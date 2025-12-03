"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Psychiatrist } from "@/types/database"
import { Button } from "@/components/ui/button"

/**
 * Home page - Public psychiatrist directory
 * Displays a list of all psychiatrists available for booking with filtering
 */
export default function Home() {
  const [psychiatrists, setPsychiatrists] = useState<Psychiatrist[]>([])
  const [filteredPsychiatrists, setFilteredPsychiatrists] = useState<Psychiatrist[]>([])
  const [loading, setLoading] = useState(true)
  const [nameFilter, setNameFilter] = useState<string>("")
  const [locationFilter, setLocationFilter] = useState<string>("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("")

  /**
   * Fetch all psychiatrists from Supabase
   */
  const fetchPsychiatrists = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("psychiatrists")
        .select("*")
        .order("name")

      if (error) throw error
      setPsychiatrists(data || [])
    } catch (error) {
      console.error("Error fetching psychiatrists:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Filter psychiatrists based on search criteria
   */
  const filterPsychiatrists = useCallback(() => {
    let filtered = [...psychiatrists]

    if (nameFilter) {
      filtered = filtered.filter((p) => {
        if (!p.name || typeof p.name !== "string") return false
        try {
          return p.name.toLowerCase().includes(nameFilter.toLowerCase())
        } catch (error) {
          console.error("Error filtering by name:", error)
          return false
        }
      })
    }

    if (locationFilter) {
      filtered = filtered.filter((p) => {
        if (!p.location || typeof p.location !== "string") return false
        try {
          return p.location.toLowerCase().includes(locationFilter.toLowerCase())
        } catch (error) {
          console.error("Error filtering by location:", error)
          return false
        }
      })
    }

    if (specialtyFilter) {
      filtered = filtered.filter((p) => {
        if (!p.specialty || typeof p.specialty !== "string") return false
        try {
          return p.specialty.toLowerCase().includes(specialtyFilter.toLowerCase())
        } catch (error) {
          console.error("Error filtering by subspecialty:", error)
          return false
        }
      })
    }

    setFilteredPsychiatrists(filtered)
  }, [psychiatrists, nameFilter, locationFilter, specialtyFilter])

  useEffect(() => {
    fetchPsychiatrists()
  }, [fetchPsychiatrists])

  useEffect(() => {
    filterPsychiatrists()
  }, [filterPsychiatrists])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading psychiatrists...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">PsyConnect</h1>
        <p className="text-muted-foreground text-lg">
          Browse our network of qualified psychiatrists and request an appointment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Psychiatrists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Filter by name..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter by location..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Subspecialty</Label>
              <Input
                id="specialty"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                placeholder="Filter by subspecialty..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredPsychiatrists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {psychiatrists.length === 0
                ? "No psychiatrists available at this time."
                : "No psychiatrists match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPsychiatrists.map((psychiatrist) => (
            <Card key={psychiatrist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{psychiatrist.name}</CardTitle>
                <CardDescription>{psychiatrist.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{psychiatrist.location}</p>
                </div>
                <Link href={`/psychiatrist/${psychiatrist.id}`}>
                  <Button className="w-full">View Profile & Request Appointment</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


