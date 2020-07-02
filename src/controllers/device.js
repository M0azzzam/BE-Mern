import _DeviceModel from '../models/device'
import Joi from '@hapi/joi'
import flatten from 'flat'
import { getSignedUrlForObject, deleteObject } from '../utils/aws'
import ERRORS from '../constants/errors'

const createDeviceSchema = Joi.object({
  name: Joi.string().required(),
  manufacturer: Joi.string().required(),
  colors: Joi.array().items(Joi.string()).optional(),
  imageUrl: Joi.string().optional().allow(''),
  triggers: Joi.object().optional(),
})

const updateDeviceSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  manufacturer: Joi.string(),
  colors: Joi.array().items(Joi.string()).optional(),
  imageUrl: Joi.string().optional().allow(''),
  triggers: Joi.object().optional(),
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required(),
})

const updateTriggersSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required(),
  triggers: Joi.object({
    onPOS: Joi.boolean(),
    onWidget: Joi.boolean()
  }).required()
})

const getByManufacturerSchema = Joi.object({
  manufacturer: Joi.string().required(),
})

export const getDevices = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _DeviceModel().paginate({ isDelete: false }, { page, limit, select: '-isDelete', populate: [{ path: 'colors', select: 'name colorCode' }, { path: 'manufacturer', select: 'name' }] })

    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createDevice = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createDeviceSchema)
    if (validation.error) throw new Error(validation.error)

    const existingDevice = await _DeviceModel().findOne({ name: { $regex: new RegExp(`^${req.body.name}$`), $options: 'i' }, isDelete: false })
    if (existingDevice) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const data = await _DeviceModel().create(req.body)
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateDevice = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateDeviceSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id, ...rest } = req.body
    if (rest.name) {
      const existingDevice = await _DeviceModel().findOne({ name: { $regex: new RegExp(rest.name), $options: 'i' }, isDelete: false })
      if (existingDevice && !existingDevice._id.equals(_id)) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }

    const data = await _DeviceModel().findOneAndUpdate({ _id, isDelete: false }, { $set: flatten(rest) }, { new: true })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteDevice = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: ids } = req.body
    const data = await _DeviceModel().updateMany({ _id: { $in: ids } }, { $set: { isDelete: true } }, { new: true })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateDeviceTriggers = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateTriggersSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, ...rest } = req.body

    const data = await _DeviceModel().updateMany({ _id: { $in: _id } }, { $set: flatten(rest) }, { new: true })
    return res.json({})
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const getSignedUrlForDeviceImage = async (req, res) => {
  try {
    const { file } = req.body
    const result = await getSignedUrlForObject(file, 'devices')

    return res.json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteImage = async (req, res) => {
  try {
    const { id: _id } = req.body
    if (!_id) throw new Error('id is missing from request body.')

    const data = await _DeviceModel().findOne({ _id })
    const url = data.imageUrl
    const result = await deleteObject(url)
    if (!result.error) return res.json({ data: result })
    else throw new Error(result.reason)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const getDevicesByManufacturer = async (req, res) => {

  try {
    const validation = Joi.validate(req.body, getByManufacturerSchema)
    if (validation.error) throw new Error(validation.error)
    const { manufacturer } = req.body
    const data = await _DeviceModel().find({ isDelete: false, manufacturer }).select('name')
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
