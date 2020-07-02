import { Router } from 'express'

import { getTaxes, createTax, updateTax, deleteTax } from '../controllers/tax'
const router = Router()

router.get('/', getTaxes)
router.post('/create', createTax)
router.post('/delete', deleteTax)
router.post('/update', updateTax)

export default router
