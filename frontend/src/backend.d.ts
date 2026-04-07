import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface LeaderboardEntry {
    rank: bigint;
    user: Principal;
    score: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface PointsCategory {
    id: string;
    multiplier: bigint;
    name: string;
    type: string;
    description: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface VenueInfo {
    hours: string;
    faqs: Array<string>;
    name: string;
    facilities: Array<string>;
    location: string;
    rules: Array<string>;
}
export interface BusinessContactInfo {
    description: string;
    email: string;
    address: string;
    phone: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Booking {
    id: string;
    status: string;
    createdAt: Time;
    user: Principal;
    timeSlot: Time;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface MembershipTier {
    id: string;
    name: string;
    description: string;
    benefits: Array<string>;
    monthlyFee: bigint;
    rewardMultiplier: bigint;
}
export interface FileReference {
    id: string;
    blob: ExternalBlob;
    name: string;
    uploadedAt: Time;
}
export interface Review {
    id: string;
    createdAt: Time;
    user: Principal;
    comment: string;
    rating: bigint;
}
export interface AdminInvitation {
    id: string;
    status: string;
    createdAt: Time;
    whatsapp: string;
    email: string;
    slack: string;
    inviteLink: string;
    phone: string;
    sentChannels: Array<string>;
    telegram: string;
}
export interface TimeSlot {
    startTime: Time;
    duration: bigint;
    isLive: boolean;
    isEnabled: boolean;
}
export interface Order {
    id: string;
    status: string;
    createdAt: Time;
    user: Principal;
    totalAmount: bigint;
    items: Array<string>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Notification {
    id: string;
    read: boolean;
    type: string;
    user: Principal;
    message: string;
    timestamp: Time;
}
export interface Product {
    id: string;
    name: string;
    description: string;
    stock: bigint;
    category: string;
    price: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
    loyaltyPoints: bigint;
    membershipId: string;
    membershipTier: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFileReference(blob: ExternalBlob, name: string): Promise<string>;
    addProduct(product: Product): Promise<void>;
    addReview(rating: bigint, comment: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkSetTimeSlotStates(states: Array<[Time, boolean, boolean]>): Promise<void>;
    createAdminInvitation(email: string, phone: string, whatsapp: string, telegram: string, slack: string): Promise<string>;
    createAnnouncement(message: string): Promise<void>;
    createBooking(timeSlot: Time): Promise<string>;
    createBookingNotification(bookingId: string, message: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createMembershipTier(tier: MembershipTier): Promise<string>;
    createNotification(user: Principal, message: string, type: string): Promise<string>;
    createOrder(items: Array<string>, totalAmount: bigint): Promise<string>;
    createPointsCategory(category: PointsCategory): Promise<string>;
    createSessionReminder(bookingId: string): Promise<void>;
    createTimeSlot(startTime: Time, duration: bigint): Promise<void>;
    deleteAllNotifications(): Promise<void>;
    deleteMembershipTier(tierId: string): Promise<void>;
    deleteNotification(notificationId: string): Promise<void>;
    deletePointsCategory(categoryId: string): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    extendBooking15Minutes(bookingId: string): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAdminInvitations(): Promise<Array<AdminInvitation>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllTimeSlots(): Promise<Array<TimeSlot>>;
    getAvailableTimeSlots(): Promise<Array<TimeSlot>>;
    getAwardPointsForPromotionalBookings(): Promise<boolean>;
    getBusinessContactInfo(): Promise<BusinessContactInfo | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFileReferences(): Promise<Array<FileReference>>;
    getInvitationChannelSuggestions(): Promise<Array<string>>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getMembershipTiers(): Promise<Array<MembershipTier>>;
    getMyBookings(): Promise<Array<Booking>>;
    getMyNotifications(): Promise<Array<Notification>>;
    getMyOrders(): Promise<Array<Order>>;
    getPointsCategories(): Promise<Array<PointsCategory>>;
    getPointsGuide(): Promise<string>;
    getProducts(): Promise<Array<Product>>;
    getReviews(): Promise<Array<Review>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVenueInfo(): Promise<VenueInfo | null>;
    getWhatsAppInviteTemplate(): Promise<string>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markAllNotificationsAsRead(): Promise<void>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAwardPointsForPromotionalBookings(value: boolean): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    toggleTimeSlotAvailability(startTime: Time): Promise<void>;
    toggleTimeSlotLiveStatus(startTime: Time): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAdminInvitationStatus(invitationId: string, status: string): Promise<void>;
    updateBusinessContactInfo(info: BusinessContactInfo): Promise<void>;
    updateLeaderboardEntry(entry: LeaderboardEntry): Promise<void>;
    updateMembershipTier(tier: MembershipTier): Promise<void>;
    updatePointsCategory(category: PointsCategory): Promise<void>;
    updatePointsGuide(newGuide: string): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    updateTimeSlot(startTime: Time, duration: bigint): Promise<void>;
    updateVenueInfo(info: VenueInfo): Promise<void>;
}
