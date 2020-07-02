import { Router } from 'express'

import { getInventories, createInventory, updateInventory, deleteInventories, searchInventory } from '../controllers/inventory'
const router = Router()

router.get('/', getInventories)
router.post('/create', createInventory)
router.post('/update', updateInventory)
router.post('/delete', deleteInventories)
router.get('/search', searchInventory)


export default router
