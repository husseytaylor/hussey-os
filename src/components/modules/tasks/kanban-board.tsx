"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskCard } from "./task-card"
import type { Task, TaskStatus } from "@/types/task.types"
import { useTaskStore } from "@/stores/task-store"
import { CheckSquare, Clock, CheckCircle2 } from "lucide-react"

const columns: { id: TaskStatus; title: string; icon: any }[] = [
  { id: "todo", title: "To Do", icon: CheckSquare },
  { id: "in_progress", title: "In Progress", icon: Clock },
  { id: "completed", title: "Completed", icon: CheckCircle2 },
]

function DroppableColumn({
  column,
  tasks
}: {
  column: typeof columns[0]
  tasks: Task[]
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
    <Card className="flex flex-col h-[calc(100vh-280px)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <column.icon className="h-5 w-5" />
          {column.title}
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div
            ref={setNodeRef}
            className="space-y-2 min-h-[200px] pb-4"
            data-status={column.id}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasks.length === 0 && (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  Drop tasks here
                </div>
              )}
            </SortableContext>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function KanbanBoard() {
  const tasks = useTaskStore((state) => state.tasks)
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      completed: tasks.filter((t) => t.status === "completed"),
    }
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    // Check if it's a valid column
    if (columns.some((col) => col.id === newStatus)) {
      const task = tasks.find((t) => t.id === taskId)
      if (task && task.status !== newStatus) {
        updateTaskStatus(taskId, newStatus)
      }
    }

    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
