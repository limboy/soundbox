import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MarkdownView({ content }: { content: string }): React.JSX.Element {
  return (
    <ScrollArea className="h-full">
      <div className="prose prose-sm dark:prose-invert max-w-none p-4 [&_*]:!my-2 [&_h1]:!text-xl [&_h2]:!text-lg [&_h3]:!text-base">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </ScrollArea>
  )
}
