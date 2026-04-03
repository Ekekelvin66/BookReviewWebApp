export const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        const redirectPath = encodeURIComponent(req.originalUrl);
        return res.redirect(`/login?redirect=${redirectPath}`)
    }
    res.locals.user = {
        id: req.session.user.id,
        name: req.session.user.name,
        email: req.session.user.email
    }
    next()
}