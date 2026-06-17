/**
 * Generic sortable table.
 * columns: [{ key, label, sortable, render?(row) }]
 * sort: { sortBy, order }  onSort(key)
 */
export default function DataTable({ columns, rows, sort, onSort, emptyText = "No records found." }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => {
              const isActive = sort?.sortBy === col.key
              return (
                <th
                  key={col.key}
                  className={col.sortable ? "sortable" : ""}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                >
                  {col.label}
                  {col.sortable && (
                    <span className="sort-indicator">
                      {isActive ? (sort.order === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
