import { Router } from 'express'

import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoice'
const router = Router()

router.get('/', getInvoices)
router.post('/create', createInvoice)
router.post('/delete', deleteInvoice)
router.post('/update', updateInvoice)

export default router
