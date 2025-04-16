"use client"

import { CONTACT_LINK } from '@/constants/external-links'
import { useEffect } from 'react'
import { useState } from 'react'
import Markdown from 'react-markdown'

interface TermsProps {
  terms: string
}

export const Terms = ({ terms }: TermsProps) => {
  const [termsContent, setTermsContent] = useState(terms)

  useEffect(() => {
    const text = terms.replace("[[]]", atob(atob(CONTACT_LINK)))
    setTermsContent(text)
  }, [])

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
          {termsContent.replace("[[]]", "")}
        </Markdown>
      </div>
    </div>
  )
}
