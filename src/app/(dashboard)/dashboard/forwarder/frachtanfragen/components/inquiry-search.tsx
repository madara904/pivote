"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface InquirySearchProps {
  onSearch?: (query: string) => void
  onFilter?: (filters: Record<string, string>) => void
  searchValue?: string
  className?: string
}

export function InquirySearch({ onSearch, searchValue, className }: InquirySearchProps) {
  const [search, setSearch] = React.useState(searchValue || "")

  const handleSearch = (value: string) => {
    setSearch(value)
    onSearch?.(value)
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Suche nach Referenznummer, Versender, Route..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 w-full"
          />
        </div>
        {search && (
          <Badge variant="secondary" className="gap-1">
            {search}
            <button
              onClick={() => {
                setSearch("")
                onSearch?.("")
              }}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  )
}

