import { Router } from 'express'

import { getProductCategories, createProductCategory, deleteProductCategory, updateProductCategory } from '../controllers/productCategory'
const router = Router()

router.get('/', getProductCategories)
router.post('/create', createProductCategory)
router.post('/delete', deleteProductCategory)
router.post('/update', updateProductCategory)


export default router
