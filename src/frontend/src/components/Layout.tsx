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
                className="h-8 w-8 sm:h-10 sm:w-10" 
              />
              <span className="text-base sm:text-xl font-bold text-gradient hidden md:inline">
                Strika
              </span>
            </button>

            {/* Desktop Navigation - Show on larger screens with proper spacing */}
            <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center max-w-4xl mx-4">
              {navItems.map((item) => (
                <NavLink key={item.path} {...item} />
              ))}
              {isAuthenticated && (
                <NavLink path="/profile" label="Profile" icon={User} />
              )}
              {showAdminButton && (
                <NavLink path="/admin" label="Admin" icon={Shield} />
              )}
            </nav>

            {/* Auth Button, Notification Center & Mobile Menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthenticated && <NotificationCenter />}
              <Button
                onClick={handleAuth}
                disabled={disabled}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
                className="hidden sm:flex"
              >
                {buttonText}
              </Button>

              {/* Mobile Menu - Show on tablets and smaller */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="xl:hidden flex-shrink-0">
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <div className="flex flex-col gap-4 mt-8">
                    <Button
                      onClick={handleAuth}
                      disabled={disabled}
                      variant={isAuthenticated ? 'outline' : 'default'}
                      className="w-full"
                    >
                      {buttonText}
                    </Button>
                    <nav className="flex flex-col gap-2">
                      {navItems.map((item) => (
                        <NavLink key={item.path} {...item} onClick={() => setMobileMenuOpen(false)} />
                      ))}
                      {isAuthenticated && (
                        <NavLink path="/profile" label="Profile" icon={User} onClick={() => setMobileMenuOpen(false)} />
                      )}
                      {showAdminButton && (
                        <NavLink path="/admin" label="Admin" icon={Shield} onClick={() => setMobileMenuOpen(false)} />
                      )}
                    </nav>
                  </div>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2025. Built with</span>
              <span className="text-destructive">❤</span>
              <span>using</span>
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <button onClick={() => navigate({ to: '/venue' })} className="hover:text-foreground transition-colors">
                Contact
              </button>
              <button onClick={() => navigate({ to: '/venue' })} className="hover:text-foreground transition-colors">
                FAQs
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
