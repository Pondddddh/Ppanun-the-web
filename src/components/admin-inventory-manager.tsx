"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { Package } from 'lucide-react'

interface AdminInventoryManagerProps {
  userId: string
  username: string
}

export function AdminInventoryManager({ userId, username }: AdminInventoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [userInventory, setUserInventory] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, userId])

  const fetchData = async () => {
    try {
      console.log('[v0] Fetching items from /api/items');
      // Fetch all items
      const itemsRes = await fetch("/api/items")
      console.log('[v0] Items response status:', itemsRes.status);
      if (itemsRes.ok) {
        const data = await itemsRes.json()
        console.log('[v0] Items data:', data);
        setItems(data.items || [])
      } else {
        console.error('[v0] Failed to fetch items:', itemsRes.status, itemsRes.statusText);
      }

      console.log('[v0] Fetching inventory for user:', userId);
      // Fetch user inventory
      const inventoryRes = await fetch(`/api/admin/inventory?userId=${userId}`)
      console.log('[v0] Inventory response status:', inventoryRes.status);
      if (inventoryRes.ok) {
        const data = await inventoryRes.json()
        console.log('[v0] Inventory data:', data);
        const inventoryIds = (data.inventory || []).map((item: any) => item.id)
        console.log('[v0] Inventory IDs:', inventoryIds);
        setUserInventory(inventoryIds)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch data:", error)
    }
  }

  const handleAddItem = async (itemId: string) => {
    setLoading(itemId)
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", userId, itemId }),
      })

      if (response.ok) {
        setUserInventory([...userInventory, itemId])
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to add item:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setLoading(itemId)
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", userId, itemId }),
      })

      if (response.ok) {
        setUserInventory(userInventory.filter(id => id !== itemId))
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
    } finally {
      setLoading(null)
    }
  }

  const hasItem = (itemId: string) => {
    const result = (userInventory || []).includes(itemId);
    return result;
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      case 'uncommon': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'rare': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'epic': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'legendary': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default: return ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="w-4 h-4 mr-2" />
          Manage Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Inventory - {username}</DialogTitle>
          <DialogDescription>Grant or remove items from this user's inventory</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading items...
            </div>
          ) : (
            items.map((item) => {
              const owned = hasItem(item.id)
              return (
                <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="outline" className={getRarityColor(item.rarity)}>
                        {item.rarity}
                      </Badge>
                      <Badge variant="outline">${item.price}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div>
                    {owned ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={loading === item.id}
                      >
                        {loading === item.id ? "Removing..." : "Remove"}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAddItem(item.id)}
                        disabled={loading === item.id}
                      >
                        {loading === item.id ? "Adding..." : "Grant"}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
