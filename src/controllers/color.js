import _ColorModel from '../models/color'
import Joi from '@hapi/joi'
import ERRORS from '../constants/errors'

const createSchema = Joi.object({
  name: Joi.string().required(),
  colorCode: Joi.string().required(),
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  colorCode: Joi.string().required(),
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required()
})

export const getColors = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _ColorModel().paginate({ isDelete: false }, { page, limit })
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createColor = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)
    const { name, colorCode } = req.body
    const existingColor = await _ColorModel().findOne({ name, isDelete: false })
    if (existingColor) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const data = await _ColorModel().create({
      name,
      colorCode
    })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateColor = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, name, colorCode } = req.body
    const toUpdate = {
      name,
      colorCode
    };


    if (name) {
      const existingColor = await _ColorModel().findOne({ name, isDelete: false })
      if (existingColor && !existingColor._id.equals(_id)) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }
    const data = await _ColorModel().findOneAndUpdate({ _id, isDelete: false }, toUpdate, { new: true })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteColor = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body

    await _ColorModel().updateMany({ _id: { $in: _id } }, { $set: { isDelete: true } }, { new: true })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
