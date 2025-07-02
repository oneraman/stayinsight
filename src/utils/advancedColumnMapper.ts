
export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  confidence: number;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  transformations?: string[];
}

export interface ColumnMappingResult {
  mappings: ColumnMapping[];
  unmappedColumns: string[];
  confidence: number;
  suggestions: string[];
}

// Comprehensive column pattern matching
const COLUMN_PATTERNS = {
  customer_id: [
    /^(customer[_\s-]?id|cust[_\s-]?id|id|customer[_\s-]?number|account[_\s-]?id)$/i,
    /^(client[_\s-]?id|member[_\s-]?id|user[_\s-]?id)$/i
  ],
  email: [
    /^(email|e[_\s-]?mail|email[_\s-]?address|contact[_\s-]?email)$/i
  ],
  name: [
    /^(name|customer[_\s-]?name|full[_\s-]?name|client[_\s-]?name)$/i,
    /^(first[_\s-]?name|last[_\s-]?name|display[_\s-]?name)$/i
  ],
  total_spent: [
    /^(total[_\s-]?spent|total[_\s-]?amount|lifetime[_\s-]?value|ltv|clv)$/i,
    /^(revenue|total[_\s-]?revenue|spend|spending)$/i
  ],
  purchase_count: [
    /^(purchase[_\s-]?count|order[_\s-]?count|total[_\s-]?orders|num[_\s-]?orders)$/i,
    /^(transactions|purchase[_\s-]?frequency)$/i
  ],
  last_purchase_date: [
    /^(last[_\s-]?purchase|last[_\s-]?order|most[_\s-]?recent|latest[_\s-]?purchase)$/i,
    /^(last[_\s-]?transaction|final[_\s-]?purchase)$/i
  ],
  avg_order_value: [
    /^(avg[_\s-]?order[_\s-]?value|aov|average[_\s-]?order|mean[_\s-]?order)$/i,
    /^(average[_\s-]?purchase|avg[_\s-]?spent)$/i
  ],
  age: [
    /^(age|customer[_\s-]?age|years[_\s-]?old)$/i
  ],
  gender: [
    /^(gender|sex|m\/f)$/i
  ],
  tenure: [
    /^(tenure|customer[_\s-]?tenure|months[_\s-]?active|time[_\s-]?with[_\s-]?us)$/i,
    /^(membership[_\s-]?length|account[_\s-]?age)$/i
  ],
  support_calls: [
    /^(support[_\s-]?calls|help[_\s-]?requests|tickets|complaints)$/i,
    /^(service[_\s-]?calls|contact[_\s-]?count)$/i
  ],
  payment_delay: [
    /^(payment[_\s-]?delay|days[_\s-]?late|overdue|late[_\s-]?payments)$/i
  ],
  usage_frequency: [
    /^(usage[_\s-]?frequency|activity[_\s-]?level|engagement)$/i,
    /^(login[_\s-]?frequency|visit[_\s-]?frequency)$/i
  ],
  subscription_type: [
    /^(subscription[_\s-]?type|plan[_\s-]?type|membership[_\s-]?tier)$/i,
    /^(package|service[_\s-]?level|account[_\s-]?type)$/i
  ]
};

export const mapColumnsIntelligently = (headers: string[]): ColumnMappingResult => {
  const mappings: ColumnMapping[] = [];
  const unmappedColumns: string[] = [];
  const suggestions: string[] = [];
  let totalConfidence = 0;

  // Clean and normalize headers
  const cleanHeaders = headers.map(header => header.trim().replace(/[^\w\s-]/g, ''));

  for (const header of cleanHeaders) {
    let bestMatch: ColumnMapping | null = null;
    let highestConfidence = 0;

    // Try to match against all patterns
    for (const [targetField, patterns] of Object.entries(COLUMN_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(header)) {
          const confidence = calculateMatchConfidence(header, pattern, targetField);
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              sourceColumn: header,
              targetField,
              confidence,
              dataType: getExpectedDataType(targetField),
              transformations: getRequiredTransformations(targetField)
            };
          }
        }
      }
    }

    if (bestMatch && bestMatch.confidence > 60) {
      mappings.push(bestMatch);
      totalConfidence += bestMatch.confidence;
    } else {
      unmappedColumns.push(header);
      suggestions.push(`Consider mapping "${header}" to a customer attribute`);
    }
  }

  const overallConfidence = mappings.length > 0 ? totalConfidence / mappings.length : 0;

  return {
    mappings,
    unmappedColumns,
    confidence: overallConfidence,
    suggestions
  };
};

const calculateMatchConfidence = (header: string, pattern: RegExp, targetField: string): number => {
  let confidence = 70; // Base confidence for regex match

  // Boost confidence for exact matches
  if (header.toLowerCase() === targetField.replace('_', ' ')) {
    confidence += 25;
  }

  // Boost for common business terms
  const businessTerms = ['customer', 'total', 'average', 'last', 'purchase', 'order'];
  businessTerms.forEach(term => {
    if (header.toLowerCase().includes(term)) {
      confidence += 5;
    }
  });

  // Reduce confidence for ambiguous matches
  if (header.length <= 3) {
    confidence -= 15;
  }

  return Math.min(100, Math.max(0, confidence));
};

const getExpectedDataType = (targetField: string): 'string' | 'number' | 'date' | 'boolean' => {
  const numberFields = ['total_spent', 'purchase_count', 'avg_order_value', 'age', 'tenure', 'support_calls', 'payment_delay'];
  const dateFields = ['last_purchase_date'];
  
  if (numberFields.includes(targetField)) return 'number';
  if (dateFields.includes(targetField)) return 'date';
  return 'string';
};

const getRequiredTransformations = (targetField: string): string[] => {
  const transformations: string[] = [];
  
  if (targetField === 'email') {
    transformations.push('lowercase', 'trim', 'validate_email');
  }
  if (targetField === 'total_spent' || targetField === 'avg_order_value') {
    transformations.push('remove_currency', 'parse_number');
  }
  if (targetField === 'last_purchase_date') {
    transformations.push('parse_date', 'validate_date');
  }
  
  return transformations;
};
