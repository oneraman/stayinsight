import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, RefreshCw, Download, Search } from "lucide-react";

interface ModernDashboardHeaderProps {
  onUpload?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
  hasData?: boolean;
}

const ModernDashboardHeader = ({ 
  onUpload, 
  onRefresh, 
  onExport, 
  isRefreshing = false,
  hasData = true 
}: ModernDashboardHeaderProps) => {
  const [activeFilter, setActiveFilter] = useState("30 Days");
  const [searchQuery, setSearchQuery] = useState("");

  const timeFilters = ["7 Days", "30 Days", "90 Days"];

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title and filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-3xl font-bold">Customer Retention Dashboard</h1>
            <div className="flex gap-2">
              {timeFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search and actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={onUpload} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Data
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onExport}
                disabled={!hasData}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboardHeader;