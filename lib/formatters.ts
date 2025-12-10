/**
 * Utility functions for formatting and normalizing data
 * Used across multiple components to ensure consistency
 */

/**
 * Normalize array values that may come from Supabase as strings or arrays
 * Handles cases where Supabase returns array columns as serialized JSON strings
 */
export function normalizeArray(value?: string[] | string | null): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // Not JSON, treat as single string value
    }
    return [trimmed].filter(Boolean)
  }
  return []
}

/**
 * Format an array of values as a comma-separated string
 * Handles both array and string inputs for flexibility
 */
export function formatList(values?: string[] | string | null): string {
  if (!values) return "Not provided"

  if (Array.isArray(values)) {
    return values.length > 0 ? values.join(", ") : "Not provided"
  }

  if (typeof values === "string") {
    const trimmed = values.trim()
    if (!trimmed) return "Not provided"
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.length > 0 ? parsed.join(", ") : "Not provided"
      }
    } catch {
      // Not JSON, return as-is
    }
    return trimmed
  }

  return "Not provided"
}

