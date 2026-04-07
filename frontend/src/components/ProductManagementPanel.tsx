import { useState } from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAddProduct } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Product } from '../backend';

export default function ProductManagementPanel() {
  const addProduct = useAddProduct();

  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStock, setProductStock] = useState('');

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim() || !productPrice || !productCategory.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      name: productName.trim(),
      description: productDesc.trim(),
      price: BigInt(Math.round(parseFloat(productPrice) * 100)),
      category: productCategory.trim(),
      stock: BigInt(productStock || '0'),
    };

    try {
      await addProduct.mutateAsync(product);
      toast.success('Product added successfully!');
      setProductName('');
      setProductDesc('');
      setProductPrice('');
      setProductCategory('');
      setProductStock('');
    } catch (error) {
      toast.error('Failed to add product');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Add New Product
        </CardTitle>
        <p className="text-sm text-muted-foreground">Prices are in Pakistani Rupees (PKR)</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                placeholder="Cricket Bat"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productCategory">Category *</Label>
              <Input
                id="productCategory"
                placeholder="Equipment"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="productDesc">Description</Label>
            <Textarea
              id="productDesc"
              placeholder="Product description..."
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productPrice">Price (PKR) *</Label>
              <Input
                id="productPrice"
                type="number"
                step="0.01"
                placeholder="2999.00"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productStock">Stock Quantity</Label>
              <Input
                id="productStock"
                type="number"
                placeholder="10"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={addProduct.isPending}>
            {addProduct.isPending ? 'Adding...' : 'Add Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
