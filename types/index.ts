export interface Topic {
  name: string
  minStars?: number
}

export interface Collection {
  id: number
  name: string
  minStars: number
  topics: Topic[]
  seenRepos: number[]
  favorites?: number[] // Add favorites to each collection
}

export interface Repository {
  id: number
  name: string
  owner: string
  description: string
  url: string
  stars: number
  topics: string[]
  image?: string
}

export interface StoredRepositories {
  [collectionId: string]: {
    repositories: Repository[]
    seenRepositories: Repository[]
    lastFetched: number
  }
}

export interface CollectionFavorites {
  [collectionId: string]: Repository[]
}
