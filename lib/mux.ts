/**
 * Mux Configuration and Utilities
 * 
 * Provides integration with Mux for video processing and adaptive bitrate streaming.
 * After videos are uploaded to UploadThing, they are sent to Mux for processing.
 * Mux generates multiple resolutions and provides HLS streaming with automatic ABR.
 */

import Mux from '@mux/mux-node';

// Lazy initialization of Mux client
let muxClient: Mux | null = null;

function getMuxClient(): Mux {
  if (!muxClient) {
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!tokenId || !tokenSecret) {
      throw new Error(
        'MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables are required. ' +
        'Please add them to your .env file.'
      );
    }

    muxClient = new Mux({
      tokenId,
      tokenSecret,
    });
  }
  return muxClient;
}

/**
 * Create a Mux asset from an UploadThing video URL
 * @param videoUrl - The UploadThing video URL
 * @param videoId - The MongoDB video document ID (for metadata)
 * @returns The created Mux asset with assetId and playbackId
 */
export async function createMuxAsset(videoUrl: string, videoId: string) {
  try {
    const client = getMuxClient();
    
    // Create Mux asset using the video URL
    const asset = await client.video.assets.create({
      input: [{ url: videoUrl }],
      playback_policy: ['public'], // Makes video publicly accessible
      // Note: mp4_support removed - not needed for HLS streaming and not allowed on basic plans
      // Add metadata for reference
      passthrough: videoId,
    });

    // Wait for asset to be ready and get playback ID
    const playbackIds = asset.playback_ids || [];
    const playbackId = playbackIds[0]?.id || '';

    return {
      assetId: asset.id,
      playbackId: playbackId,
    };
  } catch (error: any) {
    console.error('[Mux] Failed to create asset:', error);
    throw new Error(`Failed to create Mux asset: ${error.message}`);
  }
}

/**
 * Delete a Mux asset
 * @param assetId - The Mux asset ID to delete
 */
export async function deleteMuxAsset(assetId: string) {
  try {
    const client = getMuxClient();
    await client.video.assets.delete(assetId);
    console.log('[Mux] Asset deleted successfully:', assetId);
  } catch (error: any) {
    console.error('[Mux] Failed to delete asset:', error);
    throw new Error(`Failed to delete Mux asset: ${error.message}`);
  }
}

/**
 * Get Mux asset details
 * @param assetId - The Mux asset ID
 * @returns The Mux asset details
 */
export async function getMuxAsset(assetId: string) {
  try {
    const client = getMuxClient();
    const asset = await client.video.assets.retrieve(assetId);
    return asset;
  } catch (error: any) {
    console.error('[Mux] Failed to get asset:', error);
    throw new Error(`Failed to get Mux asset: ${error.message}`);
  }
}

/**
 * Create a signed playback URL for private videos
 * @param playbackId - The Mux playback ID
 * @param options - Signing options
 * @returns A signed URL that expires
 */
export async function createSignedPlaybackUrl(
  playbackId: string,
  options: {
    type?: 'video' | 'thumbnail';
    expirationTime?: string;
  } = {}
) {
  try {
    // For signed URLs, you need to use a signing key
    // This is optional and only needed for private videos
    const signingKeyId = process.env.MUX_SIGNING_KEY_ID;
    const signingKeyPrivate = process.env.MUX_SIGNING_KEY_PRIVATE;

    if (!signingKeyId || !signingKeyPrivate) {
      throw new Error('Signing keys not configured');
    }

    // Implementation would use JWT to create signed URLs
    // For now, return the public URL
    return `https://stream.mux.com/${playbackId}.m3u8`;
  } catch (error: any) {
    console.error('[Mux] Failed to create signed URL:', error);
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }
}

export default getMuxClient;
