
export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  confidence: number;
  dataType: 'string' | 'number' | 'date' | 'boolean';
}

export interface ColumnMappingResult {
  mappings: ColumnMapping[];
  confidence: number;
  unmappedColumns: string[];
}

// Enhanced field patterns with more comprehensive matching
const FIELD_PATTERNS = {
  customer_id: [
    /^(customer[_\s]?id|cust[_\s]?id|id|customer[_\s]?number|account[_\s]?id)$/i,
    /^(client[_\s]?id|user[_\s]?id|member[_\s]?id)$/i
  ],
  email: [
    /^(email|e[_\s]?mail|email[_\s]?address|contact[_\s]?email)$/i,
    /^(mail|electronic[_\s]?mail)$/i
  ],
  name: [
    /^(name|customer[_\s]?name|full[_\s]?name|client[_\s]?name)$/i,
    /^(first[_\s]?name|last[_\s]?name|display[_\s]?name)$/i
  ],
  total_spent: [
    /^(total[_\s]?spent|lifetime[_\s]?value|clv|revenue|total[_\s]?revenue)$/i,
    /^(spent|amount[_\s]?spent|purchase[_\s]?amount|total[_\s]?amount)$/i,
    /^(value|customer[_\s]?value|monetary[_\s]?value)$/i
  ],
  purchase_count: [
    /^(purchase[_\s]?count|order[_\s]?count|transaction[_\s]?count)$/i,
    /^(purchases|orders|transactions|frequency)$/i,
    /^(num[_\s]?purchases|num[_\s]?orders|total[_\s]?orders)$/i
  ],
  last_purchase_date: [
    /^(last[_\s]?purchase[_\s]?date|last[_\s]?order[_\s]?date|recent[_\s]?purchase)$/i,
    /^(last[_\s]?transaction[_\s]?date|latest[_\s]?purchase|most[_\s]?recent)$/i,
    /^(last[_\s]?buy|last[_\s]?activity|last[_\s]?seen)$/i
  ],
  avg_order_value: [
    /^(avg[_\s]?order[_\s]?value|average[_\s]?order|aov|mean[_\s]?order)$/i,
    /^(avg[_\s]?purchase|average[_\s]?purchase|avg[_\s]?transaction)$/i
  ],
  age: [
    /^(age|customer[_\s]?age|years[_\s]?old)$/i,
    /^(birth[_\s]?date|date[_\s]?of[_\s]?birth|dob)$/i
  ],
  gender: [
    /^(gender|sex|male[_\s]?female)$/i
  ],
  tenure: [
    /^(tenure|years[_\s]?active|months[_\s]?active|customer[_\s]?since)$/i,
    /^(membership[_\s]?length|account[_\s]?age|time[_\s]?with[_\s]?us)$/i
  ],
  usage_frequency: [
    /^(usage[_\s]?frequency|frequency|activity[_\s]?level)$/i,
    /^(engagement[_\s]?level|usage[_\s]?pattern|activity[_\s]?frequency)$/i
  ],
  support_calls: [
    /^(support[_\s]?calls|help[_\s]?requests|tickets|complaints)$/i,
    /^(customer[_\s]?service|contact[_\s]?count|support[_\s]?tickets)$/i
  ],
  payment_delay: [
    /^(payment[_\s]?delay|late[_\s]?payment|overdue|days[_\s]?late)$/i,
    /^(payment[_\s]?issues|billing[_\s]?problems)$/i
  ],
  subscription_type: [
    /^(subscription[_\s]?type|plan[_\s]?type|membership[_\s]?type)$/i,
    /^(account[_\s]?type|service[_\s]?level|tier)$/i
  ]
};

// Data type detection patterns
const DATA_TYPE_PATTERNS = {
  date: [
    /date|time|created|updated|last|first|recent/i,
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/,
    /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/
  ],
  number: [
    /count|amount|value|price|cost|total|sum|avg|average|age|years|days|score/i,
    /^\d+\.?\d*$/,
    /\$|€|£|¥|%/
  ],
  boolean: [
    /active|enabled|disabled|yes|no|true|false|is_|has_/i
  ]
};

export const mapColumnsIntelligently = (headers: string[]): ColumnMappingResult => {
  console.log('🔍 Starting intelligent column mapping for headers:', headers);
  
  const mappings: ColumnMapping[] = [];
  const unmappedColumns: string[] = [];
  let totalConfidence = 0;
  
  // Clean and normalize headers
  const cleanHeaders = headers.map(header => ({
    original: header,
    clean: header.trim().toLowerCase().replace(/[^\w\s]/g, '_')
  }));
  
  console.log('🧹 Cleaned headers:', cleanHeaders);
  
  // Try to map each header to a target field
  cleanHeaders.forEach(({ original, clean }) => {
    let bestMatch: { field: string; confidence: number; dataType: string } | null = null;
    
    // Check against all field patterns
    Object.entries(FIELD_PATTERNS).forEach(([field, patterns]) => {
      patterns.forEach(pattern => {
        if (pattern.test(clean) || pattern.test(original)) {
          const confidence = calculateMatchConfidence(clean, original, pattern);
          
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = {
              field,
              confidence,
              dataType: inferDataType(original, clean)
            };
          }
        }
      });
    });
    
    if (bestMatch && bestMatch.confidence > 30) { // Lower threshold for more inclusive mapping
      mappings.push({
        sourceColumn: original,
        targetField: bestMatch.field,
        confidence: bestMatch.confidence,
        dataType: bestMatch.dataType as any
      });
      totalConfidence += bestMatch.confidence;
      
      console.log(`✅ Mapped "${original}" -> "${bestMatch.field}" (${bestMatch.confidence}% confidence)`);
    } else {
      unmappedColumns.push(original);
      console.log(`❓ Could not map "${original}" with sufficient confidence`);
    }
  });
  
  // Calculate overall confidence
  const overallConfidence = mappings.length > 0 ? totalConfidence / mappings.length : 0;
  
  // Add some fallback mappings for common scenarios
  if (mappings.length === 0 && headers.length > 0) {
    console.log('🔄 No mappings found, applying fallback logic...');
    
    // Try to infer from position and content
    headers.forEach((header, index) => {
      if (index === 0 && header.toLowerCase().includes('id')) {
        mappings.push({
          sourceColumn: header,
          targetField: 'customer_id',
          confidence: 50,
          dataType: 'string'
        });
      } else if (header.toLowerCase().includes('email') || header.includes('@')) {
        mappings.push({
          sourceColumn: header,
          targetField: 'email',
          confidence: 70,
          dataType: 'string'
        });
      } else if (header.toLowerCase().includes('name')) {
        mappings.push({
          sourceColumn: header,
          targetField: 'name',
          confidence: 60,
          dataType: 'string'
        });
      }
    });
  }
  
  const result: ColumnMappingResult = {
    mappings,
    confidence: Math.max(overallConfidence, mappings.length > 0 ? 40 : 0), // Ensure minimum confidence if we have mappings
    unmappedColumns
  };
  
  console.log('📊 Column mapping result:', result);
  
  return result;
};

const calculateMatchConfidence = (cleanHeader: string, originalHeader: string, pattern: RegExp): number => {
  let confidence = 50; // Base confidence
  
  // Exact match gets highest confidence
  if (pattern.test(cleanHeader) && cleanHeader.length <= 20) {
    confidence = 95;
  } else if (pattern.test(originalHeader)) {
    confidence = 85;
  } else if (pattern.test(cleanHeader)) {
    confidence = 75;
  }
  
  // Boost confidence for shorter, more specific matches
  if (cleanHeader.length <= 10) {
    confidence += 10;
  }
  
  // Reduce confidence for very long headers (likely to be descriptions)
  if (cleanHeader.length > 30) {
    confidence -= 20;
  }
  
  // Boost confidence for common business terms
  const businessTerms = ['customer', 'order', 'purchase', 'revenue', 'date', 'email', 'name'];
  if (businessTerms.some(term => cleanHeader.includes(term))) {
    confidence += 15;
  }
  
  return Math.max(10, Math.min(100, confidence));
};

const inferDataType = (originalHeader: string, cleanHeader: string): string => {
  const combined = `${originalHeader} ${cleanHeader}`.toLowerCase();
  
  // Check date patterns
  if (DATA_TYPE_PATTERNS.date.some(pattern => 
    typeof pattern === 'string' ? combined.includes(pattern) : pattern.test(combined)
  )) {
    return 'date';
  }
  
  // Check number patterns
  if (DATA_TYPE_PATTERNS.number.some(pattern => 
    typeof pattern === 'string' ? combined.includes(pattern) : pattern.test(combined)
  )) {
    return 'number';
  }
  
  // Check boolean patterns
  if (DATA_TYPE_PATTERNS.boolean.some(pattern => 
    typeof pattern === 'string' ? combined.includes(pattern) : pattern.test(combined)
  )) {
    return 'boolean';
  }
  
  return 'string';
};
