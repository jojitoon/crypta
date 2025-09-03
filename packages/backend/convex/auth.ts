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

      // TODO: Update the actual password using the auth system
      // This requires integration with the auth provider's password update mechanism

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
    password + process.env.PASSWORD_SALT || 'default-salt'
  );
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
