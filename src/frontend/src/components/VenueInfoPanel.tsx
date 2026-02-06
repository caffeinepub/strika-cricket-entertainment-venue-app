import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateVenueInfo } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { VenueInfo } from '../backend';

export default function VenueInfoPanel() {
  const updateVenue = useUpdateVenueInfo();

  const [venueName, setVenueName] = useState('Cricket Arena');
  const [venueLocation, setVenueLocation] = useState('');
  const [venueHours, setVenueHours] = useState('');

  const handleUpdateVenue = async (e: React.FormEvent) => {
    e.preventDefault();

    const info: VenueInfo = {
      name: venueName.trim(),
      location: venueLocation.trim(),
      hours: venueHours.trim(),
      facilities: [],
      rules: [],
      faqs: [],
    };

    try {
      await updateVenue.mutateAsync(info);
      toast.success('Venue information updated!');
    } catch (error) {
      toast.error('Failed to update venue info');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Update Venue Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateVenue} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venueName">Venue Name</Label>
            <Input
              id="venueName"
              placeholder="Cricket Arena"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueLocation">Location</Label>
            <Input
              id="venueLocation"
              placeholder="123 Cricket Lane, Lahore, Pakistan"
              value={venueLocation}
              onChange={(e) => setVenueLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueHours">Operating Hours</Label>
            <Input
              id="venueHours"
              placeholder="Monday - Sunday: 8:00 AM - 10:00 PM"
              value={venueHours}
              onChange={(e) => setVenueHours(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={updateVenue.isPending}>
            {updateVenue.isPending ? 'Updating...' : 'Update Venue Info'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
