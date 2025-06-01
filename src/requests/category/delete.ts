import { z } from "zod";
import { useCategoryStore } from "@/stores/categoryStore";

const idSchema = z.number().int({ message: "ID category tidak valid" });

export async function deleteCategoryRequest(categoryId: number) {
  const result = idSchema.safeParse(categoryId);

  if (!result.success) {
    return { success: false, message: result.error.errors[0].message };
  }

  try {
    await useCategoryStore.getState().deleteCategory(result.data);
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_USED_IN_EXPENSES") {
      return {
        success: false,
        message: "Category cannot be deleted because it has already been used in production",
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while deleting category",
    };
  }
}
