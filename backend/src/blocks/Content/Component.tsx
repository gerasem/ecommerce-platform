import { cn } from '@/utilities/cn'
import React from 'react'
import { RichText } from '@/components/RichText'
import type { DefaultDocumentIDType } from 'payload'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'

export const ContentBlock: React.FC<
  ContentBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = props => {
  const { content, width, customClass, className } = props

  const widthClasses: Record<string, string> = {
    '1/1': 'col-span-12',
    '1/2': 'col-span-12 lg:col-span-6',
    '1/3': 'col-span-12 lg:col-span-4',
    '2/3': 'col-span-12 lg:col-span-8',
  }

  const colClass = width ? widthClasses[width] ?? 'col-span-12' : 'col-span-12'

  return (
    <div className={cn('container my-16', className, customClass)}>
      <div className="grid grid-cols-12 gap-y-8 gap-x-16">
        <div className={colClass}>
          {content && <RichText data={content} enableGutter={false} />}
        </div>
      </div>
    </div>
  )
}
