"use client"

import { useState, useEffect } from "react"
import { GitHubApiKeyForm } from "@/components/github-api-key-form"
import { RepositoryList } from "@/components/repository-list"
import { CollectionModal } from "@/components/collection-modal"
import { ImportCollectionModal } from "@/components/import-collection-modal"
import { ExportCollectionModal } from "@/components/export-collection-modal"
import { Navbar } from "@/components/navbar"
import type { Collection, Repository, Topic, StoredRepositories, CollectionFavorites } from "@/types"
import { fetchRepositoriesByTopic } from "@/lib/github-api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/custom-toast"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000
// Number of repositories to load per batch
const REPOS_PER_PAGE = 10

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("")
  const [noApiKey, setNoApiKey] = useState(false)
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [seenRepositories, setSeenRepositories] = useState<Repository[]>([])
  const [collectionFavorites, setCollectionFavorites] = useState<CollectionFavorites>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [collectionToEdit, setCollectionToEdit] = useState<Collection | undefined>(undefined)
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null)
  const [progressiveLoadingStatus, setProgressiveLoadingStatus] = useState<string>("")
  const [storedRepos, setStoredRepos] = useState<StoredRepositories>({})
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [allRepositories, setAllRepositories] = useState<Repository[]>([])

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedApiKey = localStorage.getItem("githubApiKey")
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }

    const storedCollections = localStorage.getItem("githubCollections")
    if (storedCollections) {
      setCollections(JSON.parse(storedCollections))
    }

    // Load stored repositories
    const storedRepositories = localStorage.getItem("githubStoredRepositories")
    if (storedRepositories) {
      setStoredRepos(JSON.parse(storedRepositories))
    }

    // Load collection favorites
    const storedCollectionFavorites = localStorage.getItem("githubCollectionFavorites")
    if (storedCollectionFavorites) {
      setCollectionFavorites(JSON.parse(storedCollectionFavorites))
    }
  }, [])

  // Save collections to localStorage whenever they change
  useEffect(() => {
    if (collections.length > 0) {
      localStorage.setItem("githubCollections", JSON.stringify(collections))
    }
  }, [collections])

  // Save stored repositories to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(storedRepos).length > 0) {
      localStorage.setItem("githubStoredRepositories", JSON.stringify(storedRepos))
    }
  }, [storedRepos])

  // Save collection favorites to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(collectionFavorites).length > 0) {
      localStorage.setItem("githubCollectionFavorites", JSON.stringify(collectionFavorites))
    }
  }, [collectionFavorites])

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("githubApiKey", apiKey)
    }
  }, [apiKey])

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      document.documentElement.classList.add(savedTheme)
    } else {
      // Check system preference
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  // Load initial repositories when page changes
  useEffect(() => {
    if (selectedCollection && allRepositories.length > 0) {
      loadRepositoriesPage()
    }
  }, [page, selectedCollection, allRepositories])

  const loadRepositoriesPage = () => {
    const startIndex = 0
    const endIndex = page * REPOS_PER_PAGE

    // Load repositories up to the current page
    const reposToShow = allRepositories.slice(0, endIndex)
    setRepositories(reposToShow)

    // Check if we've loaded all repositories
    setHasMore(endIndex < allRepositories.length)
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1)
    }
  }

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key)
  }

  const handleSaveCollection = async (collection: Collection) => {
    let updatedCollections: Collection[]

    // Check if we're editing an existing collection
    if (collections.some((c) => c.id === collection.id)) {
      updatedCollections = collections.map((c) => (c.id === collection.id ? collection : c))
    } else {
      updatedCollections = [...collections, collection]
    }

    setCollections(updatedCollections)
    setSelectedCollection(collection)

    // Load repositories for the collection
    await loadRepositoriesForCollection(collection)
  }

  const handleImportCollection = (collection: Collection) => {
    // Check if a collection with the same name already exists
    const existingCollection = collections.find((c) => c.name === collection.name)

    if (existingCollection) {
      // Append a number to make the name unique
      let counter = 1
      let newName = `${collection.name} (${counter})`

      while (collections.some((c) => c.name === newName)) {
        counter++
        newName = `${collection.name} (${counter})`
      }

      collection.name = newName
    }

    const updatedCollections = [...collections, collection]
    setCollections(updatedCollections)
    setSelectedCollection(collection)

    // Load repositories for the imported collection
    loadRepositoriesForCollection(collection)
    toast({
      id: `import-${Date.now()}`,
      title: "Collection Imported",
      description: "The collection has been successfully imported.",
      variant: "default"
    })
  }

  const isCacheValid = (collectionId: number) => {
    const cache = storedRepos[collectionId]
    if (!cache) return false

    const now = Date.now()
    return now - cache.lastFetched < CACHE_EXPIRATION
  }

  const loadRepositoriesForCollection = async (collection: Collection) => {
    // Reset pagination
    setPage(1)
    setHasMore(true)

    // Check if we have cached repositories for this collection
    if (isCacheValid(collection.id)) {
      const cache = storedRepos[collection.id]
      setAllRepositories(cache.repositories)
      setSeenRepositories(cache.seenRepositories)
      return
    }

    setIsLoading(true)
    setRepositories([]) // Clear existing repositories
    setSeenRepositories([]) // Clear existing seen repositories
    setAllRepositories([]) // Clear all repositories

    try {
      // Regular collection handling
      const allRepos: Repository[] = []
      const seenRepoIds = new Set(collection.seenRepos || [])

      // Track loaded repositories to avoid duplicates during progressive loading
      const loadedRepoIds = new Set<number>()
      const unseenRepos: Repository[] = []
      const seenRepos: Repository[] = []

      for (let i = 0; i < collection.topics.length; i++) {
        const topic = collection.topics[i]
        const minStars = topic.minStars || collection.minStars || 500

        setProgressiveLoadingStatus(`Loading ${topic.name} (${i + 1}/${collection.topics.length})...`)

        try {
          const repos = await fetchRepositoriesByTopic(apiKey || undefined, topic.name, minStars)

          // Process repositories as they come in
          for (const repo of repos) {
            if (!loadedRepoIds.has(repo.id)) {
              loadedRepoIds.add(repo.id)

              if (seenRepoIds.has(repo.id)) {
                seenRepos.push(repo)
              } else {
                unseenRepos.push(repo)
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching repositories for topic ${topic.name}:`, error)
          if (error instanceof Error) {
            if (error.message.includes('rate limit exceeded')) {
              toast({
                id: `rate-limit-${Date.now()}`,
                title: "Rate Limit Exceeded",
                description: error.message,
                variant: "destructive"
              })
              break
            } else if (error.message.includes('Consider adding a GitHub API key')) {
              toast({
                id: `api-key-recommended-${Date.now()}`,
                title: "API Key Recommended",
                description: "Adding a GitHub API key will provide better rate limits and reliability.",
                variant: "default"
              })
            } else {
              toast({
                id: `error-${Date.now()}`,
                title: "Error",
                description: `Failed to load repositories for topic: ${topic.name}`,
                variant: "destructive"
              })
            }
          }
        }
      }

      // Sort repositories by stars
      const sortedUnseen = unseenRepos.sort((a, b) => b.stars - a.stars)
      const sortedSeen = seenRepos.sort((a, b) => b.stars - a.stars)

      setAllRepositories(sortedUnseen)
      setSeenRepositories(sortedSeen)

      // Store in cache
      setStoredRepos((prev) => ({
        ...prev,
        [collection.id]: {
          repositories: sortedUnseen,
          seenRepositories: sortedSeen,
          lastFetched: Date.now(),
        },
      }))

      setProgressiveLoadingStatus("")
    } catch (error) {
      console.error("Error fetching repositories:", error)
      if (error instanceof Error) {
        toast({
          id: `error-${Date.now()}`,
          title: "Error",
          description: error.message,
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollection(collection)
    setPage(1) // Reset pagination

    // Load repositories from cache if available, otherwise fetch from API
    if (isCacheValid(collection.id)) {
      const cache = storedRepos[collection.id]
      setAllRepositories(cache.repositories)
      setSeenRepositories(cache.seenRepositories)
    } else {
      loadRepositoriesForCollection(collection)
    }
  }

  const handleMarkAsSeen = (repoId: number) => {
    if (!selectedCollection) return

    // Find the repository to move to seen
    const repoToMove = repositories.find((repo) => repo.id === repoId)
    if (!repoToMove) return

    // Update the selected collection with the seen repository
    const updatedCollection = {
      ...selectedCollection,
      seenRepos: [...(selectedCollection.seenRepos || []), repoId],
    }

    // Update the collections array
    const updatedCollections = collections.map((c) => (c.id === updatedCollection.id ? updatedCollection : c))

    setSelectedCollection(updatedCollection)
    setCollections(updatedCollections)

    // Move the repository from repositories to seenRepositories
    const updatedAllRepositories = allRepositories.filter((repo) => repo.id !== repoId)
    const updatedRepositories = repositories.filter((repo) => repo.id !== repoId)
    const updatedSeenRepositories = [...seenRepositories, repoToMove].sort((a, b) => b.stars - a.stars)

    setAllRepositories(updatedAllRepositories)
    setRepositories(updatedRepositories)
    setSeenRepositories(updatedSeenRepositories)

    // Update the cache
    if (storedRepos[selectedCollection.id]) {
      setStoredRepos((prev) => ({
        ...prev,
        [selectedCollection.id]: {
          ...prev[selectedCollection.id],
          repositories: updatedAllRepositories,
          seenRepositories: updatedSeenRepositories,
        },
      }))
    }
  }

  const handleToggleFavorite = (repoId: number) => {
    if (!selectedCollection) return

    const currentFavorites = collectionFavorites[selectedCollection.id] || []

    if (currentFavorites.some((repo) => repo.id === repoId)) {
      // Remove from favorites
      const updatedFavorites = currentFavorites.filter((repo) => repo.id !== repoId)

      setCollectionFavorites({
        ...collectionFavorites,
        [selectedCollection.id]: updatedFavorites,
      })

      toast({
        id: `remove-favorite-${Date.now()}`,
        title: "Removed from favorites",
        description: "Repository removed from favorites",
        variant: "default"
      })
    } else {
      // Find the repository in either current or seen repositories
      const repo = [...repositories, ...seenRepositories].find((r) => r.id === repoId)

      if (repo) {
        // Add to favorites
        setCollectionFavorites({
          ...collectionFavorites,
          [selectedCollection.id]: [...currentFavorites, repo],
        })

        toast({
          id: `add-favorite-${Date.now()}`,
          title: "Added to favorites",
          description: "Repository added to favorites",
          variant: "default"
        })
      }
    }
  }

  const handleAddTopicToCollection = (topic: string) => {
    if (!selectedCollection) return

    // Check if topic already exists in collection
    if (selectedCollection.topics.some((t) => t.name === topic)) {
      toast({
        id: `topic-exists-${Date.now()}`,
        title: "Topic already exists",
        description: `The topic "${topic}" is already in this collection.`,
        variant: "default"
      })
      return
    }

    // Add the topic to the collection
    const newTopic: Topic = {
      name: topic,
      minStars: undefined, // Use collection default
    }

    const updatedCollection = {
      ...selectedCollection,
      topics: [...selectedCollection.topics, newTopic],
    }

    // Update collections
    const updatedCollections = collections.map((c) => (c.id === selectedCollection.id ? updatedCollection : c))

    setCollections(updatedCollections)
    setSelectedCollection(updatedCollection)

    toast({
      id: `topic-added-${Date.now()}`,
      title: "Topic added",
      description: `Added "${topic}" to collection. Click Refresh to load repositories.`,
      variant: "default"
    })
  }

  const handleDeleteCollection = (collectionId: number) => {
    setCollectionToDelete(collectionId)
  }

  const handleConfirmDelete = () => {
    if (collectionToDelete === null) return

    const updatedCollections = collections.filter((c) => c.id !== collectionToDelete)
    setCollections(updatedCollections)

    // If the deleted collection was selected, select the first available collection or null
    if (selectedCollection?.id === collectionToDelete) {
      setSelectedCollection(updatedCollections[0] || null)
    }

    // Remove from cache
    setStoredRepos((prev) => {
      const newStoredRepos = { ...prev }
      delete newStoredRepos[collectionToDelete]
      return newStoredRepos
    })

    setCollectionToDelete(null)
    toast({
      id: `delete-${Date.now()}`,
      title: "Collection Deleted",
      description: "The collection has been successfully deleted.",
      variant: "default"
    })
  }

  const openCreateModal = () => {
    setCollectionToEdit(undefined)
    setIsModalOpen(true)
  }

  const openEditModal = (collection: Collection) => {
    setCollectionToEdit(collection)
    setIsModalOpen(true)
  }

  const handleRefresh = async () => {
    if (!selectedCollection) return

    // Clear the cache for this collection
    setStoredRepos((prev) => {
      const newStoredRepos = { ...prev }
      delete newStoredRepos[selectedCollection.id]
      return newStoredRepos
    })

    // Reload repositories
    await loadRepositoriesForCollection(selectedCollection)
    toast({
      id: `refresh-${Date.now()}`,
      title: "Collection Refreshed",
      description: "The collection has been refreshed with the latest data.",
      variant: "default"
    })
  }

  // Get current collection favorites
  const getCurrentFavorites = (): Repository[] => {
    if (!selectedCollection) return []
    return collectionFavorites[selectedCollection.id.toString()] || []
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar
        collections={collections}
        selectedCollection={selectedCollection}
        onSelectCollection={handleSelectCollection}
        onCreateCollection={openCreateModal}
        onEditCollection={openEditModal}
        onDeleteCollection={handleDeleteCollection}
        onRefresh={handleRefresh}
        onExportCollection={() => setIsExportModalOpen(true)}
        onImportCollection={() => setIsImportModalOpen(true)}
        isLoading={isLoading}
        onAddApiKey={() => setShowApiKeyForm(true)}
        hasApiKey={!!apiKey}
      />

      <div className="container mx-auto px-4 py-8 flex-grow">
        {!apiKey && !noApiKey ? (
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center text-purple-700 dark:text-purple-400">GitHubie</h1>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Add a GitHub API key for better rate limits and reliability, or continue without one.
              </p>
              <GitHubApiKeyForm onSubmit={(key) => {
                setApiKey(key)
                setShowApiKeyForm(false)
              }} />
              <div className="flex justify-center">
                <Button
                  onClick={() => setNoApiKey(true)}
                  variant="outline"
                  className="w-full"
                >
                  Continue without API key
                </Button>
              </div>
            </div>
          </div>
        ) : showApiKeyForm ? (
          <div className="max-w-md mx-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add GitHub API Key</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKeyForm(false)}
                >
                  Cancel
                </Button>
              </div>
              <GitHubApiKeyForm onSubmit={(key) => {
                setApiKey(key)
                setShowApiKeyForm(false)
              }} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {progressiveLoadingStatus && (
              <div className="bg-blue-50 text-blue-700 p-2 rounded-md text-center text-sm max-w-4xl mx-auto border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                {progressiveLoadingStatus}
              </div>
            )}

            {selectedCollection ? (
              <div className="max-w-4xl mx-auto">
                <RepositoryList
                  repositories={repositories}
                  seenRepositories={seenRepositories}
                  isLoading={isLoading}
                  onMarkAsSeen={handleMarkAsSeen}
                  onAddTopicToCollection={handleAddTopicToCollection}
                  onToggleFavorite={handleToggleFavorite}
                  collectionName={selectedCollection.name}
                  collectionTopics={selectedCollection.topics}
                  favorites={getCurrentFavorites()}
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  collectionId={selectedCollection.id}
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  {collections.length > 0
                    ? "Select a collection to view repositories"
                    : "Create a collection to start exploring repositories"}
                </p>
              </div>
            )}
          </div>
        )}

        <CollectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCollection}
          collection={collectionToEdit}
        />

        <ImportCollectionModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportCollection}
        />

        <ExportCollectionModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          collection={selectedCollection}
        />

        <AlertDialog open={collectionToDelete !== null} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
          <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-white">Delete Collection</AlertDialogTitle>
              <AlertDialogDescription className="dark:text-gray-300">
                Are you sure you want to delete this collection? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Toaster />
    </main>
  )
}
