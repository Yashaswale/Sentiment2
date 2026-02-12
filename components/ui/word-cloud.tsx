"use client"

import { useEffect, useState } from "react"

interface WordCloudProps {
  comments: Array<{ text: string }>
  className?: string
}

interface WordData {
  text: string
  count: number
  size: number
}

export function WordCloud({ comments, className }: WordCloudProps) {
  const [words, setWords] = useState<WordData[]>([])

  useEffect(() => {
    const wordCount: Record<string, number> = {}
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
      "not",
      "no",
      "yes",
      "very",
      "so",
      "just",
      "now",
      "then",
      "here",
      "there",
    ])

    comments.forEach((comment) => {
      const words = comment.text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word))

      words.forEach((word) => {
        wordCount[word] = (wordCount[word] || 0) + 1
      })
    })

    // Get top 20 words and calculate sizes
    const sortedWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([text, count]) => ({
        text,
        count,
        size: Math.max(12, Math.min(32, 12 + count * 4)),
      }))

    setWords(sortedWords)
  }, [comments])

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div className="flex flex-wrap gap-2 justify-center items-center p-6">
        {words.map((word, index) => (
          <span
            key={word.text}
            className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground font-medium hover:scale-110 transition-transform cursor-pointer break-words"
            style={{
              fontSize: `${word.size}px`,
              animationDelay: `${index * 100}ms`,
            }}
          >
            {word.text}
            <span className="ml-1 text-xs opacity-60">({word.count})</span>
          </span>
        ))}
      </div>
    </div>
  )
}
