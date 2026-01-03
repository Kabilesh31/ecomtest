export interface PromoCode {
  _id: string;
  title: string;
  description: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
}
