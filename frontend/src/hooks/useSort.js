import { useState, useCallback } from "react"

/**
 * Manages { sortBy, order } state and toggles direction when the same
 * column header is clicked again.
 */
export function useSort(initialSortBy = "name", initialOrder = "asc") {
  const [sort, setSort] = useState({ sortBy: initialSortBy, order: initialOrder })

  const onSort = useCallback((key) => {
    setSort((prev) =>
      prev.sortBy === key
        ? { sortBy: key, order: prev.order === "asc" ? "desc" : "asc" }
        : { sortBy: key, order: "asc" },
    )
  }, [])

  return { sort, onSort }
}
