/**
 * Middleware die checkt als de user als admin ingelogd is
 */
function isAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) return next();
    return res.status(403).redirect('/'); 
}

module.exports = isAdmin;