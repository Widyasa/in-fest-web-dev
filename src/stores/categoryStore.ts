import { create } from "zustand";
import type { Category, NewCategory, UpdateCategory} from "@/types";
import { supabaseClient } from "@/utils/supabase";

const supabase = supabaseClient;
interface categorieState {
    categories: Category[];
    selectedCategory: Category | null;
    loading: boolean;
    loadingCrud: boolean;
    fetchCategories: () => Promise<void>;
    createCategory: (newCategory: NewCategory) => Promise<void>;
    getCategoryById: (categoryId: number) => Promise<void>;
    updateCategory: (updatedCategory: UpdateCategory) => Promise<void>;
    deleteCategory: (categoryId: number) => Promise<void>;
}

export const useCategoryStore = create<categorieState>((set) => ({
    categories: [],
    selectedCategory: null,
    loading: false,
    loadingCrud: false,

  // get all categories
  fetchCategories: async () => {
    set({ loading: true });
      
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });
      
      set({ loading: false });
      
      if (error) {
        throw new Error("Failed to retrieve categories data!");
      }
      
      set({ categories: data });
  },  

  // create category
  createCategory: async (newCategory) => {
    set({ loadingCrud: true });

    const { data, error } = await supabase
      .from("categories")
      .insert(newCategory)
      .select()
      .single(); 

    set({ loadingCrud: false });

    if (error) {
      throw new Error(error.message);
    }

    set((state) => ({
      categories: [data, ...state.categories],
    }));
  },

  // get category by id
  getCategoryById: async (categoryId: number) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single(); 

    set({ loading: false });

    if (error) {
      throw new Error(error.message);
    }

    set({ selectedCategory: data });
  },

  // update category
  updateCategory: async (updatedCategory) => {
    set({ loadingCrud: true });
  
    const { id, ...fieldsToUpdate } = updatedCategory;
  
    const { data, error } = await supabase
      .from("categories")
      .update(fieldsToUpdate)
      .eq("id", id)
      .select()
      .single();
  
    set({ loadingCrud: false });
  
    if (error) {
      throw new Error(error.message);
    }
  
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id ? data : category
      ),
      selectedCategory: data,
    }));
  },

  // delete category
  deleteCategory: async (categoryId) => {
    set({ loadingCrud: true });

    // Cek apakah category terpakai di tabel expenses
    const { count, error: countError } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if (countError) {
      set({ loadingCrud: false });
      throw new Error(countError.message);
    }

    if (count && count > 0) {
      set({ loadingCrud: false });
      throw new Error("CATEGORY_USED_IN_EXPENSES");
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    set({ loadingCrud: false });

    if (error) {
      if (
        error.message.includes("violates foreign key constraint") &&
        error.message.includes("expenses_category_id_fkey")
      ) {
        throw new Error("CATEGORY_USED_IN_EXPENSES");
      }

      throw new Error(error.message);
    }

    set((state) => ({
      categories: state.categories.filter((category) => category.id !== categoryId),
      selectedCategory:
        state.selectedCategory?.id === categoryId ? null : state.selectedCategory,
    }));
  }

}));