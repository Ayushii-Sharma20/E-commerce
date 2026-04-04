'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Mail, Phone, MapPin, Edit2, Save, X, Package, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'

function ProfileContent() {
  const [isEditing, setIsEditing] = useState(false)

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const [editData, setEditData] = useState(userData)

  // ✅ Fetch profile from backend
  useEffect(() => {
    if (typeof window === "undefined") return

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) return

        const res = await fetch("http://localhost:3001/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()

        if (!res.ok) throw new Error("Failed")

        setUserData({
          name: data.name,
          email: data.email,
          phone: ''
        })

      } catch (err) {
        console.error(err)
      }
    }

    fetchProfile()
  }, [])

  // ✅ Sync editData with userData
  useEffect(() => {
    setEditData(userData)
  }, [userData])

  const handleSave = () => {
    setUserData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(userData)
    setIsEditing(false)
  }

  const recentOrders: any[] = []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground md:text-4xl">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and view order history
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>

              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={userData.name} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {userData.name
                      ? userData.name.split(' ').map(n => n[0]).join('')
                      : 'U'}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="font-semibold text-foreground">{userData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since January 2024
                  </p>
                </div>
              </div>

              <Separator />

              {/* Fields */}
              <div className="grid gap-4 sm:grid-cols-2">

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>

                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-foreground">{userData.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>

                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-foreground">{userData.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </Label>

                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-foreground">
                      {userData.phone || 'Not provided'}
                    </p>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Saved Addresses
              </CardTitle>
              <CardDescription>
                Manage your shipping addresses
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                No addresses yet
              </p>

              <Button variant="outline" className="mt-4 w-full">
                Add New Address
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/orders">
                  <Package className="mr-2 h-4 w-4" />
                  View All Orders
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  localStorage.removeItem("token")
                  window.location.href = "/login"
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                No orders yet
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <ProfileContent />
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}