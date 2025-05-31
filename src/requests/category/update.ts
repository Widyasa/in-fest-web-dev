import { z } from "zod";
import { useCategoryStore } from "@/stores/categoryStore";
import type { UpdateCategory } from "@/types";

const updateCategorySchema = z.object({
  id: z.number().int({ message: "Invalid category ID" }),
  category_name: z.string().min(2, { message: "Category name must be at least 2 characters long" }).trim()
});

export async function updateCategoryRequest(categoryData: UpdateCategory) {
  const result = updateCategorySchema.safeParse(categoryData);

  if (!result.success) {
    const errorMessage = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return { success: false, message: errorMessage };
  }

  try {
    await useCategoryStore.getState().updateCategory(result.data);
    return { success: true, message: "Category has been successfully updated" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return {
        success: false,
        message: "Category name is already in use, please choose another",
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while updating the category",
    };
  }
}