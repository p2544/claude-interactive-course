import TextBlock from './TextBlock.jsx'
import TableBlock from './TableBlock.jsx'
import CodeBlock from './CodeBlock.jsx'
import Callout from './Callout.jsx'

const BLOCK_COMPONENTS = {
  text: TextBlock,
  table: TableBlock,
  code: CodeBlock,
  callout: Callout,
}

export function BlockList({ blocks }) {
  const list = Array.isArray(blocks) ? blocks : []
  return (
    <div className="space-y-3">
      {list.map((block, i) => {
        const Component = BLOCK_COMPONENTS[block?.type]
        if (!Component) return null
        return <Component key={i} block={block} />
      })}
    </div>
  )
}
