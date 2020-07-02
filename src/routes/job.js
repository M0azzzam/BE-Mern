import { Router } from 'express'
import { createJob, getNextJobNumber, updateJobStatus, deleteJobs, updateJob, getJobs } from '../controllers/job'

const router = Router()

router.get('/', getJobs)
router.post('/create', createJob)
router.get('/get_next_number', getNextJobNumber)
router.post('/delete', deleteJobs)
router.post('/update', updateJob)
router.post('/update_status', updateJobStatus)

export default router
