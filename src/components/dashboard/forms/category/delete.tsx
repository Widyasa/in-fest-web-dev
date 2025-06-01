import { ActionModal } from "@/components/dashboard/dialogs/action-modal";
import { useCategoryStore } from "@/stores/categoryStore";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCategoryRequest } from "@/requests/category/delete";
import { DeleteConfirmationMessage } from "@/components/ui/delete-confirmation-message";

interface DeleteCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categoryId: number;
  categoryName: string;
}

export function DeleteCategoryDialog({ open, onClose, categoryId, categoryName,
}: DeleteCategoryDialogProps) {
  const { fetchCategories } = useCategoryStore();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteCategoryRequest(categoryId);

    if (result.success) {
      await fetchCategories();
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <ActionModal open={open} onClose={onClose} type="delete" title={`Delete Category ${categoryName}?`} onSubmit={handleDelete} loading={loading} >
      <DeleteConfirmationMessage label={`category ${categoryName}`} />
    </ActionModal>
  );
}