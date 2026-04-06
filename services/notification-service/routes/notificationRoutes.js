const express = require('express')
const router = express.Router()

const controller = require('../controllers/notificationController')

// ✅ IMPORTANT (used by order-service)
router.post('/notify', controller.createNotification)

// optional
router.post('/', controller.createNotification)

// GET
router.get('/user/:userId', controller.getNotifications)

// MARK READ
router.patch('/:id/read', controller.markAsRead)

module.exports = router