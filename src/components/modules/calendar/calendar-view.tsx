"use client"

import { useMemo, useState } from "react"
import { Calendar, momentLocalizer, View } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useCalendarStore } from "@/stores/calendar-store"
import type { CalendarEvent, CalendarEventView } from "@/types/calendar.types"
import { Card } from "@/components/ui/card"
import "./calendar-styles.css"

const localizer = momentLocalizer(moment)

interface CalendarViewProps {
  onSelectEvent?: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
}

export function CalendarView({ onSelectEvent, onSelectSlot }: CalendarViewProps) {
  const events = useCalendarStore((state) => state.events)
  const [view, setView] = useState<View>("month")
  const [date, setDate] = useState(new Date())

  const calendarEvents = useMemo<CalendarEventView[]>(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      resource: event,
    }))
  }, [events])

  const handleSelectEvent = (event: CalendarEventView) => {
    if (onSelectEvent && event.resource) {
      onSelectEvent(event.resource)
    }
  }

  const handleSelectSlot = (slotInfo: any) => {
    if (onSelectSlot) {
      onSelectSlot({
        start: slotInfo.start,
        end: slotInfo.end,
      })
    }
  }

  return (
    <Card className="p-4">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 280px)", minHeight: 500 }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        views={["month", "week", "day", "agenda"]}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: "hsl(var(--primary))",
            borderRadius: "4px",
            opacity: 0.9,
            color: "white",
            border: "none",
            display: "block",
          },
        })}
      />
    </Card>
  )
}
