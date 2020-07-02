import { Router } from 'express'

import { getManufacturers, createManufacturer, deleteManufacturer, updateManufacturer,updateManufacturerTriggers} from '../controllers/manufacturer'
const router = Router()

router.get('/', getManufacturers)
router.post('/create', createManufacturer)
router.post('/delete', deleteManufacturer)
router.post('/update', updateManufacturer)
router.post('/update_triggers', updateManufacturerTriggers)

export default router
