// /types/order.ts

export interface ProductReview {
  customerName: string;
  date: string;
  rating: number;
  message?: string;
  customerId: string;
  orderId: string;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchasedProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
  returnEligible?: boolean;
  returnStatus: "None" | "Return Initiated" | "Returned";

  review?: {
    rating: number;
    comment: string;     
    message?: string;   
    reviewedAt?: string; 
  };

  reviews?: ProductReview[];
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
  returnAmount?: number;
  returnEligible?: boolean; 
  
  purchasedProducts: PurchasedProduct[];
  customerDetails: CustomerDetails;
 status: "order Recieved" | "Delivered" | "Shipped" | "Processing" | "Cancelled";
}


export interface Counts {
  orderCount : number,
  productCount : number,
  totalRevenue : number,
  userCount : number,
  returnCount : number,
  returnAmount: number;
}
