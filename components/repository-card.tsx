"use client"

import type { Repository, Topic } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye, Star } from "lucide-react"
import Image from "next/image"

interface RepositoryCardProps {
  repository: Repository
  onMarkAsSeen: (repoId: number) => void
  onAddTopicToCollection: (topic: string) => void
  collectionTopics: Topic[]
  isSeen?: boolean
  isFavorite?: boolean
  onToggleFavorite: (repoId: number) => void
  hideMarkAsSeen?: boolean
  className?: string
}

export function RepositoryCard({
  repository,
  onMarkAsSeen,
  onAddTopicToCollection,
  collectionTopics,
  isSeen = false,
  isFavorite = false,
  onToggleFavorite,
  hideMarkAsSeen = false,
  className = "",
}: RepositoryCardProps) {
  // Function to check if a topic is already in the collection
  const isTopicInCollection = (topic: string) => {
    return collectionTopics.some((t) => t.name === topic)
  }

  return (
    <Card
      className={`overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 ${
        isSeen ? "opacity-70 bg-gray-50 dark:bg-gray-900" : ""
      } ${className}`}
    >
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {repository.image && (
              <div className="flex-shrink-0">
                <Image
                  src={repository.image || "/placeholder.svg"}
                  alt={repository.name}
                  width={100}
                  height={100}
                  className={`rounded-md object-cover ${isSeen ? "opacity-70" : ""}`}
                />
              </div>
            )}
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    <a
                      href={repository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline flex items-center text-emerald-700 dark:text-emerald-400 ${
                        isSeen ? "text-emerald-600 dark:text-emerald-500" : ""
                      }`}
                    >
                      {repository.owner}/{repository.name}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </h3>
                  <p
                    className={`text-gray-600 mt-1 dark:text-gray-300 ${
                      isSeen ? "text-gray-500 dark:text-gray-400" : ""
                    }`}
                  >
                    {repository.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center text-amber-500 font-medium dark:text-amber-400 ${
                      isSeen ? "text-amber-400 dark:text-amber-500" : ""
                    }`}
                  >
                    <Star
                      className={`h-4 w-4 fill-amber-500 dark:fill-amber-400 mr-1 ${
                        isSeen ? "fill-amber-400 dark:fill-amber-500" : ""
                      }`}
                    />
                    {repository.stars.toLocaleString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleFavorite(repository.id)}
                    className={`h-8 w-8 ${
                      isFavorite
                        ? "text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
                        : "text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400"
                    }`}
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  {!hideMarkAsSeen && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMarkAsSeen(repository.id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 w-8"
                      title="Mark as seen"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {repository.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {repository.topics.map((topic) => (
                    <button
                      key={topic}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        isTopicInCollection(topic)
                          ? "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                      } ${isSeen ? "opacity-80" : ""}`}
                      onClick={() => onAddTopicToCollection(topic)}
                      title={
                        isTopicInCollection(topic) ? "Already in collection" : "Click to add to current collection"
                      }
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
