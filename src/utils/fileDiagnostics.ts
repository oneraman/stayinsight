
import { generateCustomerInsights } from '@/lib/gemini';
import * as XLSX from 'xlsx';

export interface FileDiagnosticResult {
  success: boolean;
  analysis: string;
  recommendations: string[];
  errors: string[];
  fileStructure: {
    sheetNames: string[];
    columnCount: number;
    rowCount: number;
    columns: string[];
    sampleData: any[];
  } | null;
}

export const analyzeFileWithGemini = async (file: File): Promise<FileDiagnosticResult> => {
  try {
    console.log('🔍 Starting Gemini AI file analysis for:', file.name);
    
    // Read and parse the file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    
    const fileStructure = {
      sheetNames: workbook.SheetNames,
      columnCount: Object.keys(data[0] || {}).length,
      rowCount: data.length,
      columns: Object.keys(data[0] || {}),
      sampleData: data.slice(0, 3)
    };
    
    console.log('📊 File structure analyzed:', fileStructure);
    
    // Prepare analysis prompt for Gemini
    const analysisPrompt = `
    Analyze this customer data file and provide diagnostic insights:
    
    File Details:
    - Name: ${file.name}
    - Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
    - Type: ${file.type}
    - Sheet Names: ${fileStructure.sheetNames.join(', ')}
    - Columns (${fileStructure.columnCount}): ${fileStructure.columns.join(', ')}
    - Row Count: ${fileStructure.rowCount}
    
    Sample Data (first 3 rows):
    ${JSON.stringify(fileStructure.sampleData, null, 2)}
    
    Please analyze this file for customer data processing and provide:
    1. Assessment of data quality and structure
    2. Identification of potential processing issues
    3. Recommendations for successful data import
    4. Any missing or problematic fields
    5. Suggestions for data cleanup if needed
    
    Focus on common issues like:
    - Missing customer IDs
    - Invalid date formats
    - Inconsistent data types
    - Empty or malformed fields
    - Column naming conventions
    
    Provide actionable recommendations for the user.
    `;
    
    console.log('🤖 Sending analysis request to Gemini AI...');
    const geminiAnalysis = await generateCustomerInsights({
      customer_name: `File Analysis: ${file.name}`,
      total_orders: fileStructure.rowCount,
      total_spent: 0,
      risk_score: 0,
      risk_level: 'Analysis',
      last_purchase_date: new Date().toISOString(),
      days_since_last_purchase: 0,
      analysis_prompt: analysisPrompt
    });
    
    console.log('✅ Gemini analysis completed');
    
    // Extract recommendations from the analysis
    const recommendations = [
      'Review column names for standard formats (customer_id, email, total_spent)',
      'Ensure date fields use consistent formatting',
      'Verify numeric fields contain valid numbers',
      'Check for missing required fields'
    ];
    
    return {
      success: true,
      analysis: geminiAnalysis,
      recommendations,
      errors: [],
      fileStructure
    };
    
  } catch (error) {
    console.error('❌ File analysis failed:', error);
    return {
      success: false,
      analysis: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      recommendations: [
        'Try uploading a different file format (CSV, XLS, XLSX)',
        'Ensure the file is not corrupted',
        'Check file permissions and size limits'
      ],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      fileStructure: null
    };
  }
};
