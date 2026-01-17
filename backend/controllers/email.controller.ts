import type { Request, Response } from 'express';
import { sendWelcomeEmail, sendEyeTestCertificateEmail } from '../services/emailService.ts';

export const sendWelcome = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body as { name?: string; email?: string };

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    await sendWelcomeEmail(name || '', email);

    res.json({ success: true });
  } catch (error) {
    console.error('[Email Controller] Welcome email failed:', error);
    res.status(500).json({ message: 'Failed to send welcome email' });
  }
};

export const sendEyeTestCertificate = async (req: Request, res: Response) => {
  try {
    const { name, email, age, gender, certId, leftEye, rightEye, overallConfidence } = req.body;

    if (!email || !certId || !leftEye || !rightEye) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await sendEyeTestCertificateEmail({
      name: name || 'Patient',
      email,
      age: age || '',
      gender: gender || 'Not specified',
      certId,
      leftEye,
      rightEye,
      overallConfidence: overallConfidence || 0,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[Email Controller] Eye test email failed:', error);
    res.status(500).json({ message: 'Failed to send eye test email' });
  }
};

