import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Cloud, HardDrive, CheckCircle, XCircle, Upload, Download, Trash2, RefreshCw } from "lucide-react";
import { usePersonalGoogleDrive } from "@/hooks/usePersonalGoogleDrive";

export function PersonalGoogleDriveSettings() {
  const {
    settings,
    loading,
    connectGoogleDrive,
    disconnectGoogleDrive,
    getStorageUsage,
    formatStorageSize,
    refreshSettings
  } = usePersonalGoogleDrive();

  const { used, total, percentage } = getStorageUsage();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Personal Google Drive Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading Google Drive settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Personal Google Drive Storage
        </CardTitle>
        <CardDescription>
          Connect your personal Google account to store documents in your Google Drive (15GB free)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${settings?.connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              {settings?.connected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            </div>
            <div>
              <h4 className="font-medium">
                {settings?.connected ? 'Connected' : 'Not Connected'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {settings?.connected ? settings.google_email : 'Connect your Google account to get started'}
              </p>
            </div>
          </div>
          <Badge variant={settings?.connected ? 'default' : 'secondary'}>
            {settings?.connected ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <Separator />

        {/* Storage Usage (if connected) */}
        {settings?.connected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="font-medium">Storage Usage</span>
              </div>
              <Button variant="outline" size="sm" onClick={refreshSettings}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {formatStorageSize(used)}</span>
                <span>Total: {formatStorageSize(total)}</span>
              </div>
              <Progress value={Math.min(percentage, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {percentage.toFixed(1)}% of your Google Drive storage used
              </p>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="space-y-4">
          <h4 className="font-medium">Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Upload className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Auto Upload</p>
                <p className="text-xs text-muted-foreground">Student documents</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Download className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Easy Access</p>
                <p className="text-xs text-muted-foreground">From any device</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Cloud className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">15GB Free</p>
                <p className="text-xs text-muted-foreground">No payment needed</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-3">
          {!settings?.connected ? (
            <Button onClick={connectGoogleDrive} className="flex-1">
              <Cloud className="h-4 w-4 mr-2" />
              Sign in with Google
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={disconnectGoogleDrive} className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Disconnect
              </Button>
              <Button variant="outline" onClick={refreshSettings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">How it works:</h5>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Click "Sign in with Google" to connect your personal Google account</li>
            <li>2. Grant permission to store files in your Google Drive</li>
            <li>3. Student documents and ID cards will be automatically organized in folders</li>
            <li>4. Access your files anytime from Google Drive on any device</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}