"use client"

import { CONTACT_LINK } from '@/constants/external-links'
import { useState } from 'react'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

interface TermsProps {
  terms: string
}

export const Terms = ({ terms }: TermsProps) => {
  const [termsContent, setTermsContent] = useState(terms)

  const handleClick = () => {
    const text = terms.replace("[[]]", atob(atob(CONTACT_LINK)))
    setTermsContent(text)
  }

  const processText = (text: string) => {
    if (!text.includes("[[]]")) return text
    return text.replace("[[]]", '<span class="cursor-pointer" id="reveal-contact">[click to reveal]</span>')
  }

  return (
    <div className="p-4 max-w-5xl grid mx-auto text-justify">
      <div>
        <Markdown
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold">{children}</h1>,
            h2: ({ children }) => <h2 className="mt-4 text-lg font-semibold mb-4">{children}</h2>,
            p: ({ children }) => <p className="my-4 text-base">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 my-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 my-4">{children}</ol>,
            li: ({ children }) => <li className="text-base mb-2">{children}</li>,
            span: ({ ...props }) => {
              if (props.id === 'reveal-contact') {
                return <span {...props} onClick={handleClick} />
              }
              return <span {...props} />
            }
          }}
        >
          {processText(termsContent)}
        </Markdown>
      </div>
    </div>
  )
}
