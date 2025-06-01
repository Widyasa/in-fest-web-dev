export interface Category {
    id: number;
    category_name: string;
    created_at: string; 
}
  
export type NewCategory = {
    category_name?: string
};
  
export type UpdateCategory = {
    id?: number;
    category_name?: string;
};