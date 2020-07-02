import { Router } from 'express'

import { getClients, createClient, updateClient, deleteClient, searchClients } from '../controllers/client'
const router = Router()

router.get('/', getClients)
router.post('/create', createClient)
router.post('/delete', deleteClient)
router.post('/update', updateClient)
router.get('/search', searchClients)


export default router
