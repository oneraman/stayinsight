import * as XLSX from 'xlsx';
import { CustomerRowData, validateFileData } from './dataValidation';

export interface ProcessedFileData {
  success: boolean;
  data: CustomerRowData[];
  errors: string[];
  warnings: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    sheets: string[];
    totalRows: number;
    columns: string[];
  };
}

export interface FilePreview {
  columns: string[];
  sampleRows: CustomerRowData[];
  totalRows: number;
  detectedMappings: Record<string, string>;
}

export const processFileClientSide = async (file: File): Promise<ProcessedFileData> => {
  try {
    console.log('🔄 Starting client-side file processing for:', file.name);
    
    // Read file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as CustomerRowData[];
    
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      sheets: workbook.SheetNames,
      totalRows: rawData.length,
      columns: Object.keys(rawData[0] || {})
    };
    
    console.log('📊 File info:', fileInfo);
    
    // Always validate but be more lenient
    const validation = validateFileData(rawData);
    
    // Consider file processable if we have data, even with validation issues
    const hasUsefulData = rawData.length > 0 && fileInfo.columns.length > 0;
    
    return {
      success: hasUsefulData, // Success if we have any data
      data: rawData,
      errors: validation.errors,
      warnings: validation.warnings,
      fileInfo
    };
    
  } catch (error) {
    console.error('❌ Client-side processing failed:', error);
    return {
      success: false,
      data: [],
      errors: [error instanceof Error ? error.message : 'Unknown processing error'],
      warnings: [],
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        sheets: [],
        totalRows: 0,
        columns: []
      }
    };
  }
};

export const generateFilePreview = (data: CustomerRowData[]): FilePreview => {
  const columns = Object.keys(data[0] || {});
  const sampleRows = data.slice(0, 5);
  
  // Auto-detect column mappings
  const detectedMappings: Record<string, string> = {};
  
  columns.forEach(col => {
    const lowerCol = col.toLowerCase();
    if (lowerCol.includes('customer') && lowerCol.includes('id')) {
      detectedMappings.customerId = col;
    } else if (lowerCol.includes('email')) {
      detectedMappings.email = col;
    } else if (lowerCol.includes('name') && !lowerCol.includes('first') && !lowerCol.includes('last')) {
      detectedMappings.name = col;
    } else if (lowerCol.includes('total') && lowerCol.includes('spent')) {
      detectedMappings.totalSpent = col;
    } else if (lowerCol.includes('purchase') && lowerCol.includes('count')) {
      detectedMappings.purchaseCount = col;
    }
  });
  
  return {
    columns,
    sampleRows,
    totalRows: data.length,
    detectedMappings
  };
};