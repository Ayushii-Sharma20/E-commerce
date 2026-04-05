'use client'

import { useEffect, useState, useRef } from 'react'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  // ✅ Prevent double fetch in dev (React Strict Mode)
  const hasFetched = useRef(false)

  // 🔄 Fetch notifications
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem("userId")

        if (!userId) {
          console.error("❌ No userId found")
          return
        }

        console.log("🔔 Fetching notifications for:", userId)

        const res = await fetch(
          `http://localhost:3005/api/notifications/user/${userId}`
        )

        const data = await res.json()

        console.log("🔔 Notifications:", data)

        setNotifications(data)

      } catch (err) {
        console.error("❌ Fetch error:", err)
      }
    }

    fetchNotifications()
  }, [])

  // ✅ Toggle dropdown
  const handleOpen = () => {
    setOpen(prev => !prev)
  }

  // 🔥 Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await fetch(
        `http://localhost:3005/api/notifications/${id}/read`,
        {
          method: 'PATCH'
        }
      )

      // ✅ Update UI instantly
      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
      )
    } catch (err) {
      console.error("❌ Mark read error:", err)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      {/* 🔔 Bell Button */}
      <button onClick={handleOpen} className="relative">
        🔔

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📩 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded shadow-lg z-50">
          <div className="p-3 font-semibold border-b">
            Notifications
          </div>

          {notifications.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">
              No notifications
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id)}
                className={`p-3 text-sm border-b cursor-pointer hover:bg-gray-100 ${
                  n.read ? 'text-gray-400' : 'font-medium'
                }`}
              >
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}