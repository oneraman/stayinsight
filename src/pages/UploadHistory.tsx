import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, History as HistoryIcon, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, UploadSession } from "@/lib/supabase";
import { formatDate, formatFileSize } from "@/utils/customerUtils";
import { Badge } from "@/components/ui/badge";

const UploadHistory = () => {
  const { currentUser } = useAuth();
  const [uploadSessions, setUploadSessions] = useState<UploadSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUploadHistory = async () => {
      if (!currentUser) {
        setError("User not authenticated. Please log in to view upload history.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("📊 Fetching upload sessions for user:", currentUser.id);

        const { data, error: supabaseError } = await supabase
          .from('upload_sessions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw new Error(`Supabase query failed: ${supabaseError.message}`);
        }

        setUploadSessions(data || []);
        console.log("✅ Fetched", data?.length, "upload sessions.");
      } catch (err: any) {
        console.error("❌ Error fetching upload history:", err);
        setError(err.message || "Failed to load upload history.");
      } finally {
        setLoading(false);
      }
    };

    fetchUploadHistory();
  }, [currentUser]);

  const getStatusBadge = (status: UploadSession['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Failed</Badge>;
      case 'uploading':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">Uploading</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <HistoryIcon className="h-6 w-6 mr-3 text-primary" />
          <h1 className="text-2xl font-bold">Upload History</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Past File Uploads & Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4 flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" /> {error}
              </div>
            ) : uploadSessions.length === 0 ? (
              <div className="text-center p-8">
                <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No previous upload sessions found</p>
                <p className="text-sm text-gray-400 mt-1">Upload a file to get started with customer analysis!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">File Name</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">File Size</TableHead>
                      <TableHead className="font-semibold">Total Rows</TableHead>
                      <TableHead className="font-semibold">Processed Rows</TableHead>
                      <TableHead className="font-semibold">Uploaded At</TableHead>
                      <TableHead className="font-semibold">Error Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadSessions.map((session) => (
                      <TableRow key={session.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{session.file_name}</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell className="text-gray-600">
                          {formatFileSize(session.file_size)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {session.total_rows?.toLocaleString() || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {session.processed_rows?.toLocaleString() || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {session.created_at ? formatDate(new Date(session.created_at)) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-red-500 text-sm max-w-xs truncate">
                          {session.error_message || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UploadHistory;