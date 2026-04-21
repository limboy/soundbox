import DOMPurify from 'dompurify'
import { useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function HtmlView({ content }: { content: string }): React.JSX.Element {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(content, {
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'meta', 'link', 'style'],
        FORBID_ATTR: [
          'onerror',
          'onload',
          'onclick',
          'onmouseover',
          'onmouseout',
          'onfocus',
          'onblur'
        ]
      }),
    [content]
  )
  return (
    <ScrollArea className="h-full">
      <div
        className="prose prose-sm dark:prose-invert max-w-none p-4"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </ScrollArea>
  )
}
