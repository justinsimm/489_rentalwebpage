function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Middleware: allows admin AND moderator through
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
        return next();
    }
    res.redirect('/profile');
}

// Middleware: only allows admin through (not moderator)
function isAdminOnly(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/profile');
}

module.exports = { isAuthenticated, isAdmin, isAdminOnly };