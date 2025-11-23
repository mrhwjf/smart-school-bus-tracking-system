const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash');

// ---------------------- LOGIN ----------------------
router.post('/login', async (req, res) => {
try {
const { email, phone, password } = req.body;

    // Validate input
    if ((!email && !phone) || !password) {
        return res.status(400).json({ message: 'Email or phone and password are required' });
    }

    // Find user by email or phone
    const user = await User.scope('withPassword').findOne({
        where: email
            ? { email: email.trim().toLowerCase() }
            : { phone_number: phone.trim() }
    });

    if (!user) return res.status(400).json({ message: 'User not found' });

    // Compare password
    const validPassword = await comparePassword(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: 'Invalid password' });

    // Check if account is locked
    if (user.locked) {
        return res.status(403).json({ message: 'Account is locked. Please contact support.' });
    }

    // Save minimal info in session
    req.session.userId = user.user_id;
    req.session.roleId = user.role_id;

    // Determine redirect based on role
    let redirectTo = '/';
    switch(user.role_id) {
        case 1: redirectTo = '/admin/dashboard'; break;
        case 2: redirectTo = '/driver/dashboard'; break;
        case 3: redirectTo = '/parent/dashboard'; break;
    }

    return res.json({ message: 'Login successful', redirect: redirectTo,  });

} catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
}


});

// ---------------------- LOGOUT ----------------------
router.post('/logout', (req, res) => {
if (!req.session) return res.status(200).json({ message: 'Already logged out' });


req.session.destroy(err => {
    if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ message: 'Logout failed' });
    }

    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully' });
});


});

// ---------------------- CHECK SESSION ----------------------
router.get('/me', (req, res) => {
if (!req.session.userId) {
return res.status(401).json({ message: 'Not logged in' });
}
res.json({ userId: req.session.userId, roleId: req.session.roleId });
});

module.exports = router;
