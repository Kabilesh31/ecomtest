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
  mainImages?: string[];
  category?: string;
  quantity?: number;
   descriptions: string[] ;
  descriptionItems?: Feature[];
  features?: Feature[];
  outofstock: boolean;
}
