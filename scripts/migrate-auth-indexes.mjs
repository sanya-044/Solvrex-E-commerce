import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing.");
}

const client = new MongoClient(uri);

async function countAggregation(collection, pipeline) {
  const results = await collection
    .aggregate([...pipeline, { $count: "count" }])
    .toArray();
  return results[0]?.count ?? 0;
}

function hasSingleFieldKey(index, field) {
  return (
    Object.keys(index.key).length === 1 &&
    index.key[field] === 1
  );
}

function isCompatibleEmailIndex(index) {
  return (
    index.unique === true &&
    index.sparse !== true &&
    !index.partialFilterExpression
  );
}

function isCompatibleGoogleSubIndex(index) {
  const filter = index.partialFilterExpression;
  const subjectFilter = filter?.googleSub;

  if (
    !filter ||
    Object.keys(filter).length !== 1 ||
    !subjectFilter ||
    typeof subjectFilter !== "object" ||
    Array.isArray(subjectFilter)
  ) {
    return false;
  }

  return (
    index.unique === true &&
    Object.keys(subjectFilter).length === 2 &&
    subjectFilter.$type === "string" &&
    subjectFilter.$gt === ""
  );
}

try {
  await client.connect();

  const users = client.db("VELMORI").collection("users");
  const indexes = await users.listIndexes().toArray();
  const emailIndexes = indexes.filter((index) =>
    hasSingleFieldKey(index, "email")
  );
  const googleSubIndexes = indexes.filter((index) =>
    hasSingleFieldKey(index, "googleSub")
  );

  const missingOrNonStringEmails = await users.countDocuments({
    $expr: { $ne: [{ $type: "$email" }, "string"] },
  });
  const emptyEmails = await users.countDocuments({ email: "" });
  const nonCanonicalEmails = await countAggregation(users, [
    { $match: { email: { $type: "string" } } },
    {
      $match: {
        $expr: {
          $ne: ["$email", { $toLower: { $trim: { input: "$email" } } }],
        },
      },
    },
  ]);
  const duplicateEmailGroups = await countAggregation(users, [
    { $match: { email: { $type: "string" } } },
    {
      $set: {
        normalizedEmail: {
          $toLower: { $trim: { input: "$email" } },
        },
      },
    },
    { $group: { _id: "$normalizedEmail", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  const nonCanonicalGoogleSubs = await countAggregation(users, [
    { $match: { googleSub: { $type: "string" } } },
    {
      $match: {
        $expr: {
          $ne: ["$googleSub", { $trim: { input: "$googleSub" } }],
        },
      },
    },
  ]);
  const duplicateGoogleSubGroups = await countAggregation(users, [
    { $match: { googleSub: { $type: "string", $gt: "" } } },
    { $group: { _id: "$googleSub", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  console.log("Existing auth-related indexes:");
  console.log(
    JSON.stringify(
      indexes.map(({ name, key, unique, sparse, partialFilterExpression }) => ({
        name,
        key,
        unique: unique === true,
        sparse: sparse === true,
        partialFilterExpression,
      })),
      null,
      2
    )
  );
  console.log("Auth-index preflight counts:", {
    missingOrNonStringEmails,
    emptyEmails,
    nonCanonicalEmails,
    duplicateEmailGroups,
    nonCanonicalGoogleSubs,
    duplicateGoogleSubGroups,
  });

  if (
    missingOrNonStringEmails ||
    emptyEmails ||
    nonCanonicalEmails ||
    duplicateEmailGroups ||
    nonCanonicalGoogleSubs ||
    duplicateGoogleSubGroups
  ) {
    throw new Error(
      "Preflight failed. Resolve the reported data issues before creating auth indexes."
    );
  }

  if (emailIndexes.some((index) => !isCompatibleEmailIndex(index))) {
    throw new Error(
      "An incompatible email index exists. Review it manually; this script will not drop or replace indexes."
    );
  }

  if (
    googleSubIndexes.some(
      (index) => !isCompatibleGoogleSubIndex(index)
    )
  ) {
    throw new Error(
      "An incompatible googleSub index exists. Review it manually; this script will not drop or replace indexes."
    );
  }

  if (emailIndexes.length > 1 || googleSubIndexes.length > 1) {
    throw new Error(
      "Multiple indexes exist for an auth field. Review them manually before continuing."
    );
  }

  if (emailIndexes.length === 0) {
    await users.createIndex(
      { email: 1 },
      { name: "email_unique", unique: true }
    );
    console.log("Created unique email index.");
  } else {
    console.log("Compatible unique email index already exists.");
  }

  if (googleSubIndexes.length === 0) {
    await users.createIndex(
      { googleSub: 1 },
      {
        name: "googleSub_unique_nonempty",
        unique: true,
        partialFilterExpression: {
          googleSub: { $type: "string", $gt: "" },
        },
      }
    );
    console.log("Created unique partial googleSub index.");
  } else {
    console.log("Compatible unique partial googleSub index already exists.");
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Auth-index migration failed."
  );
  process.exitCode = 1;
} finally {
  await client.close();
}
