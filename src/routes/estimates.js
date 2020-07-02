import { Router } from 'express'

import { getEstimates, createEstimate, updateEstimate, deleteEstimates, getNextEstimateNumber, updateEsitmateStatus, convertEstimateToJob } from '../controllers/estimate'
const router = Router()

router.get('/', getEstimates)
router.get('/get_next_number', getNextEstimateNumber)
router.post('/create', createEstimate)
router.post('/delete', deleteEstimates)
router.post('/update', updateEstimate)
router.post('/update_status', updateEsitmateStatus)
router.post('/convert_estimate_to_job', convertEstimateToJob)

export default router
