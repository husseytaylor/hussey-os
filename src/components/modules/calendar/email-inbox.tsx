"use client"

import { useState, useEffect } from "react"
import { useEmailStore } from "@/stores/email-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Mail, Trash2, X } from "lucide-react"
import { format } from "date-fns"
import type { Email } from "@/types/email.types"
import { toast } from "sonner"

export function EmailInbox() {
  const { emails, loading, fetchEmails, deleteEmail, setFilter, filter } = useEmailStore()
  const [search, setSearch] = useState("")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

  useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  const allLabels = Array.from(
    new Set(emails.flatMap((email) => email.labels || []))
  ).sort()

  const handleSearch = (value: string) => {
    setSearch(value)
    setFilter({ ...filter, search: value || undefined })
  }

  const toggleLabel = (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter((l) => l !== label)
      : [...selectedLabels, label]

    setSelectedLabels(newLabels)
    setFilter({ ...filter, labels: newLabels.length > 0 ? newLabels : undefined })
  }

  const handleDelete = async (email: Email) => {
    if (confirm("Are you sure you want to delete this email?")) {
      await deleteEmail(email.id)
      setSelectedEmail(null)
      toast.success("Email deleted")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {allLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Filter by label:</span>
          {allLabels.map((label) => (
            <Badge
              key={label}
              variant={selectedLabels.includes(label) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleLabel(label)}
            >
              {label}
            </Badge>
          ))}
          {selectedLabels.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLabels([])
                setFilter({ ...filter, labels: undefined })
              }}
              className="h-6 px-2"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Inbox
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {emails.length} emails
            </span>
          </CardTitle>
          <CardDescription>
            Synced from Gmail via webhook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No emails found</p>
                <p className="text-sm text-muted-foreground">
                  {search || selectedLabels.length > 0
                    ? "Try adjusting your filters"
                    : "Emails will appear here when synced"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{email.from_email}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(email.received_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">{email.subject}</p>
                        {email.body && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {email.body}
                          </p>
                        )}
                        {email.labels && email.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {email.labels.map((label) => (
                              <Badge key={label} variant="secondary" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate pr-4">{selectedEmail?.subject}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedEmail && handleDelete(selectedEmail)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-1">
                <p>
                  <strong>From:</strong> {selectedEmail?.from_email}
                </p>
                <p>
                  <strong>To:</strong> {selectedEmail?.to_email}
                </p>
                <p>
                  <strong>Received:</strong>{" "}
                  {selectedEmail &&
                    format(new Date(selectedEmail.received_at), "PPpp")}
                </p>
                {selectedEmail?.labels && selectedEmail.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedEmail.labels.map((label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {selectedEmail?.body || "(No content)"}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
