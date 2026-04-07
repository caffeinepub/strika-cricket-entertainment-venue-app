import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGetBusinessContactInfo, useUpdateBusinessContactInfo } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { BusinessContactInfo } from '../backend';

export default function BusinessContactInfoPanel() {
  const { data: contactInfo } = useGetBusinessContactInfo();
  const updateContactInfo = useUpdateBusinessContactInfo();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (contactInfo) {
      setPhone(contactInfo.phone);
      setEmail(contactInfo.email);
      setAddress(contactInfo.address);
      setDescription(contactInfo.description);
    }
  }, [contactInfo]);

  const handleSave = async () => {
    if (!phone.trim() || !email.trim()) {
      toast.error('Phone and email are required');
      return;
    }

    const info: BusinessContactInfo = {
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      description: description.trim(),
    };

    try {
      await updateContactInfo.mutateAsync(info);
      toast.success('Contact information updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update contact information');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Business Contact Information
        </CardTitle>
        <CardDescription>
          Update your business contact details displayed on the venue page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="info@strika.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Physical Address
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="123 Cricket Lane, Sports District, City"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Brief description of your venue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={updateContactInfo.isPending}
          className="w-full sm:w-auto"
        >
          {updateContactInfo.isPending ? 'Saving...' : 'Save Contact Information'}
        </Button>
      </CardContent>
    </Card>
  );
}
