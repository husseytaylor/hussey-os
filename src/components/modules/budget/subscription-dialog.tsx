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
import { Switch } from "@/components/ui/switch"
import { useSubscriptionStore } from "@/stores/subscription-store"
import { toast } from "sonner"
import type { Subscription, BillingCycle } from "@/types/subscription.types"

const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  cost: z.number().positive("Cost must be positive"),
  currency: z.string().optional(),
  billing_cycle: z.enum(['monthly', 'yearly', 'quarterly']),
  next_billing_date: z.string().min(1, "Next billing date is required"),
  category: z.string().optional(),
  is_active: z.boolean().optional(),
  notes: z.string().optional(),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription?: Subscription | null
}

export function SubscriptionDialog({ open, onOpenChange, subscription }: SubscriptionDialogProps) {
  const [loading, setLoading] = useState(false)
  const createSubscription = useSubscriptionStore((state) => state.createSubscription)
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
  })

  const selectedBillingCycle = watch("billing_cycle")
  const isActive = watch("is_active")

  useEffect(() => {
    if (subscription) {
      reset({
        name: subscription.name,
        cost: subscription.cost,
        currency: subscription.currency,
        billing_cycle: subscription.billing_cycle,
        next_billing_date: subscription.next_billing_date.split('T')[0],
        category: subscription.category || "",
        is_active: subscription.is_active,
        notes: subscription.notes || "",
      })
    } else {
      reset({
        name: "",
        cost: 0,
        currency: "USD",
        billing_cycle: "monthly",
        next_billing_date: "",
        category: "",
        is_active: true,
        notes: "",
      })
    }
  }, [subscription, reset, open])

  const onSubmit = async (data: SubscriptionFormData) => {
    setLoading(true)
    try {
      const subscriptionData = {
        name: data.name,
        cost: data.cost,
        currency: data.currency || "USD",
        billing_cycle: data.billing_cycle,
        next_billing_date: data.next_billing_date,
        category: data.category || undefined,
        is_active: data.is_active !== undefined ? data.is_active : true,
        notes: data.notes || undefined,
      }

      if (subscription) {
        await updateSubscription(subscription.id, subscriptionData)
        toast.success("Subscription updated successfully!")
      } else {
        await createSubscription(subscriptionData)
        toast.success("Subscription created successfully!")
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
    if (!subscription) return

    if (confirm(`Are you sure you want to delete ${subscription.name}?`)) {
      setLoading(true)
      try {
        await deleteSubscription(subscription.id)
        toast.success("Subscription deleted")
        onOpenChange(false)
      } catch (error) {
        toast.error("Failed to delete subscription")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{subscription ? "Edit Subscription" : "Add Subscription"}</DialogTitle>
          <DialogDescription>
            {subscription ? "Update subscription details" : "Add a new subscription to track"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Subscription Name *</Label>
              <Input
                id="name"
                placeholder="Netflix, Spotify..."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cost">Cost *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="9.99"
                  {...register("cost", { valueAsNumber: true })}
                />
                {errors.cost && (
                  <p className="text-sm text-red-500">{errors.cost.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="USD"
                  {...register("currency")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="billing_cycle">Billing Cycle *</Label>
                <Select
                  value={selectedBillingCycle || "monthly"}
                  onValueChange={(value) => setValue("billing_cycle", value as BillingCycle)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="next_billing_date">Next Billing Date *</Label>
                <Input
                  id="next_billing_date"
                  type="date"
                  {...register("next_billing_date")}
                />
                {errors.next_billing_date && (
                  <p className="text-sm text-red-500">{errors.next_billing_date.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Entertainment, Productivity..."
                {...register("category")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active Subscription</Label>
              <Switch
                id="is_active"
                checked={isActive !== undefined ? isActive : true}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                rows={3}
                {...register("notes")}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {subscription && (
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
              {loading ? "Saving..." : subscription ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
