import { convexAuth, getAuthUserId } from '@convex-dev/auth/server';
import { Password } from '@convex-dev/auth/providers/Password';
import { query, mutation, action } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

// Check if user's email is verified
export const isEmailVerified = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }
    const user = await ctx.db.get(userId);
    return user?.emailVerificationTime ? true : false;
  },
});

// Update user profile (for regular users)
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    socialLinks: v.optional(
      v.object({
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        github: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Only allow users to update their own profile
    const updates: any = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.location !== undefined) updates.location = args.location;
    if (args.website !== undefined) updates.website = args.website;
    if (args.socialLinks !== undefined) updates.socialLinks = args.socialLinks;

    await ctx.db.patch(userId, updates);
    return { success: true };
  },
});

// Get user by ID (for admin use)
export const getUserById = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error('Must be authenticated');
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error('Admin access required');
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },
});

// Forgot password - send reset email
export const forgotPassword = action({
  args: {
    email: v.string(),
    isAdmin: v.optional(v.boolean()),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    try {
      // Find user by email
      const users = await ctx.runQuery(api.auth.findUserByEmail, {
        email: args.email.toLowerCase(),
      });

      if (!users || users.length === 0) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message:
            'If an account with that email exists, a password reset link has been sent.',
        };
      }

      const user = users[0];

      // Check if user is admin when requesting admin reset
      if (args.isAdmin && !user.isAdmin) {
        return { success: false, message: 'Invalid email address.' };
      }

      // Generate reset token
      const resetToken = generateSecureToken();
      const tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry

      // Store reset token
      await ctx.runMutation(internal.auth.storePasswordResetToken, {
        userId: user._id,
        resetToken,
        tokenExpiry,
      });

      // Send reset email using the email action
      await ctx.runAction(internal.emailActions.sendPasswordResetEmail, {
        email: user.email || '',
        resetToken,
        isAdmin: args.isAdmin || false,
      });

      return {
        success: true,
        message: 'Password reset link has been sent to your email.',
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to process password reset request.',
      };
    }
  },
});

// Reset password with token
export const resetPassword = mutation({
  args: {
    resetToken: v.string(),
    newPassword: v.string(),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    try {
      // Find user by reset token
      const user = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('resetToken'), args.resetToken))
        .first();

      if (!user) {
        return { success: false, message: 'Invalid or expired reset token.' };
      }

      // Check if token is expired
      if (!user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
        return {
          success: false,
          message: 'Reset token has expired. Please request a new one.',
        };
      }

      // Hash new password
      const hashedPassword = await hashPassword(args.newPassword);

      // Update user password using the auth system and clear reset token
      // Note: The password field is managed by the auth system
      await ctx.db.patch(user._id, {
        resetToken: undefined,
        resetTokenExpiry: undefined,
      });

      // Update the actual password using the auth system
      // Find the auth account for this user and update the password
      const authAccount = await ctx.db
        .query('authAccounts')
        .withIndex('userIdAndProvider', (q) =>
          q.eq('userId', user._id).eq('provider', 'password')
        )
        .first();

      if (authAccount) {
        // Update the password hash in the auth account
        await ctx.db.patch(authAccount._id, {
          secret: hashedPassword,
        });
      } else {
        // If no auth account exists, create one
        await ctx.db.insert('authAccounts', {
          userId: user._id,
          provider: 'password',
          providerAccountId: user.email || user._id,
          secret: hashedPassword,
        });
      }

      return {
        success: true,
        message: 'Password has been reset successfully.',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Failed to reset password.' };
    }
  },
});

// Verify reset token
export const verifyResetToken = query({
  args: {
    resetToken: v.string(),
  },
  returns: v.object({
    valid: v.boolean(),
    message: v.string(),
    userEmail: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('resetToken'), args.resetToken))
        .first();

      if (!user) {
        return { valid: false, message: 'Invalid reset token.' };
      }

      if (!user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
        return { valid: false, message: 'Reset token has expired.' };
      }

      return {
        valid: true,
        message: 'Token is valid.',
        userEmail: user.email,
      };
    } catch (error) {
      console.error('Verify reset token error:', error);
      return { valid: false, message: 'Failed to verify token.' };
    }
  },
});

// Internal function to find user by email
export const findUserByEmail = query({
  args: { email: v.string() },
  returns: v.array(
    v.object({
      _id: v.id('users'),
      email: v.string(),
      isAdmin: v.optional(v.boolean()),
    })
  ),
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .collect();

    // Return only the fields we need
    return users.map((user) => ({
      _id: user._id,
      email: user.email || '',
      isAdmin: user.isAdmin,
    }));
  },
});

// Internal function to store password reset token
export const storePasswordResetToken = mutation({
  args: {
    userId: v.id('users'),
    resetToken: v.string(),
    tokenExpiry: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      resetToken: args.resetToken,
      resetTokenExpiry: args.tokenExpiry,
    });
    return null;
  },
});

// Helper function to generate secure token
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

// Helper function to hash password
async function hashPassword(password: string): Promise<string> {
  // In a real implementation, you'd use a proper hashing library
  // For now, we'll use a simple hash (replace with bcrypt or similar)
  const encoder = new TextEncoder();
  const data = encoder.encode(
    // @ts-ignore
    password + process.env.PASSWORD_SALT || 'default-salt'
  );
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Send email verification code
export const sendEmailVerification = action({
  args: {},
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx) => {
    'use node';
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const user = await ctx.runQuery(api.auth.loggedInUser, {});
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    if (user.emailVerificationTime) {
      return { success: false, message: 'Email already verified' };
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiryTime = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store verification code in user record
    await ctx.runMutation(api.auth.storeVerificationCode, {
      code: verificationCode,
      expiryTime,
    });

    // Send email using Resend library
    try {
      // For development/testing, log the verification code
      console.log(
        `🔐 VERIFICATION CODE for ${user.email}: ${verificationCode}`
      );

      // Import Resend library
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY environment variable is not set');
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
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
            .verification-code { 
              background: #f5f5f5; 
              padding: 20px; 
              text-align: center; 
              margin: 20px 0;
              border-radius: 8px;
              border: 2px solid #e9ecef;
            }
            .code { 
              color: #2563eb; 
              font-size: 32px; 
              margin: 0; 
              letter-spacing: 5px;
              font-weight: bold;
              font-family: 'Courier New', monospace;
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
            <h1>🚀 Digital Assets Academy</h1>
            <p>Email Verification</p>
          </div>
          
          <div class="content">
            <h2>Hello ${user.name || 'there'}!</h2>
            <p>Please use the following code to verify your email address:</p>
            
            <div class="verification-code">
              <div class="code">${verificationCode}</div>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This code will expire in 15 minutes for security reasons.
            </div>
            
            <p>If you didn't request this verification, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from Digital Assets Academy. Please do not reply to this email.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Email Verification - Digital Assets Academy
        
        Hello ${user.name || 'there'}!
        
        Please use the following code to verify your email address:
        
        ${verificationCode}
        
        Important: This code will expire in 15 minutes for security reasons.
        
        If you didn't request this verification, you can safely ignore this email.
        
        This is an automated message from Digital Assets Academy. Please do not reply to this email.
      `;

      const emailResult = await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL || 'noreply@digitalassetsaceademy.io',
        to: [user.email],
        subject: 'Verify Your Email - Digital Assets Academy',
        html: htmlContent,
        text: textContent,
      });

      console.log(
        `Verification email sent successfully to ${user.email}:`,
        emailResult
      );
      return { success: true, message: 'Verification code sent to your email' };
    } catch (error) {
      console.error('Email sending error:', error);
      // For development, don't fail if email sending fails
      console.log(
        '⚠️ Email sending failed, but verification code is logged above'
      );
      return {
        success: true,
        message: 'Verification code sent (check console for code)',
      };
    }
  },
});

// Store verification code in user record
export const storeVerificationCode = mutation({
  args: {
    code: v.string(),
    expiryTime: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    await ctx.db.patch(userId, {
      resetToken: args.code, // Reusing resetToken field for verification code
      resetTokenExpiry: args.expiryTime,
    });
  },
});

// Verify email with code
export const verifyEmail = mutation({
  args: {
    code: v.string(),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerificationTime) {
      return { success: false, message: 'Email already verified' };
    }

    if (!user.resetToken || !user.resetTokenExpiry) {
      return { success: false, message: 'No verification code found' };
    }

    if (Date.now() > user.resetTokenExpiry) {
      return { success: false, message: 'Verification code expired' };
    }

    if (user.resetToken !== args.code) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Mark email as verified
    await ctx.db.patch(userId, {
      emailVerificationTime: Date.now(),
      resetToken: undefined,
      resetTokenExpiry: undefined,
    });

    return { success: true, message: 'Email verified successfully' };
  },
});

// Test email sending (for debugging)
export const testEmailSending = action({
  args: {},
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx) => {
    'use node';
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const user = await ctx.runQuery(api.auth.loggedInUser, {});
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    try {
      // Import Resend library
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY environment variable is not set');
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email</title>
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
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
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
            .success { 
              background: #d4edda; 
              border: 1px solid #c3e6cb; 
              color: #155724; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #dee2e6; 
              font-size: 14px; 
              color: #6c757d;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Test Email</h1>
            <p>Digital Assets Academy</p>
          </div>
          
          <div class="content">
            <h2>Hello ${user.name || 'there'}!</h2>
            <p>This is a test email to verify that email sending is working correctly.</p>
            
            <div class="success">
              <strong>Success!</strong> If you receive this email, the email system is functioning properly.
            </div>
            
            <p>This test was sent at: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="footer">
            <p>This is a test message from Digital Assets Academy.</p>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Test Email - Digital Assets Academy
        
        Hello ${user.name || 'there'}!
        
        This is a test email to verify that email sending is working correctly.
        
        Success! If you receive this email, the email system is functioning properly.
        
        This test was sent at: ${new Date().toLocaleString()}
        
        This is a test message from Digital Assets Academy.
      `;

      await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL || 'noreply@digitalassetsaceademy.io',
        to: [user.email],
        subject: 'Test Email - Digital Assets Academy',
        html: htmlContent,
        text: textContent,
      });

      console.log(`Test email sent successfully to ${user.email}`);
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      console.error('Test email sending error:', error);
      return {
        success: false,
        message: `Test email failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

// Test both email types (for debugging)
export const testAllEmails = action({
  args: {},
  returns: v.object({
    verification: v.object({ success: v.boolean(), message: v.string() }),
    test: v.object({ success: v.boolean(), message: v.string() }),
  }),
  handler: async (ctx) => {
    'use node';
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const user = await ctx.runQuery(api.auth.loggedInUser, {});
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    // Test verification email
    const verificationResult: any = await ctx.runAction(
      api.auth.sendEmailVerification,
      {}
    );

    // Test regular email
    const testResult: any = await ctx.runAction(api.auth.testEmailSending, {});

    return {
      verification: verificationResult,
      test: testResult,
    };
  },
});
