"use client"

interface DataTableColumnHeaderProps {
  title: string
}

export function DataTableColumnHeader({ title }: DataTableColumnHeaderProps) {
  return <div>{title}</div>
}
