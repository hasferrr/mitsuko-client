"use client"

import { useState, useEffect } from 'react'
import { keepOnlyWrapped } from '@/lib/parser'
import { TERMS_LINK } from '@/constants/external-links'
import Markdown from 'react-markdown'

export const Terms = () => {
  const [terms, setTerms] = useState("")

  useEffect(() => {
    fetch(TERMS_LINK)
      .then((res) => res.text())
      .then((text) => {
        const b64 = keepOnlyWrapped(text, "[[", "]]")
        const mail = Buffer.from(b64, "base64").toString("utf-8")
        setTerms(text.replace(b64, mail))
      })
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
          {terms}
        </Markdown>
      </div>
    </div>
  )
}
