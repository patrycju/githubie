"use client"

import type { Collection } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Edit, Trash } from "lucide-react"

interface CollectionsDropdownProps {
  collections: Collection[]
  selectedCollection: Collection | null
  onSelectCollection: (collection: Collection) => void
  onCreateCollection: () => void
  onEditCollection: (collection: Collection) => void
  onDeleteCollection: (collectionId: number) => void
}

export function CollectionsDropdown({
  collections,
  selectedCollection,
  onSelectCollection,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
}: CollectionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-9">
          {selectedCollection ? selectedCollection.name : "Select Collection"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 border-blue-100 dark:border-blue-800 dark:bg-gray-800">
        <DropdownMenuLabel className="text-purple-700 dark:text-purple-300">Your Collections</DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:border-gray-700" />
        {collections.map((collection) => (
          <DropdownMenuItem
            key={collection.id}
            className={`flex items-center justify-between cursor-pointer ${
              collection.name === "All" ? "font-semibold text-blue-700 dark:text-blue-300" : ""
            } ${selectedCollection?.id === collection.id ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}
            onClick={() => onSelectCollection(collection)}
          >
            <span>{collection.name}</span>
            <div className="flex items-center">
              {collection.name !== "All" && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditCollection(collection)
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/50"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteCollection(collection.id)
                    }}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
