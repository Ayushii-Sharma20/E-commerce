const express = require('express')
const router = express.Router()
const controller = require('../controllers/notificationController')

// CREATE (optional)
router.post('/', controller.createNotification)

// ✅ FIXED: more specific route
router.get('/user/:userId', controller.getNotifications)

// MARK as read
router.patch('/:id/read', controller.markAsRead)

module.exports = router