import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadWizardProps {
  onComplete?: (file: File) => void;
}

export const FileUploadWizard = ({ onComplete }: FileUploadWizardProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onComplete) {
      console.log('📁 File selected:', file.name);
      setSelectedFile(file);
      onComplete(file);
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="font-medium mb-2">Upload Customer Data</p>
          <p className="text-sm text-gray-500 mb-4">CSV, XLS, XLSX files up to 10MB</p>
          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button onClick={() => document.getElementById('file-upload')?.click()}>
            {selectedFile ? 'Change File' : 'Choose File'}
          </Button>
          {selectedFile && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadWizard;
