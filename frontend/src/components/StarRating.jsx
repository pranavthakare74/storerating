import { useState } from "react"

/**
 * Interactive (or read-only) 1-5 star control.
 */
export default function StarRating({ value = 0, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <span className="stars" role={readOnly ? "img" : "radiogroup"} aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= display ? "filled" : ""} ${readOnly ? "readonly" : ""}`}
          onClick={readOnly ? undefined : () => onChange?.(n)}
          onMouseEnter={readOnly ? undefined : () => setHover(n)}
          onMouseLeave={readOnly ? undefined : () => setHover(0)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          disabled={readOnly}
        >
          {n <= display ? "★" : "☆"}
        </button>
      ))}
    </span>
  )
}
