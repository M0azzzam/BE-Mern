import mongoose from 'mongoose'
import _ProductCategoryModel from '../models/productCategory'
import Joi from '@hapi/joi'
import flatten from 'flat'
import { findIndex } from 'lodash'
import ERRORS from '../constants/errors'

const createSchema = Joi.object({
  name: Joi.string().required(),
  parent: Joi.string()
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  parent: Joi.string(),
  valuationMethod: Joi.string().valid(['FIFO', 'LIFO', 'WAC']),
  triggers: Joi.object({
    onPOS: Joi.boolean(),
    isPart: Joi.boolean()
  })
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required(),
})



const hasBulkOperations = (bulk) => {
  return bulk
    && bulk.s
    && bulk.s.currentBatch
    && bulk.s.currentBatch.operations
    && bulk.s.currentBatch.operations.length > 0
}

export const getProductCategories = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _ProductCategoryModel().paginate({ isDelete: false }, { page, limit, select: '-isDelete', populate: { path: 'path', select: 'name' } })
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createProductCategory = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)
    const { name, parent = '' } = req.body

    const productCategory = await _ProductCategoryModel().findOne({ name: { $regex: new RegExp(`^${name}$`), $options: 'i' }, isDelete: false })
    if (productCategory) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    let parentCategory = null
    if (parent) {
      parentCategory = await _ProductCategoryModel().findById(parent)
    }

    let data = {}
    const newID = mongoose.Types.ObjectId()
    if (parentCategory) {
      data = await _ProductCategoryModel().create({
        _id: newID,
        name,
        parent: parentCategory._id,
        path: [...parentCategory.path, newID]
      })
    } else {
      data = await _ProductCategoryModel().create({
        _id: newID,
        name,
        path: [newID]
      })
    }

    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateProductCategory = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, parent, ...rest } = req.body

    if (rest.name) {
      const existingProductCatergory = await _ProductCategoryModel().findOne({ name: { $regex: new RegExp(`^${rest.name}$`), $options: 'i' }, isDelete: false })
      if (existingProductCatergory && !existingProductCatergory._id.equals(_id)) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }

    const oldCategory = await _ProductCategoryModel().findOne({ _id, isDelete: false })
    if (oldCategory.parent) delete rest.valuationMethod
    if (parent && parent !== oldCategory.parent) {
      const parentCategory = await _ProductCategoryModel().findOne({ _id: parent, isDelete: false })
      const pathIndex = findIndex(oldCategory.path, (val) => val === parent)
      const oldPathSubset = oldCategory.path.slice(pathIndex, oldCategory.path.length)
      const newPath = parentCategory.path.concat(oldPathSubset)
      const $addToSet = { path: { $each: newPath } }
      rest.parent = parent

      const childCategories = await _ProductCategoryModel().find({ parent: _id })
      const bulk = _ProductCategoryModel().collection.initializeOrderedBulkOp()

      childCategories && childCategories.forEach((cat, i) => {
        const childPathIndex = findIndex(cat.path, (val) => val === oldCategory.id)
        const childOldPathSubset = cat.path.slice(childPathIndex, cat.path.length)
        const childNewPath = newPath.concat(childOldPathSubset)
        bulk.find({ _id: cat._id }).updateOne({ $set: { path: [] } });
        bulk.find({ _id: cat._id }).updateOne({ $addToSet: { path: { $each: childNewPath } } });
      })

      await _ProductCategoryModel().updateOne({ _id }, { $set: { path: [] } })
      await _ProductCategoryModel().updateOne({ _id }, { $set: flatten(rest), $addToSet })
      if (hasBulkOperations(bulk)) await bulk.execute()

      return res.json({ data: {} })
    } else {
      const data = await _ProductCategoryModel().findOneAndUpdate({ _id, isDelete: false }, { $set: flatten(rest) }, { new: true })
      return res.json({ data })
    }
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteProductCategory = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: ids } = req.body

    await _ProductCategoryModel().updateMany({ _id: { $in: ids } }, { $set: { isDelete: true } })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
