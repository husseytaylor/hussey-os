"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Play, Pause, TrendingUp } from "lucide-react"
import type { Goal } from "@/types/goal.types"
import { useGoalStore } from "@/stores/goal-store"
import { format, parseISO } from "date-fns"

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onUpdateProgress: (goal: Goal) => void
}

export function GoalCard({ goal, onEdit, onUpdateProgress }: GoalCardProps) {
  const { deleteGoal, toggleActive, getGoalStats } = useGoalStore()
  const stats = getGoalStats(goal)

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this goal?")) {
      await deleteGoal(goal.id)
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "bg-blue-500"
      case "weekly":
        return "bg-green-500"
      case "monthly":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className={goal.is_active ? "" : "opacity-60"}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              {!goal.is_active && (
                <Badge variant="secondary">Paused</Badge>
              )}
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdateProgress(goal)}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Update Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleActive(goal.id)}>
                {goal.is_active ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Goal
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Goal
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {goal.current_value} / {goal.target_value} {goal.metric_type}
            </span>
          </div>
          <Progress value={stats.progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.progressPercentage}% complete</span>
            {stats.remainingDays !== null && (
              <span>{stats.remainingDays} days remaining</span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.adherenceRate}%</div>
            <div className="text-xs text-muted-foreground">Adherence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.daysActive}</div>
            <div className="text-xs text-muted-foreground">Days Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getFrequencyColor(goal.frequency)}`} />
            <span className="capitalize">{goal.frequency}</span>
          </div>
          <span>
            Started {format(parseISO(goal.start_date), "MMM d, yyyy")}
          </span>
        </div>

        {/* Update Progress Button */}
        <Button
          onClick={() => onUpdateProgress(goal)}
          className="w-full"
          variant="outline"
          disabled={!goal.is_active}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Update Progress
        </Button>
      </CardContent>
    </Card>
  )
}
