import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu, Home, Calendar, ShoppingBag, Award, Trophy, User, Info, MessageSquare, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';
import NotificationCenter from './NotificationCenter';

export default function Layout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: isAdmin, isLoading: isAdminLoading, refetch: refetchAdminStatus } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  // Refetch admin status when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isAdminLoading) {
      refetchAdminStatus();
    }
  }, [isAuthenticated, refetchAdminStatus, isAdminLoading]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
        // Refetch admin status after successful login
        setTimeout(() => {
          refetchAdminStatus();
        }, 500);
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/booking', label: 'Book Session', icon: Calendar },
    { path: '/store', label: 'Store', icon: ShoppingBag },
    { path: '/membership', label: 'Membership', icon: Award },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/venue', label: 'Venue Info', icon: Info },
    { path: '/reviews', label: 'Reviews', icon: MessageSquare },
  ];

  const NavLink = ({ path, label, icon: Icon, onClick }: { path: string; label: string; icon: any; onClick?: () => void }) => {
    const isActive = currentPath === path;
    return (
      <button
        onClick={() => {
          navigate({ to: path });
          onClick?.();
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
          isActive
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-foreground hover:bg-muted'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">{label}</span>
      </button>
    );
  };

  // Show admin button if user is authenticated and admin status is confirmed
  const showAdminButton = isAuthenticated && isAdmin === true;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Logo - Responsive sizing */}
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <img
                src="/assets/generated/strika-logo-transparent.dim_200x200.png"
                alt="Strika Logo"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="text-xl sm:text-2xl font-bold gradient-text">Strika</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => (
                <NavLink key={item.path} {...item} />
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Notification Center - Only show when authenticated */}
              {isAuthenticated && <NotificationCenter />}

              {/* Admin Button - Only show when authenticated and admin */}
              {showAdminButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: '/admin' })}
                  className="hidden sm:flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden md:inline">Admin</span>
                </Button>
              )}

              {/* Profile Button - Only show when authenticated */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/profile' })}
                  className="hidden sm:flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Profile</span>
                </Button>
              )}

              {/* Auth Button */}
              <Button
                onClick={handleAuth}
                disabled={disabled}
                size="sm"
                variant={isAuthenticated ? 'outline' : 'default'}
                className="hidden sm:flex"
              >
                {buttonText}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <nav className="flex flex-col gap-2 mt-8">
                    {navItems.map((item) => (
                      <NavLink key={item.path} {...item} onClick={() => setMobileMenuOpen(false)} />
                    ))}
                    {isAuthenticated && (
                      <NavLink
                        path="/profile"
                        label="Profile"
                        icon={User}
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    )}
                    {showAdminButton && (
                      <NavLink
                        path="/admin"
                        label="Admin Panel"
                        icon={Shield}
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    )}
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        onClick={() => {
                          handleAuth();
                          setMobileMenuOpen(false);
                        }}
                        disabled={disabled}
                        variant={isAuthenticated ? 'outline' : 'default'}
                        className="w-full"
                      >
                        {buttonText}
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/generated/strika-logo-transparent.dim_200x200.png"
                  alt="Strika Logo"
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold gradient-text">Strika</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your premier cricket training facility
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Quick Links</h3>
              <div className="flex flex-col gap-2 text-sm">
                <button onClick={() => navigate({ to: '/booking' })} className="text-muted-foreground hover:text-foreground text-left">
                  Book a Session
                </button>
                <button onClick={() => navigate({ to: '/membership' })} className="text-muted-foreground hover:text-foreground text-left">
                  Membership
                </button>
                <button onClick={() => navigate({ to: '/venue' })} className="text-muted-foreground hover:text-foreground text-left">
                  Venue Info
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Contact</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Visit our venue page for contact details</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © 2026. Built with ❤️ using{' '}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
