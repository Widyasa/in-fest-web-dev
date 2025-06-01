"use client"

import { Input } from "@/components/ui/input"

interface TableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TableSearch({ value, onChange, placeholder = "Search..." }: TableSearchProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
