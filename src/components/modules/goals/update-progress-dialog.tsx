"use client"

import { useState, useEffect } from "react"
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
import { Slider } from "@/components/ui/slider"
import { useGoalStore } from "@/stores/goal-store"
import { toast } from "sonner"
import type { Goal } from "@/types/goal.types"
import { TrendingUp, Plus, Minus } from "lucide-react"

interface UpdateProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: Goal | null
}

export function UpdateProgressDialog({
  open,
  onOpenChange,
  goal,
}: UpdateProgressDialogProps) {
  const [value, setValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const updateProgress = useGoalStore((state) => state.updateProgress)

  useEffect(() => {
    if (goal) {
      setValue(goal.current_value)
    }
  }, [goal, open])

  const handleSubmit = async () => {
    if (!goal) return

    setLoading(true)
    try {
      await updateProgress(goal.id, value)
      toast.success("Progress updated!")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update progress")
    } finally {
      setLoading(false)
    }
  }

  const handleIncrement = (amount: number) => {
    if (!goal) return
    setValue((prev) => Math.min(goal.target_value, Math.max(0, prev + amount)))
  }

  if (!goal) return null

  const percentage = Math.round((value / goal.target_value) * 100)
  const progressChange = value - goal.current_value

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Update Progress
          </DialogTitle>
          <DialogDescription>
            Update your progress for: {goal.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Progress Display */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-4xl font-bold mb-1">
              {value} / {goal.target_value}
            </div>
            <div className="text-sm text-muted-foreground">
              {goal.metric_type} ({percentage}%)
            </div>
            {progressChange !== 0 && (
              <div className={`text-sm mt-2 ${progressChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {progressChange > 0 ? '+' : ''}{progressChange} {goal.metric_type}
              </div>
            )}
          </div>

          {/* Quick Increment Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleIncrement(-10)}
              disabled={value === 0}
            >
              <Minus className="h-3 w-3 mr-1" />
              10
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleIncrement(-1)}
              disabled={value === 0}
            >
              <Minus className="h-3 w-3 mr-1" />
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleIncrement(1)}
              disabled={value >= goal.target_value}
            >
              <Plus className="h-3 w-3 mr-1" />
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleIncrement(10)}
              disabled={value >= goal.target_value}
            >
              <Plus className="h-3 w-3 mr-1" />
              10
            </Button>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <Label>Adjust Value</Label>
            <Slider
              value={[value]}
              onValueChange={(vals) => setValue(vals[0])}
              min={0}
              max={goal.target_value}
              step={goal.target_value > 100 ? 1 : 0.1}
              className="py-4"
            />
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="manual-value">Or enter manually</Label>
            <Input
              id="manual-value"
              type="number"
              value={value}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val)) {
                  setValue(Math.min(goal.target_value, Math.max(0, val)))
                }
              }}
              min={0}
              max={goal.target_value}
              step={0.1}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Progress"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
