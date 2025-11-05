export interface Feature {
  title: string
  mainmage?: string
  featureImages?: string
}

export interface Product {
  _id?: string;
  id?: string | number; // support both
  name: string;
  price: number;
  mainImage?: string;
  category?: string;
  quantity?: number;
   descriptions: string[] ;
  descriptionItems?: Feature[];
  features?: Feature[];
}
