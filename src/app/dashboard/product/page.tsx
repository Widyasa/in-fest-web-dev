"use client";

import { useState, useEffect } from "react";
import { useProductStore } from "@/stores/productStore";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { getProductColumns } from "@/components/dashboard/datatable/columns/product";
import { DataTable } from "@/components/dashboard/datatable/datatable";
import { DataTablePagination } from "@/components/dashboard/datatable/datatable-pagination";
import { TableSearch } from "@/components/dashboard/datatable/table-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DeleteProductDialog } from "@/components/dashboard/forms/product/delete";

export default function ProductPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const { products, fetchProducts, loading} = useProductStore();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(0);
  const [selectedProductCode, setSelectedProductCode] = useState("");

  useEffect(() => {
    const getProducts = async () => {
      try {
        await fetchProducts();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Terjadi kesalahan saat mengambil data product");
        }
      }
    };
    getProducts();
  }, [fetchProducts]);

  const table = useReactTable({
    data: products,
    columns: getProductColumns({
      actions: (row) => [
        {
          label: "View Details",
          onClick: () => {
            router.push(`/dashboard/product/${row.id}`);
          },
        },
        {
          label: "Update",
          onClick: () => {
            router.push(`/dashboard/product/${row.id}/update`);
          },
        },
        {
          label: "Delete",
          onClick: async () => {
            setSelectedProductId(row.id);
            setSelectedProductCode(row.name);
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
          <CardTitle>Product List</CardTitle>
          <div className="flex gap-5 items-center mt-2">
            <TableSearch value={globalFilter} onChange={setGlobalFilter} />
            <Button asChild>
              <Link href="/dashboard/product/create"><IconPlus className="w-5 h-5 mr-2" />Create Product</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <DataTable table={table} columnsLength={getProductColumns({}).length} />
              <DataTablePagination table={table} />
            </>
          )}
        </CardContent>
      </Card>
      <DeleteProductDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} productId={selectedProductId} productName={selectedProductCode} />
    </div>
  );
}