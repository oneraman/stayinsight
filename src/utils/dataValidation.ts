export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CustomerRowData {
  [key: string]: any;
  customer_id?: string;
  customerId?: string;
  id?: string;
  CustomerID?: string;
  customerid?: string;
  email?: string;
  email_address?: string;
  name?: string;
  customer_name?: string;
  fullname?: string;
  first_name?: string;
  last_name?: string;
  last_purchase_date?: string | number;
  lastPurchaseDate?: string | number;
  last_order_date?: string | number;
  purchase_count?: number | string;
  purchaseCount?: number | string;
  order_count?: number | string;
  total_spent?: number | string;
  totalSpent?: number | string;
  lifetime_value?: number | string;
  avg_order_value?: number | string;
  avgOrderValue?: number | string;
  Age?: number | string;
  Gender?: string;
  Tenure?: number | string;
  'Usage Frequency'?: string;
  'Support Calls'?: number | string;
  'Payment Delay'?: number | string;
  'Subscription Type'?: string;
  // Additional common fields
  gender?: string;
  tenure?: number | string;
  SeniorCitizen?: number | string;
  Partner?: string;
  Dependents?: string;
  PhoneService?: string;
  MultipleLines?: string;
  InternetService?: string;
  OnlineSecurity?: string;
  Churn?: string;
}

export const findCustomerIdColumn = (row: CustomerRowData): string | null => {
  // Try different variations of customer ID column names
  const possibleIdColumns = [
    'customer_id', 'customerId', 'id', 'CustomerID', 'customerid',
    'customer_number', 'customerNumber', 'cust_id', 'custId',
    'user_id', 'userId', 'account_id', 'accountId'
  ];
  
  for (const col of possibleIdColumns) {
    if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
      return col;
    }
  }
  
  return null;
};

export const generateCustomerId = (row: CustomerRowData, index: number): string => {
  // Try to generate a meaningful ID from available data
  const email = row.email || row.email_address;
  const name = row.name || row.customer_name || row.fullname;
  
  if (email) {
    return `email_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
  
  if (name) {
    return `name_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`;
  }
  
  // Generate a unique ID based on row index and timestamp
  return `customer_${Date.now()}_${index}`;
};

export const validateCustomerRow = (row: CustomerRowData, index: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for customer ID - be more flexible
  const idColumn = findCustomerIdColumn(row);
  if (!idColumn) {
    warnings.push(`Row ${index + 1}: No customer ID found, will generate one automatically`);
  }
  
  // Numeric field validations - be more lenient
  const numericFields = [
    { fields: ['total_spent', 'totalSpent', 'lifetime_value'], name: 'total spent' },
    { fields: ['purchase_count', 'purchaseCount', 'order_count'], name: 'purchase count' },
    { fields: ['avg_order_value', 'avgOrderValue'], name: 'average order value' },
    { fields: ['Age'], name: 'age' },
    { fields: ['Tenure', 'tenure'], name: 'tenure' },
    { fields: ['Support Calls'], name: 'support calls' },
    { fields: ['Payment Delay'], name: 'payment delay' }
  ];
  
  numericFields.forEach(({ fields, name }) => {
    const value = fields.find(field => row[field] !== undefined && row[field] !== null && row[field] !== '');
    if (value !== undefined) {
      const fieldValue = row[value];
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '' && isNaN(Number(fieldValue))) {
        warnings.push(`Row ${index + 1}: Invalid ${name} value: ${fieldValue} (will be set to 0)`);
      }
    }
  });
  
  // Email validation - make it a warning instead of error
  const email = row.email || row.email_address;
  if (email && typeof email === 'string' && !email.includes('@')) {
    warnings.push(`Row ${index + 1}: Email format may be invalid: ${email}`);
  }
  
  // Date validation warnings
  const dateFields = ['last_purchase_date', 'lastPurchaseDate', 'last_order_date'];
  const dateField = dateFields.find(field => row[field] !== undefined && row[field] !== null && row[field] !== '');
  if (dateField && typeof row[dateField] === 'string') {
    const parsedDate = new Date(row[dateField] as string);
    if (isNaN(parsedDate.getTime())) {
      warnings.push(`Row ${index + 1}: Date format may be invalid: ${row[dateField]}`);
    }
  }
  
  return {
    isValid: true, // Always return true - we can process any data
    errors,
    warnings
  };
};

export const validateFileData = (data: CustomerRowData[]): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  if (data.length === 0) {
    allErrors.push("The uploaded file appears to be empty or has no valid data rows.");
    return { isValid: false, errors: allErrors, warnings: allWarnings };
  }
  
  // Check for required columns - be more flexible
  const firstRow = data[0];
  const hasCustomerId = findCustomerIdColumn(firstRow) !== null;
  
  if (!hasCustomerId) {
    allWarnings.push("No customer ID column detected. Customer IDs will be generated automatically based on available data.");
  }
  
  // Check if we have any useful data columns
  const usefulColumns = [
    'email', 'email_address', 'name', 'customer_name', 'fullname',
    'total_spent', 'totalSpent', 'lifetime_value',
    'purchase_count', 'purchaseCount', 'order_count',
    'last_purchase_date', 'lastPurchaseDate', 'last_order_date',
    'Age', 'Gender', 'Tenure', 'Usage Frequency', 'Support Calls', 'Payment Delay', 'Subscription Type',
    'gender', 'tenure', 'SeniorCitizen', 'Partner', 'Dependents', 'PhoneService', 'MultipleLines',
    'InternetService', 'OnlineSecurity', 'Churn'
  ];
  
  const availableColumns = Object.keys(firstRow);
  const hasUsefulData = usefulColumns.some(col => 
    availableColumns.includes(col) && 
    firstRow[col] !== undefined && 
    firstRow[col] !== null && 
    firstRow[col] !== ''
  );
  
  if (!hasUsefulData) {
    // Check if we have ANY data at all
    const hasAnyData = availableColumns.some(col => 
      firstRow[col] !== undefined && firstRow[col] !== null && firstRow[col] !== ''
    );
    
    if (!hasAnyData) {
      allErrors.push("No data found in the file. Please ensure your file contains customer information.");
      return { isValid: false, errors: allErrors, warnings: allWarnings };
    } else {
      allWarnings.push("No standard customer data columns detected, but the file contains data that can be processed for churn analysis.");
    }
  }
  
  // Validate a sample of rows (first 100) to avoid performance issues with large files
  const sampleSize = Math.min(100, data.length);
  const sampleData = data.slice(0, sampleSize);
  
  sampleData.forEach((row, index) => {
    const validation = validateCustomerRow(row, index);
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  });
  
  // Add info about large files
  if (data.length > 1000) {
    allWarnings.push(`Large file detected (${data.length.toLocaleString()} rows). Processing may take a few minutes.`);
  }
  
  return {
    isValid: true, // Always return true if we have any data
    errors: allErrors,
    warnings: allWarnings
  };
};