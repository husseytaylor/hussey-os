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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProjectStore } from "@/stores/project-store"
import { useClientStore } from "@/stores/client-store"
import { toast } from "sonner"
import type { ProjectWithClient, ProjectStatus } from "@/types/project.types"

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  client_id: z.string().optional(),
  status: z.enum(['active', 'on_hold', 'completed', 'cancelled']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: ProjectWithClient | null
}

export function CreateProjectDialog({ open, onOpenChange, project }: CreateProjectDialogProps) {
  const [loading, setLoading] = useState(false)
  const createProject = useProjectStore((state) => state.createProject)
  const updateProject = useProjectStore((state) => state.updateProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const clients = useClientStore((state) => state.clients)
  const fetchClients = useClientStore((state) => state.fetchClients)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const selectedStatus = watch("status")
  const selectedClientId = watch("client_id")

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || "",
        client_id: project.client_id || "",
        status: project.status || "active",
        start_date: project.start_date ? project.start_date.split('T')[0] : "",
        end_date: project.end_date ? project.end_date.split('T')[0] : "",
      })
    } else {
      reset({
        name: "",
        description: "",
        client_id: "",
        status: "active",
        start_date: "",
        end_date: "",
      })
    }
  }, [project, reset, open])

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true)
    try {
      const projectData = {
        name: data.name,
        description: data.description || undefined,
        client_id: data.client_id || undefined,
        status: data.status || 'active',
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
      }

      if (project) {
        await updateProject(project.id, projectData)
        toast.success("Project updated successfully!")
      } else {
        await createProject(projectData)
        toast.success("Project created successfully!")
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
    if (!project) return

    if (confirm("Are you sure you want to delete this project? All associated objectives will also be deleted.")) {
      setLoading(true)
      try {
        await deleteProject(project.id)
        toast.success("Project deleted")
        onOpenChange(false)
      } catch (error) {
        toast.error("Failed to delete project")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
          <DialogDescription>
            {project ? "Update project information" : "Add a new project to track"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Website redesign..."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Project details and scope..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client_id">Client</Label>
                <Select
                  value={selectedClientId || "none"}
                  onValueChange={(value) => setValue("client_id", value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedStatus || "active"}
                  onValueChange={(value) => setValue("status", value as ProjectStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {project && (
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
              {loading ? "Saving..." : project ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
