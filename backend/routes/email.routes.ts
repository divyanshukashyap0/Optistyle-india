import express from 'express';
import { sendWelcome, sendEyeTestCertificate } from '../controllers/email.controller.ts';

const router = express.Router();

router.post('/welcome', sendWelcome);
router.post('/eye-test', sendEyeTestCertificate);

export default router;

