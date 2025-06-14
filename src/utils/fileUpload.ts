import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { processCustomerDataFile } from "./dataProcessing";

// Supported file types
export const SUPPORTED_FILE_TYPES = [
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/csv", // .csv
];

// Function to validate file extensions
export const isValidFileExtension = (fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension === 'csv' || extension === 'xls' || extension === 'xlsx';
};

// Function to validate file type
export const isValidFileType = (fileType: string): boolean => {
  return SUPPORTED_FILE_TYPES.includes(fileType);
};

// Function to validate file size (max 10MB)
export const isValidFileSize = (fileSize: number): boolean => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  return fileSize <= MAX_FILE_SIZE;
};

// Main function to upload file to Firebase Storage
export const uploadFileToStorage = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting file upload for:", file.name);
      
      // Validate file extension
      if (!isValidFileExtension(file.name)) {
        reject(new Error("Invalid file extension. Only CSV, XLS, and XLSX files are supported."));
        return;
      }

      // Validate file type
      if (!isValidFileType(file.type) && file.type !== "") {
        reject(new Error("Invalid file type. Only CSV, XLS, and XLSX files are supported."));
        return;
      }

      // Validate file size
      if (!isValidFileSize(file.size)) {
        reject(new Error("File size exceeds the maximum limit of 10MB."));
        return;
      }

      // Create a reference to the file in Firebase Storage
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `customer_data_${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, `customer_data/${userId}/${fileName}`);

      console.log("Upload reference created:", fileName);

      // Start uploading the file
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Register observers
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload progress:", progress.toFixed(2) + "%");
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Handle errors
          console.error("Upload error:", error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          console.log("Upload completed, getting download URL");
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Download URL obtained:", downloadURL);
            
            // Process the uploaded file
            console.log("Starting file processing...");
            await processCustomerDataFile(downloadURL);
            console.log("File processing completed successfully");
            
            resolve(downloadURL);
          } catch (processingError) {
            console.error("Error processing file:", processingError);
            reject(processingError);
          }
        }
      );
    } catch (error) {
      console.error("Upload setup error:", error);
      reject(error);
    }
  });
};
