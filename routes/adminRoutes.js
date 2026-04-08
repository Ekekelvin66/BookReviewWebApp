import express from 'express'
import { requireAuth } from '../middlewares/requireAuth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'
import {
  renderAdminDashboard,
  adminDeleteBook,
  renderEditBook,
  adminEditBook,
  adminDeleteUser,
//   adminBanUser
} from '../controllers/adminController.js'

const router = express.Router()

router.get('/admin', requireAuth, requireAdmin, renderAdminDashboard)
router.get('/admin/books/:bookId/edit', requireAuth, requireAdmin, renderEditBook)
router.post('/admin/books/:bookId/edit', requireAuth, requireAdmin, adminEditBook)
router.post('/admin/books/:bookId/delete', requireAuth, requireAdmin, adminDeleteBook)
router.post('/admin/users/:userId/delete', requireAuth, requireAdmin, adminDeleteUser)
// router.post('/admin/users/:userId/ban', requireAuth, requireAdmin, adminBanUser)

export default router
