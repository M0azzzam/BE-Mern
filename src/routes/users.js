import { Router } from 'express'
import _BusinessModel from '../models/business'
import _UserModel from '../models/user'
import _RoleModel from '../models/role'
import _PermissionModel from '../models/permission'
import { loginController, registerController, verifyAccount, updateUser, getUserProfile, updateUserProfile, updateUserPassword } from '../controllers/user'
import { authenticate } from '../middlewares/auth'

const router = Router()

router.post('/login', loginController)
router.post('/register', registerController)
router.get('/verify/:token', verifyAccount)
router.post('/update', authenticate, updateUser)
router.get('/profile/me', authenticate, getUserProfile)
router.post('/profile/me/update', authenticate, updateUserProfile)
router.post('/profile/update_password', authenticate, updateUserPassword)

export default router;
