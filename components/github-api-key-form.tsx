"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface GitHubApiKeyFormProps {
  onSubmit: (apiKey: string) => void
}

export function GitHubApiKeyForm({ onSubmit }: GitHubApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      setError("Please enter a GitHub API key")
      return
    }

    // Validate the API key by making a test request
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error("Invalid API key")
      }

      onSubmit(apiKey)
      setError("")
    } catch (err) {
      setError("Invalid GitHub API key. Please check and try again.")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-t-4 border-t-purple-500 shadow-lg dark:bg-gray-800 dark:border-purple-700">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/30 dark:to-gray-800">
        <CardTitle className="text-purple-700 dark:text-purple-300">GitHub API Key</CardTitle>
        <CardDescription className="dark:text-gray-300">
          Enter your GitHub personal access token to start exploring repositories. You can create a token in your GitHub
          settings under Developer Settings &gt; Personal access tokens.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full border-blue-200 focus-visible:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {error && (
                <div className="flex items-center text-red-500 text-sm dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
          >
            Save API Key
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
