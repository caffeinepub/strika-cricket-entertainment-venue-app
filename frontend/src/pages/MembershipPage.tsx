import { Award, Star, Gift, Zap, CreditCard, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetCallerUserProfile, useGetMembershipTiers, useCreateCheckoutSession, useGetPointsCategories } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { ShoppingItem } from '../backend';

export default function MembershipPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: membershipTiers = [] } = useGetMembershipTiers();
  const { data: pointsCategories = [], isLoading: categoriesLoading } = useGetPointsCategories();
  const createCheckout = useCreateCheckoutSession();

  const isAuthenticated = !!identity;

  const handleUpgrade = async (tierId: string, tierName: string, monthlyFee: bigint) => {
    if (!isAuthenticated) {
      toast.error('Please login to upgrade membership');
      return;
    }

    const items: ShoppingItem[] = [
      {
        productName: `${tierName} Membership`,
        productDescription: `Monthly subscription to ${tierName} tier`,
        priceInCents: monthlyFee,
        quantity: BigInt(1),
        currency: 'pkr',
      },
    ];

    try {
      const session = await createCheckout.mutateAsync(items);
      window.location.href = session.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Login Required</h1>
          <p className="text-muted-foreground">
            Please login to view your membership details and loyalty rewards.
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const currentTier = membershipTiers.find((t) => t.id === userProfile?.membershipTier);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Membership & Rewards</h1>
          <p className="text-muted-foreground">Track your loyalty points and unlock exclusive benefits</p>
        </div>

        {/* Digital Membership Card */}
        {userProfile && (
          <Card className="gradient-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/generated/strika-logo-transparent.dim_200x200.png"
                      alt="Strika Logo"
                      className="h-12 w-12"
                    />
                    <div>
                      <div className="text-sm opacity-90">Strika Member</div>
                      <div className="text-2xl font-bold">{userProfile.name}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm opacity-90">Member ID</div>
                    <div className="font-mono text-lg">{userProfile.membershipId}</div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {currentTier?.name || userProfile.membershipTier}
                  </Badge>
                  <div className="space-y-1">
                    <div className="text-sm opacity-90">Loyalty Points</div>
                    <div className="text-3xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-6 h-6" />
                      {userProfile.loyaltyPoints.toString()}
                    </div>
                  </div>
                  {currentTier && (
                    <div className="text-xs opacity-75">
                      {currentTier.rewardMultiplier}x points multiplier
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How to Earn Points - Structured Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading earning categories...</div>
            ) : pointsCategories.length > 0 ? (
              <div className="space-y-6">
                {pointsCategories.map((category) => (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {category.multiplier}x multiplier
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {category.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {currentTier && currentTier.rewardMultiplier > BigInt(1) && (
                  <div className="mt-6 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                    <p className="text-sm">
                      <strong>Your {currentTier.name} tier bonus:</strong> All points earned are multiplied by {currentTier.rewardMultiplier.toString()}x!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No earning categories configured yet. Check back soon!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Membership Tiers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Membership Tiers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {membershipTiers.map((tier) => {
              const isCurrentTier = userProfile?.membershipTier === tier.id;
              return (
                <Card key={tier.id} className={isCurrentTier ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      {isCurrentTier && (
                        <Badge variant="default">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tier.description}
                    </div>
                    <div className="text-lg font-bold text-primary">
                      PKR {(Number(tier.monthlyFee) / 100).toFixed(2)}/month
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Gift className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Benefits</span>
                      </div>
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Star className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 text-secondary" />
                      <span>{tier.rewardMultiplier}x reward points multiplier</span>
                    </div>
                    {!isCurrentTier && (
                      <Button
                        onClick={() => handleUpgrade(tier.id, tier.name, tier.monthlyFee)}
                        disabled={createCheckout.isPending}
                        className="w-full gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        {createCheckout.isPending ? 'Processing...' : 'Upgrade'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {membershipTiers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No membership tiers available yet. Check back soon!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
