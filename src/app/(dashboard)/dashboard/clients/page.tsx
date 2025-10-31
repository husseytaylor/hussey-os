"use client"

import { useEffect, useState } from "react"
import { useClientStore } from "@/stores/client-store"
import { CreateClientDialog } from "@/components/modules/clients/create-client-dialog"
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
import { Plus, Search, MoreVertical, Edit, Trash2, Mail, Phone, Building2, Upload, FileIcon, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Client, ClientAsset } from "@/types/client.types"
import { toast } from "sonner"
import { format } from "date-fns"

export default function ClientsPage() {
  const { clients, loading, fetchClients, deleteClient, uploadAsset, getClientAssets, deleteAsset } = useClientStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [search, setSearch] = useState("")
  const [viewClient, setViewClient] = useState<Client | null>(null)
  const [clientAssets, setClientAssets] = useState<ClientAsset[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    if (viewClient) {
      loadAssets(viewClient.id)
    }
  }, [viewClient])

  const loadAssets = async (clientId: string) => {
    const assets = await getClientAssets(clientId)
    setClientAssets(assets)
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setDialogOpen(true)
  }

  const handleDelete = async (client: Client) => {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      await deleteClient(client.id)
      toast.success("Client deleted")
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedClient(null)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!viewClient || !event.target.files || event.target.files.length === 0) return

    setUploading(true)
    try {
      const file = event.target.files[0]
      const url = await uploadAsset(viewClient.id, file)
      if (url) {
        toast.success("File uploaded successfully")
        await loadAssets(viewClient.id)
      } else {
        toast.error("Failed to upload file")
      }
    } catch (error) {
      toast.error("Error uploading file")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const handleDeleteAsset = async (fileName: string) => {
    if (!viewClient) return
    if (confirm("Are you sure you want to delete this file?")) {
      await deleteAsset(viewClient.id, fileName)
      toast.success("File deleted")
      await loadAssets(viewClient.id)
    }
  }

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase()) ||
    client.company?.toLowerCase().includes(search.toLowerCase())
  )

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and assets
          </p>
        </div>
        <Button onClick={() => {
          setSelectedClient(null)
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {search ? "No clients found" : "No clients yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search ? "Try adjusting your search" : "Add your first client to get started"}
          </p>
          {!search && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setViewClient(client)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {client.company && (
                      <CardDescription className="mt-1">{client.company}</CardDescription>
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
                        handleEdit(client)
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(client)
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
              <CardContent className="space-y-2">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-3">
                    {client.notes}
                  </p>
                )}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Added {format(new Date(client.created_at), "MMM d, yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateClientDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        client={selectedClient}
      />

      <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewClient?.name}</DialogTitle>
            <DialogDescription>
              Client details and assets
            </DialogDescription>
          </DialogHeader>

          {viewClient && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {viewClient.company && (
                  <div>
                    <div className="text-sm font-medium mb-1">Company</div>
                    <div className="text-sm text-muted-foreground">{viewClient.company}</div>
                  </div>
                )}
                {viewClient.email && (
                  <div>
                    <div className="text-sm font-medium mb-1">Email</div>
                    <div className="text-sm text-muted-foreground">{viewClient.email}</div>
                  </div>
                )}
                {viewClient.phone && (
                  <div>
                    <div className="text-sm font-medium mb-1">Phone</div>
                    <div className="text-sm text-muted-foreground">{viewClient.phone}</div>
                  </div>
                )}
                {viewClient.notes && (
                  <div>
                    <div className="text-sm font-medium mb-1">Notes</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{viewClient.notes}</div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Client Assets</h3>
                  <Button size="sm" disabled={uploading} onClick={() => document.getElementById("file-upload")?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload File"}
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {clientAssets.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <FileIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No assets uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientAssets.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileIcon className="h-5 w-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{asset.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {(asset.size / 1024).toFixed(2)} KB • {format(new Date(asset.uploaded_at), "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={asset.url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteAsset(asset.name)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
