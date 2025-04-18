import type { Repository } from "@/types"

interface GitHubResponse {
  items: any[]
  total_count: number
  message?: string
  documentation_url?: string
}

async function makeGitHubRequest(url: string, apiKey?: string): Promise<GitHubResponse> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  }

  if (apiKey) {
    headers.Authorization = `token ${apiKey}`
  }

  const response = await fetch(url, { headers })

  // Check rate limit headers
  const rateLimitRemaining = response.headers.get('x-ratelimit-remaining')
  const rateLimitReset = response.headers.get('x-ratelimit-reset')
  
  if (rateLimitRemaining === '0') {
    const resetTime = new Date(parseInt(rateLimitReset || '0') * 1000)
    throw new Error(`GitHub API rate limit exceeded. Please try again after ${resetTime.toLocaleTimeString()}`)
  }

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`GitHub API error: ${errorData.message || response.status}`)
  }

  return response.json()
}

export async function fetchRepositoriesByTopic(apiKey: string | undefined, topic: string, minStars = 500): Promise<Repository[]> {
  const query = `topic:${topic} stars:>=${minStars}`
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`

  try {
    const data = await makeGitHubRequest(url, apiKey)
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      owner: item.owner.login,
      description: item.description || "",
      url: item.html_url,
      stars: item.stargazers_count,
      topics: item.topics || [],
      image: item.owner.avatar_url,
    }))
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit exceeded')) {
      throw error
    }
    // If unauthenticated request fails, try with authentication if available
    if (!apiKey) {
      throw new Error('GitHub API request failed. Consider adding a GitHub API key for better rate limits.')
    }
    throw error
  }
}

export async function fetchRepositoriesWithoutTopics(apiKey: string | undefined, minStars = 10000): Promise<Repository[]> {
  const query = `stars:>=${minStars} NOT topics:>=1`
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`

  try {
    const data = await makeGitHubRequest(url, apiKey)
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      owner: item.owner.login,
      description: item.description || "",
      url: item.html_url,
      stars: item.stargazers_count,
      topics: item.topics || [],
      image: item.owner.avatar_url,
    }))
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit exceeded')) {
      throw error
    }
    // If unauthenticated request fails, try with authentication if available
    if (!apiKey) {
      throw new Error('GitHub API request failed. Consider adding a GitHub API key for better rate limits.')
    }
    throw error
  }
}
