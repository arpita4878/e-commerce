import express from "express";
import * as authController from "../controller/auth.controller.js"
import * as UserController from "../controller/user.controller.js";


const router = express.Router();

router.post("/register", authController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password. Returns JWT accessToken.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "seth@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful, returns accessToken and user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: integer
 *                           example: 12
 *                         email:
 *                           type: string
 *                           example: "gurjeet@gmail.com"
 *                         role:
 *                           type: string
 *                           example: "super_admin"
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *                 code:
 *                   type: integer
 *                   example: 401
 */

router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);

router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset/:token", UserController.resetPassword);
router.post("/change-password",UserController.changePassword);

router.get('/getdata', UserController.fetch); 
router.patch('/updateUser', UserController.update); 
router.delete('/delete', UserController.deleteUser); 

router.get("/get-customer/:phone",UserController.getCustomerByPhone)



export default router;
