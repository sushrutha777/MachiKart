
export type OrderStatus = "NEW" | "CONFIRMED" | "OUT_FOR_DELIVERY" | "DELIVERED";

export interface Product {
  id: string;
  fish_name: string;
  price_per_kg: number;
  available: boolean;
  is_premium?: boolean;
  image_url?: string;
  last_updated: any;
}

export interface CartItem extends Product {
  quantity: number;
  cleaning?: boolean;
}

export interface OrderItem {
  fish_name: string;
  price_per_kg: number;
  quantity: number;
  cleaning?: boolean;
}

export interface Order {
  id?: string;
  customer_name: string;
  phone_number: string;
  delivery_address: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: "Cash on Delivery";
  order_status: OrderStatus;
  created_at: any;
}
