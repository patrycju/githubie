import type { Repository } from "@/types"

export async function fetchRepositoriesByTopic(apiKey: string, topic: string, minStars = 500): Promise<Repository[]> {
  const query = `topic:${topic} stars:>=${minStars}`
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`

  const response = await fetch(url, {
    headers: {
      Authorization: `token ${apiKey}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    owner: item.owner.login,
    description: item.description || "",
    url: item.html_url,
    stars: item.stargazers_count,
    topics: item.topics || [],
    image: item.owner.avatar_url, // Using owner avatar as image
  }))
}

export async function fetchRepositoriesWithoutTopics(apiKey: string, minStars = 10000): Promise<Repository[]> {
  // Search for repositories with no topics and high star count
  const query = `stars:>=${minStars} NOT topics:>=1`
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`

  const response = await fetch(url, {
    headers: {
      Authorization: `token ${apiKey}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    owner: item.owner.login,
    description: item.description || "",
    url: item.html_url,
    stars: item.stargazers_count,
    topics: item.topics || [],
    image: item.owner.avatar_url, // Using owner avatar as image
  }))
}
