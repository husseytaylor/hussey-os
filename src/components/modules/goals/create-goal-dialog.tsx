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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGoalStore } from "@/stores/goal-store"
import { toast } from "sonner"
import type { Goal, GoalFrequency } from "@/types/goal.types"
import { format } from "date-fns"

const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  metric_type: z.string().min(1, "Metric type is required"),
  target_value: z.number().min(0.01, "Target must be greater than 0"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
})

type GoalFormData = z.infer<typeof goalSchema>

interface CreateGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal | null
}

export function CreateGoalDialog({ open, onOpenChange, goal }: CreateGoalDialogProps) {
  const [loading, setLoading] = useState(false)
  const createGoal = useGoalStore((state) => state.createGoal)
  const updateGoal = useGoalStore((state) => state.updateGoal)
  const deleteGoal = useGoalStore((state) => state.deleteGoal)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      frequency: "daily",
      start_date: format(new Date(), "yyyy-MM-dd"),
    },
  })

  const frequency = watch("frequency")

  useEffect(() => {
    if (goal) {
      reset({
        title: goal.title,
        description: goal.description || "",
        metric_type: goal.metric_type,
        target_value: goal.target_value,
        frequency: goal.frequency,
        start_date: goal.start_date,
        end_date: goal.end_date || "",
      })
    } else {
      reset({
        frequency: "daily",
        start_date: format(new Date(), "yyyy-MM-dd"),
      })
    }
  }, [goal, reset, open])

  const onSubmit = async (data: GoalFormData) => {
    setLoading(true)
    try {
      const goalData = {
        title: data.title,
        description: data.description,
        metric_type: data.metric_type,
        target_value: data.target_value,
        frequency: data.frequency,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
      }

      if (goal) {
        await updateGoal(goal.id, goalData)
        toast.success("Goal updated successfully!")
      } else {
        await createGoal(goalData)
        toast.success("Goal created successfully!")
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
    if (!goal) return

    if (confirm("Are you sure you want to delete this goal?")) {
      setLoading(true)
      try {
        await deleteGoal(goal.id)
        toast.success("Goal deleted")
        onOpenChange(false)
      } catch (error) {
        toast.error("Failed to delete goal")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
          <DialogDescription>
            {goal ? "Update your goal details" : "Set a new quantifiable goal to track"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                placeholder="e.g., Read 30 minutes daily"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details about your goal..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="metric_type">Metric Type</Label>
                <Input
                  id="metric_type"
                  placeholder="e.g., minutes, pages, workouts"
                  {...register("metric_type")}
                />
                {errors.metric_type && (
                  <p className="text-sm text-red-500">{errors.metric_type.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target_value">Target Value</Label>
                <Input
                  id="target_value"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 30"
                  {...register("target_value", { valueAsNumber: true })}
                />
                {errors.target_value && (
                  <p className="text-sm text-red-500">{errors.target_value.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(value) => setValue("frequency", value as GoalFrequency)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500">{errors.start_date.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                />
                {errors.end_date && (
                  <p className="text-sm text-red-500">{errors.end_date.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {goal && (
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
              {loading ? "Saving..." : goal ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
