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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useClientStore } from "@/stores/client-store"
import { toast } from "sonner"
import type { Client } from "@/types/client.types"

const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50, "Phone is too long").optional(),
  company: z.string().max(200, "Company name is too long").optional(),
  notes: z.string().max(2000, "Notes are too long").optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface CreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
}

export function CreateClientDialog({ open, onOpenChange, client }: CreateClientDialogProps) {
  const [loading, setLoading] = useState(false)
  const createClient = useClientStore((state) => state.createClient)
  const updateClient = useClientStore((state) => state.updateClient)
  const deleteClient = useClientStore((state) => state.deleteClient)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
        notes: client.notes || "",
      })
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        notes: "",
      })
    }
  }, [client, reset, open])

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true)
    try {
      const clientData = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        company: data.company || undefined,
        notes: data.notes || undefined,
      }

      if (client) {
        await updateClient(client.id, clientData)
        toast.success("Client updated successfully!")
      } else {
        await createClient(clientData)
        toast.success("Client created successfully!")
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
    if (!client) return

    if (confirm("Are you sure you want to delete this client? All associated projects will also be deleted.")) {
      setLoading(true)
      try {
        await deleteClient(client.id)
        toast.success("Client deleted")
        onOpenChange(false)
      } catch (error) {
        toast.error("Failed to delete client")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {client ? "Update client information" : "Add a new client to your CRM"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Client name..."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Company name..."
                {...register("company")}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information about the client..."
                rows={4}
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {client && (
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
              {loading ? "Saving..." : client ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
