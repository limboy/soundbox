import { ScrollArea } from '@/components/ui/scroll-area'

export function TextView({ content }: { content: string }): React.JSX.Element {
  return (
    <ScrollArea className="h-full">
      <pre className="whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed">
        {content}
      </pre>
    </ScrollArea>
  )
}
