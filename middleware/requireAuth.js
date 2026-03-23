export const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login')
    }
    res.locals.user = {
        id: req.session.user.id,
        name: req.session.user.name,
        email: req.session.user.email
    }
    next()
}