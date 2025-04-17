import type { Collection } from "@/types"

// Export a collection to a shareable string
export function exportCollection(collection: Collection): string {
  // Remove any sensitive or unnecessary data before exporting
  const exportableCollection = {
    ...collection,
    // We don't need to export seenRepos as they're specific to the user
    seenRepos: [],
  }

  // Convert to JSON and encode to Base64 for easy sharing
  const jsonString = JSON.stringify(exportableCollection)
  return btoa(jsonString)
}

// Import a collection from a shareable string
export function importCollection(shareString: string): Collection | null {
  try {
    // Decode from Base64 and parse JSON
    const jsonString = atob(shareString)
    const importedCollection = JSON.parse(jsonString) as Collection

    // Validate the imported collection
    if (!isValidCollection(importedCollection)) {
      throw new Error("Invalid collection format")
    }

    // Generate a new ID for the imported collection to avoid conflicts
    return {
      ...importedCollection,
      id: Date.now(),
      seenRepos: [],
    }
  } catch (error) {
    console.error("Failed to import collection:", error)
    return null
  }
}

// Validate that the imported collection has the required fields
function isValidCollection(collection: any): collection is Collection {
  return (
    typeof collection === "object" &&
    typeof collection.name === "string" &&
    typeof collection.minStars === "number" &&
    Array.isArray(collection.topics) &&
    collection.topics.every((topic: any) => typeof topic === "object" && typeof topic.name === "string")
  )
}
