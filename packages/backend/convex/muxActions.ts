'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';

/**
 * Internal action to create a Mux upload.
 * Only callable from other actions.
 */
export const _internalCreateMuxUpload = internalAction({
  args: {
    fileName: v.string(),
  },
  returns: v.object({
    uploadUrl: v.string(),
    uploadId: v.string(),
  }),
  handler: async (_ctx, args) => {
    try {
      // Dynamically import Mux for node runtime
      const { default: Mux } = await import('@mux/mux-node');
      const muxClient = new Mux({
        // @ts-ignore
        tokenId: process.env.MUX_TOKEN_ID || '',
        // @ts-ignore
        tokenSecret: process.env.MUX_TOKEN_SECRET || '',
      });

      // Create a new upload
      const upload = await muxClient.video.uploads.create({
        new_asset_settings: {
          playback_policy: ['public'],
        },
        cors_origin: '*',
        test: false,
      });

      return {
        uploadUrl: upload.url,
        uploadId: upload.id,
      };
    } catch (error) {
      throw new Error('Failed to create upload URL');
    }
  },
});

/**
 * Internal action to get Mux asset details.
 * Only callable from other actions.
 */
export const _internalGetMuxAsset = internalAction({
  args: {
    uploadId: v.string(),
  },
  returns: v.object({
    assetId: v.optional(v.string()),
    playbackId: v.optional(v.string()),
    status: v.optional(v.string()),
    duration: v.optional(v.number()),
  }),
  handler: async (_ctx, args) => {
    const { default: Mux } = await import('@mux/mux-node');
    const muxClient = new Mux({
      // @ts-ignore
      tokenId: process.env.MUX_TOKEN_ID || '',
      // @ts-ignore
      tokenSecret: process.env.MUX_TOKEN_SECRET || '',
    });

    // Get the upload to find the asset
    const upload = await muxClient.video.uploads.retrieve(args.uploadId);

    if (upload.asset_id) {
      // Get the asset details
      const asset = await muxClient.video.assets.retrieve(upload.asset_id);

      return {
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id,
        status: asset.status,
        duration: asset.duration,
      };
    } else {
      return {
        status: 'processing',
      };
    }
  },
});
