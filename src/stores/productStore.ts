import { create } from "zustand";
import type { Product, NewProduct, UpdateProduct} from "@/types";
import { supabaseClient } from "@/utils/supabase";

const supabase = supabaseClient;
interface productState {
    products: Product[];
    selectedProduct: Product | null;
    loading: boolean;
    loadingCrud: boolean;
    fetchProducts: () => Promise<void>;
    createProduct: (newProduct: NewProduct) => Promise<void>;
    getProductById: (productId: number) => Promise<void>;
    updateProduct: (updatedProduct: UpdateProduct) => Promise<void>;
    deleteProduct: (productId: number) => Promise<void>;
}

export const useProductStore = create<productState>((set) => ({
    products: [],
    selectedProduct: null,
    loading: false,
    loadingCrud: false,

  // get all products
  fetchProducts: async () => {
    set({ loading: true });
      
    const { data, error } = await supabase
      .from("view_products_with_categories")
      .select("*")
      .order("name", { ascending: false });
      
      set({ loading: false });
      
      if (error) {
        throw new Error("Failed to retrieve products data!");
      }
      
      set({ products: data });
  },  

    // create product
    createProduct: async (newProduct) => {
        set({ loadingCrud: true });

        const { data, error } = await supabase
        .from("products")
        .insert(newProduct)
        .select()
        .single(); 

        set({ loadingCrud: false });

        if (error) {
        throw new Error(error.message);
        }

        set((state) => ({
        products: [data, ...state.products],
        }));
    },

  // Get product by ID
  getProductById: async (id: number) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("view_products_with_categories")
      .select("*") // gunakan * saja dulu, jangan select categories(name) jika bukan relasi
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      set({ selectedProduct: null, loading: false });
      return;
    }

    let ingredients = [];
    let features = [];

    try {
      ingredients = Array.isArray(data.ingredients)
        ? data.ingredients
        : JSON.parse(data.ingredients || "[]");
    } catch (err) {
      console.warn("Failed to parse ingredients", err);
    }

    try {
      features = Array.isArray(data.features)
        ? data.features
        : JSON.parse(data.features || "[]");
    } catch (err) {
      console.warn("Failed to parse features", err);
    }

    const product = {
      ...data,
      ingredients,
      features,
      category_name: data.categories?.category ?? data.category ?? "-", // fallback
    };

    set({ selectedProduct: product, loading: false });
  },

  // update product
  updateProduct: async (updatedProduct) => {
    set({ loadingCrud: true });
  
    const { id, ...fieldsToUpdate } = updatedProduct;
  
    const { data, error } = await supabase
      .from("products")
      .update(fieldsToUpdate)
      .eq("id", id)
      .select()
      .single();
  
    set({ loadingCrud: false });
  
    if (error) {
      throw new Error(error.message);
    }
  
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? data : product
      ),
      selectedProduct: data,
    }));
  },

  // delete product
  deleteProduct: async (productId) => {
    set({ loadingCrud: true });

    // Cek apakah product terpakai di tabel expenses
    const { count, error: countError } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    if (countError) {
      set({ loadingCrud: false });
      throw new Error(countError.message);
    }

    if (count && count > 0) {
      set({ loadingCrud: false });
      throw new Error("PRODUCT_USED_IN_EXPENSES");
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    set({ loadingCrud: false });

    if (error) {
      if (
        error.message.includes("violates foreign key constraint") &&
        error.message.includes("expenses_product_id_fkey")
      ) {
        throw new Error("PRODUCT_USED_IN_EXPENSES");
      }

      throw new Error(error.message);
    }

    set((state) => ({
      products: state.products.filter((product) => product.id !== productId),
      selectedProduct:
        state.selectedProduct?.id === productId ? null : state.selectedProduct,
    }));
  }

}));