export const requireAdmin = (req, res, next) => {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).render('error', {
      message: 'You are not authorized to view this page.'
    })
  }
  next()
}
