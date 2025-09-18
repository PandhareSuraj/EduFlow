import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Shield, Key } from "lucide-react";

interface GoogleOAuthSetupWizardProps {
  onSave: (clientId: string, clientSecret: string) => Promise<void>;
  loading?: boolean;
}

export function GoogleOAuthSetupWizard({ onSave, loading }: GoogleOAuthSetupWizardProps) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [step, setStep] = useState(1);

  const handleSave = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      return;
    }
    
    try {
      await onSave(clientId.trim(), clientSecret.trim());
    } catch (error) {
      console.error('Failed to save OAuth credentials:', error);
    }
  };

  const steps = [
    {
      title: "Create Google Cloud Project",
      description: "Set up OAuth credentials in Google Cloud Console",
      content: (
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You'll need your own Google Cloud Console project with OAuth 2.0 credentials to connect your college's Google Drive.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <span>Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="h-3 w-3" /></a></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <span>Create a new project or select an existing one</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">3</span>
              <span>Enable the Google Drive API for your project</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">4</span>
              <span>Go to "Credentials" and create OAuth 2.0 Client IDs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">5</span>
              <span>Set authorized redirect URI: <code className="bg-muted px-2 py-1 rounded text-sm">{window.location.origin}/settings</code></span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Enter OAuth Credentials",
      description: "Copy your Client ID and Client Secret from Google Cloud Console",
      content: (
        <div className="space-y-4">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              These credentials will be stored securely and used only for your college's Google Drive integration.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Google Client ID</Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Enter your Google OAuth Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientSecret">Google Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Enter your Google OAuth Client Secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Google Drive Setup - Step {step} of {steps.length}
        </CardTitle>
        <CardDescription>
          {steps[step - 1].description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">{steps[step - 1].title}</h4>
          {steps[step - 1].content}
        </div>
        
        <div className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          
          <div className="ml-auto flex gap-2">
            {step < steps.length ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSave}
                disabled={!clientId.trim() || !clientSecret.trim() || loading}
              >
                {loading ? "Saving..." : "Save Credentials"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}