
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
    console.log(`🔄 Upload progress update: ${progress}% - Phase: ${phase} - ${message}`);
    setState(prevState => {
      const newState = {
        phase,
        progress: Math.max(0, Math.min(100, progress)),
        message,
        isUploading: true
      };
      console.log('Progress state update:', { prevState, newState });
      return newState;
    });
  }, []);

  const resetProgress = useCallback(() => {
    console.log('🔄 Resetting upload progress');
    setState({
      phase: 'idle',
      progress: 0,
      message: '',
      isUploading: false
    });
  }, []);

  const completeUpload = useCallback((message: string) => {
    console.log('✅ Upload completed:', message);
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
