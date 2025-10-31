"use client"

import { useEffect, useState } from "react"
import { useGoalStore } from "@/stores/goal-store"
import { GoalCard } from "@/components/modules/goals/goal-card"
import { CreateGoalDialog } from "@/components/modules/goals/create-goal-dialog"
import { UpdateProgressDialog } from "@/components/modules/goals/update-progress-dialog"
import { GoalStats } from "@/components/modules/goals/goal-stats"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Goal } from "@/types/goal.types"

export default function GoalsPage() {
  const { goals, loading, fetchGoals } = useGoalStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setCreateDialogOpen(true)
  }

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal)
    setProgressDialogOpen(true)
  }

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false)
    setSelectedGoal(null)
  }

  const handleProgressDialogClose = () => {
    setProgressDialogOpen(false)
    setSelectedGoal(null)
  }

  const activeGoals = goals.filter((g) => g.is_active)
  const pausedGoals = goals.filter((g) => !g.is_active)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">
            Track your progress and stay consistent
          </p>
        </div>
        <Button onClick={() => {
          setSelectedGoal(null)
          setCreateDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      <GoalStats />

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Goals ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused ({pausedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Goals ({goals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No active goals</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first goal to start tracking your progress
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          {pausedGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No paused goals</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pausedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No goals yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start setting quantifiable goals to track your success
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={handleCreateDialogClose}
        goal={selectedGoal}
      />

      <UpdateProgressDialog
        open={progressDialogOpen}
        onOpenChange={handleProgressDialogClose}
        goal={selectedGoal}
      />
    </div>
  )
}
