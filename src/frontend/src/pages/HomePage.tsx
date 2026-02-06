import { useNavigate } from '@tanstack/react-router';
import { Calendar, ShoppingBag, Award, Trophy, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetReviews } from '../hooks/useQueries';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: reviews = [] } = useGetReviews();

  const features = [
    {
      icon: Calendar,
      title: 'Book Sessions',
      description: 'Reserve your cricket play time with our easy booking system',
      action: () => navigate({ to: '/booking' }),
      color: 'text-primary',
    },
    {
      icon: ShoppingBag,
      title: 'Shop Merchandise',
      description: 'Browse cricket gear, equipment, and refreshments',
      action: () => navigate({ to: '/store' }),
      color: 'text-secondary',
    },
    {
      icon: Award,
      title: 'Membership Benefits',
      description: 'Join our loyalty program and earn exclusive rewards',
      action: () => navigate({ to: '/membership' }),
      color: 'text-accent',
    },
    {
      icon: Trophy,
      title: 'Leaderboard',
      description: 'Compete with other players and climb the rankings',
      action: () => navigate({ to: '/leaderboard' }),
      color: 'text-primary',
    },
  ];

  const topReviews = reviews.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Welcome to <span className="text-gradient">Strika</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Experience the thrill of cricket in our state-of-the-art entertainment venue. Book sessions, compete with friends, and enjoy premium facilities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate({ to: '/booking' })} className="gap-2">
                  Book Now <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/venue' })}>
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/venue-exterior.dim_800x600.jpg"
                alt="Strika Venue"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for an amazing cricket experience
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={feature.action}>
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                  <Button variant="ghost" className="w-full justify-between group">
                    Explore
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {topReviews.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Players Say</h2>
              <p className="text-lg text-muted-foreground">Real experiences from our community</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {topReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: Number(review.rating) }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">"{review.comment}"</p>
                    <p className="text-sm font-medium">- Cricket Enthusiast</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => navigate({ to: '/reviews' })}>
                View All Reviews
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join our cricket community today and experience world-class facilities with exclusive membership benefits
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate({ to: '/booking' })}>
              Book Your Session
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate({ to: '/membership' })}>
              Become a Member
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
