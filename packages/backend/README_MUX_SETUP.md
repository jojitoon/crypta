# Mux Video Integration Setup

This guide explains how to set up Mux video integration for the Crypta learning platform.

## Prerequisites

1. A Mux account (sign up at [mux.com](https://mux.com))
2. Convex project with HTTP endpoints enabled

## Setup Steps

### 1. Get Mux Credentials

1. Log into your Mux dashboard
2. Go to Settings > Access Tokens
3. Create a new token with the following permissions:
   - Video: Read, Write
   - Upload: Read, Write
4. Copy the Token ID and Token Secret

### 2. Configure Environment Variables

Add the following environment variables to your Convex project:

```bash
MUX_TOKEN_ID=your_mux_token_id_here
MUX_TOKEN_SECRET=your_mux_token_secret_here
```

### 3. Configure Mux Webhooks

1. In your Mux dashboard, go to Settings > Webhooks
2. Add a new webhook with:
   - URL: `https://your-convex-url.convex.cloud/mux/webhook`
   - Events: Select "video.asset.ready"
   - Method: POST

### 4. Install Dependencies

The Mux SDK is already included in the package.json. Run:

```bash
pnpm install
```

## Features

### Video Upload

- Drag & drop video files (MP4, MOV, AVI)
- Maximum file size: 100MB
- Automatic video processing
- Progress tracking

### Video Playback

- Adaptive bitrate streaming
- Cross-platform compatibility
- Custom video player controls
- Progress tracking

### Integration

- Seamless lesson creation workflow
- Automatic lesson completion on video end
- Video status tracking (uploading, processing, ready, failed)

## Usage

### Creating a Video Lesson

1. Create a new lesson with type "video"
2. After lesson creation, upload your video file
3. Wait for video processing (usually 2-5 minutes)
4. Video is automatically available for playback

### Video Player

The VideoPlayer component automatically:

- Handles video loading states
- Shows processing status
- Provides playback controls
- Tracks video progress

## Troubleshooting

### Common Issues

1. **Upload fails**: Check file size and format
2. **Video not processing**: Verify Mux credentials
3. **Playback issues**: Check webhook configuration

### Debug Steps

1. Check Convex logs for errors
2. Verify Mux dashboard for asset status
3. Test webhook endpoint manually

## Security Notes

- Mux tokens are stored securely in Convex environment
- Video access is controlled by lesson permissions
- Upload URLs are temporary and secure
- All video operations require user authentication

## Support

For Mux-specific issues, refer to:

- [Mux Documentation](https://docs.mux.com/)
- [Mux Support](https://mux.com/support)

For platform-specific issues, check the main project documentation.
