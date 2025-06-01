import { z } from "zod";
import { useProductStore } from "@/stores/productStore";

const idSchema = z.number().int({ message: "ID product tidak valid" });

export async function deleteProductRequest(productId: number) {
  const result = idSchema.safeParse(productId);

  if (!result.success) {
    return { success: false, message: result.error.errors[0].message };
  }

  try {
    await useProductStore.getState().deleteProduct(result.data);
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_USED_IN_EXPENSES") {
      return {
        success: false,
        message: "Product cannot be deleted because it has already been used in production",
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while deleting product",
    };
  }
}
