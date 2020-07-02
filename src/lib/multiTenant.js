import mongoose, { Schema } from 'mongoose'
import { getCurrentTenantId } from './storage'
import mongoosePaginate from 'mongoose-paginate-v2'
import customLabels from '../constants/paginationLabels'
mongoosePaginate.paginate.options = {
  customLabels
}

export function tenantModel(name, schema, options) {
  schema.plugin(mongoosePaginate)

  return (props = {}) => {
    schema.add({ tenantId: String })
    const Model = mongoose.model(name, schema, options)

    const { skipTenant } = props
    const tenantId = getCurrentTenantId()
    if (!tenantId || skipTenant) return Model

    Model.schema.set('discriminatorKey', 'tenantId')

    const discriminatorName = name + '-' + tenantId
    const existingDiscriminator = (Model.discriminators || {})[discriminatorName]
    return existingDiscriminator || Model.discriminator(discriminatorName, new Schema({}), `${tenantId}`)
  }
}

export function tenantlessModel(name, schema, options) {
  schema.plugin(mongoosePaginate)

  return () => mongoose.model(name, schema, options)
}
