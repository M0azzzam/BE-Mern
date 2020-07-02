import { getCurrentTenantId } from '../lib/storage'
import uuid4 from 'uuid4'

export const generateRandomKey = length => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const generateFileName = (fileName, path) => {
  const tenantId = getCurrentTenantId()
  const uuid = uuid4()
  if (path) {
    return `${path}/${tenantId}_${uuid}_${fileName}`
  }

  return `${tenantId}_${uuid}_${fileName}`
}
