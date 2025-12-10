import { cn } from "@/lib/utils"

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })

  it("should resolve Tailwind conflicts", () => {
    expect(cn("p-4", "p-2")).toBe("p-2")
  })

  it("should handle empty inputs", () => {
    expect(cn()).toBe("")
    expect(cn("")).toBe("")
  })

  it("should handle arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar")
  })

  it("should handle mixed inputs", () => {
    expect(cn("foo", ["bar", "baz"], false && "qux")).toBe("foo bar baz")
  })
})

