import type { ObjectId } from "mongodb";
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  date: string;
  note?: string;
}

// Shape as returned to the client (dates and ids as strings).
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  trackingUrl?: string;
  statusHistory: OrderStatusEvent[];
  createdAt: string;
  updatedAt: string;
}

// Shape as stored in MongoDB (raw _id / ObjectId refs, Date objects).
export interface OrderDocument {
  _id: ObjectId;
  orderNumber: string;
  userId: ObjectId;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  trackingUrl?: string;
  statusHistory: OrderStatusEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
