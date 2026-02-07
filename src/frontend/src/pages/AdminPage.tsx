import { Shield, Settings, Package, Info, UserPlus, Award, Zap, ToggleLeft, Calendar, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import InviteAdminPanel from '../components/InviteAdminPanel';
import MembershipManagementPanel from '../components/MembershipManagementPanel';
import PointsCategoriesPanel from '../components/PointsCategoriesPanel';
import LoyaltyPointsSettingsPanel from '../components/LoyaltyPointsSettingsPanel';
import StripeConfigPanel from '../components/StripeConfigPanel';
import ProductManagementPanel from '../components/ProductManagementPanel';
import VenueInfoPanel from '../components/VenueInfoPanel';
import AvailabilityManagementPanel from '../components/AvailabilityManagementPanel';
import BookingExtensionsPanel from '../components/BookingExtensionsPanel';
import BusinessContactInfoPanel from '../components/BusinessContactInfoPanel';

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage venue settings and content</p>
          </div>
        </div>

        <Tabs defaultValue="membership" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1">
            <TabsTrigger value="membership" className="gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Membership</span>
              <span className="sm:hidden">Tiers</span>
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Points</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty-settings" className="gap-2">
              <ToggleLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Slots</span>
            </TabsTrigger>
            <TabsTrigger value="extensions" className="gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Extend</span>
            </TabsTrigger>
            <TabsTrigger value="invite" className="gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Invite</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Stripe</span>
              <span className="sm:hidden">Pay</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">Shop</span>
            </TabsTrigger>
            <TabsTrigger value="venue" className="gap-2">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Venue</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="membership">
            <MembershipManagementPanel />
          </TabsContent>

          <TabsContent value="points">
            <PointsCategoriesPanel />
          </TabsContent>

          <TabsContent value="loyalty-settings">
            <LoyaltyPointsSettingsPanel />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityManagementPanel />
          </TabsContent>

          <TabsContent value="extensions">
            <BookingExtensionsPanel />
          </TabsContent>

          <TabsContent value="invite">
            <InviteAdminPanel />
          </TabsContent>

          <TabsContent value="stripe">
            <StripeConfigPanel />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagementPanel />
          </TabsContent>

          <TabsContent value="venue">
            <div className="space-y-6">
              <VenueInfoPanel />
              <BusinessContactInfoPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
