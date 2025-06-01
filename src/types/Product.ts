export interface Product {
  id: number;
  name: string;
  price: number;
  img_link: string;
  shop_link: string;
  created_at: string;
  ingredients: string[]; 
  features: string[];  
  category_id: number; 
  category_name?: string;  
}

export type NewProduct = {
  name?: string;
  price?: number;
  img_link?: string;
  shop_link?: string;
  ingredients?: string[];
  features?: string[];
  category_id?: number;
};

export type UpdateProduct = {
  id?: number;
  name?: string;
  price?: number;
  img_link?: string;
  shop_link?: string;
  ingredients?: string[];
  features?: string[];
  category_id?: number;
}
