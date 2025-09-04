import express from 'express';
import { getAllSavings, createSaving, getSavingsSummary, deleteSaving, updateSaving } from '../controllers/savingsController';
import verifyToken from '../middleware/verifyToken';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

router.use(verifyToken); 

router.get('/', asyncHandler(getAllSavings));
router.post('/', asyncHandler(createSaving));
router.get('/summary', asyncHandler(getSavingsSummary));
router.delete('/:id', asyncHandler(deleteSaving));
router.put('/:id', asyncHandler(updateSaving));

export default router;
