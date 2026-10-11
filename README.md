This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Configure the database

The app reads products and account data from MongoDB. Create a MongoDB database (for example, a free MongoDB Atlas cluster), copy `.env.example` to `.env.local`, and replace the `MONGODB_URI` placeholder with the connection string for that database. Make sure the database user's password is URL-encoded if it contains reserved characters, and allow your development machine's IP address in the cluster network access settings.

The server will show `Please add MONGODB_URI to your environment variables.` until `.env.local` contains a valid `MONGODB_URI`. Restart the development server after adding or changing environment variables.

### Run the development server

Install dependencies if needed, then run:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Google sign-in, email delivery, and Razorpay payments need their corresponding optional credentials configured in `.env.local`; see `.env.example` for the variable names.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
