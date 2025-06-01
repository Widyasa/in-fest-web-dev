"use client";

import { useState, useEffect } from "react";
import { useCategoryStore } from "@/stores/categoryStore";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { getCategoryColumns } from "@/components/dashboard/datatable/columns/category";
import { DataTable } from "@/components/dashboard/datatable/datatable";
import { DataTablePagination } from "@/components/dashboard/datatable/datatable-pagination";
import { TableSearch } from "@/components/dashboard/datatable/table-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Category } from "@/types";
import CreateCategoryModal from "@/components/dashboard/forms/category/create";
import UpdateCategoryModal from "@/components/dashboard/forms/category/update";
import { DeleteCategoryDialog } from "@/components/dashboard/forms/category/delete";

export default function CategoryPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const { categories, fetchCategories, loading} = useCategoryStore();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  useEffect(() => {
    const getCategories = async () => {
      try {
        await fetchCategories();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An error occurred while retrieving category data");
        }
      }
    };
    getCategories();
  }, [fetchCategories]);

  const table = useReactTable({
    data: categories,
    columns: getCategoryColumns({
      actions: (row) => [
        {
          label: "Update",
          onClick: () => {
            setSelectedCategory(row);
            setOpenUpdateModal(true);
          },
        },
        {
          label: "Delete",
          onClick: async () => {
            setSelectedCategoryId(row.id);
            setSelectedCategoryName(row.category_name);
            setDeleteDialogOpen(true);
          },
        },
      ],
    }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });  

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <div className="flex gap-5 items-center mt-2">
            <TableSearch value={globalFilter} onChange={setGlobalFilter} />
            <Button onClick={() => setOpenCreateModal(true)}>
              <IconPlus className="w-5 h-5 mr-2" /> Create Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <DataTable table={table} columnsLength={getCategoryColumns({}).length} />
              <DataTablePagination table={table} />
            </>
          )}
        </CardContent>
      </Card>
      <CreateCategoryModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <UpdateCategoryModal open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} category={selectedCategory} />
      <DeleteCategoryDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} categoryId={selectedCategoryId} categoryName={selectedCategoryName} />
    </div>
  );
}