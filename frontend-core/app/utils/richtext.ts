import DOMPurify from 'isomorphic-dompurify'

interface LexicalNode {
  type?: string
  text?: string
  format?: number
  tag?: string
  listType?: string
  headerState?: number
  colSpan?: number
  rowSpan?: number
  children?: LexicalNode[]
  root?: LexicalNode
  fields?: {
    url?: string
    blockType?: string
    content?: LexicalNode
    linkType?: string
    newTab?: boolean
    doc?: {
      slug?: string
      value?: {
        slug?: string
      }
    }
  }
}

function asLexicalNode(value: unknown): LexicalNode | null {
  return typeof value === 'object' && value !== null ? (value as LexicalNode) : null
}

const HTML_PURIFY_CONFIG = {
  USE_PROFILES: { html: true, svg: false },
  ALLOWED_TAGS: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'strong',
    'em',
    'u',
    's',
    'a',
    'ul',
    'ol',
    'li',
    'table',
    'tr',
    'td',
    'th',
    'br',
    'div'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'colspan', 'rowspan', 'class'], // Restrict attributes strictly
  RETURN_DOM: false
}

const FORMAT = {
  BOLD: 1,
  ITALIC: 2,
  UNDERLINE: 4,
  STRIKETHROUGH: 8
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrapFormat(text: string, format: number): string {
  let result = text
  if (format & FORMAT.BOLD) result = `<strong>${result}</strong>`
  if (format & FORMAT.ITALIC) result = `<em>${result}</em>`
  if (format & FORMAT.UNDERLINE) result = `<u>${result}</u>`
  if (format & FORMAT.STRIKETHROUGH) result = `<s>${result}</s>`
  return result
}

/**
 * Convert Lexical rich text JSON to HTML string
 * Supports paragraphs, headings, lists, tables, links, and text formatting.
 * Output is sanitized to prevent XSS.
 */
export function richTextToHTML(value: unknown): string {
  const node = asLexicalNode(value)
  if (!node) return ''

  let html = ''

  function traverse(n: LexicalNode) {
    if (!n) return

    switch (n.type) {
      case 'root':
        n.children?.forEach(traverse)
        break

      case 'paragraph':
        html += '<p>'
        n.children?.forEach(traverse)
        html += '</p>'
        break

      case 'linebreak':
        html += '<br>'
        break

      case 'text':
        html += wrapFormat(escapeHTML(n.text || ''), n.format || 0)
        break

      case 'heading': {
        const tag = n.tag && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(n.tag) ? n.tag : 'h2'
        html += `<${tag}>`
        n.children?.forEach(traverse)
        html += `</${tag}>`
        break
      }

      case 'link': {
        let url = '#'
        if (n.fields?.linkType === 'internal') {
          if (n.fields?.doc?.value?.slug) {
            url = `/${n.fields.doc.value.slug}`
          } else if (n.fields?.doc?.slug) {
            url = `/${n.fields.doc.slug}`
          }
        } else if (n.fields?.url) {
          url = n.fields.url
        }
        
        url = escapeHTML(url)
        const targetAttr = n.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
        
        html += `<a href="${url}" class="underline"${targetAttr}>`
        n.children?.forEach(traverse)
        html += '</a>'
        break
      }

      case 'list': {
        const listTag = n.listType === 'number' || n.tag === 'ol' ? 'ol' : 'ul'
        html += `<${listTag}>`
        n.children?.forEach(traverse)
        html += `</${listTag}>`
        break
      }

      case 'listitem':
        html += '<li>'
        n.children?.forEach(traverse)
        html += '</li>'
        break

      case 'table':
        html += '<table>'
        n.children?.forEach(traverse)
        html += '</table>'
        break

      case 'tablerow':
        html += '<tr>'
        n.children?.forEach(traverse)
        html += '</tr>'
        break

      case 'tablecell': {
        const tagCell = n.headerState && n.headerState > 0 ? 'th' : 'td'
        html += `<${tagCell}${(n.colSpan || 0) > 1 ? ` colspan="${n.colSpan}"` : ''}${(n.rowSpan || 0) > 1 ? ` rowspan="${n.rowSpan}"` : ''}>`
        n.children?.forEach(traverse)
        html += `</${tagCell}>`
        break
      }

      case 'block': {
        if (n.fields?.blockType === 'twoColumnText' && n.fields?.content) {
          html += '<div class="columns-1 md:columns-2 gap-10">'
          html += richTextToHTML(n.fields.content)
          html += '</div>'
        }
        break
      }

      default:
        n.children?.forEach(traverse)
        break
    }
  }

  traverse(node.root || node)

  return DOMPurify.sanitize(html, HTML_PURIFY_CONFIG) as string
}

/**
 * Extract plain text from Lexical rich text JSON
 * Useful for previews and excerpts.
 */
export function extractLexicalText(value: unknown, maxLength?: number): string {
  const node = asLexicalNode(value)
  if (!node) return ''

  let text = ''

  function traverse(n: LexicalNode) {
    if (!n) return
    if (maxLength && text.length >= maxLength) return

    switch (n.type) {
      case 'text':
        text += n.text || ''
        break

      case 'paragraph':
      case 'heading':
      case 'listitem':
        n.children?.forEach(traverse)
        text += ' '
        break

      case 'linebreak':
        text += ' '
        break

      default:
        n.children?.forEach(traverse)
        break
    }
  }

  traverse(node.root || node)

  text = text.replace(/\s+/g, ' ').trim()

  if (maxLength && text.length > maxLength) {
    return text.substring(0, maxLength).trim() + '...'
  }

  return text
}
