"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Collection, Topic } from "@/types"
import { Plus, X } from "lucide-react"

interface CollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (collection: Collection) => void
  collection?: Collection // For editing existing collection
}

export function CollectionModal({ isOpen, onClose, onSave, collection }: CollectionModalProps) {
  const [name, setName] = useState("")
  const [minStars, setMinStars] = useState("500")
  const [topicName, setTopicName] = useState("")
  const [topicMinStars, setTopicMinStars] = useState("")
  const [topics, setTopics] = useState<Topic[]>([])
  const isEditing = !!collection
  const topicInputRef = useRef<HTMLInputElement>(null)

  // Initialize form when editing
  useEffect(() => {
    if (collection) {
      setName(collection.name)
      setMinStars(collection.minStars.toString())
      setTopics([...collection.topics])
    } else {
      // Reset form when creating new
      setName("")
      setMinStars("500")
      setTopics([])
    }
  }, [collection, isOpen])

  const handleAddTopic = () => {
    if (!topicName.trim()) return

    const newTopic: Topic = {
      name: topicName.trim(),
      minStars: topicMinStars ? Number.parseInt(topicMinStars) : undefined,
    }

    setTopics([...topics, newTopic])
    setTopicName("")
    setTopicMinStars("")

    // Focus back on the topic name input
    if (topicInputRef.current) {
      topicInputRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTopic()
    }
  }

  const handleRemoveTopic = (index: number) => {
    const newTopics = [...topics]
    newTopics.splice(index, 1)
    setTopics(newTopics)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || topics.length === 0) return

    const updatedCollection: Collection = {
      id: collection?.id || Date.now(),
      name: name.trim(),
      minStars: Number.parseInt(minStars) || 500,
      topics,
      seenRepos: collection?.seenRepos || [],
    }

    onSave(updatedCollection)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">{isEditing ? "Edit Collection" : "Create Collection"}</DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            {isEditing
              ? "Update your collection details and topics."
              : "Create a new collection to organize GitHub repositories."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-200">
                Collection Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Frontend"
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStars" className="dark:text-gray-200">
                Default Minimum Stars
              </Label>
              <Input
                id="minStars"
                type="number"
                value={minStars}
                onChange={(e) => setMinStars(e.target.value)}
                placeholder="500"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-200">Topics</Label>
              <div className="flex space-x-2">
                <Input
                  ref={topicInputRef}
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Topic name"
                  className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Input
                  type="number"
                  value={topicMinStars}
                  onChange={(e) => setTopicMinStars(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Min stars (optional)"
                  className="w-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button
                  type="button"
                  onClick={handleAddTopic}
                  size="icon"
                  className="dark:bg-purple-700 dark:hover:bg-purple-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {topics.length > 0 && (
              <div className="space-y-2">
                <Label className="dark:text-gray-200">Added Topics</Label>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm dark:text-white"
                    >
                      <span>{topic.name}</span>
                      {topic.minStars && (
                        <span className="ml-1 text-gray-500 dark:text-gray-400">({topic.minStars}★)</span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => handleRemoveTopic(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              type="submit"
              disabled={!name.trim() || topics.length === 0}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
            >
              {isEditing ? "Save Changes" : "Create Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
