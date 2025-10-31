"use client"

import { useEffect, useState } from "react"
import { useProjectStore } from "@/stores/project-store"
import { CreateProjectDialog } from "@/components/modules/projects/create-project-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Search, MoreVertical, Edit, Trash2, FolderOpen, Building2, Calendar, CheckCircle2, Upload, Image as ImageIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ProjectWithClient, ProjectObjective, ObjectiveStatus } from "@/types/project.types"
import { toast } from "sonner"
import { format } from "date-fns"

export default function ProjectsPage() {
  const { projects, objectives, loading, fetchProjects, deleteProject, fetchObjectives, createObjective, updateObjective, deleteObjective, uploadObjectiveImage } = useProjectStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectWithClient | null>(null)
  const [search, setSearch] = useState("")
  const [viewProject, setViewProject] = useState<ProjectWithClient | null>(null)
  const [objectiveDialogOpen, setObjectiveDialogOpen] = useState(false)
  const [selectedObjective, setSelectedObjective] = useState<ProjectObjective | null>(null)
  const [objectiveForm, setObjectiveForm] = useState({
    title: "",
    description: "",
    status: "pending" as ObjectiveStatus,
    notes: "",
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    if (viewProject) {
      fetchObjectives(viewProject.id)
    }
  }, [viewProject, fetchObjectives])

  const handleEdit = (project: ProjectWithClient) => {
    setSelectedProject(project)
    setDialogOpen(true)
  }

  const handleDelete = async (project: ProjectWithClient) => {
    if (confirm(`Are you sure you want to delete ${project.name}?`)) {
      await deleteProject(project.id)
      toast.success("Project deleted")
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedProject(null)
  }

  const handleViewProject = (project: ProjectWithClient) => {
    setViewProject(project)
  }

  const handleCloseProjectView = () => {
    setViewProject(null)
  }

  const handleCreateObjective = () => {
    setSelectedObjective(null)
    setObjectiveForm({
      title: "",
      description: "",
      status: "pending",
      notes: "",
    })
    setObjectiveDialogOpen(true)
  }

  const handleEditObjective = (objective: ProjectObjective) => {
    setSelectedObjective(objective)
    setObjectiveForm({
      title: objective.title,
      description: objective.description || "",
      status: objective.status,
      notes: objective.notes || "",
    })
    setObjectiveDialogOpen(true)
  }

  const handleSaveObjective = async () => {
    if (!viewProject || !objectiveForm.title.trim()) {
      toast.error("Title is required")
      return
    }

    try {
      if (selectedObjective) {
        await updateObjective(selectedObjective.id, {
          title: objectiveForm.title,
          description: objectiveForm.description || undefined,
          status: objectiveForm.status,
          notes: objectiveForm.notes || undefined,
        })
        toast.success("Objective updated")
      } else {
        await createObjective({
          project_id: viewProject.id,
          title: objectiveForm.title,
          description: objectiveForm.description || undefined,
          status: objectiveForm.status,
          notes: objectiveForm.notes || undefined,
        })
        toast.success("Objective created")
      }
      setObjectiveDialogOpen(false)
      setObjectiveForm({ title: "", description: "", status: "pending", notes: "" })
    } catch (error) {
      toast.error("Failed to save objective")
    }
  }

  const handleDeleteObjective = async (objective: ProjectObjective) => {
    if (!viewProject) return
    if (confirm("Are you sure you want to delete this objective?")) {
      await deleteObjective(objective.id, viewProject.id)
      toast.success("Objective deleted")
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, objective: ProjectObjective) => {
    if (!viewProject || !event.target.files || event.target.files.length === 0) return

    setUploadingImage(true)
    try {
      const file = event.target.files[0]
      const url = await uploadObjectiveImage(viewProject.id, file)
      if (url) {
        const currentImages = objective.image_urls || []
        await updateObjective(objective.id, {
          image_urls: [...currentImages, url],
        })
        toast.success("Image uploaded successfully")
      } else {
        toast.error("Failed to upload image")
      }
    } catch (error) {
      toast.error("Error uploading image")
    } finally {
      setUploadingImage(false)
      event.target.value = ""
    }
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.description?.toLowerCase().includes(search.toLowerCase()) ||
    project.client?.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'on_hold':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-blue-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getObjectiveStatusColor = (status: ObjectiveStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'pending':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  const currentObjectives = viewProject ? objectives[viewProject.id] || [] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track objectives
          </p>
        </div>
        <Button onClick={() => {
          setSelectedProject(null)
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {search ? "No projects found" : "No projects yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search ? "Try adjusting your search" : "Create your first project to get started"}
          </p>
          {!search && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const projectObjectives = objectives[project.id] || []
            const completedCount = projectObjectives.filter(o => o.status === 'completed').length

            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewProject(project)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {project.client && (
                        <CardDescription className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {project.client.name}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(project)
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(project)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {(project.start_date || project.end_date) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {project.start_date && format(new Date(project.start_date), "MMM d, yyyy")}
                        {project.start_date && project.end_date && " - "}
                        {project.end_date && format(new Date(project.end_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{completedCount} / {projectObjectives.length} objectives completed</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CreateProjectDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        project={selectedProject}
      />

      <Dialog open={!!viewProject} onOpenChange={handleCloseProjectView}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{viewProject?.name}</DialogTitle>
              {viewProject && (
                <Badge className={getStatusColor(viewProject.status)}>
                  {viewProject.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <DialogDescription>
              Project details and objectives
            </DialogDescription>
          </DialogHeader>

          {viewProject && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {viewProject.client && (
                  <div>
                    <div className="text-sm font-medium mb-1">Client</div>
                    <div className="text-sm text-muted-foreground">{viewProject.client.name}</div>
                  </div>
                )}
                {viewProject.description && (
                  <div>
                    <div className="text-sm font-medium mb-1">Description</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{viewProject.description}</div>
                  </div>
                )}
                {(viewProject.start_date || viewProject.end_date) && (
                  <div>
                    <div className="text-sm font-medium mb-1">Timeline</div>
                    <div className="text-sm text-muted-foreground">
                      {viewProject.start_date && format(new Date(viewProject.start_date), "MMMM d, yyyy")}
                      {viewProject.start_date && viewProject.end_date && " - "}
                      {viewProject.end_date && format(new Date(viewProject.end_date), "MMMM d, yyyy")}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Objectives</h3>
                  <Button size="sm" onClick={handleCreateObjective}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Objective
                  </Button>
                </div>

                {currentObjectives.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No objectives yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentObjectives.map((objective) => (
                      <Card key={objective.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-base">{objective.title}</CardTitle>
                                <Badge className={getObjectiveStatusColor(objective.status)}>
                                  {objective.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              {objective.description && (
                                <CardDescription className="mt-1">{objective.description}</CardDescription>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditObjective(objective)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteObjective(objective)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {objective.notes && (
                            <div>
                              <div className="text-xs font-medium mb-1">Notes</div>
                              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{objective.notes}</div>
                            </div>
                          )}

                          {objective.image_urls && objective.image_urls.length > 0 && (
                            <div>
                              <div className="text-xs font-medium mb-2">Images</div>
                              <div className="grid grid-cols-3 gap-2">
                                {objective.image_urls.map((url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={`Objective ${index + 1}`}
                                    className="w-full h-24 object-cover rounded border"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={uploadingImage}
                              onClick={() => document.getElementById(`image-upload-${objective.id}`)?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImage ? "Uploading..." : "Add Image"}
                            </Button>
                            <input
                              id={`image-upload-${objective.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, objective)}
                            />
                          </div>

                          <div className="text-xs text-muted-foreground pt-2 border-t">
                            Created {format(new Date(objective.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={objectiveDialogOpen} onOpenChange={setObjectiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedObjective ? "Edit Objective" : "Create Objective"}</DialogTitle>
            <DialogDescription>
              {selectedObjective ? "Update objective details" : "Add a new objective to track"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="obj-title">Title *</Label>
              <Input
                id="obj-title"
                placeholder="Objective title..."
                value={objectiveForm.title}
                onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="obj-description">Description</Label>
              <Textarea
                id="obj-description"
                placeholder="Objective description..."
                rows={3}
                value={objectiveForm.description}
                onChange={(e) => setObjectiveForm({ ...objectiveForm, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="obj-status">Status</Label>
              <Select
                value={objectiveForm.status}
                onValueChange={(value) => setObjectiveForm({ ...objectiveForm, status: value as ObjectiveStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="obj-notes">Notes</Label>
              <Textarea
                id="obj-notes"
                placeholder="Additional notes..."
                rows={3}
                value={objectiveForm.notes}
                onChange={(e) => setObjectiveForm({ ...objectiveForm, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setObjectiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveObjective}>
              {selectedObjective ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
