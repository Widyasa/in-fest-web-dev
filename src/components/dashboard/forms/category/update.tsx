"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCategoryStore } from "@/stores/categoryStore";
import { updateCategoryRequest } from "@/requests/category/update";
import { ActionModal } from "@/components/dashboard/dialogs/action-modal";
import type { Category } from "@/types";

interface UpdateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  category: Category | null;
}

export default function UpdateCategoryModal({ open, onClose, category,
}: UpdateCategoryModalProps) {
  const { loadingCrud } = useCategoryStore();

  const [form, setForm] = useState({
    id: 0,
    category_name: ""
  });

  useEffect(() => {
    if (category) {
      setForm({
        id: category.id,
        category_name: category.category_name
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const result = await updateCategoryRequest(form);

    if (result.success) {
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <ActionModal open={open} onClose={onClose} type="update" title="Update Category" onSubmit={handleSubmit} loading={loadingCrud} >
      <div className="grid gap-4">
        <div>
          <Label className="block text-sm font-medium mb-2" htmlFor="category_name">Category Name</Label>
          <Input id="category_name" name="category_name" value={form.category_name} onChange={handleChange} />
        </div>
      </div>
    </ActionModal>
  );
}