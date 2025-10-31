"use client"

import { useEffect, useState } from "react"
import { useCalendarStore } from "@/stores/calendar-store"
import { CalendarView } from "@/components/modules/calendar/calendar-view"
import { CreateEventDialog } from "@/components/modules/calendar/create-event-dialog"
import { EmailInbox } from "@/components/modules/calendar/email-inbox"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { CalendarEvent } from "@/types/calendar.types"
import { toast } from "sonner"

export default function CalendarPage() {
  const { fetchEvents, loading } = useCalendarStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [defaultStart, setDefaultStart] = useState<Date>()
  const [defaultEnd, setDefaultEnd] = useState<Date>()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setDefaultStart(undefined)
    setDefaultEnd(undefined)
    setDialogOpen(true)
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent(null)
    setDefaultStart(slotInfo.start)
    setDefaultEnd(slotInfo.end)
    setDialogOpen(true)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEvents()
    toast.success("Calendar refreshed")
    setRefreshing(false)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedEvent(null)
    setDefaultStart(undefined)
    setDefaultEnd(undefined)
  }

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendar & Emails</h1>
          <p className="text-muted-foreground">
            Manage your schedule and synced emails
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => {
            setSelectedEvent(null)
            setDefaultStart(undefined)
            setDefaultEnd(undefined)
            setDialogOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <EmailInbox />
        </TabsContent>
      </Tabs>

      <CreateEventDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        event={selectedEvent}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
      />
    </div>
  )
}
