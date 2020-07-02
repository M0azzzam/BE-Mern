import { Router } from 'express'

import { getRepairCategories, createRepairCategory, deleteRepairCategory, updateRepairCategory, updateRepairCategoriesTriggers } from '../controllers/repairCategory'
const router = Router()

router.get('/', getRepairCategories)
router.post('/create', createRepairCategory)
router.post('/delete', deleteRepairCategory)
router.post('/update', updateRepairCategory)
router.post('/update_triggers', updateRepairCategoriesTriggers)


export default router
