import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email address is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (user) {
        // 1. Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 Hour
        await user.save();

        // 2. Setup Transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        // 3. Send Email
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
        
        const mailOptions = {
          from: `"RojgarMatch Identity" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'Password Recovery Verification - RojgarMatch',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 12px;">
              <h2 style="color: #0D244D;">Reset Your Password</h2>
              <p>Hello,</p>
              <p>We received a request to reset the password for your RojgarMatch account. Click the button below to proceed with verification:</p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" style="background-color: #0D244D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Identity & Reset Password</a>
              </div>
              <p style="color: #586069; font-size: 14px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #e1e4e8; margin: 20px 0;" />
              <p style="font-size: 12px; color: #959da5;">RojgarMatch National Recruitment Registry - Secure Access Protocol</p>
            </div>
          `,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailError: any) {
            console.error('SMTP Mail Error:', mailError.message);
            // If it's a login error, give a specific hint
            if (mailError.message.includes('Invalid login')) {
                return NextResponse.json({ 
                    message: 'Email service authentication failed. Please check your App Password in .env.' 
                }, { status: 500 });
            }
            throw mailError; // Re-throw for general catch
        }
    }

    return NextResponse.json({ 
        message: 'If an account exists with this email, a reset link has been dispatched to your inbox.' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
        message: 'An error occurred during transmission',
        debug_error: error.message // Added for remote debugging
    }, { status: 500 });
  }
}
