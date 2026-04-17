import express from "express";
import {
  renderRegister,
  renderLogin,
  registerUser,
  loginUser,
  logoutUser,
  setNewPassword,
  ForgotPassword,
  renderForgotPassword,
  renderResetPassword,
  verifyUser,
  resendVerification
} from "../controllers/authController.js";
import passport from '../config/passport.js'

const router = express.Router();

router.get("/register", renderRegister);
router.post("/register", registerUser);

router.get("/login", renderLogin);
router.post("/login", loginUser);
router.get('/logout',logoutUser)

router.get('/forgot-password',renderForgotPassword)
router.post('/forgot-password',ForgotPassword)

router.get('/reset-password',renderResetPassword)
router.post('/reset-password',setNewPassword)

router.get('/verify',verifyUser)
router.post('/resend-verification', resendVerification);

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google redirects back here
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Set your session the same way your loginUser does
    req.session.user = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      is_admin: req.user.is_admin
    };
    res.redirect('/');
  }
);

export default router;