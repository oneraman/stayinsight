import { callLovableAI } from '@/lib/lovableAI';

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  confidence: number;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'currency';
}

export interface ColumnAnalysisResult {
  mappings: ColumnMapping[];
  confidence: number;
  unmappedColumns: string[];
  warnings: string[];
}

// Comprehensive pattern library with 100+ variations
const FIELD_PATTERNS: Record<string, RegExp[]> = {
  customer_id: [
    /^(customer[_\s\-]?id|cust[_\s\-]?id|client[_\s\-]?id|user[_\s\-]?id)$/i,
    /^(id|customer[_\s\-]?number|account[_\s\-]?id|member[_\s\-]?id)$/i,
    /^(customer|client|user|account)$/i
  ],
  email: [
    /^(email|e[_\s\-]?mail|email[_\s\-]?address|contact[_\s\-]?email)$/i,
    /^(mail|electronic[_\s\-]?mail|email[_\s\-]?id)$/i
  ],
  name: [
    /^(name|customer[_\s\-]?name|full[_\s\-]?name|client[_\s\-]?name)$/i,
    /^(first[_\s\-]?name|last[_\s\-]?name|display[_\s\-]?name|person)$/i,
    /^(contact[_\s\-]?name|user[_\s\-]?name)$/i
  ],
  total_spent: [
    /^(total[_\s\-]?spent|lifetime[_\s\-]?value|clv|ltv|revenue)$/i,
    /^(total[_\s\-]?revenue|spent|amount[_\s\-]?spent|purchase[_\s\-]?amount)$/i,
    /^(total[_\s\-]?amount|value|customer[_\s\-]?value|monetary)$/i,
    /^(sales|total[_\s\-]?sales)$/i
  ],
  purchase_count: [
    /^(purchase[_\s\-]?count|order[_\s\-]?count|transaction[_\s\-]?count)$/i,
    /^(purchases|orders|transactions|frequency|num[_\s\-]?orders)$/i,
    /^(total[_\s\-]?orders|total[_\s\-]?purchases|order[_\s\-]?frequency)$/i
  ],
  last_purchase_date: [
    /^(last[_\s\-]?purchase[_\s\-]?date|last[_\s\-]?order[_\s\-]?date)$/i,
    /^(recent[_\s\-]?purchase|last[_\s\-]?transaction|latest[_\s\-]?purchase)$/i,
    /^(last[_\s\-]?buy|last[_\s\-]?activity|most[_\s\-]?recent|last[_\s\-]?seen)$/i,
    /^(purchase[_\s\-]?date|order[_\s\-]?date|transaction[_\s\-]?date)$/i
  ],
  avg_order_value: [
    /^(avg[_\s\-]?order[_\s\-]?value|average[_\s\-]?order|aov)$/i,
    /^(mean[_\s\-]?order|avg[_\s\-]?purchase|average[_\s\-]?purchase)$/i,
    /^(avg[_\s\-]?transaction|average[_\s\-]?transaction)$/i
  ],
  age: [
    /^(age|customer[_\s\-]?age|years[_\s\-]?old|yrs)$/i,
    /^(birth[_\s\-]?date|date[_\s\-]?of[_\s\-]?birth|dob|birthdate)$/i
  ],
  gender: [
    /^(gender|sex|male[_\s\-]?female|m[_\s\-]?f)$/i
  ],
  tenure: [
    /^(tenure|years[_\s\-]?active|months[_\s\-]?active)$/i,
    /^(customer[_\s\-]?since|membership[_\s\-]?length|account[_\s\-]?age)$/i,
    /^(time[_\s\-]?with[_\s\-]?us|customer[_\s\-]?tenure)$/i
  ],
  usage_frequency: [
    /^(usage[_\s\-]?frequency|frequency|activity[_\s\-]?level)$/i,
    /^(engagement|usage[_\s\-]?pattern|activity[_\s\-]?frequency)$/i
  ],
  support_calls: [
    /^(support[_\s\-]?calls|help[_\s\-]?requests|tickets|complaints)$/i,
    /^(customer[_\s\-]?service|contact[_\s\-]?count|support[_\s\-]?tickets)$/i
  ],
  payment_delay: [
    /^(payment[_\s\-]?delay|late[_\s\-]?payment|overdue|days[_\s\-]?late)$/i,
    /^(payment[_\s\-]?issues|billing[_\s\-]?problems|delinquency)$/i
  ],
  subscription_type: [
    /^(subscription[_\s\-]?type|plan[_\s\-]?type|membership[_\s\-]?type)$/i,
    /^(account[_\s\-]?type|service[_\s\-]?level|tier|package)$/i
  ]
};

/**
 * Analyze cell values to detect data type
 */
const analyzeDataType = (values: any[]): 'string' | 'number' | 'date' | 'email' | 'currency' => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'string';

  let dateCount = 0;
  let numberCount = 0;
  let emailCount = 0;
  let currencyCount = 0;

  for (const value of nonNullValues.slice(0, 50)) {
    const str = String(value);

    // Check email pattern
    if (/@.*\./.test(str)) {
      emailCount++;
      continue;
    }

    // Check currency pattern
    if (/^\$?[\d,]+\.?\d{0,2}$/.test(str) || /^[\d,]+\.?\d{0,2}\s*(USD|EUR|GBP)?$/i.test(str)) {
      currencyCount++;
      continue;
    }

    // Check date pattern
    const datePatterns = [
      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
      /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
      /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i
    ];
    if (datePatterns.some(p => p.test(str))) {
      dateCount++;
      continue;
    }

    // Check if it's a valid date string
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
      dateCount++;
      continue;
    }

    // Check number
    const cleaned = str.replace(/[$,€£¥\s%]/g, '');
    if (!isNaN(Number(cleaned)) && cleaned !== '') {
      numberCount++;
    }
  }

  const sampleSize = Math.min(50, nonNullValues.length);
  
  if (emailCount / sampleSize > 0.7) return 'email';
  if (currencyCount / sampleSize > 0.5) return 'currency';
  if (dateCount / sampleSize > 0.5) return 'date';
  if (numberCount / sampleSize > 0.6) return 'number';
  
  return 'string';
};

/**
 * Calculate similarity between two strings (Levenshtein distance)
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 100;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return Math.round((1 - distance / maxLength) * 100);
};

/**
 * Layer 1: Exact pattern matching
 */
const exactMatch = (header: string): { field: string; confidence: number } | null => {
  const clean = header.trim().toLowerCase().replace(/[^\w\s]/g, '_');
  
  for (const [field, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(clean) || pattern.test(header)) {
        const confidence = clean.length <= 20 ? 95 : 85;
        return { field, confidence };
      }
    }
  }
  
  return null;
};

/**
 * Layer 2: Fuzzy matching
 */
const fuzzyMatch = (header: string): { field: string; confidence: number } | null => {
  const clean = header.trim().toLowerCase();
  let bestMatch: { field: string; confidence: number } | null = null;
  
  const targetFields = [
    'customer_id', 'email', 'name', 'total_spent', 'purchase_count',
    'last_purchase_date', 'avg_order_value', 'age', 'gender', 'tenure',
    'usage_frequency', 'support_calls', 'payment_delay', 'subscription_type'
  ];
  
  for (const field of targetFields) {
    const similarity = calculateSimilarity(clean, field.replace(/_/g, ' '));
    
    if (similarity >= 70) {
      if (!bestMatch || similarity > bestMatch.confidence) {
        bestMatch = { field, confidence: similarity };
      }
    }
  }
  
  return bestMatch;
};

/**
 * Main intelligent column analyzer
 */
export const analyzeColumnsIntelligently = async (
  headers: string[],
  sampleData: any[]
): Promise<ColumnAnalysisResult> => {
  console.log('🔍 Starting smart column analysis...');
  console.log('📊 Headers:', headers);
  console.log('📋 Sample rows:', sampleData.length);
  
  const mappings: ColumnMapping[] = [];
  const unmappedColumns: string[] = [];
  const warnings: string[] = [];
  let totalConfidence = 0;
  
  for (const header of headers) {
    let mapping: ColumnMapping | null = null;
    
    // Layer 1: Exact pattern matching
    const exact = exactMatch(header);
    if (exact && exact.confidence >= 85) {
      const dataType = analyzeDataType(sampleData.map(row => row[header]));
      mapping = {
        sourceColumn: header,
        targetField: exact.field,
        confidence: exact.confidence,
        dataType
      };
      console.log(`✅ Exact match: "${header}" -> ${exact.field} (${exact.confidence}% confidence, type: ${dataType})`);
    }
    
    // Layer 2: Fuzzy matching
    if (!mapping) {
      const fuzzy = fuzzyMatch(header);
      if (fuzzy && fuzzy.confidence >= 70) {
        const dataType = analyzeDataType(sampleData.map(row => row[header]));
        mapping = {
          sourceColumn: header,
          targetField: fuzzy.field,
          confidence: fuzzy.confidence,
          dataType
        };
        console.log(`🔎 Fuzzy match: "${header}" -> ${fuzzy.field} (${fuzzy.confidence}% confidence, type: ${dataType})`);
      }
    }
    
    // Layer 3: Cell value analysis
    if (!mapping) {
      const cellValues = sampleData.map(row => row[header]);
      const dataType = analyzeDataType(cellValues);
      
      // If data type strongly suggests a field
      if (dataType === 'email') {
        mapping = {
          sourceColumn: header,
          targetField: 'email',
          confidence: 80,
          dataType: 'email'
        };
        console.log(`📧 Email detected: "${header}" -> email (80% confidence)`);
      } else if (dataType === 'currency') {
        mapping = {
          sourceColumn: header,
          targetField: 'total_spent',
          confidence: 65,
          dataType: 'currency'
        };
        console.log(`💰 Currency detected: "${header}" -> total_spent (65% confidence)`);
      }
    }
    
    if (mapping) {
      mappings.push(mapping);
      totalConfidence += mapping.confidence;
    } else {
      unmappedColumns.push(header);
      warnings.push(`Could not map column: "${header}"`);
      console.log(`❓ Unmapped column: "${header}"`);
    }
  }
  
  const overallConfidence = mappings.length > 0 ? totalConfidence / mappings.length : 0;
  
  // Layer 4: AI-powered mapping for low confidence
  if (overallConfidence < 60 && unmappedColumns.length > 0) {
    console.log('🤖 Attempting AI-powered column mapping...');
    try {
      const aiMappings = await aiAssistedMapping(headers, sampleData.slice(0, 5));
      for (const aiMapping of aiMappings) {
        mappings.push(aiMapping);
        const index = unmappedColumns.indexOf(aiMapping.sourceColumn);
        if (index > -1) {
          unmappedColumns.splice(index, 1);
        }
      }
    } catch (error) {
      console.warn('⚠️ AI mapping failed:', error);
      warnings.push('AI-powered mapping unavailable');
    }
  }
  
  console.log('📊 Column analysis complete:', {
    mapped: mappings.length,
    unmapped: unmappedColumns.length,
    confidence: overallConfidence.toFixed(1) + '%'
  });
  
  return {
    mappings,
    confidence: overallConfidence,
    unmappedColumns,
    warnings
  };
};

/**
 * AI-assisted column mapping as fallback
 */
const aiAssistedMapping = async (
  headers: string[],
  sampleData: any[]
): Promise<ColumnMapping[]> => {
  const prompt = `Analyze these column headers and sample data to map them to our schema:

Headers: ${headers.join(', ')}

Sample Data (first 3 rows):
${JSON.stringify(sampleData.slice(0, 3), null, 2)}

Target Schema Fields:
- customer_id: Unique customer identifier
- email: Customer email address
- name: Customer full name
- total_spent: Total amount spent (currency)
- purchase_count: Number of purchases
- last_purchase_date: Date of most recent purchase
- avg_order_value: Average order value (currency)
- age: Customer age in years
- gender: Customer gender
- tenure: Months as customer
- usage_frequency: Usage pattern
- support_calls: Number of support contacts
- payment_delay: Days late on payments
- subscription_type: Subscription/plan type

Return ONLY a JSON array of mappings:
[
  {"sourceColumn": "header_name", "targetField": "schema_field", "confidence": 85, "dataType": "string|number|date|email|currency"}
]`;

  try {
    const response = await callLovableAI(prompt, { temperature: 0.3 });
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('AI mapping failed:', error);
  }
  
  return [];
};
