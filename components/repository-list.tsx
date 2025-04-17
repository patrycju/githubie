"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Repository, Topic } from "@/types"
import { RepositoryCard } from "@/components/repository-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Search, Star } from "lucide-react"

interface RepositoryListProps {
  repositories: Repository[]
  seenRepositories: Repository[]
  isLoading: boolean
  onMarkAsSeen: (repoId: number) => void
  onAddTopicToCollection: (topic: string) => void
  onToggleFavorite: (repoId: number) => void
  collectionName: string
  collectionTopics: Topic[]
  favorites: Repository[]
  onLoadMore: () => void
  hasMore: boolean
  collectionId: number
}

export function RepositoryList({
  repositories,
  seenRepositories,
  isLoading,
  onMarkAsSeen,
  onAddTopicToCollection,
  onToggleFavorite,
  collectionName,
  collectionTopics,
  favorites,
  onLoadMore,
  hasMore,
  collectionId,
}: RepositoryListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSeen, setShowSeen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Filter out favorites from the main repositories list
  const nonFavoriteRepositories = repositories.filter((repo) => !favorites.some((fav) => fav.id === repo.id))

  const nonFavoriteSeenRepositories = seenRepositories.filter((repo) => !favorites.some((fav) => fav.id === repo.id))

  // Filter repositories based on search query
  const displayRepositories = showSeen
    ? [...nonFavoriteRepositories, ...nonFavoriteSeenRepositories].sort((a, b) => b.stars - a.stars)
    : nonFavoriteRepositories

  const filteredRepositories = displayRepositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter favorites based on search query
  const filteredFavorites = favorites.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Setup intersection observer for infinite scroll
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore()
        }
      },
      { threshold: 0.5 },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
  }, [hasMore, isLoading, onLoadMore])

  // Setup observer when component mounts or dependencies change
  useEffect(() => {
    setupObserver()
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [setupObserver, filteredRepositories.length])

  return (
    <Card className="w-full border-t-4 border-t-purple-500 dark:bg-gray-800 dark:border-purple-700 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/30 dark:to-gray-800">
        <CardTitle className="text-purple-700 dark:text-purple-300">
          {collectionName} Repositories
          {nonFavoriteRepositories.length > 0 && (
            <span className="ml-2 text-purple-400 dark:text-purple-500">({nonFavoriteRepositories.length})</span>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSeen(!showSeen)}
            className={`flex items-center gap-1 ${
              showSeen
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                : "bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {showSeen ? (
              <>
                <EyeOff className="h-4 w-4" /> Hide Seen
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Show Seen
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="dark:bg-gray-800">
        <div className="mb-4 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search repositories..."
            className="pl-8 border-blue-200 focus-visible:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading && filteredRepositories.length === 0 && filteredFavorites.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
            {/* Favorites Section */}
            {filteredFavorites.length > 0 && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 p-3 rounded-lg shadow-md">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 mr-2 fill-white" />
                    <h3 className="text-lg font-medium text-white">Favorites</h3>
                    <span className="ml-2 bg-white/20 text-white px-2 py-0.5 rounded-full text-sm">
                      {filteredFavorites.length}
                    </span>
                  </div>
                  <div className="space-y-4 mt-3">
                    {filteredFavorites.map((repo) => (
                      <RepositoryCard
                        key={`fav-${repo.id}`}
                        repository={repo}
                        onMarkAsSeen={onMarkAsSeen}
                        onAddTopicToCollection={onAddTopicToCollection}
                        collectionTopics={collectionTopics}
                        isSeen={seenRepositories.some((seenRepo) => seenRepo.id === repo.id)}
                        isFavorite={true}
                        onToggleFavorite={onToggleFavorite}
                        className="border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-800"
                      />
                    ))}
                  </div>
                </div>
                {filteredRepositories.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
                )}
              </div>
            )}

            {/* Regular Repositories */}
            {filteredRepositories.length > 0 ? (
              <div className="space-y-4">
                {filteredRepositories.map((repo) => (
                  <RepositoryCard
                    key={repo.id}
                    repository={repo}
                    onMarkAsSeen={onMarkAsSeen}
                    onAddTopicToCollection={onAddTopicToCollection}
                    collectionTopics={collectionTopics}
                    isSeen={seenRepositories.some((seenRepo) => seenRepo.id === repo.id)}
                    isFavorite={false}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
                {/* Infinite scroll loading indicator */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-4">
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Scroll for more</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              filteredFavorites.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>No repositories found for this collection.</p>
                  <p className="text-sm mt-2">Try adding more topics or lowering the minimum star requirement.</p>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
