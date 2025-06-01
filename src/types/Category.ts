export interface Category {
    id: number;
    category_name: string;
    created_at: string; 
}
  
export type NewCategory = Omit<Category, 'id' | 'created_at'>;
  
export type UpdateCategory = Partial<Omit<Category, 'id' | 'created_at'>> & { id: number };