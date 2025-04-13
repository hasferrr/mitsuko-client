"use client"

import { useQuery } from '@tanstack/react-query'
import { fetchTerms } from '@/lib/api/terms'
import Markdown from 'react-markdown'

export const Terms = () => {
  const { data: terms, isLoading, error } = useQuery({
    queryKey: ['terms'],
    queryFn: fetchTerms,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  if (isLoading) return (
    <div className="p-4 max-w-5xl text-justify">
      Loading...
    </div>
  )

  if (error) return (
    <div className="p-4 max-w-5xl text-justify">
      Error loading terms: {error.message}
    </div>
  )

  return (
    <div className="p-4 max-w-5xl grid mx-auto text-justify">
      <div>
        <Markdown
          components={{
            h1: ({ children }) => <h1 className="text-lg font-bold">{children}</h1>,
            h2: ({ children }) => <h2 className="mt-4 text-base font-semibold mb-4">{children}</h2>,
            p: ({ children }) => <p className="my-4 text-sm">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 my-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 my-4">{children}</ol>,
            li: ({ children }) => <li className="text-sm mb-2">{children}</li>,
          }}
        >
          {terms}
        </Markdown>
      </div>
    </div>
  )
}
