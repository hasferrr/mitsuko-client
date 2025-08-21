"use client"

import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

interface ChangelogProps {
  changelog: string
}

export const Changelog = ({ changelog }: ChangelogProps) => {
  return (
    <div className="p-4 max-w-5xl grid mx-auto text-justify mt-6">
      <div>
        <Markdown
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4 border-b pb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>,
            p: ({ children }) => <p className="my-4 text-base">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 my-4">{children}</ol>,
            li: ({ children }) => <li className="text-base mb-1">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          }}
        >
          {changelog}
        </Markdown>
      </div>
    </div>
  )
}