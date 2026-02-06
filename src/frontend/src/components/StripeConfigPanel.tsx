import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { StripeConfiguration } from '../backend';

export default function StripeConfigPanel() {
  const { data: stripeConfigured } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();

  const [stripeKey, setStripeKey] = useState('');
  const [allowedCountries, setAllowedCountries] = useState('PK');

  const handleStripeSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripeKey.trim()) {
      toast.error('Please enter Stripe secret key');
      return;
    }

    const config: StripeConfiguration = {
      secretKey: stripeKey.trim(),
      allowedCountries: allowedCountries.split(',').map((c) => c.trim()),
    };

    try {
      await setStripeConfig.mutateAsync(config);
      toast.success('Stripe configured successfully for PKR payments!');
      setStripeKey('');
    } catch (error) {
      toast.error('Failed to configure Stripe');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Stripe Configuration (PKR)
        </CardTitle>
        {stripeConfigured && (
          <p className="text-sm text-muted-foreground">✓ Stripe is configured for Pakistani Rupees (PKR)</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStripeSetup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripeKey">Stripe Secret Key</Label>
            <Input
              id="stripeKey"
              type="password"
              placeholder="sk_test_..."
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="countries"
              placeholder="PK"
              value={allowedCountries}
              onChange={(e) => setAllowedCountries(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Default: PK (Pakistan). Add more countries if needed.
            </p>
          </div>
          <Button type="submit" disabled={setStripeConfig.isPending}>
            {setStripeConfig.isPending ? 'Configuring...' : 'Configure Stripe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
