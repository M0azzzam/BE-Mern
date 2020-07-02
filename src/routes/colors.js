import { Router } from 'express'

import { getColors, createColor, deleteColor, updateColor } from '../controllers/color'
const router = Router()

router.get('/', getColors)
router.post('/create', createColor)
router.post('/delete', deleteColor)
router.post('/update', updateColor)


export default router
