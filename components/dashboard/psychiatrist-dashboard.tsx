"use client"

import { useEffect, useState, useCallback, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { AppointmentRequest } from "@/types/database"
import { useRouter } from "next/navigation"
import { formatList } from "@/lib/formatters"

interface PsychiatristDashboardProps {
  userId: string
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
/**
 * Psychiatrist dashboard component
 * Displays appointment requests for the logged-in psychiatrist
 */
export function PsychiatristDashboard({ userId }: PsychiatristDashboardProps) {
  const router = useRouter()
  const [requests, setRequests] = useState<AppointmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  /**
   * Fetch appointment requests for this psychiatrist
   */
  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Get the current users email from Supabase auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser?.email) {
        console.error("No user email found")
        setLoading(false)
        return
      }

      // Get the psychiatrist record for this user by matching email
      const { data: psychiatrist, error: psychError } = await supabase
        .from("psychiatrists")
        .select("id")
        .eq("email", authUser.email)
        .single()

      if (psychError) {
        console.error("Error fetching psychiatrist:", psychError)
        // If psychiatrist does not exist, show empty list
        setRequests([])
        setLoading(false)
        return
      }

      // Fetch requests for this psychiatrist via API
      if (psychiatrist) {
        const response = await fetch(`/api/appointments?psychiatristId=${psychiatrist.id}`, {
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok || result.error) {
          throw new Error(result.error || "Failed to fetch appointment requests")
        }

        setRequests(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      setError(error instanceof Error ? error.message : "Failed to load appointment requests")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [userId, fetchRequests])

  /**
   * Update appointment request status
   */
  const updateStatus = useCallback(async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/appointments/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Refresh requests after update
      fetchRequests()
    } catch (error: any) {
      console.error("Error updating status:", error)
      alert(`Failed to update status: ${error.message}`)
    }
  }, [fetchRequests])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/psychiatrist-login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      // Still redirect even if there's an error
      router.push("/psychiatrist-login")
      router.refresh()
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const approvedRequests = requests.filter((r) => r.status === "approved")
  const declinedRequests = requests.filter((r) => r.status === "declined")
  const completedRequests = requests.filter((r) => r.status === "completed")

  const handleCardSelect = (request: AppointmentRequest) => {
    setSelectedRequest(request)
    setDetailsOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDetailsOpen(open)
    if (!open) {
      setSelectedRequest(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading requests...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Psychiatrist Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your appointment requests
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-2xl">{requests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">{pendingRequests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-2xl">{approvedRequests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl">{completedRequests.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <RequestsGrid requests={requests} onStatusUpdate={updateStatus} onSelect={handleCardSelect} />
        </TabsContent>
        <TabsContent value="pending">
          <RequestsGrid requests={pendingRequests} onStatusUpdate={updateStatus} onSelect={handleCardSelect} />
        </TabsContent>
        <TabsContent value="approved">
          <RequestsGrid requests={approvedRequests} onStatusUpdate={updateStatus} onSelect={handleCardSelect} />
        </TabsContent>
        <TabsContent value="declined">
          <RequestsGrid requests={declinedRequests} onStatusUpdate={updateStatus} onSelect={handleCardSelect} />
        </TabsContent>
        <TabsContent value="completed">
          <RequestsGrid requests={completedRequests} onStatusUpdate={updateStatus} onSelect={handleCardSelect} />
        </TabsContent>
      </Tabs>

      <Dialog open={detailsOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-2xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRequest.patient_name}</DialogTitle>
                <DialogDescription>
                  Submitted {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString() : "N/A"} · Status:{" "}
                  <span className="capitalize">{selectedRequest.status}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <DetailRow label="Patient Email" value={selectedRequest.patient_email} />
                <DetailRow label="Preferred Appointment Type" value={selectedRequest.preferred_appointment_type || "Not provided"} />
                <DetailRow label="Preferred Times" value={formatList(selectedRequest.preferred_times)} />
                <DetailRow label="What brings you here?" value={selectedRequest.what_brings_you || "Not provided"} />
                <DetailRow label="Hoping to work on" value={formatList(selectedRequest.hoping_to_work_on)} />
                <DetailRow label="Other (if provided)" value={selectedRequest.other_work_on || "Not provided"} />
                <DetailRow label="Spoken with a professional before?" value={selectedRequest.spoken_before || "Not provided"} />
                <DetailRow label="Anything else" value={selectedRequest.anything_else || "Not provided"} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RequestsGrid({
  requests,
  onStatusUpdate,
  onSelect,
}: {
  requests: AppointmentRequest[]
  onStatusUpdate: (id: string, status: string) => void
  onSelect: (request: AppointmentRequest) => void
}) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No requests found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {requests.map((request) => (
        <Card
          key={request.id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelect(request)}
        >
          <CardHeader className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{request.patient_name}</CardTitle>
                <CardDescription className="capitalize">
                  {request.preferred_appointment_type || "Not specified"}
                </CardDescription>
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize">
                {request.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {getPreviewText(request.what_brings_you)}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {request.created_at
                  ? new Date(request.created_at).toLocaleDateString()
                  : "Date unknown"}
              </span>
              <button
                type="button"
                className="font-medium text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(request)
                }}
              >
                View details
              </button>
            </div>
            <div
              className="space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-medium text-muted-foreground">
                Update status
              </p>
              <Select
                value={request.status}
                onValueChange={(value) => onStatusUpdate(request.id, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const getPreviewText = (text?: string | null) => {
  if (!text) return "No details provided."
  return text.length > 100 ? `${text.slice(0, 100)}…` : text
}


function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-line">{value || "Not provided"}</p>
    </div>
  )
}