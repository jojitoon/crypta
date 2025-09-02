'use client';

import React, { useState, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';

interface VideoUploadProps {
  lessonId: string;
  onUploadComplete?: () => void;
  onUploadStart?: () => void;
}

export function VideoUpload({
  lessonId,
  onUploadComplete,
  onUploadStart,
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createUploadUrl = useAction(api.mux.createUploadUrl);
  const getMuxAsset = useAction(api.mux.getMuxAsset);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file must be smaller than 100MB');
      return;
    }

    await startUpload(file);
  };

  const startUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      onUploadStart?.();

      // Create upload URL
      const { uploadUrl, uploadId: newUploadId } = await createUploadUrl({
        fileName: file.name,
        lessonId: lessonId as any,
      });

      setUploadId(newUploadId);

      // Upload file to Mux
      await uploadFileToMux(uploadUrl, file, newUploadId);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to start upload. Please try again.');
      setIsUploading(false);
    }
  };

  const uploadFileToMux = (
    uploadUrl: string,
    file: File,
    currentUploadId: string
  ) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          toast.success('Video uploaded successfully! Processing...');

          // Poll for asset status
          await pollAssetStatus(currentUploadId);
          resolve();
        } else {
          toast.error('Upload failed. Please try again.');
          setIsUploading(false);
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        toast.error('Upload failed. Please try again.');
        setIsUploading(false);
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const pollAssetStatus = async (currentUploadId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const result = await getMuxAsset({
          uploadId: currentUploadId,
          lessonId: lessonId as any,
        });

        console.log({ result });

        if (result.success && result.status === 'ready' && result.playbackId) {
          toast.success('Video processing complete!');
          onUploadComplete?.();
          setIsUploading(false);
          setUploadProgress(100);
          return;
        }

        if (result.status === 'failed') {
          toast.error('Video processing failed. Please try again.');
          setIsUploading(false);
          return;
        }

        // Continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          toast.error(
            'Video processing is taking longer than expected. Please check back later.'
          );
          setIsUploading(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          toast.error('Failed to check video status. Please try again.');
          setIsUploading(false);
        }
      }
    };

    poll();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files } } as any);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className='w-full'>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isUploading
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isUploading ? (
          <div className='space-y-4'>
            <div className='text-blue-600'>
              <svg
                className='mx-auto h-12 w-12 animate-spin'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            </div>
            <div>
              <p className='text-lg font-medium text-gray-900'>
                Uploading video...
              </p>
              <p className='text-sm text-gray-500'>
                {uploadProgress.toFixed(1)}% complete
              </p>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className='text-xs text-gray-500'>
              Video is being processed. This may take a few minutes.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='text-gray-400'>
              <svg
                className='mx-auto h-12 w-12'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 4v16M17 4v16M3 8h4m10 0h4M6 20h12M6 4h12'
                />
              </svg>
            </div>
            <div>
              <p className='text-lg font-medium text-gray-900'>Upload video</p>
              <p className='text-sm text-gray-500'>
                Drag and drop a video file, or click to browse
              </p>
            </div>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Select Video
            </button>
            <p className='text-xs text-gray-500'>
              Supported formats: MP4, MOV, AVI. Max size: 100MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='video/*'
        onChange={handleFileSelect}
        className='hidden'
      />
    </div>
  );
}
