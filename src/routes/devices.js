import { Router } from 'express'

import { getDevices, createDevice, updateDevice, deleteDevice, updateDeviceTriggers, getSignedUrlForDeviceImage, deleteImage, getDevicesByManufacturer } from '../controllers/device'
const router = Router()

router.get('/', getDevices)
router.post('/create', createDevice)
router.post('/delete', deleteDevice)
router.post('/update', updateDevice)
router.post('/update_triggers', updateDeviceTriggers)
router.post('/get_file_upload_url', getSignedUrlForDeviceImage)
router.post('/delete_image', deleteImage)
router.post('/by_manufacturer', getDevicesByManufacturer)

export default router
