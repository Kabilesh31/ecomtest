// /types/order.ts
export interface PurchasedProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  
}

export interface CustomerDetails {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Order {
  _id: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  totalAmount: number;
  customerId?: string;
  createdAt: string;
  purchasedProducts: PurchasedProduct[];
  customerDetails: CustomerDetails;
  status: string; 
}


export interface Counts {
  orderCount : number,
  productCount : number,
  totalRevenue : number,
  userCount : number
}
