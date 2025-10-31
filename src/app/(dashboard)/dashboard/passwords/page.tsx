"use client"

import { useEffect, useState } from "react"
import { usePasswordStore } from "@/stores/password-store"
import { MasterPasswordDialog } from "@/components/modules/passwords/master-password-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Lock,
  Unlock,
  MoreVertical,
  AlertTriangle,
  RefreshCw,
  Check,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { generatePassword } from "@/lib/crypto"
import type { Password } from "@/types/password.types"

export default function PasswordsPage() {
  const {
    passwords,
    loading,
    isUnlocked,
    setMasterPassword,
    clearMasterPassword,
    fetchPasswords,
    createPassword,
    updatePassword,
    deletePassword,
    decryptPassword,
  } = usePasswordStore()

  const [search, setSearch] = useState("")
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [passwordForm, setPasswordForm] = useState({
    website: "",
    username: "",
    password: "",
    notes: "",
  })

  useEffect(() => {
    if (isUnlocked) {
      fetchPasswords()
    }
  }, [isUnlocked, fetchPasswords])

  useEffect(() => {
    if (!isUnlocked && passwords.length === 0 && !loading) {
      setShowUnlockDialog(true)
    }
  }, [isUnlocked, passwords, loading])

  const handleUnlock = async (masterPassword: string) => {
    setMasterPassword(masterPassword)
    setShowUnlockDialog(false)
    toast.success("Password manager unlocked")
  }

  const handleLock = () => {
    clearMasterPassword()
    setVisiblePasswords(new Set())
    toast.success("Password manager locked")
  }

  const handleCreate = () => {
    setSelectedPassword(null)
    setPasswordForm({
      website: "",
      username: "",
      password: "",
      notes: "",
    })
    setPasswordDialogOpen(true)
  }

  const handleEdit = (password: Password) => {
    setSelectedPassword(password)
    setPasswordForm({
      website: password.website,
      username: password.username || "",
      password: "",
      notes: password.notes || "",
    })
    setPasswordDialogOpen(true)
  }

  const handleSave = async () => {
    if (!passwordForm.website.trim()) {
      toast.error("Website is required")
      return
    }

    if (!selectedPassword && !passwordForm.password) {
      toast.error("Password is required")
      return
    }

    try {
      if (selectedPassword) {
        await updatePassword(selectedPassword.id, {
          website: passwordForm.website,
          username: passwordForm.username || undefined,
          password: passwordForm.password || undefined,
          notes: passwordForm.notes || undefined,
        })
        toast.success("Password updated")
      } else {
        await createPassword({
          website: passwordForm.website,
          username: passwordForm.username || undefined,
          password: passwordForm.password,
          notes: passwordForm.notes || undefined,
        })
        toast.success("Password saved")
      }
      setPasswordDialogOpen(false)
      setPasswordForm({ website: "", username: "", password: "", notes: "" })
    } catch (error) {
      toast.error("Failed to save password")
    }
  }

  const handleDelete = async (password: Password) => {
    if (confirm(`Are you sure you want to delete the password for ${password.website}?`)) {
      await deletePassword(password.id)
      toast.success("Password deleted")
    }
  }

  const handleToggleVisibility = async (password: Password) => {
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(password.id)) {
      newVisible.delete(password.id)
    } else {
      newVisible.add(password.id)
    }
    setVisiblePasswords(newVisible)
  }

  const handleCopyPassword = async (password: Password) => {
    const decrypted = await decryptPassword(password)
    if (decrypted) {
      await navigator.clipboard.writeText(decrypted)
      setCopiedId(password.id)
      toast.success("Password copied to clipboard")
      setTimeout(() => setCopiedId(null), 2000)
    } else {
      toast.error("Failed to decrypt password")
    }
  }

  const handleGeneratePassword = () => {
    const generated = generatePassword(16, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    })
    setPasswordForm({ ...passwordForm, password: generated })
    toast.success("Password generated")
  }

  const filteredPasswords = passwords.filter((password) =>
    password.website.toLowerCase().includes(search.toLowerCase()) ||
    password.username?.toLowerCase().includes(search.toLowerCase())
  )

  if (!isUnlocked) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
          <Lock className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Password Manager Locked</h2>
          <p className="text-muted-foreground mb-6">
            Enter your master password to access your passwords
          </p>
          <Button onClick={() => setShowUnlockDialog(true)}>
            <Unlock className="h-4 w-4 mr-2" />
            Unlock
          </Button>
        </div>
        <MasterPasswordDialog
          open={showUnlockDialog}
          onUnlock={handleUnlock}
          mode={passwords.length === 0 ? "setup" : "unlock"}
        />
      </>
    )
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Passwords</h1>
            <Badge variant="outline" className="gap-1">
              <Unlock className="h-3 w-3" />
              Unlocked
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Securely manage your passwords with zero-knowledge encryption
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLock}>
            <Lock className="h-4 w-4 mr-2" />
            Lock
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Password
          </Button>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Your master password is stored in memory only for this session. Lock the password manager or close your browser to clear it.
        </AlertDescription>
      </Alert>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search passwords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredPasswords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {search ? "No passwords found" : "No passwords yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search ? "Try adjusting your search" : "Add your first password to get started"}
          </p>
          {!search && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Password
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPasswords.map((password) => (
            <PasswordCard
              key={password.id}
              password={password}
              isVisible={visiblePasswords.has(password.id)}
              isCopied={copiedId === password.id}
              onToggleVisibility={handleToggleVisibility}
              onCopy={handleCopyPassword}
              onEdit={handleEdit}
              onDelete={handleDelete}
              decryptPassword={decryptPassword}
            />
          ))}
        </div>
      )}

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPassword ? "Edit Password" : "Add Password"}
            </DialogTitle>
            <DialogDescription>
              {selectedPassword
                ? "Update password information"
                : "Add a new password to your encrypted vault"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="website">Website / Service *</Label>
              <Input
                id="website"
                placeholder="example.com"
                value={passwordForm.website}
                onChange={(e) => setPasswordForm({ ...passwordForm, website: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username / Email</Label>
              <Input
                id="username"
                placeholder="user@example.com"
                value={passwordForm.username}
                onChange={(e) => setPasswordForm({ ...passwordForm, username: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                Password {!selectedPassword && "*"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  placeholder={selectedPassword ? "Leave empty to keep current" : "Enter password"}
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                  title="Generate password"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                rows={3}
                value={passwordForm.notes}
                onChange={(e) => setPasswordForm({ ...passwordForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedPassword ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PasswordCardProps {
  password: Password
  isVisible: boolean
  isCopied: boolean
  onToggleVisibility: (password: Password) => void
  onCopy: (password: Password) => void
  onEdit: (password: Password) => void
  onDelete: (password: Password) => void
  decryptPassword: (password: Password) => Promise<string | null>
}

function PasswordCard({
  password,
  isVisible,
  isCopied,
  onToggleVisibility,
  onCopy,
  onEdit,
  onDelete,
  decryptPassword,
}: PasswordCardProps) {
  const [decrypted, setDecrypted] = useState<string | null>(null)

  useEffect(() => {
    if (isVisible && !decrypted) {
      decryptPassword(password).then(setDecrypted)
    } else if (!isVisible) {
      setDecrypted(null)
    }
  }, [isVisible, password, decryptPassword, decrypted])

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{password.website}</CardTitle>
            {password.username && (
              <CardDescription className="mt-1">{password.username}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(password)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(password)}
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
        <div>
          <div className="text-xs font-medium mb-1 text-muted-foreground">Password</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-muted p-2 rounded font-mono">
              {isVisible && decrypted ? decrypted : "••••••••••••"}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onToggleVisibility(password)}
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onCopy(password)}
            >
              {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {password.notes && (
          <div>
            <div className="text-xs font-medium mb-1 text-muted-foreground">Notes</div>
            <p className="text-sm text-muted-foreground line-clamp-2">{password.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
