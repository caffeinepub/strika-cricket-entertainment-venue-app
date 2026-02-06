import { useState } from 'react';
import { ShoppingCart, Plus, Minus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetProducts, useCreateCheckoutSession } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { Product, ShoppingItem } from '../backend';

type CartItem = {
  product: Product;
  quantity: number;
};

export default function StorePage() {
  const { identity } = useInternetIdentity();
  const { data: products = [] } = useGetProducts();
  const createCheckout = useCreateCheckoutSession();
  const [cart, setCart] = useState<CartItem[]>([]);

  const isAuthenticated = !!identity;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success('Added to cart');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const items: ShoppingItem[] = cart.map((item) => ({
      productName: item.product.name,
      productDescription: item.product.description,
      priceInCents: item.product.price,
      quantity: BigInt(item.quantity),
      currency: 'pkr',
    }));

    try {
      const session = await createCheckout.mutateAsync(items);
      window.location.href = session.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error(error);
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Store</h1>
            <p className="text-muted-foreground">Browse cricket gear, equipment, and refreshments</p>
          </div>
          {cart.length > 0 && (
            <Card className="w-full sm:w-auto">
              <CardContent className="p-4 flex items-center gap-4">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-semibold">PKR {(cartTotal / 100).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{cart.length} items</div>
                </div>
                <Button onClick={handleCheckout} disabled={createCheckout.isPending} className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  {createCheckout.isPending ? 'Processing...' : 'Checkout'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Products by Category */}
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-bold capitalize">{category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products
                .filter((p) => p.category === category)
                .map((product) => {
                  const cartItem = cart.find((item) => item.product.id === product.id);
                  return (
                    <Card key={product.id} className="flex flex-col">
                      <CardHeader>
                        <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                          <img
                            src="/assets/generated/cricket-equipment.dim_400x300.jpg"
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </CardHeader>
                      <CardFooter className="mt-auto flex-col gap-3">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-2xl font-bold text-primary">
                            PKR {(Number(product.price) / 100).toFixed(2)}
                          </span>
                          <Badge variant={Number(product.stock) > 0 ? 'default' : 'secondary'}>
                            {Number(product.stock) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </Badge>
                        </div>
                        {cartItem ? (
                          <div className="flex items-center gap-2 w-full">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(product.id, -1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="flex-1 text-center font-medium">{cartItem.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(product.id, 1)}
                              disabled={cartItem.quantity >= Number(product.stock)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(product)}
                            disabled={Number(product.stock) === 0}
                            className="w-full"
                          >
                            Add to Cart
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
            <p className="text-muted-foreground">Check back soon for new items!</p>
          </div>
        )}
      </div>
    </div>
  );
}
