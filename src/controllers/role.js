import _RoleModel from '../models/role'
import Joi from '@hapi/joi'

const createRoleSchema = Joi.object({
  name: Joi.string().required()
})

const deleteRoleSchema = Joi.object({
  id: Joi.string().required()
})

const updateRoleSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  isSuper: Joi.boolean(),
  permissions: Joi.array()
})

const defaultPermisions = () => {
  function preparePermissions(...modules) {
    return modules.map((module) => {
      return { module, access: true, edit: true, delete: false, actions: {} }
    })
  }

  return preparePermissions('pos', 'inventory', 'invoice', 'employees')
}

export const createRole = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createRoleSchema)
    if (validation.error) throw new Error(validation.error)

    const { name } = req.body
    const result = await _RoleModel().create({ name, permissions: defaultPermisions() })
    return res.status(201).json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateRole = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateRoleSchema)
    if (validation.error) throw new Error(validation.error)

    const { id, ...rest } = req.body
    const result = await _RoleModel().findByIdAndUpdate(id, rest, { new: true })
    return res.json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const getRoles = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _RoleModel().paginate({}, { page, limit })
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteRole = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteRoleSchema)
    if (validation.error) throw new Error(validation.error)

    const { id } = req.body
    const result = await _RoleModel().findByIdAndDelete(id)
    return res.json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
