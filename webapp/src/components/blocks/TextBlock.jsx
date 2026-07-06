import { renderMarkdownLite } from '../../lib/markdown.jsx'

export default function TextBlock({ block }) {
  return <div className="space-y-2">{renderMarkdownLite(block?.md)}</div>
}
