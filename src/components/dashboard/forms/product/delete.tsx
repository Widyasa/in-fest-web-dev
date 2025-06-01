import { ActionModal } from "@/components/dashboard/dialogs/action-modal";
import { useProductStore } from "@/stores/productStore";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProductRequest } from "@/requests/product/delete";
import { DeleteConfirmationMessage } from "@/components/ui/delete-confirmation-message";

interface DeleteProductDialogProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

export function DeleteProductDialog({ open, onClose, productId, productName,
}: DeleteProductDialogProps) {
  const { fetchProducts } = useProductStore();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteProductRequest(productId);

    if (result.success) {
      await fetchProducts();
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <ActionModal open={open} onClose={onClose} type="delete" title={`Delete Product ${productName}?`} onSubmit={handleDelete} loading={loading} >
      <DeleteConfirmationMessage label={`product ${productName}`} />
    </ActionModal>
  );
}