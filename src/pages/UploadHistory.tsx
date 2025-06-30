import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, History as HistoryIcon, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, UploadSession } from "@/lib/supabase";
import { formatDate, formatFileSize } from "@/utils/customerUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UploadHistory = () => {
  const { currentUser } = useAuth();
  const [uploadSessions, setUploadSessions] = useState<UploadSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  useEffect(() => {
    fetchUploadHistory();
  }, [currentUser]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUploadHistory();
    setRefreshing(false);
    toast.success("Upload history refreshed!");
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!currentUser) return;

    setDeleting(sessionId);
    try {
      const { error } = await supabase
        .from('upload_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', currentUser.id);

      if (error) {
        throw new Error(`Failed to delete session: ${error.message}`);
      }

      setUploadSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success("Upload session deleted successfully!");
    } catch (err: any) {
      console.error("❌ Error deleting session:", err);
      toast.error(err.message || "Failed to delete session");
    } finally {
      setDeleting(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('upload_sessions')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) {
        throw new Error(`Failed to clear history: ${error.message}`);
      }

      setUploadSessions([]);
      toast.success("Upload history cleared successfully!");
    } catch (err: any) {
      console.error("❌ Error clearing history:", err);
      toast.error(err.message || "Failed to clear history");
    }
  };

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

  const getProgressPercentage = (session: UploadSession) => {
    if (session.total_rows === 0) return 0;
    return Math.round((session.processed_rows / session.total_rows) * 100);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <HistoryIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Upload History</h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            
            {uploadSessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Upload History</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all upload session records. This action cannot be undone.
                      <br /><br />
                      <strong>Note:</strong> This only clears the upload history, not your customer data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearAllHistory}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Clear All History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>File Upload Sessions</span>
              {uploadSessions.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {uploadSessions.length} session{uploadSessions.length !== 1 ? 's' : ''} found
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading upload history...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4 flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" /> {error}
              </div>
            ) : uploadSessions.length === 0 ? (
              <div className="text-center p-8">
                <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No upload history found</p>
                <p className="text-sm text-gray-400">
                  Upload customer data files to see your upload history here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">File Name</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Progress</TableHead>
                      <TableHead className="font-semibold">File Size</TableHead>
                      <TableHead className="font-semibold">Total Rows</TableHead>
                      <TableHead className="font-semibold">Processed</TableHead>
                      <TableHead className="font-semibold">Uploaded At</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadSessions.map((session) => (
                      <TableRow key={session.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={session.file_name}>
                            {session.file_name}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  session.status === 'completed' ? 'bg-green-500' :
                                  session.status === 'failed' ? 'bg-red-500' :
                                  session.status === 'processing' ? 'bg-blue-500' :
                                  'bg-gray-400'
                                }`}
                                style={{ width: `${getProgressPercentage(session)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              {getProgressPercentage(session)}%
                            </span>
                          </div>
                        </TableCell>
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
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={deleting === session.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {deleting === session.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Upload Session</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this upload session record?
                                  <br /><br />
                                  <strong>File:</strong> {session.file_name}
                                  <br />
                                  <strong>Status:</strong> {session.status}
                                  <br /><br />
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteSession(session.id!)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Session
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {uploadSessions.some(session => session.error_message) && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                    <div className="space-y-2">
                      {uploadSessions
                        .filter(session => session.error_message)
                        .map(session => (
                          <div key={session.id} className="text-sm">
                            <strong className="text-red-700">{session.file_name}:</strong>
                            <span className="text-red-600 ml-2">{session.error_message}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UploadHistory;