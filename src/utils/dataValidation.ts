export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataQualityMetrics: {
    completenessScore: number;
    consistencyScore: number;
    validityScore: number;
    overallScore: number;
  };
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

// Enhanced customer ID detection with fuzzy matching
export const findCustomerIdColumn = (row: CustomerRowData): string | null => {
  const possibleIdColumns = [
    'customer_id', 'customerId', 'id', 'CustomerID', 'customerid',
    'customer_number', 'customerNumber', 'cust_id', 'custId',
    'user_id', 'userId', 'account_id', 'accountId', 'client_id',
    'member_id', 'subscriber_id', 'customer_code'
  ];
  
  // First, try exact matches
  for (const col of possibleIdColumns) {
    if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
      return col;
    }
  }
  
  // Then try fuzzy matching for column names
  const columnNames = Object.keys(row);
  for (const columnName of columnNames) {
    const lowerColumn = columnName.toLowerCase().replace(/[^a-z]/g, '');
    if (lowerColumn.includes('customerid') || 
        lowerColumn.includes('custid') || 
        (lowerColumn.includes('customer') && lowerColumn.includes('id')) ||
        (lowerColumn === 'id' && row[columnName] !== undefined && row[columnName] !== null && row[columnName] !== '')) {
      return columnName;
    }
  }
  
  return null;
};

// Enhanced customer ID generation with better uniqueness
export const generateCustomerId = (row: CustomerRowData, index: number): string => {
  const email = row.email || row.email_address;
  const name = row.name || row.customer_name || row.fullname;
  const phone = row.phone || row.phone_number;
  
  // Use email as primary identifier
  if (email && typeof email === 'string' && email.includes('@')) {
    const emailPart = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    return `email_${emailPart}_${index}`;
  }
  
  // Use name as secondary identifier
  if (name && typeof name === 'string' && name.trim().length > 0) {
    const namePart = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    return `name_${namePart}_${index}`;
  }
  
  // Use phone as tertiary identifier
  if (phone && typeof phone === 'string') {
    const phonePart = phone.replace(/[^0-9]/g, '').substring(-10);
    return `phone_${phonePart}_${index}`;
  }
  
  // Generate timestamp-based unique ID
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `customer_${timestamp}_${index}_${randomSuffix}`;
};

// Enhanced email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Enhanced date validation
const isValidDate = (dateStr: string | number): boolean => {
  if (typeof dateStr === 'number') {
    return dateStr > 25569 && dateStr < 73050; // Valid Excel date range (1970-2100)
  }
  
  if (typeof dateStr === 'string') {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && 
           date.getFullYear() > 1900 && 
           date.getFullYear() < 2100;
  }
  
  return false;
};

// Enhanced number validation
const isValidNumber = (value: any): boolean => {
  if (value === undefined || value === null || value === '') return false;
  
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,\s]/g, '');
    return !isNaN(Number(cleaned)) && isFinite(Number(cleaned));
  }
  
  return !isNaN(Number(value)) && isFinite(Number(value));
};

// Calculate data quality metrics
const calculateDataQualityMetrics = (data: CustomerRowData[]): ValidationResult['dataQualityMetrics'] => {
  if (data.length === 0) {
    return { completenessScore: 0, consistencyScore: 0, validityScore: 0, overallScore: 0 };
  }
  
  let completenessScore = 0;
  let consistencyScore = 0;
  let validityScore = 0;
  
  const totalRows = data.length;
  const keyFields = ['customer_id', 'email', 'name', 'total_spent', 'purchase_count'];
  
  // Completeness: percentage of non-empty key fields
  let totalKeyFields = 0;
  let filledKeyFields = 0;
  
  data.forEach(row => {
    keyFields.forEach(field => {
      totalKeyFields++;
      const value = row[field] || row[field.replace('_', '')] || row[field.replace('_', '').toLowerCase()];
      if (value !== undefined && value !== null && value !== '') {
        filledKeyFields++;
      }
    });
  });
  
  completenessScore = totalKeyFields > 0 ? (filledKeyFields / totalKeyFields) * 100 : 0;
  
  // Validity: percentage of valid data formats
  let totalValidations = 0;
  let validValidations = 0;
  
  data.forEach(row => {
    // Email validation
    const email = row.email || row.email_address;
    if (email) {
      totalValidations++;
      if (isValidEmail(String(email))) validValidations++;
    }
    
    // Date validation
    const date = row.last_purchase_date || row.lastPurchaseDate || row.last_order_date;
    if (date) {
      totalValidations++;
      if (isValidDate(date)) validValidations++;
    }
    
    // Number validations
    const numbers = [
      row.total_spent || row.totalSpent,
      row.purchase_count || row.purchaseCount,
      row.avg_order_value || row.avgOrderValue
    ];
    
    numbers.forEach(num => {
      if (num !== undefined && num !== null && num !== '') {
        totalValidations++;
        if (isValidNumber(num)) validValidations++;
      }
    });
  });
  
  validityScore = totalValidations > 0 ? (validValidations / totalValidations) * 100 : 100;
  
  // Consistency: check for duplicate customer IDs and emails
  const customerIds = new Set();
  const emails = new Set();
  let duplicates = 0;
  
  data.forEach(row => {
    const id = findCustomerIdColumn(row);
    const email = row.email || row.email_address;
    
    if (id && row[id]) {
      if (customerIds.has(row[id])) duplicates++;
      else customerIds.add(row[id]);
    }
    
    if (email) {
      if (emails.has(email)) duplicates++;
      else emails.add(email);
    }
  });
  
  consistencyScore = Math.max(0, 100 - (duplicates / totalRows) * 100);
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    (completenessScore * 0.4) + 
    (validityScore * 0.4) + 
    (consistencyScore * 0.2)
  );
  
  return {
    completenessScore: Math.round(completenessScore),
    consistencyScore: Math.round(consistencyScore),
    validityScore: Math.round(validityScore),
    overallScore
  };
};

// Enhanced row validation
export const validateCustomerRow = (row: CustomerRowData, index: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Enhanced customer ID validation
  const idColumn = findCustomerIdColumn(row);
  if (!idColumn) {
    warnings.push(`Row ${index + 1}: No customer ID found, will generate one automatically`);
  } else {
    const idValue = row[idColumn];
    if (!idValue || String(idValue).trim() === '') {
      warnings.push(`Row ${index + 1}: Empty customer ID, will generate one automatically`);
    }
  }
  
  // Enhanced email validation
  const email = row.email || row.email_address;
  if (email) {
    if (!isValidEmail(String(email))) {
      warnings.push(`Row ${index + 1}: Invalid email format: ${email}`);
    }
  }
  
  // Enhanced numeric field validations
  const numericFields = [
    { fields: ['total_spent', 'totalSpent', 'lifetime_value'], name: 'total spent', min: 0 },
    { fields: ['purchase_count', 'purchaseCount', 'order_count'], name: 'purchase count', min: 0 },
    { fields: ['avg_order_value', 'avgOrderValue'], name: 'average order value', min: 0 },
    { fields: ['Age', 'age'], name: 'age', min: 0, max: 150 },
    { fields: ['Tenure', 'tenure'], name: 'tenure', min: 0 },
    { fields: ['Support Calls', 'support_calls'], name: 'support calls', min: 0 },
    { fields: ['Payment Delay', 'payment_delay'], name: 'payment delay', min: 0 }
  ];
  
  numericFields.forEach(({ fields, name, min, max }) => {
    const field = fields.find(f => row[f] !== undefined && row[f] !== null && row[f] !== '');
    if (field !== undefined) {
      const fieldValue = row[field];
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        if (!isValidNumber(fieldValue)) {
          warnings.push(`Row ${index + 1}: Invalid ${name} value: ${fieldValue} (will be set to 0)`);
        } else {
          const numValue = Number(String(fieldValue).replace(/[$,\s]/g, ''));
          if (min !== undefined && numValue < min) {
            warnings.push(`Row ${index + 1}: ${name} value ${numValue} is below minimum ${min}`);
          }
          if (max !== undefined && numValue > max) {
            warnings.push(`Row ${index + 1}: ${name} value ${numValue} is above maximum ${max}`);
          }
        }
      }
    }
  });
  
  // Enhanced date validation
  const dateFields = ['last_purchase_date', 'lastPurchaseDate', 'last_order_date'];
  const dateField = dateFields.find(field => row[field] !== undefined && row[field] !== null && row[field] !== '');
  if (dateField) {
    if (!isValidDate(row[dateField])) {
      warnings.push(`Row ${index + 1}: Invalid date format: ${row[dateField]}`);
    } else {
      const date = new Date(row[dateField] as string);
      if (date > new Date()) {
        warnings.push(`Row ${index + 1}: Future date detected: ${row[dateField]}`);
      }
    }
  }
  
  // Business logic validations
  const totalSpent = row.total_spent || row.totalSpent;
  const purchaseCount = row.purchase_count || row.purchaseCount;
  
  if (totalSpent && purchaseCount && isValidNumber(totalSpent) && isValidNumber(purchaseCount)) {
    const spent = Number(String(totalSpent).replace(/[$,\s]/g, ''));
    const count = Number(purchaseCount);
    
    if (count > 0 && spent === 0) {
      warnings.push(`Row ${index + 1}: Customer has purchases but zero total spent`);
    }
    
    if (count === 0 && spent > 0) {
      warnings.push(`Row ${index + 1}: Customer has spending but zero purchase count`);
    }
  }
  
  return {
    isValid: true, // Always return true - we can process any data
    errors,
    warnings,
    dataQualityMetrics: { completenessScore: 0, consistencyScore: 0, validityScore: 0, overallScore: 0 }
  };
};

// Enhanced file validation
export const validateFileData = (data: CustomerRowData[]): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  if (data.length === 0) {
    allErrors.push("The uploaded file appears to be empty or has no valid data rows.");
    return { 
      isValid: false, 
      errors: allErrors, 
      warnings: allWarnings,
      dataQualityMetrics: { completenessScore: 0, consistencyScore: 0, validityScore: 0, overallScore: 0 }
    };
  }
  
  // Calculate data quality metrics
  const dataQualityMetrics = calculateDataQualityMetrics(data);
  
  // Enhanced column detection
  const firstRow = data[0];
  const hasCustomerId = findCustomerIdColumn(firstRow) !== null;
  
  if (!hasCustomerId) {
    allWarnings.push("No customer ID column detected. Customer IDs will be generated automatically based on available data.");
  }
  
  // Enhanced useful data detection
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
    const hasAnyData = availableColumns.some(col => 
      firstRow[col] !== undefined && firstRow[col] !== null && firstRow[col] !== ''
    );
    
    if (!hasAnyData) {
      allErrors.push("No data found in the file. Please ensure your file contains customer information.");
      return { 
        isValid: false, 
        errors: allErrors, 
        warnings: allWarnings,
        dataQualityMetrics
      };
    } else {
      allWarnings.push("No standard customer data columns detected, but the file contains data that can be processed for churn analysis.");
    }
  }
  
  // Enhanced sample validation (first 100 rows for better accuracy)
  const sampleSize = Math.min(100, data.length);
  const sampleData = data.slice(0, sampleSize);
  
  sampleData.forEach((row, index) => {
    const validation = validateCustomerRow(row, index);
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  });
  
  // Data quality warnings
  if (dataQualityMetrics.overallScore < 50) {
    allWarnings.push(`Low data quality detected (${dataQualityMetrics.overallScore}%). Consider cleaning your data for better results.`);
  } else if (dataQualityMetrics.overallScore < 75) {
    allWarnings.push(`Moderate data quality (${dataQualityMetrics.overallScore}%). Some fields may need attention.`);
  }
  
  // File size warnings
  if (data.length > 10000) {
    allWarnings.push(`Very large file detected (${data.length.toLocaleString()} rows). Processing may take several minutes.`);
  } else if (data.length > 1000) {
    allWarnings.push(`Large file detected (${data.length.toLocaleString()} rows). Processing may take a few minutes.`);
  }
  
  return {
    isValid: true,
    errors: allErrors,
    warnings: allWarnings,
    dataQualityMetrics
  };
};