"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCalendarStore } from "@/stores/calendar-store"
import { toast } from "sonner"
import type { CalendarEvent } from "@/types/calendar.types"
import { format } from "date-fns"

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  location: z.string().max(500, "Location is too long").optional(),
})

type EventFormData = z.infer<typeof eventSchema>

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: CalendarEvent | null
  defaultStart?: Date
  defaultEnd?: Date
}

export function CreateEventDialog({
  open,
  onOpenChange,
  event,
  defaultStart,
  defaultEnd,
}: CreateEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const createEvent = useCalendarStore((state) => state.createEvent)
  const updateEvent = useCalendarStore((state) => state.updateEvent)
  const deleteEvent = useCalendarStore((state) => state.deleteEvent)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  })

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description || "",
        start_time: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"),
        location: event.location || "",
      })
    } else if (defaultStart && defaultEnd) {
      reset({
        start_time: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
      })
    } else {
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
      reset({
        start_time: format(now, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(oneHourLater, "yyyy-MM-dd'T'HH:mm"),
      })
    }
  }, [event, defaultStart, defaultEnd, reset, open])

  const onSubmit = async (data: EventFormData) => {
    setLoading(true)
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        location: data.location,
      }

      if (event) {
        await updateEvent(event.id, eventData)
        toast.success("Event updated successfully!")
      } else {
        await createEvent(eventData)
        toast.success("Event created successfully!")
      }

      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return

    if (confirm("Are you sure you want to delete this event?")) {
      setLoading(true)
      try {
        await deleteEvent(event.id)
        toast.success("Event deleted")
        onOpenChange(false)
      } catch (error) {
        toast.error("Failed to delete event")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
          <DialogDescription>
            {event ? "Update event details" : "Add a new event to your calendar"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Event title..."
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Event description..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  {...register("start_time")}
                />
                {errors.start_time && (
                  <p className="text-sm text-red-500">{errors.start_time.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  {...register("end_time")}
                />
                {errors.end_time && (
                  <p className="text-sm text-red-500">{errors.end_time.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Event location..."
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : event ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
