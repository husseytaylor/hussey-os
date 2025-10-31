"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useGoalStore } from "@/stores/goal-store"
import { Target, TrendingUp, Award, Clock } from "lucide-react"

export function GoalStats() {
  const goals = useGoalStore((state) => state.goals)
  const getGoalStats = useGoalStore((state) => state.getGoalStats)

  const stats = useMemo(() => {
    const activeGoals = goals.filter((g) => g.is_active)
    const completedGoals = goals.filter((g) => g.current_value >= g.target_value)

    const totalProgress = goals.reduce((acc, goal) => {
      const stat = getGoalStats(goal)
      return acc + stat.progressPercentage
    }, 0)

    const avgProgress = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0

    const avgAdherence = goals.length > 0
      ? Math.round(
          goals.reduce((acc, goal) => {
            const stat = getGoalStats(goal)
            return acc + stat.adherenceRate
          }, 0) / goals.length
        )
      : 0

    const longestStreak = Math.max(
      0,
      ...goals.map((goal) => getGoalStats(goal).currentStreak)
    )

    return {
      total: goals.length,
      active: activeGoals.length,
      completed: completedGoals.length,
      avgProgress,
      avgAdherence,
      longestStreak,
    }
  }, [goals, getGoalStats])

  const chartData = useMemo(() => {
    return goals.slice(0, 10).map((goal) => {
      const stat = getGoalStats(goal)
      return {
        name: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title,
        progress: stat.progressPercentage,
        adherence: stat.adherenceRate,
      }
    })
  }, [goals, getGoalStats])

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adherence</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAdherence}%</div>
            <p className="text-xs text-muted-foreground">
              Average adherence rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.longestStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress Overview</CardTitle>
            <CardDescription>Progress and adherence for your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="progress" name="Progress %">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.progress >= 100
                          ? "hsl(var(--chart-2))"
                          : entry.progress >= 50
                          ? "hsl(var(--primary))"
                          : "hsl(var(--chart-3))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
