import { Router } from 'express'
import { singleFileUpload, multiFileUpload } from '../controllers/storage'

const router = Router()

router.post('/upload_single', singleFileUpload)
router.post('/upload_multi', multiFileUpload)

export default router;
