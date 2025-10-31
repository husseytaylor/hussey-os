"use client"

import { useEffect, useState, useCallback } from "react"
import { Tldraw, Editor, TLRecord, TLStoreSnapshot } from "tldraw"
import "tldraw/tldraw.css"
import { useWhiteboardStore } from "@/stores/whiteboard-store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save, FolderOpen, Trash2, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import type { Whiteboard } from "@/types/whiteboard.types"

export default function WhiteboardPage() {
  const {
    whiteboards,
    currentWhiteboard,
    loading,
    fetchWhiteboards,
    createWhiteboard,
    updateWhiteboard,
    deleteWhiteboard,
    setCurrentWhiteboard,
    saveSnapshot,
  } = useWhiteboardStore()

  const [editor, setEditor] = useState<Editor | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [whiteboardForm, setWhiteboardForm] = useState({
    name: "",
    description: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchWhiteboards()
  }, [fetchWhiteboards])

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!editor || !currentWhiteboard) return

    const interval = setInterval(() => {
      handleSave(false) // Auto-save without toast
    }, 10000)

    return () => clearInterval(interval)
  }, [editor, currentWhiteboard])

  const handleSetEditor = useCallback((editor: Editor) => {
    setEditor(editor)
  }, [])

  const handleSave = async (showToast = true) => {
    if (!editor || !currentWhiteboard) {
      if (showToast) toast.error("No whiteboard loaded")
      return
    }

    setIsSaving(true)
    try {
      const snapshot = editor.getSnapshot()
      await saveSnapshot(currentWhiteboard.id, snapshot)
      if (showToast) toast.success("Whiteboard saved")
    } catch (error) {
      if (showToast) toast.error("Failed to save whiteboard")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!whiteboardForm.name.trim()) {
      toast.error("Name is required")
      return
    }

    try {
      const snapshot = editor?.getSnapshot() || {}
      const newWhiteboard = await createWhiteboard({
        name: whiteboardForm.name,
        description: whiteboardForm.description || undefined,
        snapshot,
      })

      if (newWhiteboard) {
        setCurrentWhiteboard(newWhiteboard)
        toast.success("Whiteboard created")
        setCreateDialogOpen(false)
        setWhiteboardForm({ name: "", description: "" })
      }
    } catch (error) {
      toast.error("Failed to create whiteboard")
    }
  }

  const handleLoad = (whiteboard: Whiteboard) => {
    if (editor && whiteboard.snapshot) {
      try {
        editor.loadSnapshot(whiteboard.snapshot as TLStoreSnapshot)
        setCurrentWhiteboard(whiteboard)
        toast.success(`Loaded: ${whiteboard.name}`)
        setLoadDialogOpen(false)
      } catch (error) {
        toast.error("Failed to load whiteboard")
      }
    } else {
      setCurrentWhiteboard(whiteboard)
      setLoadDialogOpen(false)
    }
  }

  const handleDelete = async (whiteboard: Whiteboard) => {
    if (confirm(`Are you sure you want to delete "${whiteboard.name}"?`)) {
      await deleteWhiteboard(whiteboard.id)
      toast.success("Whiteboard deleted")

      if (currentWhiteboard?.id === whiteboard.id) {
        setCurrentWhiteboard(null)
        if (editor) {
          editor.store.clear()
        }
      }
    }
  }

  const handleNew = () => {
    if (editor) {
      editor.selectNone()
      editor.deleteShapes(Array.from(editor.getCurrentPageShapeIds()))
    }
    setCurrentWhiteboard(null)
    toast.success("New whiteboard started")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div>
          <h1 className="text-2xl font-bold">
            {currentWhiteboard ? currentWhiteboard.name : "Whiteboard"}
          </h1>
          {currentWhiteboard?.description && (
            <p className="text-sm text-muted-foreground">{currentWhiteboard.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
          <Button variant="outline" onClick={() => setLoadDialogOpen(true)}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Load
          </Button>
          {currentWhiteboard ? (
            <Button onClick={() => handleSave(true)} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          ) : (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save As...
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <Tldraw onMount={handleSetEditor} />
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Whiteboard</DialogTitle>
            <DialogDescription>
              Give your whiteboard a name and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="wb-name">Name *</Label>
              <Input
                id="wb-name"
                placeholder="My whiteboard..."
                value={whiteboardForm.name}
                onChange={(e) => setWhiteboardForm({ ...whiteboardForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wb-description">Description</Label>
              <Textarea
                id="wb-description"
                placeholder="Optional description..."
                rows={3}
                value={whiteboardForm.description}
                onChange={(e) => setWhiteboardForm({ ...whiteboardForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Whiteboard</DialogTitle>
            <DialogDescription>
              Select a whiteboard to load
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : whiteboards.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No saved whiteboards yet
            </div>
          ) : (
            <div className="space-y-2">
              {whiteboards.map((whiteboard) => (
                <div
                  key={whiteboard.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleLoad(whiteboard)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{whiteboard.name}</div>
                    {whiteboard.description && (
                      <div className="text-sm text-muted-foreground">{whiteboard.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Updated {new Date(whiteboard.updated_at).toLocaleDateString()}
                    </div>
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
                        handleLoad(whiteboard)
                      }}>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Load
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(whiteboard)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
