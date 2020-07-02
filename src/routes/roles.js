import { Router } from 'express'
import _RoleModel from '../models/role'
import { createRole, getRoles, deleteRole, updateRole } from '../controllers/role'

const router = Router()

router.get('/', getRoles)
router.delete('/', deleteRole)
router.post('/create', createRole)
router.post('/update', updateRole)
router.post('/delete', deleteRole)

export default router;
