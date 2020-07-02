import { Router } from 'express'
import { getAllStores, getCurrentStore, updateStoreInformation, getStoreById, addNewStore } from '../controllers/store'

const router = Router()

router.get('/', getAllStores)
router.get('/get_current_store', getCurrentStore)
router.get('/get_store', getStoreById)
router.post('/update', updateStoreInformation)
router.post('/add_new', addNewStore)

export default router;
