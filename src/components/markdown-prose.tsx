import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import Link from "@/components/link"

type MarkdownProseProps = {
  content: string
}

export function MarkdownProse({ content }: MarkdownProseProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h2: props => <h2 className="mt-10 text-2xl font-semibold tracking-tight first:mt-0" {...props} />,
        h3: props => <h3 className="mt-7 text-xl font-semibold" {...props} />,
        h4: props => <h4 className="mt-6 text-lg font-semibold" {...props} />,
        p: props => <p className="my-4 leading-7 text-foreground" {...props} />,
        ul: props => <ul className="my-4 list-disc pl-6 space-y-2" {...props} />,
        ol: props => <ol className="my-4 list-decimal pl-6 space-y-2" {...props} />,
        li: props => <li className="leading-7" {...props} />,
        a: props => <Link href={props.href || "#"} className="text-sidebar-primary underline underline-offset-4" {...props} />,
        pre: props => <pre className="my-4 overflow-x-auto rounded-lg bg-muted p-3 text-sm leading-6" {...props} />,
        code: ({ className, children, ...props }) => (
          <code className={"rounded bg-muted px-1 py-0.5 text-[0.9em] " + (className || "")} {...props}>
            {children}
          </code>
        ),
        blockquote: props => (
          <blockquote className="my-4 border-l-4 border-border pl-4 text-muted-foreground italic" {...props} />
        ),
        table: props => (
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm" {...props} />
          </div>
        ),
        thead: props => <thead className="bg-muted/50" {...props} />,
        th: props => <th className="border border-border px-3 py-2 text-left font-semibold" {...props} />,
        td: props => <td className="border border-border px-3 py-2 align-top" {...props} />,
        img: ({ alt, ...props }) => <img className="my-6 rounded max-w-full h-auto" alt={alt ?? ""} {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
