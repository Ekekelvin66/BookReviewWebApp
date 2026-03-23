import express from "express";
import {
  renderRegister,
  renderLogin,
  registerUser,
  loginUser,
} from "../controllers/authContoller.js";

const router = express.Router();

router.get("/register", renderRegister);
router.post("/register", registerUser);

router.get("/login", renderLogin);
router.post("/login", loginUser);



export default router;