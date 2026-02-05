"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter: (sentiment: string | null) => void
  currentFilter: string | null
}

export function SearchFilter({ onSearch, onFilter, currentFilter }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const sentimentFilters = [
    { value: "positive", label: "Positive", color: "bg-green-500/10 text-green-700 border-green-200" },
    { value: "negative", label: "Negative", color: "bg-red-500/10 text-red-700 border-red-200" },
    { value: "neutral", label: "Neutral", color: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search comments..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2">
          {sentimentFilters.map((filter) => (
            <Badge
              key={filter.value}
              variant={currentFilter === filter.value ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                currentFilter === filter.value ? filter.color : "hover:bg-muted"
              }`}
              onClick={() => onFilter(currentFilter === filter.value ? null : filter.value)}
            >
              {filter.label}
            </Badge>
          ))}
          {currentFilter && (
            <Button variant="ghost" size="sm" onClick={() => onFilter(null)} className="h-6 w-6 p-0">
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
