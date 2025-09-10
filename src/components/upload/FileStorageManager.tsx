import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Trash2, Eye } from "lucide-react";

interface StoredFile {
  id: string;
  name: string;
  size: number;
  created_at: string;
  metadata?: any;
  file_path: string;
  bucket_id: string;
}

interface FileStorageManagerProps {
  userId: string;
}

export const FileStorageManager = ({ userId }: FileStorageManagerProps) => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('uploaded-files')
        .list(`${userId}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const formattedFiles: StoredFile[] = data?.map(file => ({
        id: file.id || file.name,
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at || file.updated_at || new Date().toISOString(),
        metadata: file.metadata,
        file_path: `${userId}/${file.name}`,
        bucket_id: 'uploaded-files'
      })) || [];

      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stored files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (file: StoredFile) => {
    try {
      const { data, error } = await supabase.storage
        .from(file.bucket_id)
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${file.name}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (file: StoredFile) => {
    try {
      const { error } = await supabase.storage
        .from(file.bucket_id)
        .remove([file.file_path]);

      if (error) throw error;

      setFiles(files.filter(f => f.id !== file.id));
      toast({
        title: "File Deleted",
        description: `${file.name} has been deleted`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stored Files</CardTitle>
        <CardDescription>
          Manage your uploaded files stored securely in the cloud
        </CardDescription>
        <Button onClick={fetchUserFiles} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh Files'}
        </Button>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No files stored yet
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};