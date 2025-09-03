import express from "express";
import * as authController from "../controller/auth.controller.js"
import * as UserController from "../controller/user.controller.js";


const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset/:token", UserController.resetPassword);
router.post("/change-password",UserController.changePassword);

router.get('/getdata', UserController.fetch); 
router.patch('/updateUser', UserController.update); 
router.delete('/delete', UserController.deleteUser); 

// router.post("/change-password", authMiddleware, changePassword);

// router.get("/me", authMiddleware, roleCheck(["super_admin", "branch_admin"]), (req, res) => {
//   res.json({ user: req.user });
// });

export default router;
