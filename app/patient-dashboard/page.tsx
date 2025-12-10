"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase, signOut } from "@/lib/supabase"
import { AppointmentRequest } from "@/types/database"
import { normalizeArray, formatList } from "@/lib/formatters"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"

const PREFERRED_TIME_OPTIONS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekend mornings",
  "Weekend afternoons",
]

const HOPING_TO_WORK_ON_OPTIONS = [
  "Short-term support (specific situation)",
  "Long-term support",
  "Understanding patterns or challenges",
  "Discussing coping strategies",
  "Not sure yet",
]

const OTHER_MARKER = "Other:"

interface EditAppointmentFormValues {
  name: string
  email: string
  preferred_appointment_type: string
  preferred_times: string[]
  what_brings_you: string
  hoping_to_work_on: string[]
  other_work_on: string
  spoken_before: string
  anything_else: string
}

/**
 * Patient dashboard page
 * Displays appointment requests for the logged-in patient
 */
export default function PatientDashboard() {
  const router = useRouter()
  const [requests, setRequests] = useState<AppointmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [editingRequest, setEditingRequest] = useState<AppointmentRequest | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const checkAuth = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push("/patient-login")
        return
      }

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (!patient) {
        router.push("/patient-login")
        return
      }

      const { data, error } = await supabase
        .from("appointment_requests")
        .select("*")
        .eq("patient_email", session.user.email)
        .order("created_at", { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const refreshData = async () => {
    setLoading(true)
    await checkAuth()
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const handleCancel = async (request: AppointmentRequest) => {
    if (request.status !== "pending") return
    if (!confirm("Are you sure you want to cancel this appointment request?")) return

    setProcessingId(request.id)
    setActionError(null)
    try {
      const response = await fetch(`/api/appointments/${request.id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to cancel appointment")
      }
      setActionMessage("Appointment request cancelled.")
      await refreshData()
    } catch (error: any) {
      setActionError(error.message || "Failed to cancel appointment.")
    } finally {
      setProcessingId(null)
    }
  }

  const handleEdit = (request: AppointmentRequest) => {
    setEditingRequest(request)
    setEditDialogOpen(true)
  }

  const handleEditDialogChange = (open: boolean) => {
    setEditDialogOpen(open)
    if (!open) {
      setEditingRequest(null)
    }
  }

  const handleEditSuccess = async (message: string) => {
    setActionMessage(message)
    await refreshData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <p className="text-muted-foreground">Manage your appointment requests</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      {actionMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You haven&apos;t submitted any appointment requests yet.
            </p>
            <div className="mt-4 text-center">
              <Button onClick={() => router.push("/")}>Browse Psychiatrists</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const isPending = request.status === "pending"
            const normalizedTimes = normalizeArray(request.preferred_times)
            const normalizedHoping = normalizeArray(request.hoping_to_work_on)

            return (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{request.patient_name || "Appointment Request"}</CardTitle>
                      <CardDescription>
                        Status: <span className="capitalize">{request.status}</span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Requested on</p>
                      <p className="text-sm font-medium">
                        {request.created_at ? new Date(request.created_at).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow label="Name" value={request.patient_name} />
                  <DetailRow label="Email" value={request.patient_email} />
                  <DetailRow
                    label="Preferred Appointment Type"
                    value={request.preferred_appointment_type || "Not provided"}
                  />
                  <DetailRow label="Preferred Times" value={formatList(normalizedTimes)} />
                  <DetailRow
                    label="What are you hoping to work on?"
                    value={formatList(normalizedHoping)}
                  />
                  <DetailRow label="Other (if provided)" value={request.other_work_on || "Not provided"} />
                  <DetailRow
                    label="What brings you here?"
                    value={request.what_brings_you || "Not provided"}
                  />
                  <DetailRow
                    label="Have you spoken with a professional before?"
                    value={request.spoken_before || "Not provided"}
                  />
                  <DetailRow label="Additional details" value={request.anything_else || "Not provided"} />

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      disabled={!isPending || processingId === request.id}
                      onClick={() => handleEdit(request)}
                    >
                      Edit Appointment
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={!isPending || processingId === request.id}
                      onClick={() => handleCancel(request)}
                    >
                      Cancel Appointment
                    </Button>
                    {!isPending && (
                      <p className="text-sm text-muted-foreground">
                        This request can no longer be edited or cancelled.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <EditAppointmentDialog
        request={editingRequest}
        open={editDialogOpen}
        onOpenChange={handleEditDialogChange}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-line">{value || "Not provided"}</p>
    </div>
  )
}


function EditAppointmentDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
}: {
  request: AppointmentRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (message: string) => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultValues: EditAppointmentFormValues | undefined = useMemo(() => {
    if (!request) return undefined
    return {
      name: request.patient_name || "",
      email: request.patient_email || "",
      preferred_appointment_type: request.preferred_appointment_type || "",
      preferred_times: normalizeArray(request.preferred_times),
      what_brings_you: request.what_brings_you || "",
      hoping_to_work_on: normalizeArray(request.hoping_to_work_on),
      other_work_on: request.other_work_on || "",
      spoken_before: request.spoken_before || "",
      anything_else: request.anything_else || "",
    }
  }, [request])

  const { register, handleSubmit, setValue, watch, reset } = useForm<EditAppointmentFormValues>({
    defaultValues,
  })

  const preferredTimes = watch("preferred_times") || []
  const hopingToWorkOn = watch("hoping_to_work_on") || []

  const toggleArrayValue = (array: string[], value: string) => {
    if (array.includes(value)) {
      return array.filter((item) => item !== value)
    }
    return [...array, value]
  }

  useEffect(() => {
    if (request && defaultValues) {
      reset(defaultValues)
    }
  }, [request, defaultValues, reset])

  useEffect(() => {
    if (!open) {
      reset(defaultValues)
      setError(null)
    }
  }, [open, reset, defaultValues])

  const onSubmit = async (data: EditAppointmentFormValues) => {
    if (!request) return
    setSubmitting(true)
    setError(null)

    try {
      let hopingValues = data.hoping_to_work_on || []
      if (data.other_work_on) {
        if (!hopingValues.includes(OTHER_MARKER)) {
          hopingValues = [...hopingValues, OTHER_MARKER]
        }
      } else {
        hopingValues = hopingValues.filter((value) => value !== OTHER_MARKER)
      }

      const response = await fetch(`/api/appointments/${request.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_name: data.name,
          patient_email: data.email,
          preferred_appointment_type: data.preferred_appointment_type,
          preferred_times: data.preferred_times,
          what_brings_you: data.what_brings_you,
          hoping_to_work_on: hopingValues,
          other_work_on: data.other_work_on || null,
          spoken_before: data.spoken_before,
          anything_else: data.anything_else || null,
        }),
      })

      const result = await response.json()
      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to update appointment")
      }

      onSuccess("Appointment request updated.")
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to update appointment.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col p-0 w-[95vw] sm:w-full">
        {request && (
          <>
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
              <DialogTitle>Edit Appointment Request</DialogTitle>
              <DialogDescription>
                Update the details you previously submitted to your psychiatrist.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="px-4 sm:px-6 overflow-y-auto flex-1 space-y-4 pb-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input id="edit-name" {...register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" {...register("email")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Appointment Type</Label>
                <Select
                  value={watch("preferred_appointment_type") || ""}
                  onValueChange={(value) => setValue("preferred_appointment_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="either">Either</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Appointment Times (Select all that apply)</Label>
                <div className="space-y-2">
                  {PREFERRED_TIME_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={preferredTimes.includes(option)}
                        onChange={() =>
                          setValue("preferred_times", toggleArrayValue(preferredTimes, option))
                        }
                        className="rounded border-gray-300"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>What brings you here today?</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("what_brings_you")}
                />
              </div>

              <div className="space-y-2">
                <Label>What are you hoping to work on or achieve? (Select all that apply)</Label>
                <div className="space-y-2">
                  {HOPING_TO_WORK_ON_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={hopingToWorkOn.includes(option)}
                        onChange={() =>
                          setValue(
                            "hoping_to_work_on",
                            toggleArrayValue(hopingToWorkOn, option)
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={hopingToWorkOn.includes(OTHER_MARKER)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setValue("hoping_to_work_on", [...hopingToWorkOn, OTHER_MARKER])
                        } else {
                          setValue(
                            "hoping_to_work_on",
                            hopingToWorkOn.filter((item) => item !== OTHER_MARKER)
                          )
                          setValue("other_work_on", "")
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>Other</span>
                  </label>
                  {hopingToWorkOn.includes(OTHER_MARKER) && (
                    <Input
                      {...register("other_work_on")}
                      placeholder="Please specify"
                      className="max-w-sm"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Have you spoken with a professional before?</Label>
                <Select
                  value={watch("spoken_before") || ""}
                  onValueChange={(value) => setValue("spoken_before", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Anything else you&apos;d like to share?</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("anything_else")}
                />
              </div>

                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </div>

              <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t flex-shrink-0 flex justify-end gap-2 bg-background">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

