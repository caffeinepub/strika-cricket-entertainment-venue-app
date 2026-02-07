import { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useExtendBooking15Minutes } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function BookingExtensionsPanel() {
  const extendBooking = useExtendBooking15Minutes();
  const [bookingId, setBookingId] = useState('');

  const handleExtend = async () => {
    if (!bookingId.trim()) {
      toast.error('Please enter a booking ID');
      return;
    }

    try {
      await extendBooking.mutateAsync(bookingId.trim());
      toast.success('Booking extended by 15 minutes successfully');
      setBookingId('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to extend booking';
      if (errorMessage.includes('not found')) {
        toast.error('Booking not found. Please check the booking ID.');
      } else if (errorMessage.includes('already booked')) {
        toast.error('Cannot extend: The following time segment is already booked.');
      } else {
        toast.error(errorMessage);
      }
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Extend Booking
        </CardTitle>
        <CardDescription>
          Add a 15-minute extension to an active booking (staff only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bookingId">Booking ID</Label>
          <Input
            id="bookingId"
            type="text"
            placeholder="Enter booking ID (e.g., booking-123456)"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />
        </div>
        <Button
          onClick={handleExtend}
          disabled={extendBooking.isPending}
          className="w-full sm:w-auto gap-2"
        >
          <Plus className="w-4 h-4" />
          {extendBooking.isPending ? 'Extending...' : 'Extend by 15 Minutes'}
        </Button>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Extensions can only be applied if the immediately following 15-minute time segment is not already booked. The booking duration will be extended from 30 minutes to 45 minutes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
