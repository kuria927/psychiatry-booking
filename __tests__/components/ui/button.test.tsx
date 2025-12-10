import { render, screen } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button component", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("should apply variant classes correctly", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    const button = container.querySelector("button")
    expect(button).toHaveClass("bg-destructive")
  })

  it("should apply size classes correctly", () => {
    const { container } = render(<Button size="lg">Large Button</Button>)
    const button = container.querySelector("button")
    expect(button).toHaveClass("h-11")
  })

  it("should handle disabled state", () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
  })

  it("should handle onClick events", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    screen.getByRole("button").click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("should merge custom className", () => {
    const { container } = render(<Button className="custom-class">Test</Button>)
    const button = container.querySelector("button")
    expect(button).toHaveClass("custom-class")
  })
})

