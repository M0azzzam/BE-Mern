import { Router } from 'express'

import { getEmployees, createEmployee, deleteEmployee, updateEmployee } from '../controllers/employee'
const router = Router()

router.get('/', getEmployees)
router.post('/create', createEmployee)
router.post('/delete', deleteEmployee)
router.post('/update', updateEmployee)


export default router
