# Crypta Backend

This is the backend service for Crypta, built with Convex.

## Features

- User authentication and authorization
- Course and lesson management
- Video upload and streaming with Mux
- Community features
- Achievement system
- Admin panel

## Mux Video Integration

### Setup

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Set Environment Variables**
   Create a `.env` file in the `packages/backend` directory:

   ```bash
   MUX_TOKEN_ID=your_mux_token_id_here
   MUX_TOKEN_SECRET=your_mux_token_secret_here
   ```

3. **Configure Mux Webhook**
   In your Mux dashboard, set up a webhook:
   - URL: `https://your-convex-url.convex.cloud/mux/webhook`
   - Events: Select "video.asset.ready"
   - Method: POST

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

### Usage

- Create a lesson with type "video"
- Upload video files (MP4, MOV, AVI) up to 100MB
- Videos are automatically processed and optimized
- Use the VideoPlayer component to display videos

## Password Reset System

### Setup

1. **Environment Variables**
   Add these to your `.env` file:

   ```bash
   PASSWORD_SALT=your_secure_salt_here
   WEB_URL=http://localhost:3000
   ADMIN_URL=http://localhost:3001
   ```

2. **Email Service Integration**
   The current implementation logs reset links to the console. To send actual emails:

   **Option 1: SendGrid**

   ```bash
   pnpm add @sendgrid/mail
   ```

   **Option 2: AWS SES**

   ```bash
   pnpm add @aws-sdk/client-ses
   ```

   **Option 3: Resend**

   ```bash
   pnpm add resend
   ```

3. **Update Email Function**
   In `packages/backend/convex/auth.ts`, replace the `sendPasswordResetEmail` function with your preferred email service.

### Features

- **Secure Token Generation**: 32-byte random tokens
- **Token Expiry**: 1 hour expiration
- **Admin Separation**: Separate reset flows for admin and regular users
- **Security**: No email enumeration (same response for all emails)
- **Validation**: Password strength requirements

### Routes

**Web Application:**

- `/forgot-password` - Request password reset
- `/reset-password?token=...` - Reset password with token

**Admin Application:**

- `/admin/forgot-password` - Request admin password reset
- `/admin/reset-password?token=...` - Reset admin password with token

### Security Features

- Tokens are single-use and expire after 1 hour
- Passwords must be at least 8 characters
- Secure token generation using crypto.getRandomValues()
- No information leakage about user existence
- Admin-only reset links for admin accounts

## Development

### Running Locally

1. **Start Convex Dev Server**

   ```bash
   cd packages/backend
   pnpm dev
   ```

2. **Start Web App**

   ```bash
   cd apps/web
   pnpm dev
   ```

3. **Start Admin App**
   ```bash
   cd apps/admin
   pnpm dev
   ```

### Testing

- Test video uploads with small MP4 files
- Test password reset flow (check console for reset links)
- Verify admin vs regular user separation

## Production Deployment

1. **Deploy Convex Backend**

   ```bash
   pnpm run deploy
   ```

2. **Set Production Environment Variables**
   - Update Mux webhook URL to production Convex URL
   - Set production email service credentials
   - Configure production URLs

3. **Email Service Setup**
   - Verify domain with email service provider
   - Set up SPF/DKIM records
   - Test email delivery

## Troubleshooting

### Video Upload Issues

- Check Mux environment variables
- Verify webhook configuration
- Check browser console for errors

### Password Reset Issues

- Verify environment variables are set
- Check Convex logs for errors
- Ensure email service is properly configured

### Common Errors

- `MUX_TOKEN_ID not found`: Set environment variables
- `Webhook failed`: Check Mux webhook configuration
- `Email not sent`: Configure email service integration
