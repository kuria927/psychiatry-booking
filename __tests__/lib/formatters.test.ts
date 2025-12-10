import { normalizeArray, formatList } from "@/lib/formatters"

describe("normalizeArray", () => {
  it("should return empty array for null or undefined", () => {
    expect(normalizeArray(null)).toEqual([])
    expect(normalizeArray(undefined)).toEqual([])
  })

  it("should return array as-is if already an array", () => {
    expect(normalizeArray(["a", "b", "c"])).toEqual(["a", "b", "c"])
    expect(normalizeArray([])).toEqual([])
  })

  it("should parse JSON string arrays", () => {
    expect(normalizeArray('["a", "b", "c"]')).toEqual(["a", "b", "c"])
    expect(normalizeArray('[]')).toEqual([])
  })

  it("should handle non-JSON strings", () => {
    expect(normalizeArray("single value")).toEqual(["single value"])
    expect(normalizeArray("  trimmed  ")).toEqual(["trimmed"])
  })

  it("should handle empty strings", () => {
    expect(normalizeArray("")).toEqual([])
    expect(normalizeArray("   ")).toEqual([])
  })

  it("should handle invalid JSON gracefully", () => {
    expect(normalizeArray("{ invalid json }")).toEqual(["{ invalid json }"])
  })
})

describe("formatList", () => {
  it("should return 'Not provided' for null or undefined", () => {
    expect(formatList(null)).toBe("Not provided")
    expect(formatList(undefined)).toBe("Not provided")
  })

  it("should format array as comma-separated string", () => {
    expect(formatList(["a", "b", "c"])).toBe("a, b, c")
    expect(formatList(["single"])).toBe("single")
  })

  it("should return 'Not provided' for empty array", () => {
    expect(formatList([])).toBe("Not provided")
  })

  it("should parse and format JSON string arrays", () => {
    expect(formatList('["a", "b", "c"]')).toBe("a, b, c")
    expect(formatList('[]')).toBe("Not provided")
  })

  it("should handle plain strings", () => {
    expect(formatList("plain string")).toBe("plain string")
    expect(formatList("  trimmed  ")).toBe("trimmed")
  })

  it("should return 'Not provided' for empty strings", () => {
    expect(formatList("")).toBe("Not provided")
    expect(formatList("   ")).toBe("Not provided")
  })

  it("should handle invalid JSON strings gracefully", () => {
    expect(formatList("{ invalid }")).toBe("{ invalid }")
  })
})

