"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableActions } from "@/components/dashboard/datatable/datatable-actions"
import type { Product } from "@/types";


type ProductColumnsProps = {
  actions?: (row: Product) => { label: string; onClick: () => void }[]
}

export function getProductColumns({ actions }: ProductColumnsProps): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="font-medium">
          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(row.getValue("price"))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        actions ? <DataTableActions row={row.original} actions={actions(row.original)} /> : null,
    },
  ]
}