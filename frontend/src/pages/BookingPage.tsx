import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAvailableTimeSlots, useCreateBooking, useGetMyBookings, useGetCallerUserProfile, useGetAwardPointsForPromotionalBookings, useGetMembershipTiers, useGetPointsCategories } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { Time } from '../backend';

export default function BookingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: timeSlots = [] } = useGetAvailableTimeSlots();
  const { data: myBookings = [] } = useGetMyBookings();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: awardPointsEnabled } = useGetAwardPointsForPromotionalBookings();
  const { data: membershipTiers = [] } = useGetMembershipTiers();
  const { data: pointsCategories = [] } = useGetPointsCategories();
  const createBooking = useCreateBooking();
  const [selectedSlot, setSelectedSlot] = useState<Time | null>(null);

  const isAuthenticated = !!identity;

  const formatTime = (timestamp: Time) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculatePointsToAward = () => {
    if (!awardPointsEnabled || !userProfile) return 0;

    const userTier = membershipTiers.find(tier => tier.id === userProfile.membershipTier);
    const tierMultiplier = userTier ? Number(userTier.rewardMultiplier) : 1;

    const bookingCategory = pointsCategories.find(cat => cat.id === 'booking');
    const categoryMultiplier = bookingCategory ? Number(bookingCategory.multiplier) : 1;

    return 10 * tierMultiplier * categoryMultiplier;
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a session');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    const pointsToAward = calculatePointsToAward();

    try {
      await createBooking.mutateAsync(selectedSlot);
      
      if (awardPointsEnabled && pointsToAward > 0) {
        toast.success(
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Session booked successfully!</div>
              <div className="text-sm text-muted-foreground mt-1">
                You earned {pointsToAward} loyalty points for this booking
              </div>
            </div>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.success('Session booked successfully!');
      }
      
      setSelectedSlot(null);
    } catch (error) {
      toast.error('Failed to book session');
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CalendarIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Login Required</h1>
          <p className="text-muted-foreground">
            Please login to book cricket sessions and manage your reservations.
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Book a Session</h1>
          <p className="text-muted-foreground">Select your preferred time slot and reserve your cricket session</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Slots */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Available Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.startTime.toString()}
                      onClick={() => setSelectedSlot(slot.startTime)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedSlot?.toString() === slot.startTime.toString()
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{formatTime(slot.startTime)}</div>
                      <div className="text-sm text-muted-foreground mt-1">30 minute session</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSlot ? (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Selected Time</div>
                      <div className="font-medium">{formatTime(selectedSlot)}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-medium">30 minutes</div>
                    </div>
                    
                    {/* Points Preview */}
                    {awardPointsEnabled && calculatePointsToAward() > 0 && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="font-medium text-primary">
                            Earn {calculatePointsToAward()} loyalty points
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleBooking}
                      disabled={createBooking.isPending}
                      className="w-full"
                    >
                      {createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select a time slot to continue
                  </p>
                )}
              </CardContent>
            </Card>

            {/* My Bookings */}
            {myBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    My Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <div className="text-sm font-medium">{formatTime(booking.timeSlot)}</div>
                        <div className="text-xs text-muted-foreground capitalize">{booking.status}</div>
                      </div>
                    ))}
                    {myBookings.length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate({ to: '/profile' })}>
                        View All Bookings
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
