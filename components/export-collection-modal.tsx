"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { exportCollection } from "@/lib/collection-sharing"
import { toast } from "@/components/ui/custom-toast"
import { Copy, Check } from "lucide-react"
import type { Collection } from "@/types"

interface ExportCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  collection: Collection | null
}

export function ExportCollectionModal({ isOpen, onClose, collection }: ExportCollectionModalProps) {
  const [shareString, setShareString] = useState("")
  const [copied, setCopied] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && collection) {
      const exportedString = exportCollection(collection)
      setShareString(exportedString)
    } else {
      setShareString("")
    }
    setCopied(false)
  }, [isOpen, collection])

  const handleCopy = () => {
    if (textAreaRef.current) {
      textAreaRef.current.select()
      document.execCommand("copy")

      // Modern clipboard API
      navigator.clipboard
        .writeText(shareString)
        .then(() => {
          setCopied(true)
          toast({
            title: "Copied to clipboard",
            description: "Share code has been copied to your clipboard.",
          })

          // Reset copied state after 2 seconds
          setTimeout(() => setCopied(false), 2000)
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
          toast({
            title: "Copy failed",
            description: "Please select and copy the text manually.",
            variant: "destructive",
          })
        })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Share Collection: {collection?.name}</DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Copy this share code and send it to others so they can import your collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="relative">
              <textarea
                ref={textAreaRef}
                value={shareString}
                readOnly
                rows={4}
                className="w-full p-3 text-sm font-mono bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCopy}
                className="absolute top-2 right-2 h-8 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
