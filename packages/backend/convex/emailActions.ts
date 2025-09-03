'use node';

import { Resend } from 'resend';
import { internalAction } from './_generated/server';
import { v } from 'convex/values';

// Send password reset email using Resend
export const sendPasswordResetEmail = internalAction({
  args: {
    email: v.string(),
    resetToken: v.string(),
    isAdmin: v.boolean(),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY environment variable is not set');
      }

      const baseUrl = args.isAdmin
        ? process.env.ADMIN_URL || 'http://localhost:3001'
        : process.env.WEB_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${args.resetToken}`;

      const subject = args.isAdmin
        ? 'Admin Password Reset Request - Crypta'
        : 'Password Reset Request - Crypta';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0;
            }
            .content { 
              background: #f8f9fa; 
              padding: 30px; 
              border-radius: 0 0 10px 10px;
            }
            .button { 
              display: inline-block; 
              background: #007bff; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
              font-weight: 600;
            }
            .button:hover { 
              background: #0056b3; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #dee2e6; 
              font-size: 14px; 
              color: #6c757d;
            }
            .warning { 
              background: #fff3cd; 
              border: 1px solid #ffeaa7; 
              color: #856404; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 Crypta</h1>
            <p>${args.isAdmin ? 'Admin Password Reset' : 'Password Reset'}</p>
          </div>
          
          <div class="content">
            <h2>Hello!</h2>
            <p>We received a request to reset your password for your Crypta account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from Crypta. Please do not reply to this email.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Password Reset Request - Crypta
        
        Hello!
        
        We received a request to reset your password for your Crypta account.
        
        Please visit the following link to reset your password:
        ${resetUrl}
        
        Important: This link will expire in 1 hour for security reasons.
        
        If you didn't request this password reset, you can safely ignore this email.
        
        This is an automated message from Crypta. Please do not reply to this email.
      `;

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@crypta.com',
        to: [args.email],
        subject: subject,
        html: htmlContent,
        text: textContent,
      });

      console.log(`Password reset email sent successfully to ${args.email}`);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, message: 'Failed to send email' };
    }
  },
});
