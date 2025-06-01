import { z } from "zod";
import { useProductStore } from "@/stores/productStore";
import type { UpdateProduct } from "@/types";

const updateProductSchema = z.object({
  id: z.number().int({ message: "Product ID must be an integer" }),
  name: z.string().min(2, { message: "Product name must be at least 2 characters" }).trim(),
  price: z.number().min(1, { message: "Price must be at least 1" }),
  img_link: z.string().url({ message: "Image link must be a valid URL" }),
  shop_link: z.string().url({ message: "Shop link must be a valid URL" }),
  ingredients: z.array(z.string()).min(1, { message: "At least one ingredient is required" }),
  features: z.array(z.string()).min(1, { message: "At least one feature is required" }),
  category_id: z.number().int({ message: "Category ID must be an integer" }),
});

export async function updateProductRequest(productData: UpdateProduct) {
  const result = updateProductSchema.safeParse(productData);

  if (!result.success) {
    const errorMessage = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return { success: false, message: errorMessage };
  }

  try {
    await useProductStore.getState().updateProduct(result.data);
    return { success: true, message: "Product has been successfully updated" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return {
        success: false,
        message: "Product with this name already exists, please choose another",
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while updating the product",
    };
  }
}
