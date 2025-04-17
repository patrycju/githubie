"use client"

import { CollectionsDropdown } from "@/components/collections-dropdown"
import { Button } from "@/components/ui/button"
import type { Collection } from "@/types"
import { RefreshCw, Share, Download } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavbarProps {
  collections: Collection[]
  selectedCollection: Collection | null
  onSelectCollection: (collection: Collection) => void
  onCreateCollection: () => void
  onEditCollection: (collection: Collection) => void
  onDeleteCollection: (collectionId: number) => void
  onRefresh: () => void
  onExportCollection: () => void
  onImportCollection: () => void
  isLoading: boolean
}

export function Navbar({
  collections,
  selectedCollection,
  onSelectCollection,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
  onRefresh,
  onExportCollection,
  onImportCollection,
  isLoading,
}: NavbarProps) {
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-900 dark:to-blue-900 border-b border-purple-700 dark:border-purple-800 sticky top-0 z-10 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">GitHubie</h1>
        </div>

        <div className="flex items-center gap-2">
          {collections.length > 0 && (
            <>
              <CollectionsDropdown
                collections={collections}
                selectedCollection={selectedCollection}
                onSelectCollection={onSelectCollection}
                onCreateCollection={onCreateCollection}
                onEditCollection={onEditCollection}
                onDeleteCollection={onDeleteCollection}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading || !selectedCollection}
                className="ml-2 bg-white/10 text-white border-white/20 hover:bg-white/20 h-9"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onExportCollection}
                disabled={!selectedCollection}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-9"
                title="Share Collection"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onImportCollection}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-9"
            title="Import Collection"
          >
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>

          <ThemeToggle />
          <Button
            onClick={onCreateCollection}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 h-9"
          >
            New Collection
          </Button>
        </div>
      </div>
    </nav>
  )
}
