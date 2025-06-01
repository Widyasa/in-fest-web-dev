import { z } from "zod";
import { useCategoryStore } from "@/stores/categoryStore";
import type { NewCategory } from "@/types";

const createCategorySchema = z.object({
  category_name: z.string().min(2, { message: "Category name must be at least 2 characters" }).trim().nonempty()
});

export async function createCategoryRequest(categoryData: NewCategory) {
  const result = createCategorySchema.safeParse(categoryData);

  if (!result.success) {
    const errorMessage = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return { success: false, message: errorMessage };
  }

  try {
    await useCategoryStore.getState().createCategory(result.data);
    return { success: true, message: "Category has been successfully added" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return {
        success: false,
        message: "Category name is already in use, please choose another",
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while adding the category",
    };
  }
}
