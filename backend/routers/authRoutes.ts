import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController';
import asyncHandler from '../utils/asyncHandler';

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));

export default router;