
import { useState, useCallback } from 'react';

export interface UploadProgressState {
  phase: 'uploading' | 'processing' | 'idle';
  progress: number;
  message: string;
  isUploading: boolean;
}

export const useUploadProgress = () => {
  const [state, setState] = useState<UploadProgressState>({
    phase: 'idle',
    progress: 0,
    message: '',
    isUploading: false
  });

  const updateProgress = useCallback((
    progress: number, 
    phase: 'uploading' | 'processing', 
    message: string
  ) => {
    console.log(`Upload progress: ${progress}% - Phase: ${phase} - ${message}`);
    setState({
      phase,
      progress: Math.max(0, Math.min(100, progress)),
      message,
      isUploading: true
    });
  }, []);

  const resetProgress = useCallback(() => {
    setState({
      phase: 'idle',
      progress: 0,
      message: '',
      isUploading: false
    });
  }, []);

  const completeUpload = useCallback((message: string) => {
    setState({
      phase: 'processing',
      progress: 100,
      message,
      isUploading: false
    });
  }, []);

  return {
    ...state,
    updateProgress,
    resetProgress,
    completeUpload
  };
};
