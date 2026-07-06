export default function TableBlock({ block }) {
  const { caption, headers = [], rows = [] } = block || {}
  return (
    <figure className="my-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse text-sm">
          {headers.length > 0 && (
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="odd:bg-white even:bg-gray-50/60 dark:odd:bg-transparent dark:even:bg-gray-800/30">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="border-b border-gray-100 px-3 py-2 align-top text-gray-700 dark:border-gray-800/60 dark:text-gray-300"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500 dark:border-gray-800/60 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
