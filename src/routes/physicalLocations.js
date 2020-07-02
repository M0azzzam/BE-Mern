import { Router } from 'express'

import { getPhysicalLocations, createPhysicalLocation, updatePhysicalLocation, deletePhysicalLocation } from '../controllers/physicalLocation'
const router = Router()

router.get('/', getPhysicalLocations)
router.post('/create', createPhysicalLocation)
router.post('/delete', deletePhysicalLocation)
router.post('/update', updatePhysicalLocation)

export default router
