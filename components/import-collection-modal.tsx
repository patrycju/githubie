"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { importCollection } from "@/lib/collection-sharing"
import { toast } from "@/components/ui/custom-toast"
import type { Collection } from "@/types"

interface ImportCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (collection: Collection) => void
}

export function ImportCollectionModal({ isOpen, onClose, onImport }: ImportCollectionModalProps) {
  const [shareString, setShareString] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleImport = () => {
    if (!shareString.trim()) return

    setIsLoading(true)

    try {
      const importedCollection = importCollection(shareString.trim())

      if (!importedCollection) {
        toast({
          title: "Import Failed",
          description: "The collection code is invalid or corrupted.",
          variant: "destructive",
        })
        return
      }

      onImport(importedCollection)
      setShareString("")
      onClose()

      toast({
        title: "Collection Imported",
        description: `Successfully imported "${importedCollection.name}" collection.`,
      })
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was an error importing the collection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Import Collection</DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Paste a collection share code to import it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              value={shareString}
              onChange={(e) => setShareString(e.target.value)}
              placeholder="Paste collection share code here..."
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!shareString.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
          >
            {isLoading ? "Importing..." : "Import Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
