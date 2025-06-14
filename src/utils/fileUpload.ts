
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { processCustomerDataFile } from "./dataProcessing";

// Supported file types
export const SUPPORTED_FILE_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

export const isValidFileExtension = (fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension === 'csv' || extension === 'xls' || extension === 'xlsx';
};

export const isValidFileType = (fileType: string): boolean => {
  return SUPPORTED_FILE_TYPES.includes(fileType);
};

export const isValidFileSize = (fileSize: number): boolean => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  return fileSize <= MAX_FILE_SIZE;
};

export interface UploadResult {
  success: boolean;
  downloadURL?: string;
  customersProcessed?: number;
  errors?: string[];
  message: string;
}

export interface UploadProgress {
  phase: 'uploading' | 'processing';
  progress: number;
  message: string;
}

export const uploadFileToStorage = async (
  file: File,
  userId: string,
  onProgress?: (progressInfo: UploadProgress, uploadTask?: any) => void
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting file upload for:", file.name);
      
      // Validate file
      if (!isValidFileExtension(file.name)) {
        resolve({
          success: false,
          message: "Invalid file extension. Only CSV, XLS, and XLSX files are supported."
        });
        return;
      }

      if (!isValidFileType(file.type) && file.type !== "") {
        resolve({
          success: false,
          message: "Invalid file type. Only CSV, XLS, and XLSX files are supported."
        });
        return;
      }

      if (!isValidFileSize(file.size)) {
        resolve({
          success: false,
          message: "File size exceeds the maximum limit of 10MB."
        });
        return;
      }

      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `customer_data_${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, `customer_data/${userId}/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload progress:", progress.toFixed(2) + "%");
          onProgress?.({
            phase: 'uploading',
            progress,
            message: `Uploading file... ${Math.round(progress)}%`
          }, uploadTask);
        },
        (error) => {
          console.error("Upload error:", error);
          if (error.code === 'storage/canceled') {
            resolve({
              success: false,
              message: "Upload was cancelled"
            });
          } else {
            resolve({
              success: false,
              message: `Upload failed: ${error.message}`
            });
          }
        },
        async () => {
          try {
            console.log("Upload completed, getting download URL");
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Download URL obtained:", downloadURL);
            
            // Start processing with progress updates
            onProgress?.({
              phase: 'processing',
              progress: 0,
              message: 'Starting file processing...'
            });
            
            console.log("Starting file processing...");
            const processingResult = await processCustomerDataFile(
              downloadURL,
              (progress, message) => {
                console.log(`Processing progress: ${progress}% - ${message}`);
                onProgress?.({
                  phase: 'processing',
                  progress,
                  message
                });
              }
            );
            
            console.log("Processing completed:", processingResult);
            resolve({
              success: true,
              downloadURL,
              customersProcessed: processingResult.customersProcessed,
              errors: processingResult.errors,
              message: `Successfully processed ${processingResult.customersProcessed} customers${processingResult.errors.length > 0 ? ` with ${processingResult.errors.length} warnings` : ''}`
            });
          } catch (processingError) {
            console.error("Error processing file:", processingError);
            resolve({
              success: false,
              message: processingError instanceof Error ? processingError.message : "Failed to process the uploaded file"
            });
          }
        }
      );
    } catch (error) {
      console.error("Upload setup error:", error);
      resolve({
        success: false,
        message: error instanceof Error ? error.message : "Failed to start upload"
      });
    }
  });
};
