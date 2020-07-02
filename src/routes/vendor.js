import { Router } from 'express'

import { getVendors, createVendor, deleteVendor, updateVendor } from '../controllers/vendor'
const router = Router()

router.get('/', getVendors)
router.post('/create', createVendor)
router.post('/delete', deleteVendor)
router.post('/update', updateVendor)


export default router
