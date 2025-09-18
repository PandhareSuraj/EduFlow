import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, CreditCard, Check, Cloud, CloudOff, HardDrive } from 'lucide-react';
import { useCollegeSettings } from '@/hooks/useCollegeSettings';
import { useGoogleDriveSettings } from '@/hooks/useGoogleDriveSettings';
import { GoogleOAuthSetupWizard } from './GoogleOAuthSetupWizard';
import { useToast } from '@/hooks/use-toast';
import { ClassicCorporateTemplate } from '@/components/id-card/templates/ClassicCorporateTemplate';
import { ModernMinimalTemplate } from '@/components/id-card/templates/ModernMinimalTemplate';
import { AcademicTraditionalTemplate } from '@/components/id-card/templates/AcademicTraditionalTemplate';
import { ContemporaryCardTemplate } from '@/components/id-card/templates/ContemporaryCardTemplate';
import { ProfessionalBadgeTemplate } from '@/components/id-card/templates/ProfessionalBadgeTemplate';

const sampleStudent = {
  id: 'STU001',
  name: 'John Doe',
  course: 'DMLT',
  batch: '2023-24',
  phone: '+91 98765 43210',
  admissionDate: '2023-07-01',
  validUpto: '2025-06-30',
  photo: null,
};

const templateComponents = {
  classic_corporate: ClassicCorporateTemplate,
  modern_minimal: ModernMinimalTemplate,
  academic_traditional: AcademicTraditionalTemplate,
  contemporary_card: ContemporaryCardTemplate,
  professional_badge: ProfessionalBadgeTemplate,
};

export function IDCardSettings() {
  const {
    collegeInfo,
    templates,
    loading,
    updateCollegeInfo,
    uploadLogo,
    uploadSignature,
    selectTemplate,
    getSelectedTemplate
  } = useCollegeSettings();

  const { 
    settings: driveSettings, 
    loading: driveLoading, 
    connectGoogleDrive, 
    disconnectGoogleDrive, 
    saveOAuthCredentials,
    getStorageUsage, 
    formatStorageSize 
  } = useGoogleDriveSettings();

  const { toast } = useToast();
  const [uploading, setUploading] = useState<'logo' | 'signature' | null>(null);
  const [driveEmail, setDriveEmail] = useState("");

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading('logo');
    try {
      await uploadLogo(file);
    } catch (error) {
      console.error('Logo upload failed:', error);
    } finally {
      setUploading(null);
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading('signature');
    try {
      await uploadSignature(file);
    } catch (error) {
      console.error('Signature upload failed:', error);
    } finally {
      setUploading(null);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    try {
      await selectTemplate(templateId);
    } catch (error) {
      console.error('Template selection failed:', error);
    }
  };

  const selectedTemplate = getSelectedTemplate();
  const storageUsage = getStorageUsage();

  const handleConnectDrive = async () => {
    if (!driveEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Gmail address",
        variant: "destructive",
      });
      return;
    }

    if (!driveSettings?.google_client_id_encrypted) {
      toast({
        title: "Error",
        description: "OAuth credentials not configured. Please set up Google OAuth first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await connectGoogleDrive(driveEmail.trim(), driveSettings.google_client_id_encrypted);
    } catch (error) {
      console.error('Failed to connect Google Drive:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Google Drive connection",
        variant: "destructive",
      });
    }
  };

  if (loading || driveLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading ID card settings...</p>
      </div>
    );
  }

  // Show error state if no college info and no templates
  if (!collegeInfo && templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">Setup Required</h3>
          <p className="text-muted-foreground max-w-md">
            Unable to load college information or ID card templates. Please ensure you have proper access permissions.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            ID Card Template Selection
          </CardTitle>
          <CardDescription>
            Choose from professional ID card templates for your students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Grid */}
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const TemplateComponent = templateComponents[template.code as keyof typeof templateComponents];
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div key={template.id} className="space-y-3">
                    <div className={`relative border-2 rounded-lg overflow-hidden ${isSelected ? 'border-primary' : 'border-border'} bg-white min-h-[300px] flex items-center justify-center`}>
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 bg-primary text-white rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      
                      {/* Template Preview */}
                      <div className="transform scale-50 origin-top-left w-[200%] h-[200%] overflow-hidden">
                        {TemplateComponent && collegeInfo ? (
                          <TemplateComponent 
                            student={sampleStudent} 
                            college={{
                              name: collegeInfo.name || 'Your College Name',
                              address: collegeInfo.address || 'College Address',
                              logo_url: collegeInfo.logo_url,
                              signature_url: collegeInfo.signature_url,
                              signature_title: collegeInfo.signature_title
                            }} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center space-y-2">
                              <CreditCard className="w-12 h-12 mx-auto opacity-50" />
                              <p className="text-sm">Preview not available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTemplateSelect(template.id)}
                        disabled={isSelected}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          'Select Template'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Templates Available</h3>
                <p className="text-muted-foreground">ID card templates are not configured. Please contact administrator.</p>
              </div>
            </div>
          )}
        </CardContent>
        </Card>

        {/* Google Drive Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Google Drive Integration
            </CardTitle>
            <CardDescription>
              Connect your Google Drive to automatically backup student documents and ID cards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {driveLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading Google Drive settings...</span>
              </div>
            ) : !driveSettings?.oauth_setup_completed ? (
              <GoogleOAuthSetupWizard 
                onSave={saveOAuthCredentials}
                loading={driveLoading}
              />
            ) : driveSettings?.drive_connected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 bg-green-600 rounded-full" />
                  <span className="text-sm font-medium">Connected to {driveSettings.drive_email}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Usage</span>
                    <span>{Math.round(getStorageUsage().percentage)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getStorageUsage().percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatStorageSize(getStorageUsage().used)} used</span>
                    <span>{formatStorageSize(getStorageUsage().total)} total</span>
                  </div>
                </div>
                
                <Button variant="outline" onClick={disconnectGoogleDrive} className="w-full">
                  Disconnect Google Drive
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driveEmail">Gmail Address</Label>
                  <Input
                    id="driveEmail"
                    type="email"
                    placeholder="Enter Gmail address for Google Drive"
                    value={driveEmail}
                    onChange={(e) => setDriveEmail(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleConnectDrive} className="w-full">
                  Connect Google Drive
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* College Branding */}
      <Card>
        <CardHeader>
          <CardTitle>College Branding</CardTitle>
          <CardDescription>
            Upload college logo and authorized signature for ID cards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo-upload">College Logo</Label>
            <div className="flex items-center gap-4">
              {collegeInfo?.logo_url && (
                <img
                  src={collegeInfo.logo_url}
                  alt="College Logo"
                  className="w-16 h-16 object-contain border border-border rounded"
                />
              )}
              <div className="flex-1">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading === 'logo'}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended size: 200x200px, PNG or JPG format
                </p>
              </div>
              {uploading === 'logo' && (
                <Button disabled size="sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </Button>
              )}
            </div>
          </div>

          {/* Signature Upload */}
          <div className="space-y-2">
            <Label htmlFor="signature-upload">Authorized Signature</Label>
            <div className="flex items-center gap-4">
              {collegeInfo?.signature_url && (
                <img
                  src={collegeInfo.signature_url}
                  alt="Authorized Signature"
                  className="w-24 h-12 object-contain border border-border rounded"
                />
              )}
              <div className="flex-1">
                <Input
                  id="signature-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  disabled={uploading === 'signature'}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended size: 300x100px, PNG format with transparent background
                </p>
              </div>
              {uploading === 'signature' && (
                <Button disabled size="sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </Button>
              )}
            </div>
          </div>

          {/* Signature Title */}
          <div className="space-y-2">
            <Label htmlFor="signature-title">Signature Title</Label>
            <Input
              id="signature-title"
              value={collegeInfo?.signature_title || ''}
              onChange={(e) => updateCollegeInfo({ signature_title: e.target.value })}
              placeholder="e.g., Principal, Registrar, Authorized Officer"
            />
          </div>
        </CardContent>
      </Card>

      {/* College Information */}
      <Card>
        <CardHeader>
          <CardTitle>College Information</CardTitle>
          <CardDescription>
            Basic information displayed on ID cards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="college-name">College Name</Label>
              <Input
                id="college-name"
                value={collegeInfo?.name || ''}
                onChange={(e) => updateCollegeInfo({ name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-code">College Code</Label>
              <Input
                id="college-code"
                value={collegeInfo?.code || ''}
                onChange={(e) => updateCollegeInfo({ code: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="college-address">Address</Label>
            <Textarea
              id="college-address"
              value={collegeInfo?.address || ''}
              onChange={(e) => updateCollegeInfo({ address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="college-phone">Phone</Label>
              <Input
                id="college-phone"
                value={collegeInfo?.phone || ''}
                onChange={(e) => updateCollegeInfo({ phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-email">Email</Label>
              <Input
                id="college-email"
                type="email"
                value={collegeInfo?.email || ''}
                onChange={(e) => updateCollegeInfo({ email: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}