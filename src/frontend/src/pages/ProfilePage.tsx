import { User, Calendar, ShoppingBag, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetCallerUserProfile, useGetMyBookings, useGetMyOrders } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import type { Time } from '../backend';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: bookings = [] } = useGetMyBookings();
  const { data: orders = [] } = useGetMyOrders();

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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Login Required</h1>
          <p className="text-muted-foreground">
            Please login to view your profile and activity history.
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-4xl font-bold text-primary-foreground">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className="gap-2">
                    <Award className="w-4 h-4" />
                    {userProfile.membershipTier} Member
                  </Badge>
                  <Badge variant="outline">{userProfile.loyaltyPoints.toString()} Points</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="w-4 h-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              My Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-lg bg-muted/30"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{formatTime(booking.timeSlot)}</div>
                          <div className="text-sm text-muted-foreground">
                            Duration: 30 minutes
                          </div>
                          <div className="text-sm text-muted-foreground">Booking ID: {booking.id}</div>
                        </div>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                    <p className="text-muted-foreground mb-4">Start booking sessions to see them here</p>
                    <Button onClick={() => navigate({ to: '/booking' })}>
                      Book a Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-lg bg-muted/30"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">Order #{order.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} items • ${(Number(order.totalAmount) / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(order.createdAt)}
                          </div>
                        </div>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                    <Button onClick={() => navigate({ to: '/store' })}>
                      Visit Store
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
