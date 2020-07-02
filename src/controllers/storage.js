import uploadService from '../services/file-upload'

const singleUpload = uploadService.single('image')
const multiUpload = uploadService.array('images')

export const singleFileUpload = async (req, res) => {
  try {
    singleUpload(req, res, async function (err) {
      if (err) {
        return res.json({ err })
      }

      return res.json({ data: req.file })
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const multiFileUpload = async (req, res) => {
  try {
    multiUpload(req, res, async function (err) {
      if (err) {
        return res.json({ err })
      }

      return res.json({ data: req.files })
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
