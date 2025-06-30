import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Filter,
  Calendar as CalendarIcon,
  Loader2,
  BarChart3
} from 'lucide-react';
import { CustomerData } from '@/utils/dataProcessing';
import { 
  ExportOptions, 
  exportCustomerData, 
  DEFAULT_EXPORT_FIELDS, 
  FIELD_LABELS,
  getExportStats
} from '@/utils/dataExport';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: CustomerData[];
}

const ExportDialog = ({ open, onOpenChange, customers }: ExportDialogProps) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_EXPORT_FIELDS);
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter states
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [riskScoreRange, setRiskScoreRange] = useState<[number, number]>([0, 100]);
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleSegmentToggle = (segment: string) => {
    setSelectedSegments(prev =>
      prev.includes(segment)
        ? prev.filter(s => s !== segment)
        : [...prev, segment]
    );
  };

  const handleSelectAllFields = () => {
    setSelectedFields(DEFAULT_EXPORT_FIELDS);
  };

  const handleDeselectAllFields = () => {
    setSelectedFields([]);
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const exportOptions: ExportOptions = {
        format: exportFormat,
        includeFields: selectedFields,
        filename: filename.trim() || undefined,
        filterBy: {
          segment: selectedSegments.length > 0 ? selectedSegments : undefined,
          riskScoreRange: riskScoreRange[0] !== 0 || riskScoreRange[1] !== 100 ? riskScoreRange : undefined,
          dateRange: dateRange.from && dateRange.to ? [dateRange.from, dateRange.to] : undefined
        }
      };

      const result = await exportCustomerData(customers, exportOptions);
      
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const exportStats = getExportStats(customers, {
    segment: selectedSegments.length > 0 ? selectedSegments : undefined,
    riskScoreRange: riskScoreRange[0] !== 0 || riskScoreRange[1] !== 100 ? riskScoreRange : undefined,
    dateRange: dateRange.from && dateRange.to ? [dateRange.from, dateRange.to] : undefined
  });

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <FileText className="h-4 w-4" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4" />;
      case 'json': return <FileJson className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Customer Data
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[70vh]">
          <Tabs defaultValue="format" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="format">Format</TabsTrigger>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="format" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Format</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'csv', label: 'CSV', description: 'Comma-separated values, compatible with Excel and other tools' },
                        { value: 'excel', label: 'Excel', description: 'Microsoft Excel format with formatting and auto-sized columns' },
                        { value: 'json', label: 'JSON', description: 'JavaScript Object Notation, ideal for developers and APIs' }
                      ].map((format) => (
                        <div
                          key={format.value}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            exportFormat === format.value 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setExportFormat(format.value as any)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getFormatIcon(format.value)}
                            <span className="font-medium">{format.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{format.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filename">Custom Filename (optional)</Label>
                      <Input
                        id="filename"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder={`customer-data-${new Date().toISOString().split('T')[0]}`}
                      />
                      <p className="text-xs text-gray-500">
                        Leave empty to use default filename. File extension will be added automatically.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fields" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Select Fields to Export
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSelectAllFields}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDeselectAllFields}>
                          Deselect All
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {DEFAULT_EXPORT_FIELDS.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={field}
                            checked={selectedFields.includes(field)}
                            onCheckedChange={() => handleFieldToggle(field)}
                          />
                          <Label htmlFor={field} className="text-sm cursor-pointer">
                            {FIELD_LABELS[field] || field}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{selectedFields.length}</strong> fields selected for export
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filter Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Segment Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Customer Segments</Label>
                      <div className="flex gap-2">
                        {['low-risk', 'medium-risk', 'high-risk'].map((segment) => (
                          <Badge
                            key={segment}
                            variant={selectedSegments.includes(segment) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleSegmentToggle(segment)}
                          >
                            {segment.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {selectedSegments.length === 0 ? 'All segments included' : `${selectedSegments.length} segment(s) selected`}
                      </p>
                    </div>

                    {/* Risk Score Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Risk Score Range: {riskScoreRange[0]}% - {riskScoreRange[1]}%
                      </Label>
                      <Slider
                        value={riskScoreRange}
                        onValueChange={(value) => setRiskScoreRange(value as [number, number])}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Last Purchase Date Range</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      {(dateRange.from || dateRange.to) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDateRange({})}
                          className="text-red-600 hover:text-red-700"
                        >
                          Clear date filter
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Export Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {exportStats.filteredCustomers}
                        </div>
                        <div className="text-sm text-blue-800">Records to Export</div>
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {exportStats.highRiskCount}
                        </div>
                        <div className="text-sm text-red-800">High Risk</div>
                      </div>
                      
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {exportStats.mediumRiskCount}
                        </div>
                        <div className="text-sm text-yellow-800">Medium Risk</div>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {exportStats.lowRiskCount}
                        </div>
                        <div className="text-sm text-green-800">Low Risk</div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Export Summary</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Format: <strong>{exportFormat.toUpperCase()}</strong></li>
                        <li>• Fields: <strong>{selectedFields.length}</strong> selected</li>
                        <li>• Records: <strong>{exportStats.filteredCustomers}</strong> of {exportStats.totalCustomers} total</li>
                        <li>• Total Revenue: <strong>${exportStats.totalRevenue.toLocaleString()}</strong></li>
                      </ul>
                    </div>

                    {exportStats.filteredCustomers === 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">
                          No customers match your current filters. Please adjust your filter criteria.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            <Button 
              onClick={handleExport}
              disabled={isExporting || selectedFields.length === 0 || exportStats.filteredCustomers === 0}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {exportStats.filteredCustomers} Records
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;