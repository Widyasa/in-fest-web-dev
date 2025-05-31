"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableActions } from "@/components/dashboard/datatable/datatable-actions"
import type { Category } from "@/types";


type CategoryColumnsProps = {
  actions?: (row: Category) => { label: string; onClick: () => void }[]
}

export function getCategoryColumns({ actions }: CategoryColumnsProps): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "category_name",
      header: "Name",
    },
    {
      id: "actions",
      cell: ({ row }) =>
        actions ? <DataTableActions row={row.original} actions={actions(row.original)} /> : null,
    },
  ]
}