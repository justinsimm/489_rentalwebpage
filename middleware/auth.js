function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Middleware to check if the logged in user is an Admin
function isAdmin(req, res, next) {
    // Check if they are logged in AND their role in the database is 'admin'
    if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
        return next();
    }
    // If they are not an admin, redirect them safely to their profile page.
    res.redirect('/profile'); 
}

module.exports = { isAuthenticated, isAdmin };