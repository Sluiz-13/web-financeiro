import express from 'express';
const router = express.Router();
import * as departmentsController from '../controllers/departmentsController';
import verifyToken from '../middleware/verifyToken';
import asyncHandler from '../utils/asyncHandler';

router.get('/departments', verifyToken, asyncHandler(departmentsController.getDepartments));
router.post('/departments', verifyToken, asyncHandler(departmentsController.createDepartment));

export default router;
