"use client"

import { useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertTriangle, Lock } from "lucide-react"
import { validateMasterPassword } from "@/lib/crypto"

interface MasterPasswordDialogProps {
  open: boolean
  onUnlock: (password: string) => void
  mode?: "unlock" | "setup"
}

export function MasterPasswordDialog({
  open,
  onUnlock,
  mode = "unlock"
}: MasterPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = () => {
    setError("")

    if (!password) {
      setError("Password is required")
      return
    }

    if (mode === "setup") {
      const validation = validateMasterPassword(password)
      if (!validation.valid) {
        setError(validation.errors.join(", "))
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }
    }

    onUnlock(password)
    setPassword("")
    setConfirmPassword("")
    setShowPassword(false)
    setError("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <DialogTitle>
              {mode === "setup" ? "Set Master Password" : "Unlock Password Manager"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === "setup"
              ? "Create a strong master password to encrypt your passwords. You will need this password every time you access your passwords."
              : "Enter your master password to decrypt and view your passwords."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === "setup" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Store your master password securely. If you forget it, you will lose access to all your encrypted passwords permanently.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="master-password">
              {mode === "setup" ? "Master Password" : "Password"}
            </Label>
            <div className="relative">
              <Input
                id="master-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === "setup" ? "Create a strong password..." : "Enter master password..."}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {mode === "setup" && (
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            )}
          </div>

          {mode === "setup" && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Confirm your password..."
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full">
            {mode === "setup" ? "Set Master Password" : "Unlock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
