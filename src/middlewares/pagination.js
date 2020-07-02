export const pagination = options => (req, res, next) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  req.query.page = page || options.page
  req.query.limit = limit > options.maxLimit ? options.maxLimit : limit || options.limit

  next()
}
