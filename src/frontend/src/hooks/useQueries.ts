import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  Booking,
  Product,
  Order,
  LeaderboardEntry,
  Review,
  VenueInfo,
  ShoppingItem,
  StripeConfiguration,
  AdminInvitation,
  Notification,
  Time,
  MembershipTier,
  PointsCategory,
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Membership Tier Queries
export function useGetMembershipTiers() {
  const { actor, isFetching } = useActor();

  return useQuery<MembershipTier[]>({
    queryKey: ['membershipTiers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMembershipTiers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMembershipTier() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tier: MembershipTier): Promise<string> => {
      if (!actor) throw new Error('Actor not available');
      const tierId = await actor.createMembershipTier(tier);
      return tierId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipTiers'] });
      queryClient.refetchQueries({ queryKey: ['membershipTiers'] });
    },
    onError: (error: any) => {
      console.error('Error creating membership tier:', error);
      throw error;
    },
  });
}

export function useUpdateMembershipTier() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tier: MembershipTier) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateMembershipTier(tier);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipTiers'] });
      queryClient.refetchQueries({ queryKey: ['membershipTiers'] });
    },
    onError: (error: any) => {
      console.error('Error updating membership tier:', error);
      throw error;
    },
  });
}

export function useDeleteMembershipTier() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tierId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteMembershipTier(tierId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipTiers'] });
      queryClient.refetchQueries({ queryKey: ['membershipTiers'] });
    },
    onError: (error: any) => {
      console.error('Error deleting membership tier:', error);
      throw error;
    },
  });
}

// Points Categories Queries
export function useGetPointsCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<PointsCategory[]>({
    queryKey: ['pointsCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPointsCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePointsCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: PointsCategory): Promise<string> => {
      if (!actor) throw new Error('Actor not available');
      const categoryId = await actor.createPointsCategory(category);
      return categoryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointsCategories'] });
      queryClient.refetchQueries({ queryKey: ['pointsCategories'] });
    },
    onError: (error: any) => {
      console.error('Error creating points category:', error);
      throw error;
    },
  });
}

export function useUpdatePointsCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: PointsCategory) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updatePointsCategory(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointsCategories'] });
      queryClient.refetchQueries({ queryKey: ['pointsCategories'] });
    },
    onError: (error: any) => {
      console.error('Error updating points category:', error);
      throw error;
    },
  });
}

export function useDeletePointsCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deletePointsCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointsCategories'] });
      queryClient.refetchQueries({ queryKey: ['pointsCategories'] });
    },
    onError: (error: any) => {
      console.error('Error deleting points category:', error);
      throw error;
    },
  });
}

// Points Guide Queries
export function useGetPointsGuide() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['pointsGuide'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getPointsGuide();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdatePointsGuide() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGuide: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updatePointsGuide(newGuide);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointsGuide'] });
      queryClient.refetchQueries({ queryKey: ['pointsGuide'] });
    },
    onError: (error: any) => {
      console.error('Error updating points guide:', error);
      throw error;
    },
  });
}

// Loyalty Points Settings Queries
export function useGetAwardPointsForPromotionalBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['awardPointsForPromotionalBookings'],
    queryFn: async () => {
      if (!actor) return true;
      return actor.getAwardPointsForPromotionalBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAwardPointsForPromotionalBookings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: boolean) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setAwardPointsForPromotionalBookings(value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awardPointsForPromotionalBookings'] });
      queryClient.refetchQueries({ queryKey: ['awardPointsForPromotionalBookings'] });
    },
    onError: (error: any) => {
      console.error('Error updating promotional booking points setting:', error);
      throw error;
    },
  });
}

// Booking Queries
export function useGetMyBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['myBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableTimeSlots() {
  const { actor, isFetching } = useActor();

  return useQuery<Time[]>({
    queryKey: ['availableTimeSlots'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableTimeSlots();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timeSlot: Time) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(timeSlot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['availableTimeSlots'] });
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Product Queries
export function useGetProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Order Queries
export function useGetMyOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, totalAmount }: { items: string[]; totalAmount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(items, totalAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Leaderboard Queries
export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

// Review Queries
export function useGetReviews() {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rating, comment }: { rating: bigint; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReview(rating, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

// Venue Info Queries
export function useGetVenueInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<VenueInfo | null>({
    queryKey: ['venueInfo'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVenueInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateVenueInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (info: VenueInfo) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateVenueInfo(info);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venueInfo'] });
    },
  });
}

// Stripe Queries
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Admin Invitation Queries
export function useGetAdminInvitations() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminInvitation[]>({
    queryKey: ['adminInvitations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAdminInvitations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAdminInvitation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      phone,
      whatsapp,
      telegram,
      slack,
    }: {
      email: string;
      phone: string;
      whatsapp: string;
      telegram: string;
      slack: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAdminInvitation(email, phone, whatsapp, telegram, slack);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInvitations'] });
    },
  });
}

// Notification Queries
export function useGetMyNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['myNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetUnreadNotificationCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['unreadNotificationCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

export function useDeleteNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

export function useDeleteAllNotifications() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteAllNotifications();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}
