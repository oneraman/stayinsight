import { generateCustomerInsights } from '@/lib/gemini';

export interface ColumnMappingResult {
  mappings: Record<string, string>;
  confidence: number;
  suggestions: string[];
}

export interface IntelligentMapping {
  sourceColumn: string;
  targetField: string;
  confidence: number;
  dataType: 'string' | 'number' | 'date' | 'email' | 'boolean';
}

/**
 * Uses AI to intelligently map columns from uploaded files to our data model
 */
export async function mapColumnsWithAI(
  headers: string[],
  sampleData: any[]
): Promise<ColumnMappingResult> {
  console.log('🧠 Starting intelligent column mapping with AI...');
  
  // Create a sample of the data for AI analysis
  const dataSample = sampleData.slice(0, 5).map(row => {
    const sample: any = {};
    headers.forEach(header => {
      sample[header] = row[header];
    });
    return sample;
  });

  const prompt = `Analyze this data and map the columns to our customer data model. 

Available columns in the file:
${headers.map((h, i) => `${i + 1}. "${h}"`).join('\n')}

Sample data (first few rows):
${JSON.stringify(dataSample, null, 2)}

Target fields we need to map to:
- customerId: Unique customer identifier
- name: Customer full name
- email: Customer email address
- totalSpent: Total amount spent (numeric)
- purchaseCount: Number of purchases (numeric)
- lastPurchaseDate: Date of last purchase
- segment: Customer segment/category
- status: Customer status (active, inactive, etc.)

Please analyze the data and provide a JSON mapping in this exact format:
{
  "mappings": {
    "source_column_name": "targetField"
  },
  "confidence": 0.95,
  "suggestions": ["list of any data quality concerns or recommendations"]
}

Only map columns that clearly match. Be specific about which source column maps to which target field.`;

  try {
    const response = await generateCustomerInsights(prompt);
    console.log('AI mapping response:', response);
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      console.log('✅ Intelligent mapping complete:', result);
      return result;
    }
    
    // Fallback to pattern-based mapping if AI fails
    return fallbackPatternMapping(headers, sampleData);
  } catch (error) {
    console.error('AI mapping failed, using fallback:', error);
    return fallbackPatternMapping(headers, sampleData);
  }
}

/**
 * Fallback pattern-based mapping when AI is unavailable
 */
function fallbackPatternMapping(headers: string[], sampleData: any[]): ColumnMappingResult {
  const mappings: Record<string, string> = {};
  const suggestions: string[] = [];
  
  const patterns = {
    customerId: /customer.*id|cust.*id|id|account.*id|client.*id/i,
    name: /name|customer.*name|client.*name|full.*name|contact.*name/i,
    email: /email|e-mail|mail|contact.*email/i,
    totalSpent: /total.*spent|total.*amount|revenue|total.*purchase|amount.*spent|spend/i,
    purchaseCount: /purchase.*count|order.*count|transaction.*count|num.*purchase|count/i,
    lastPurchaseDate: /last.*purchase.*date|last.*order.*date|recent.*purchase|last.*date/i,
    segment: /segment|category|type|group|tier|class/i,
    status: /status|state|active|condition/i
  };

  headers.forEach(header => {
    const normalizedHeader = header.trim().toLowerCase();
    
    for (const [targetField, pattern] of Object.entries(patterns)) {
      if (pattern.test(normalizedHeader)) {
        mappings[header] = targetField;
        break;
      }
    }
  });

  const mappedCount = Object.keys(mappings).length;
  const confidence = mappedCount / Object.keys(patterns).length;
  
  if (confidence < 0.5) {
    suggestions.push('Low confidence in column mapping. Manual review recommended.');
  }
  if (!mappings.email) {
    suggestions.push('No email column detected. Customer communication may be limited.');
  }
  if (!mappings.totalSpent && !mappings.purchaseCount) {
    suggestions.push('No financial metrics detected. Risk scoring will be limited.');
  }

  console.log('📊 Fallback mapping complete:', { mappings, confidence });
  
  return { mappings, confidence, suggestions };
}

/**
 * Infer data type from sample values
 */
export function inferDataType(values: any[]): 'string' | 'number' | 'date' | 'email' | 'boolean' {
  const nonNull = values.filter(v => v != null && v !== '');
  if (nonNull.length === 0) return 'string';

  const sample = nonNull[0];
  
  // Check email pattern
  if (typeof sample === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sample)) {
    return 'email';
  }
  
  // Check date pattern
  if (typeof sample === 'string' && !isNaN(Date.parse(sample))) {
    return 'date';
  }
  
  // Check number
  if (!isNaN(Number(sample))) {
    return 'number';
  }
  
  // Check boolean
  if (typeof sample === 'boolean' || ['true', 'false', 'yes', 'no'].includes(String(sample).toLowerCase())) {
    return 'boolean';
  }
  
  return 'string';
}
