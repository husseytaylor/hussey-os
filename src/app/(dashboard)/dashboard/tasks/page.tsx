"use client"

import { useEffect, useState, useMemo } from "react"
import { useTaskStore } from "@/stores/task-store"
import { CreateTaskDialog } from "@/components/modules/tasks/create-task-dialog"
import { KanbanBoard } from "@/components/modules/tasks/kanban-board"
import { TaskStats } from "@/components/modules/tasks/task-stats"
import { TaskFilters } from "@/components/modules/tasks/task-filters"
import { Skeleton } from "@/components/ui/skeleton"
import type { Task } from "@/types/task.types"

export default function TasksPage() {
  const { tasks, loading, fetchTasks, setTasks } = useTaskStore()
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Filter tasks based on search and priority
  const allTasks = useTaskStore((state) => state.tasks)
  const filteredTasks = useMemo(() => {
    let filtered = allTasks

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      )
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    return filtered
  }, [allTasks, search, priorityFilter])

  // Update the tasks shown in the kanban board
  useEffect(() => {
    setTasks(filteredTasks)
  }, [filteredTasks, setTasks])

  // Reset filters when unmounting
  useEffect(() => {
    return () => {
      setTasks(allTasks)
    }
  }, [allTasks, setTasks])

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[500px]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks with a kanban board
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      <TaskStats />

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
      />

      {filteredTasks.length === 0 && (search || priorityFilter !== "all") ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        </div>
      ) : (
        <KanbanBoard />
      )}
    </div>
  )
}
