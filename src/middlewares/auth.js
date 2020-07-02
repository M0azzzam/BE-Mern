import config from '../config/app'
import _UserModel from '../models/user'
import _PermissionModel from '../models/permission'
import _RoleModel from '../models/role'
import jwt from 'jsonwebtoken'
import { setCurrentTenantId } from '../lib/storage'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1]
    if (!token) throw new Error('Invalid token')
    const decoded = jwt.verify(token, config.authKey)
    if (decoded) {
      const doc = await _UserModel().findById(decoded.userId).populate('role', { isSuper: true })
      if (!doc) {
        throw new Error('Invalid token')
      } else {
        req.user = doc
        req.storeId = decoded.storeId
        setCurrentTenantId(doc.business)
        next()
      }
    } else {
      throw new Error('Invalid token')
    }
  } catch (err) {
    console.log(err)
    return res.status(401).json({ reason: err.message })
  }
}

const getPermissionsByRole = async role => {
  const permissions = await _PermissionModel().find({ role })
  const flatenPermissions = []
  permissions.forEach(permission => {
    if (permission.access) flatenPermissions.push(`${permission.module}:access`)
    if (permission.edit) flatenPermissions.push(`${permission.module}:edit`)
    if (permission.delete) flatenPermissions.push(`${permission.module}:delete`)
  })
  return flatenPermissions
}

export const authorize = (...allowed) => {
  return async (req, res, next) => {
    try {
      if (req.user.isSuper || (req.user.role && req.user.role.isSuper)) return next()
      if (!req.user.role) throw new Error('ACCESS_FORBIDDEN')
      const permissions = await getPermissionsByRole(req.user.role._id)
      req.user.permissions = permissions
      const hasPermission = permissions.some(p => allowed.includes(p))
      if (hasPermission) next()
      else throw new Error('ACCESS_FORBIDDEN')
    } catch (err) {
      console.log(err)
      return res.status(403).json({ error: true, reason: err.message })
    }
  }
}
