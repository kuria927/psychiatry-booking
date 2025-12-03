"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { Psychiatrist, AppointmentRequest } from "@/types/database"
import { Trash2, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { clearAdminSession } from "@/lib/auth"

/**
 * Admin dashboard component
 * Allows admin to manage psychiatrists and view all appointment requests
 */
export function AdminDashboard() {
  const router = useRouter()
  const [psychiatrists, setPsychiatrists] = useState<Psychiatrist[]>([])
  const [requests, setRequests] = useState<AppointmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPsychiatrist, setEditingPsychiatrist] = useState<Psychiatrist | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  /**
   * Fetch all psychiatrists and appointment requests
   */
  const fetchData = useCallback(async () => {
    try {
      const [psychiatristsResult, requestsResult] = await Promise.all([
        supabase.from("psychiatrists").select("*").order("name"),
        supabase.from("appointment_requests").select("*").order("created_at", { ascending: false }),
      ])

      if (psychiatristsResult.error) throw psychiatristsResult.error
      if (requestsResult.error) throw requestsResult.error

      setPsychiatrists(psychiatristsResult.data || [])
      setRequests(requestsResult.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /**
   * Delete a psychiatrist
   */
  const deletePsychiatrist = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this psychiatrist?")) return

    try {
      const { error } = await supabase.from("psychiatrists").delete().eq("id", id)

      if (error) throw error

      fetchData()
    } catch (error: any) {
      console.error("Error deleting psychiatrist:", error)
      alert(`Failed to delete psychiatrist: ${error.message}`)
    }
  }, [fetchData])

  /**
   * Handle form submission for adding/editing psychiatrist
   */
  const handlePsychiatristSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const psychiatristData = {
      name: formData.get("name") as string,
      specialty: formData.get("specialty") as string,
      location: formData.get("location") as string,
      bio: formData.get("bio") as string,
      email: formData.get("email") as string,
    }

    try {
      if (editingPsychiatrist) {
        // Update existing psychiatrist
        const { error } = await supabase
          .from("psychiatrists")
          .update(psychiatristData)
          .eq("id", editingPsychiatrist.id)

        if (error) throw error
      } else {
        // Create new psychiatrist
        const { error } = await supabase.from("psychiatrists").insert([psychiatristData])

        if (error) throw error
      }

      setDialogOpen(false)
      setEditingPsychiatrist(null)
      fetchData()
    } catch (error: any) {
      console.error("Error saving psychiatrist:", error)
      alert(`Failed to save psychiatrist: ${error.message}`)
    }
  }, [editingPsychiatrist, fetchData])

  const handleSignOut = () => {
    clearAdminSession()
    router.push("/admin-login")
    router.refresh()
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage psychiatrists and view all appointment requests
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Psychiatrists</CardDescription>
            <CardTitle className="text-2xl">{psychiatrists.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-2xl">{requests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-2xl">{pendingRequests.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="psychiatrists" className="space-y-4">
        <TabsList>
          <TabsTrigger value="psychiatrists">Psychiatrists</TabsTrigger>
          <TabsTrigger value="requests">Appointment Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="psychiatrists" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Psychiatrists</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingPsychiatrist(null)}
                >
                  Add Psychiatrist
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPsychiatrist ? "Edit Psychiatrist" : "Add New Psychiatrist"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPsychiatrist
                      ? "Update the psychiatrist information below"
                      : "Fill in the details to add a new psychiatrist"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePsychiatristSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingPsychiatrist?.name || ""}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="specialty">Subspecialty *</Label>
                      <Input
                        id="specialty"
                        name="specialty"
                        defaultValue={editingPsychiatrist?.specialty || ""}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        defaultValue={editingPsychiatrist?.location || ""}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={editingPsychiatrist?.email || ""}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bio">Bio *</Label>
                      <textarea
                        id="bio"
                        name="bio"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        defaultValue={editingPsychiatrist?.bio || ""}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false)
                        setEditingPsychiatrist(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {psychiatrists.map((psychiatrist) => (
              <Card key={psychiatrist.id}>
                <CardHeader>
                  <CardTitle>{psychiatrist.name}</CardTitle>
                  <CardDescription>{psychiatrist.specialty}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{psychiatrist.location}</p>
                  <p className="text-sm line-clamp-2">{psychiatrist.bio}</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPsychiatrist(psychiatrist)
                        setDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePsychiatrist(psychiatrist.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <h2 className="text-2xl font-semibold">All Appointment Requests</h2>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No requests found</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle>{request.patient_name}</CardTitle>
                    <CardDescription>
                      Status: <span className="capitalize">{request.status}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{request.patient_email}</p>
                    </div>
                    {request.preferred_date && (
                      <div>
                        <p className="text-sm font-medium">Preferred Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.preferred_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {request.preferred_time && (
                      <div>
                        <p className="text-sm font-medium">Preferred Time</p>
                        <p className="text-sm text-muted-foreground">{request.preferred_time}</p>
                      </div>
                    )}
                    {request.message && (
                      <div>
                        <p className="text-sm font-medium">Message</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {request.message}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Requested On</p>
                      <p className="text-sm text-muted-foreground">
                        {request.created_at
                          ? new Date(request.created_at).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


