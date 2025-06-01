"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCategoryStore } from "@/stores/categoryStore";
import { createCategoryRequest } from "@/requests/category/create";
import { ActionModal } from "@/components/dashboard/dialogs/action-modal";

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCategoryModal({ open, onClose }: CreateCategoryModalProps) {
  const { loadingCrud } = useCategoryStore();

  const [form, setForm] = useState({
    category_name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const result = await createCategoryRequest(form);

    if (result.success) {
      toast.success(result.message);
      onClose();
      setForm({ category_name: "" }); 
    } else {
      toast.error(result.message);
    }
  };

  return (
    <ActionModal open={open} onClose={onClose} type="create" title="Tambah Category" onSubmit={handleSubmit} loading={loadingCrud}>
      <div className="grid gap-4">
        <div>
          <Label className="block text-sm font-medium mb-2" htmlFor="category_name">Category Name</Label>
          <Input id="category_name" name="category_name" value={form.category_name} onChange={handleChange} />
        </div>
      </div>
    </ActionModal>
  );
}