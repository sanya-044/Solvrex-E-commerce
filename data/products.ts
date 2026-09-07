export type Product = {
  id: number;
  name: string;
  category: string;
  gender: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  sizes: string[];
  badge?: string;
};