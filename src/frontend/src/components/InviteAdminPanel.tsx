import { useState } from 'react';
import { Mail, Phone, MessageCircle, Copy, Link as LinkIcon, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { SiTelegram, SiSlack } from 'react-icons/si';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useGetAdminInvitations, useCreateAdminInvitation } from '../hooks/useQueries';

export default function InviteAdminPanel() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [showWhatsAppHelp, setShowWhatsAppHelp] = useState(false);

  const { data: invitations, isLoading: invitationsLoading } = useGetAdminInvitations();
  const createInvitation = useCreateAdminInvitation();

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const internetIdentityUrl = 'https://identity.ic0.app';
  const adminPanelUrl = `${baseUrl}/admin`;

  const defaultMessage = `You've been invited to become an admin for Strika!

To get started:
1. Set up your Internet Identity at: ${internetIdentityUrl}
2. Log in to the admin panel at: ${adminPanelUrl}
3. Access all admin features and manage the venue

Welcome to the team!`;

  const whatsappMessage = `🏏 *Strika Admin Invitation*

You've been invited to become an admin!

*Getting Started:*
1️⃣ Set up Internet Identity: ${internetIdentityUrl}
2️⃣ Access Admin Panel: ${adminPanelUrl}

Welcome to the team! 🎉`;

  // Enhanced device detection with accurate iPadOS Safari and Chrome detection
  const detectDevice = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    
    // Detect iPadOS (iPadOS 13+ reports as macOS in Safari and Chrome)
    // Check for MacIntel platform with touch support
    const isIPadOS = (platform === 'MacIntel' && navigator.maxTouchPoints > 1) || 
                     /iPad/.test(ua);
    
    // Detect Safari on iPadOS
    const isIPadSafari = isIPadOS && /Safari/.test(ua) && !/Chrome|CriOS|Edg/.test(ua);
    
    // Detect Chrome on iPadOS
    const isIPadChrome = isIPadOS && (/Chrome/.test(ua) || /CriOS/.test(ua));
    
    // Other mobile devices
    const isIPhone = /iPhone/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIPhone || isAndroid || /webOS|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    return {
      isIPadOS,
      isIPadSafari,
      isIPadChrome,
      isIPhone,
      isAndroid,
      isMobile: isMobile || isIPadOS,
      isDesktop: !isMobile && !isIPadOS
    };
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(adminPanelUrl);
    toast.success('Admin panel link copied to clipboard!');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage || defaultMessage);
    toast.success('Message copied to clipboard!');
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      // Create invitation record in backend
      await createInvitation.mutateAsync({
        email: email.trim(),
        phone: '',
        whatsapp: '',
        telegram: '',
        slack: '',
      });

      const subject = encodeURIComponent('Strika - Admin Invitation');
      const body = encodeURIComponent(customMessage || defaultMessage);
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
      
      window.location.href = mailtoLink;
      toast.success('Opening email client...');
      
      // Clear form
      setEmail('');
      setCustomMessage('');
    } catch (error) {
      toast.error('Failed to create invitation');
      console.error(error);
    }
  };

  const handleSendSMS = async () => {
    if (!phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      // Create invitation record in backend
      await createInvitation.mutateAsync({
        email: '',
        phone: phone.trim(),
        whatsapp: '',
        telegram: '',
        slack: '',
      });

      const smsBody = encodeURIComponent(
        `Strika Admin Invite: Set up Internet Identity at ${internetIdentityUrl} then access admin panel at ${adminPanelUrl}`
      );
      const smsLink = `sms:${phone}?body=${smsBody}`;
      
      window.location.href = smsLink;
      toast.success('Opening SMS app...');
      
      // Clear form
      setPhone('');
    } catch (error) {
      toast.error('Failed to create invitation');
      console.error(error);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      // Create invitation record in backend
      await createInvitation.mutateAsync({
        email: '',
        phone: '',
        whatsapp: phone.trim(),
        telegram: '',
        slack: '',
      });

      // Remove non-numeric characters from phone
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Validate phone number format
      if (cleanPhone.length < 10) {
        toast.error('Please enter a valid phone number with country code');
        return;
      }

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(whatsappMessage);
      
      // Detect device type
      const device = detectDevice();
      
      if (device.isIPadOS) {
        // iPadOS-specific handling with deep link and fallback
        toast.success('Opening WhatsApp...');
        
        // Use whatsapp:// deep link to open the app directly
        const appUrl = `whatsapp://send?text=${encodedMessage}&phone=${cleanPhone}`;
        const webUrl = `https://web.whatsapp.com/send?text=${encodedMessage}&phone=${cleanPhone}`;
        
        // Track if we've left the page (app opened successfully)
        let appOpened = false;
        
        // Listen for visibility change to detect if app opened
        const handleVisibilityChange = () => {
          if (document.hidden) {
            appOpened = true;
          }
        };
        
        // Listen for blur event (user switched to WhatsApp app)
        const handleBlur = () => {
          appOpened = true;
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        
        // Try to open WhatsApp app using deep link
        window.location.href = appUrl;
        
        // Set a timeout to check if app opened
        // If still on page after delay, fall back to WhatsApp Web
        setTimeout(() => {
          // Clean up event listeners
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('blur', handleBlur);
          
          // If app didn't open, fall back to WhatsApp Web
          if (!appOpened && document.hasFocus()) {
            // Open WhatsApp Web as fallback
            window.open(webUrl, '_blank', 'noopener,noreferrer');
          }
        }, 2000);
        
      } else if (device.isMobile) {
        // Other mobile devices (iPhone, Android)
        // Use wa.me which handles app detection automatically
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
        
        // Track if we've left the page
        let appOpened = false;
        
        const handleVisibilityChange = () => {
          if (document.hidden) {
            appOpened = true;
          }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Navigate to WhatsApp
        window.location.href = whatsappUrl;
        
        // Check if WhatsApp opened after a delay
        setTimeout(() => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          
          // If still on page, WhatsApp might not be installed
          if (!appOpened && document.hasFocus()) {
            setShowWhatsAppHelp(true);
          }
        }, 2500);
        
        toast.success('Opening WhatsApp...');
      } else {
        // Desktop - open WhatsApp Web in new tab
        const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}&phone=${cleanPhone}`;
        const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        if (whatsappWindow) {
          toast.success('Opening WhatsApp Web...');
        } else {
          // Popup blocked or failed to open
          setShowWhatsAppHelp(true);
        }
      }
      
      // Clear form
      setPhone('');
    } catch (error) {
      toast.error('Failed to create invitation');
      console.error(error);
    }
  };

  const handleCopyForTelegram = () => {
    const telegramMessage = `🏏 Strika Admin Invitation\n\nYou've been invited to become an admin!\n\nGetting Started:\n1. Set up Internet Identity: ${internetIdentityUrl}\n2. Access Admin Panel: ${adminPanelUrl}\n\nWelcome to the team! 🎉`;
    navigator.clipboard.writeText(telegramMessage);
    toast.success('Message copied! Paste it in Telegram');
  };

  const handleCopyForSlack = () => {
    const slackMessage = `*Strika Admin Invitation*\n\nYou've been invited to become an admin!\n\n*Getting Started:*\n1. Set up Internet Identity: ${internetIdentityUrl}\n2. Access Admin Panel: ${adminPanelUrl}\n\nWelcome to the team! :tada:`;
    navigator.clipboard.writeText(slackMessage);
    toast.success('Message copied! Paste it in Slack');
  };

  const handleCopyWhatsAppMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    toast.success('WhatsApp message copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Admin</CardTitle>
          <CardDescription>
            Send admin invitations via email, SMS, or WhatsApp. Recipients will need to set up Internet Identity to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" className="gap-2">
                <Phone className="w-4 h-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailMessage">Message (Optional)</Label>
                <Textarea
                  id="emailMessage"
                  placeholder={defaultMessage}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSendEmail} 
                  className="gap-2"
                  disabled={createInvitation.isPending}
                >
                  <Send className="w-4 h-4" />
                  {createInvitation.isPending ? 'Sending...' : 'Send Email'}
                </Button>
                <Button onClick={handleCopyMessage} variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Message
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US, +44 for UK)
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">SMS Preview:</p>
                <p className="text-sm text-muted-foreground">
                  Strika Admin Invite: Set up Internet Identity at {internetIdentityUrl} then access admin panel at {adminPanelUrl}
                </p>
              </div>
              <Button 
                onClick={handleSendSMS} 
                className="gap-2"
                disabled={createInvitation.isPending}
              >
                <Send className="w-4 h-4" />
                {createInvitation.isPending ? 'Sending...' : 'Send SMS'}
              </Button>
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappPhone">Phone Number</Label>
                <Input
                  id="whatsappPhone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US, +44 for UK, +91 for India)
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">WhatsApp Message Preview:</p>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  🏏 <strong>Strika Admin Invitation</strong>
                  {'\n\n'}You've been invited to become an admin!
                  {'\n\n'}<strong>Getting Started:</strong>
                  {'\n'}1️⃣ Set up Internet Identity: {internetIdentityUrl}
                  {'\n'}2️⃣ Access Admin Panel: {adminPanelUrl}
                  {'\n\n'}Welcome to the team! 🎉
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSendWhatsApp} 
                  className="gap-2"
                  disabled={createInvitation.isPending}
                >
                  <MessageCircle className="w-4 h-4" />
                  {createInvitation.isPending ? 'Sending...' : 'Send via WhatsApp'}
                </Button>
                <Button 
                  onClick={handleCopyWhatsAppMessage} 
                  variant="outline" 
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Message
                </Button>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>On iPad: Opens WhatsApp app directly, falls back to WhatsApp Web if app not installed</li>
                      <li>On iPhone & Android: Opens WhatsApp app with pre-filled message</li>
                      <li>On desktop: Opens WhatsApp Web in a new tab</li>
                      <li>Message and links are preserved across all platforms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Direct Link & Quick Copy</CardTitle>
          <CardDescription>
            Share the admin panel link directly or copy it to send via other channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Admin Panel URL</Label>
            <div className="flex gap-2">
              <Input value={adminPanelUrl} readOnly className="font-mono text-sm" />
              <Button onClick={handleCopyInviteLink} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Internet Identity Setup URL</Label>
            <div className="flex gap-2">
              <Input value={internetIdentityUrl} readOnly className="font-mono text-sm" />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(internetIdentityUrl);
                  toast.success('Internet Identity URL copied!');
                }}
                variant="outline"
                size="icon"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Channels</CardTitle>
          <CardDescription>
            Copy pre-formatted messages for other messaging platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-auto py-4 px-4 justify-start gap-3"
              onClick={handleCopyForTelegram}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0088cc]/10 flex items-center justify-center flex-shrink-0">
                <SiTelegram className="w-5 h-5 text-[#0088cc]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Telegram</p>
                <p className="text-xs text-muted-foreground">Copy message for Telegram</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-4 justify-start gap-3"
              onClick={handleCopyForSlack}
            >
              <div className="w-10 h-10 rounded-lg bg-[#4A154B]/10 flex items-center justify-center flex-shrink-0">
                <SiSlack className="w-5 h-5 text-[#4A154B]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Slack</p>
                <p className="text-xs text-muted-foreground">Copy message for Slack</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-4 justify-start gap-3"
              onClick={handleCopyInviteLink}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Direct Link</p>
                <p className="text-xs text-muted-foreground">Copy admin panel URL</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-4 justify-start gap-3"
              onClick={handleCopyMessage}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Copy className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Full Message</p>
                <p className="text-xs text-muted-foreground">Copy complete invitation</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitation History</CardTitle>
          <CardDescription>
            Track all admin invitations sent from this panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitationsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading invitations...</p>
            </div>
          ) : !invitations || invitations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No invitations sent yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Send your first admin invitation using the forms above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {invitation.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-primary" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        {invitation.email && (
                          <p className="font-medium text-sm truncate">{invitation.email}</p>
                        )}
                        {invitation.phone && (
                          <p className="font-medium text-sm truncate">{invitation.phone}</p>
                        )}
                        {invitation.whatsapp && (
                          <p className="font-medium text-sm truncate">{invitation.whatsapp}</p>
                        )}
                      </div>
                      <Badge variant={invitation.status === 'pending' ? 'secondary' : 'default'}>
                        {invitation.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {invitation.sentChannels.map((channel) => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(Number(invitation.createdAt / BigInt(1000000))).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• New admins must first set up their Internet Identity before accessing the admin panel</p>
          <p>• After logging in with Internet Identity, they will automatically have admin privileges</p>
          <p>• Make sure to only invite trusted individuals as admins have full access to venue management</p>
          <p>• The admin panel URL is: {adminPanelUrl}</p>
          <p>• Internet Identity setup: {internetIdentityUrl}</p>
        </CardContent>
      </Card>

      {/* WhatsApp Help Dialog */}
      <AlertDialog open={showWhatsAppHelp} onOpenChange={setShowWhatsAppHelp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              WhatsApp Not Available
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-left">
              <p>
                WhatsApp doesn't appear to be installed or accessible on this device. Here's how to proceed:
              </p>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground mb-1">On Mobile & iPad:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Install WhatsApp from your app store</li>
                    <li>Set up your account</li>
                    <li>Return here and try again</li>
                  </ol>
                </div>
                
                <div>
                  <p className="font-semibold text-foreground mb-1">On Desktop:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Visit <a href="https://web.whatsapp.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">web.whatsapp.com</a></li>
                    <li>Scan the QR code with your phone</li>
                    <li>Copy the message below and paste it in WhatsApp</li>
                  </ol>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-2">Message to send:</p>
                  <p className="text-xs font-mono whitespace-pre-wrap">{whatsappMessage}</p>
                  <Button 
                    onClick={handleCopyWhatsAppMessage} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full"
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy Message
                  </Button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a 
                href="https://web.whatsapp.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                Open WhatsApp Web
                <LinkIcon className="w-4 h-4" />
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
