"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminInventoryManager } from "@/components/admin-inventory-manager"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { Trash2, Shield, User } from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  role: string
  credits: number
}

interface AdminUserManagerProps {
  users: User[]
}

export function AdminUserManager({ users: initialUsers }: AdminUserManagerProps) {
  const [users, setUsers] = useState(initialUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editCredits, setEditCredits] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDeleteUser = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCredits = async () => {
    if (!selectedUser) return
    
    setLoading(true)
    try {
      const response = await fetch("/api/admin/users/credits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: selectedUser.id, 
          credits: parseInt(editCredits) 
        }),
      })

      if (response.ok) {
        setUsers(users.map(u => 
          u.id === selectedUser.id 
            ? { ...u, credits: parseInt(editCredits) } 
            : u
        ))
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update credits:", error)
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditCredits(user.credits.toString())
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.role === "admin" ? (
                    <Shield className="w-5 h-5 text-primary" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{user.username}</p>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin"
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Credits: <span className="font-semibold">${user.credits?.toLocaleString() || '0'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AdminInventoryManager userId={user.id} username={user.username} />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openEditDialog(user)}
                >
                  Edit Credits
                </Button>
                {user.role !== "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(user)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Credits Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Credits</DialogTitle>
            <DialogDescription>
              Update credits for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={editCredits}
                onChange={(e) => setEditCredits(e.target.value)}
                placeholder="Enter credits amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCredits} disabled={loading}>
              {loading ? "Updating..." : "Update Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
