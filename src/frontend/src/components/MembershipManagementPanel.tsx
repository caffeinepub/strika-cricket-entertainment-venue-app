import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  useGetMembershipTiers,
  useCreateMembershipTier,
  useUpdateMembershipTier,
  useDeleteMembershipTier,
} from '../hooks/useQueries';
import { toast } from 'sonner';
import type { MembershipTier } from '../backend';

export default function MembershipManagementPanel() {
  const { data: tiers = [], isLoading: tiersLoading } = useGetMembershipTiers();
  const createTier = useCreateMembershipTier();
  const updateTier = useUpdateMembershipTier();
  const deleteTier = useDeleteMembershipTier();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    monthlyFee: '',
    benefits: '',
    rewardMultiplier: '',
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      monthlyFee: '',
      benefits: '',
      rewardMultiplier: '',
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      monthlyFee: '',
      benefits: '',
      rewardMultiplier: '',
    });
  };

  const handleEdit = (tier: MembershipTier) => {
    setEditingId(tier.id);
    setIsCreating(false);
    setFormData({
      id: tier.id,
      name: tier.name,
      description: tier.description,
      monthlyFee: (Number(tier.monthlyFee) / 100).toString(),
      benefits: tier.benefits.join('\n'),
      rewardMultiplier: tier.rewardMultiplier.toString(),
    });
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Please enter a tier name');
      return;
    }

    if (!formData.monthlyFee || formData.monthlyFee.trim() === '') {
      toast.error('Please enter a monthly fee');
      return;
    }

    const monthlyFeeNum = parseFloat(formData.monthlyFee);
    if (isNaN(monthlyFeeNum) || monthlyFeeNum < 0) {
      toast.error('Please enter a valid monthly fee (must be a positive number)');
      return;
    }

    if (!formData.rewardMultiplier || formData.rewardMultiplier.trim() === '') {
      toast.error('Please enter a reward multiplier');
      return;
    }

    const multiplierNum = parseInt(formData.rewardMultiplier);
    if (isNaN(multiplierNum) || multiplierNum < 1) {
      toast.error('Please enter a valid reward multiplier (must be at least 1)');
      return;
    }

    // Parse benefits
    const benefitsList = formData.benefits
      .split('\n')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    // Create tier object with proper ID generation for new tiers
    const tier: MembershipTier = {
      id: isCreating ? `tier-${Date.now()}` : formData.id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      monthlyFee: BigInt(Math.round(monthlyFeeNum * 100)),
      benefits: benefitsList,
      rewardMultiplier: BigInt(multiplierNum),
    };

    try {
      if (isCreating) {
        const tierId = await createTier.mutateAsync(tier);
        toast.success('Tier created successfully!');
        console.log('Created tier with ID:', tierId);
      } else {
        await updateTier.mutateAsync(tier);
        toast.success('Tier updated successfully!');
      }
      resetForm();
    } catch (error: any) {
      console.error('Error saving membership tier:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to save membership tier';
      
      if (error?.message) {
        if (error.message.includes('Unauthorized')) {
          errorMessage = 'Unauthorized: Only admins can manage membership tiers';
        } else if (error.message.includes('Actor not available')) {
          errorMessage = 'Connection error: Please try again';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this membership tier?')) {
      return;
    }

    try {
      await deleteTier.mutateAsync(tierId);
      toast.success('Tier deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting membership tier:', error);
      
      let errorMessage = 'Failed to delete membership tier';
      
      if (error?.message) {
        if (error.message.includes('Unauthorized')) {
          errorMessage = 'Unauthorized: Only admins can delete membership tiers';
        } else if (error.message.includes('Actor not available')) {
          errorMessage = 'Connection error: Please try again';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const isSaving = createTier.isPending || updateTier.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Membership Tiers</CardTitle>
            {!isCreating && !editingId && (
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Tier
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create/Edit Form */}
          {(isCreating || editingId) && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isCreating ? 'Create New Tier' : 'Edit Tier'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tierName">Tier Name *</Label>
                    <Input
                      id="tierName"
                      placeholder="Silver"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyFee">Monthly Fee (PKR) *</Label>
                    <Input
                      id="monthlyFee"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="999.00"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Premium membership with exclusive benefits"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits (one per line)</Label>
                  <Textarea
                    id="benefits"
                    placeholder="10% discount on store items&#10;Priority booking&#10;Free equipment rental"
                    rows={5}
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="multiplier">Reward Points Multiplier *</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="2"
                    value={formData.rewardMultiplier}
                    onChange={(e) => setFormData({ ...formData, rewardMultiplier: e.target.value })}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Members earn points multiplied by this value (e.g., 2x means double points)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    onClick={resetForm} 
                    variant="outline" 
                    className="gap-2"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Tiers List */}
          <div className="space-y-4">
            {tiersLoading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading tiers...</p>
              </div>
            )}
            
            {!tiersLoading && tiers.map((tier) => (
              <Card key={tier.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{tier.name}</h3>
                        <Badge variant="secondary">
                          PKR {(Number(tier.monthlyFee) / 100).toFixed(2)}/month
                        </Badge>
                        <Badge variant="outline">{tier.rewardMultiplier.toString()}x points</Badge>
                      </div>
                      {tier.description && (
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      )}
                      {tier.benefits.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">Benefits:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {tier.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm text-muted-foreground">
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(tier)}
                        variant="outline"
                        size="icon"
                        disabled={isCreating || editingId !== null}
                        title="Edit tier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(tier.id)}
                        variant="outline"
                        size="icon"
                        disabled={deleteTier.isPending || isCreating || editingId !== null}
                        title="Delete tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {!tiersLoading && tiers.length === 0 && !isCreating && (
              <div className="text-center py-8 text-muted-foreground">
                No membership tiers created yet. Click "Create Tier" to add one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
