import { useState } from 'react';
import { Zap, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetPointsCategories, useCreatePointsCategory, useUpdatePointsCategory, useDeletePointsCategory } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { PointsCategory } from '../backend';

export default function PointsCategoriesPanel() {
  const { data: categories = [], isLoading } = useGetPointsCategories();
  const createCategory = useCreatePointsCategory();
  const updateCategory = useUpdatePointsCategory();
  const deleteCategory = useDeletePointsCategory();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    multiplier: '1',
    type: 'purchases',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      multiplier: '1',
      type: 'purchases',
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const multiplier = parseInt(formData.multiplier);
    if (isNaN(multiplier) || multiplier < 1) {
      toast.error('Multiplier must be a positive number');
      return;
    }

    const category: PointsCategory = {
      id: `cat-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      multiplier: BigInt(multiplier),
      type: formData.type,
    };

    try {
      await createCategory.mutateAsync(category);
      toast.success('Category created successfully!');
      resetForm();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create category';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) return;

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const multiplier = parseInt(formData.multiplier);
    if (isNaN(multiplier) || multiplier < 1) {
      toast.error('Multiplier must be a positive number');
      return;
    }

    const category: PointsCategory = {
      id: editingId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      multiplier: BigInt(multiplier),
      type: formData.type,
    };

    try {
      await updateCategory.mutateAsync(category);
      toast.success('Category updated successfully!');
      resetForm();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update category';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleEdit = (category: PointsCategory) => {
    setFormData({
      name: category.name,
      description: category.description,
      multiplier: category.multiplier.toString(),
      type: category.type,
    });
    setEditingId(category.id);
    setIsCreating(false);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory.mutateAsync(categoryId);
      toast.success('Category deleted successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete category';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Loading categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Points Earning Categories</CardTitle>
            {!isCreating && !editingId && (
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Configure how users can earn points through different activities
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create/Edit Form */}
          {(isCreating || editingId) && (
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{editingId ? 'Edit Category' : 'New Category'}</h3>
                <Button type="button" variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    placeholder="e.g., Purchases"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryType">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="categoryType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchases">Purchases</SelectItem>
                      <SelectItem value="bookings">Bookings</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="referrals">Referrals</SelectItem>
                      <SelectItem value="reviews">Reviews</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description *</Label>
                <Textarea
                  id="categoryDescription"
                  placeholder="Describe how users earn points in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryMultiplier">Points Multiplier *</Label>
                <Input
                  id="categoryMultiplier"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.multiplier}
                  onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Base multiplier for points earned in this category
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update Category' : 'Create Category'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">{category.name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        {category.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Multiplier: <strong>{category.multiplier.toString()}x</strong>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      disabled={editingId !== null || isCreating}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                      disabled={deleteCategory.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No earning categories configured yet.</p>
                <p className="text-sm">Click "Add Category" to create your first one.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
