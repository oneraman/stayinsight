import * as XLSX from 'xlsx';
import { CustomerData } from './dataProcessing';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  includeFields: string[];
  filterBy?: {
    segment?: string[];
    riskScoreRange?: [number, number];
    dateRange?: [Date, Date];
  };
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  message: string;
  downloadUrl?: string;
  filename?: string;
}

// Default fields for export
export const DEFAULT_EXPORT_FIELDS = [
  'customerId',
  'name',
  'email',
  'riskScore',
  'segment',
  'totalSpent',
  'purchaseCount',
  'avgOrderValue',
  'lastPurchaseDate',
  'age',
  'gender',
  'tenure',
  'usageFrequency',
  'supportCalls',
  'paymentDelay',
  'subscriptionType'
];

export const FIELD_LABELS: Record<string, string> = {
  customerId: 'Customer ID',
  name: 'Customer Name',
  email: 'Email Address',
  riskScore: 'Risk Score',
  segment: 'Risk Segment',
  totalSpent: 'Total Spent',
  purchaseCount: 'Purchase Count',
  avgOrderValue: 'Average Order Value',
  lastPurchaseDate: 'Last Purchase Date',
  age: 'Age',
  gender: 'Gender',
  tenure: 'Tenure (months)',
  usageFrequency: 'Usage Frequency',
  supportCalls: 'Support Calls',
  paymentDelay: 'Payment Delay (days)',
  subscriptionType: 'Subscription Type',
  createdAt: 'Created At',
  updatedAt: 'Updated At'
};

// Filter customer data based on export options
export const filterCustomerData = (
  customers: CustomerData[],
  filterBy?: ExportOptions['filterBy']
): CustomerData[] => {
  if (!filterBy) return customers;

  return customers.filter(customer => {
    // Filter by segment
    if (filterBy.segment && filterBy.segment.length > 0) {
      if (!customer.segment || !filterBy.segment.includes(customer.segment)) {
        return false;
      }
    }

    // Filter by risk score range
    if (filterBy.riskScoreRange) {
      const [min, max] = filterBy.riskScoreRange;
      const riskScore = customer.riskScore || 0;
      if (riskScore < min || riskScore > max) {
        return false;
      }
    }

    // Filter by date range
    if (filterBy.dateRange && customer.lastPurchaseDate) {
      const [startDate, endDate] = filterBy.dateRange;
      const purchaseDate = new Date(customer.lastPurchaseDate);
      if (purchaseDate < startDate || purchaseDate > endDate) {
        return false;
      }
    }

    return true;
  });
};

// Prepare data for export by selecting only specified fields
export const prepareExportData = (
  customers: CustomerData[],
  includeFields: string[]
): Record<string, any>[] => {
  return customers.map(customer => {
    const exportRow: Record<string, any> = {};
    
    includeFields.forEach(field => {
      const label = FIELD_LABELS[field] || field;
      let value = customer[field as keyof CustomerData];
      
      // Format specific field types
      if (field === 'lastPurchaseDate' && value) {
        value = new Date(value as Date).toLocaleDateString();
      } else if (field === 'createdAt' && value) {
        value = new Date(value as Date).toLocaleString();
      } else if (field === 'updatedAt' && value) {
        value = new Date(value as Date).toLocaleString();
      } else if (typeof value === 'number') {
        // Format currency fields
        if (field === 'totalSpent' || field === 'avgOrderValue') {
          value = `$${value.toFixed(2)}`;
        } else if (field === 'riskScore') {
          value = `${value}%`;
        }
      }
      
      exportRow[label] = value || '';
    });
    
    return exportRow;
  });
};

// Export to CSV format
export const exportToCSV = (data: Record<string, any>[], filename: string): ExportResult => {
  try {
    if (data.length === 0) {
      return {
        success: false,
        message: 'No data to export'
      };
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: `Successfully exported ${data.length} records to CSV`,
      filename
    };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return {
      success: false,
      message: 'Failed to export to CSV'
    };
  }
};

// Export to Excel format
export const exportToExcel = (data: Record<string, any>[], filename: string): ExportResult => {
  try {
    if (data.length === 0) {
      return {
        success: false,
        message: 'No data to export'
      };
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const columnWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      )
    }));
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Data');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, filename);

    return {
      success: true,
      message: `Successfully exported ${data.length} records to Excel`,
      filename
    };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return {
      success: false,
      message: 'Failed to export to Excel'
    };
  }
};

// Export to JSON format
export const exportToJSON = (data: Record<string, any>[], filename: string): ExportResult => {
  try {
    if (data.length === 0) {
      return {
        success: false,
        message: 'No data to export'
      };
    }

    const jsonContent = JSON.stringify({
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      data: data
    }, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: `Successfully exported ${data.length} records to JSON`,
      filename
    };
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return {
      success: false,
      message: 'Failed to export to JSON'
    };
  }
};

// Main export function
export const exportCustomerData = async (
  customers: CustomerData[],
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    console.log('🔄 Starting data export with options:', options);

    // Filter data if filters are specified
    const filteredCustomers = filterCustomerData(customers, options.filterBy);
    
    if (filteredCustomers.length === 0) {
      return {
        success: false,
        message: 'No customers match the specified filters'
      };
    }

    // Prepare data for export
    const exportData = prepareExportData(filteredCustomers, options.includeFields);

    // Generate filename if not provided
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `customer-data-${timestamp}`;
    const filename = options.filename || defaultFilename;

    // Export based on format
    switch (options.format) {
      case 'csv':
        return exportToCSV(exportData, `${filename}.csv`);
      case 'excel':
        return exportToExcel(exportData, `${filename}.xlsx`);
      case 'json':
        return exportToJSON(exportData, `${filename}.json`);
      default:
        return {
          success: false,
          message: 'Unsupported export format'
        };
    }
  } catch (error) {
    console.error('❌ Error in exportCustomerData:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Export failed'
    };
  }
};

// Get export statistics
export const getExportStats = (
  customers: CustomerData[],
  filterBy?: ExportOptions['filterBy']
): {
  totalCustomers: number;
  filteredCustomers: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalRevenue: number;
} => {
  const filteredCustomers = filterCustomerData(customers, filterBy);
  
  const highRiskCount = filteredCustomers.filter(c => c.segment === 'high-risk').length;
  const mediumRiskCount = filteredCustomers.filter(c => c.segment === 'medium-risk').length;
  const lowRiskCount = filteredCustomers.filter(c => c.segment === 'low-risk').length;
  const totalRevenue = filteredCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return {
    totalCustomers: customers.length,
    filteredCustomers: filteredCustomers.length,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    totalRevenue
  };
};