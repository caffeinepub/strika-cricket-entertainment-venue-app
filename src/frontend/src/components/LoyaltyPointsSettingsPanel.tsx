import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetAwardPointsForPromotionalBookings,
  useSetAwardPointsForPromotionalBookings,
} from '../hooks/useQueries';

export default function LoyaltyPointsSettingsPanel() {
  const { data: currentSetting, isLoading: loadingSetting } = useGetAwardPointsForPromotionalBookings();
  const setSettingMutation = useSetAwardPointsForPromotionalBookings();

  const [awardPointsEnabled, setAwardPointsEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentSetting !== undefined) {
      setAwardPointsEnabled(currentSetting);
      setHasChanges(false);
    }
  }, [currentSetting]);

  const handleToggleChange = (checked: boolean) => {
    setAwardPointsEnabled(checked);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await setSettingMutation.mutateAsync(awardPointsEnabled);
      toast.success('Loyalty points settings updated successfully');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Error updating loyalty points settings:', error);
      toast.error(error.message || 'Failed to update loyalty points settings');
    }
  };

  if (loadingSetting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Points Settings</CardTitle>
          <CardDescription>Configure loyalty points award rules for bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Points Settings</CardTitle>
        <CardDescription>Configure loyalty points award rules for bookings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Setting */}
        <div className="flex items-start justify-between space-x-4 rounded-lg border border-border p-4 bg-muted/30">
          <div className="flex-1 space-y-1">
            <Label htmlFor="promotional-points" className="text-base font-semibold">
              Award Loyalty Points for Free/Promotional Bookings
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, users will receive loyalty points for all session bookings, including free or
              promotional sessions without payment. When disabled, points are only awarded for paid sessions.
            </p>
          </div>
          <Switch
            id="promotional-points"
            checked={awardPointsEnabled}
            onCheckedChange={handleToggleChange}
            className="mt-1"
          />
        </div>

        {/* Current Status Display */}
        <div className="rounded-lg border border-border p-4 bg-background">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Current Status</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {awardPointsEnabled ? (
              <>
                <span className="font-medium text-foreground">Points are awarded</span> for all bookings,
                including free and promotional sessions.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">Points are only awarded</span> for paid session
                bookings. Free and promotional bookings do not earn points.
              </>
            )}
          </p>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={setSettingMutation.isPending}
              className="gap-2"
            >
              {setSettingMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}

        {/* Information Box */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-semibold text-sm mb-2 text-primary">How This Works</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Points are calculated based on the user's membership tier multiplier</li>
            <li>Changes take effect immediately for new bookings</li>
            <li>Existing bookings are not affected by this setting change</li>
            <li>Points are reflected in the user profile after booking completion</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
