import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { GoogleAnalytics } from "./GoogleAnalytics"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PsyConnect - Connect with Mental Health Professionals",
  description: "Browse psychiatrists and request appointments",
  icons: {
    icon: "/favicon.png",
  },
}

/**
 * Root layout component
 * Wraps the entire application with theme provider, navigation, and analytics
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          {/* GA at the bottom of body */}
          <GoogleAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
