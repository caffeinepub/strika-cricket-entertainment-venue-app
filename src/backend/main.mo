import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import InviteLinksModule "invite-links/invite-links-module";
import Random "mo:base/Random";
import Array "mo:base/Array";


actor Strika {
  // Authorization
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Membership Tiers
  public type MembershipTier = {
    id : Text;
    name : Text;
    description : Text;
    monthlyFee : Nat;
    benefits : [Text];
    rewardMultiplier : Nat;
  };

  transient let textMap = OrderedMap.Make<Text>(Text.compare);
  var membershipTiers = textMap.empty<MembershipTier>();

  public query func getMembershipTiers() : async [MembershipTier] {
    Iter.toArray(textMap.vals(membershipTiers));
  };

  public shared ({ caller }) func createMembershipTier(tier : MembershipTier) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can create membership tiers");
    };
    membershipTiers := textMap.put(membershipTiers, tier.id, tier);
    tier.id;
  };

  public shared ({ caller }) func updateMembershipTier(tier : MembershipTier) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update membership tiers");
    };
    membershipTiers := textMap.put(membershipTiers, tier.id, tier);
  };

  public shared ({ caller }) func deleteMembershipTier(tierId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can delete membership tiers");
    };
    membershipTiers := textMap.delete(membershipTiers, tierId);
  };

  // User Profiles
  public type UserProfile = {
    name : Text;
    email : Text;
    membershipId : Text;
    loyaltyPoints : Nat;
    membershipTier : Text;
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  // Session Booking System
  public type Booking = {
    id : Text;
    user : Principal;
    timeSlot : Time.Time;
    status : Text;
    createdAt : Time.Time;
  };

  var bookings = textMap.empty<Booking>();

  public shared ({ caller }) func createBooking(timeSlot : Time.Time) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can book sessions");
    };

    let bookingId = Text.concat("booking-", Nat.toText(Int.abs(Time.now())));
    let booking : Booking = {
      id = bookingId;
      user = caller;
      timeSlot;
      status = "confirmed";
      createdAt = Time.now();
    };

    bookings := textMap.put(bookings, bookingId, booking);

    // Award loyalty points if enabled
    if (awardPointsForPromotionalBookings) {
      switch (principalMap.get(userProfiles, caller)) {
        case null {
          Debug.trap("User profile not found");
        };
        case (?profile) {
          let tierMultiplier = switch (textMap.get(membershipTiers, profile.membershipTier)) {
            case null 1;
            case (?tier) tier.rewardMultiplier;
          };

          let pointsCategoryMultiplier = switch (textMap.get(pointsCategories, "booking")) {
            case null 1;
            case (?category) category.multiplier;
          };

          let pointsToAward = 10 * tierMultiplier * pointsCategoryMultiplier;

          let updatedProfile = {
            profile with
            loyaltyPoints = profile.loyaltyPoints + pointsToAward
          };

          userProfiles := principalMap.put(userProfiles, caller, updatedProfile);
        };
      };
    };

    bookingId;
  };

  public query ({ caller }) func getMyBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view bookings");
    };

    Iter.toArray(
      Iter.filter(
        textMap.vals(bookings),
        func(booking : Booking) : Bool {
          booking.user == caller;
        },
      )
    );
  };

  public query func getAvailableTimeSlots() : async [Time.Time] {
    // Public information - no authorization needed
    let now = Time.now();
    Array.tabulate<Time.Time>(10, func(i : Nat) : Time.Time { now + (i * 3600 * 1000000000) });
  };

  // E-commerce Store
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    stock : Nat;
  };

  var products = textMap.empty<Product>();

  public query func getProducts() : async [Product] {
    // Public catalog - no authorization needed
    Iter.toArray(textMap.vals(products));
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can add products");
    };
    products := textMap.put(products, product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update products");
    };
    products := textMap.put(products, product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can delete products");
    };
    products := textMap.delete(products, productId);
  };

  // Orders
  public type Order = {
    id : Text;
    user : Principal;
    items : [Text];
    totalAmount : Nat;
    status : Text;
    createdAt : Time.Time;
  };

  var orders = textMap.empty<Order>();

  public shared ({ caller }) func createOrder(items : [Text], totalAmount : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can place orders");
    };

    let orderId = Text.concat("order-", Nat.toText(Int.abs(Time.now())));
    let order : Order = {
      id = orderId;
      user = caller;
      items;
      totalAmount;
      status = "pending";
      createdAt = Time.now();
    };

    orders := textMap.put(orders, orderId, order);
    orderId;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view orders");
    };

    Iter.toArray(
      Iter.filter(
        textMap.vals(orders),
        func(order : Order) : Bool {
          order.user == caller;
        },
      )
    );
  };

  // Leaderboard
  public type LeaderboardEntry = {
    user : Principal;
    score : Nat;
    rank : Nat;
  };

  var leaderboard = textMap.empty<LeaderboardEntry>();

  public query func getLeaderboard() : async [LeaderboardEntry] {
    // Public leaderboard - no authorization needed
    Iter.toArray(textMap.vals(leaderboard));
  };

  public shared ({ caller }) func updateLeaderboardEntry(entry : LeaderboardEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update leaderboard");
    };
    leaderboard := textMap.put(leaderboard, Principal.toText(entry.user), entry);
  };

  // Reviews and Testimonials
  public type Review = {
    id : Text;
    user : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Time.Time;
  };

  var reviews = textMap.empty<Review>();

  public shared ({ caller }) func addReview(rating : Nat, comment : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can add reviews");
    };

    let reviewId = Text.concat("review-", Nat.toText(Int.abs(Time.now())));
    let review : Review = {
      id = reviewId;
      user = caller;
      rating;
      comment;
      createdAt = Time.now();
    };

    reviews := textMap.put(reviews, reviewId, review);
    reviewId;
  };

  public query func getReviews() : async [Review] {
    // Public reviews - no authorization needed
    Iter.toArray(textMap.vals(reviews));
  };

  // Venue Information
  public type VenueInfo = {
    name : Text;
    location : Text;
    hours : Text;
    facilities : [Text];
    rules : [Text];
    faqs : [Text];
  };

  var venueInfo : ?VenueInfo = null;

  public query func getVenueInfo() : async ?VenueInfo {
    // Public venue information - no authorization needed
    venueInfo;
  };

  public shared ({ caller }) func updateVenueInfo(info : VenueInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update venue info");
    };
    venueInfo := ?info;
  };

  // Stripe Integration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Track which sessions belong to which users
  var stripeSessions = textMap.empty<Principal>();

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can check Stripe configuration");
    };
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  private func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case null Debug.trap("Stripe needs to be first configured");
      case (?value) value;
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    // Verify the session belongs to the caller or caller is admin
    switch (textMap.get(stripeSessions, sessionId)) {
      case null {
        Debug.trap("Session not found");
      };
      case (?sessionOwner) {
        if (sessionOwner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: Can only check your own session status");
        };
      };
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create checkout sessions");
    };
    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
    // Track session ownership
    stripeSessions := textMap.put(stripeSessions, sessionId, caller);
    sessionId;
  };

  // HTTP Outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Blob Storage
  let storage = Storage.new();
  include MixinStorage(storage);

  public type FileReference = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
    uploadedAt : Time.Time;
  };

  var files = textMap.empty<FileReference>();

  public shared ({ caller }) func addFileReference(blob : Storage.ExternalBlob, name : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can add files");
    };

    let fileId = Text.concat("file-", Nat.toText(Int.abs(Time.now())));
    let fileRef : FileReference = {
      id = fileId;
      blob;
      name;
      uploadedAt = Time.now();
    };

    files := textMap.put(files, fileId, fileRef);
    fileId;
  };

  public query func getFileReferences() : async [FileReference] {
    // Public file references - no authorization needed
    // Files are stored in blob storage which has its own access control
    Iter.toArray(textMap.vals(files));
  };

  // Invite Links System
  let inviteState = InviteLinksModule.initState();

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    // Verify the invite code exists before allowing RSVP submission
    // Guests are allowed to submit RSVPs with valid invite codes
    let invites = InviteLinksModule.getInviteCodes(inviteState);
    var validCode = false;
    for (invite in invites.vals()) {
      if (invite.code == inviteCode) {
        validCode := true;
      };
    };
    if (not validCode) {
      Debug.trap("Invalid invite code");
    };
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  // Admin Invitation System
  public type AdminInvitation = {
    id : Text;
    email : Text;
    phone : Text;
    whatsapp : Text;
    telegram : Text;
    slack : Text;
    inviteLink : Text;
    status : Text;
    createdAt : Time.Time;
    sentChannels : [Text];
  };

  var adminInvitations = textMap.empty<AdminInvitation>();

  public shared ({ caller }) func createAdminInvitation(email : Text, phone : Text, whatsapp : Text, telegram : Text, slack : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can create admin invitations");
    };

    let invitationId = Text.concat("admin-invite-", Nat.toText(Int.abs(Time.now())));
    let inviteLink = Text.concat("https://strika.com/admin-invite/", invitationId);

    let invitation : AdminInvitation = {
      id = invitationId;
      email;
      phone;
      whatsapp;
      telegram;
      slack;
      inviteLink;
      status = "pending";
      createdAt = Time.now();
      sentChannels = ["email", "whatsapp"];
    };

    adminInvitations := textMap.put(adminInvitations, invitationId, invitation);
    invitationId;
  };

  public query ({ caller }) func getAdminInvitations() : async [AdminInvitation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view admin invitations");
    };
    Iter.toArray(textMap.vals(adminInvitations));
  };

  public shared ({ caller }) func updateAdminInvitationStatus(invitationId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update admin invitation status");
    };

    switch (textMap.get(adminInvitations, invitationId)) {
      case null {
        Debug.trap("Invitation not found");
      };
      case (?invitation) {
        let updatedInvitation = { invitation with status };
        adminInvitations := textMap.put(adminInvitations, invitationId, updatedInvitation);
      };
    };
  };

  public query func getInvitationChannelSuggestions() : async [Text] {
    // Publicly available suggestions - no authorization needed
    ["email", "whatsapp", "telegram", "slack", "direct link"];
  };

  public query func getWhatsAppInviteTemplate() : async Text {
    // Publicly available template - no authorization needed
    "Join as an admin: https://strika.com/admin-invite\n\n1. Set up Internet Identity\n2. Access the admin panel\n3. Follow onboarding instructions";
  };

  // Notification System
  public type Notification = {
    id : Text;
    user : Principal;
    message : Text;
    type_ : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  var notifications = textMap.empty<Notification>();

  public shared ({ caller }) func createNotification(user : Principal, message : Text, type_ : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can create notifications");
    };

    let notificationId = Text.concat("notification-", Nat.toText(Int.abs(Time.now())));
    let notification : Notification = {
      id = notificationId;
      user;
      message;
      type_;
      timestamp = Time.now();
      read = false;
    };

    notifications := textMap.put(notifications, notificationId, notification);
    notificationId;
  };

  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view notifications");
    };

    Iter.toArray(
      Iter.filter(
        textMap.vals(notifications),
        func(notification : Notification) : Bool {
          notification.user == caller;
        },
      )
    );
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (textMap.get(notifications, notificationId)) {
      case null {
        Debug.trap("Notification not found");
      };
      case (?notification) {
        if (notification.user != caller) {
          Debug.trap("Unauthorized: Can only mark your own notifications as read");
        };
        let updatedNotification = { notification with read = true };
        notifications := textMap.put(notifications, notificationId, updatedNotification);
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsAsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can mark notifications as read");
    };

    for (notification in textMap.vals(notifications)) {
      if (notification.user == caller) {
        let updatedNotification = { notification with read = true };
        notifications := textMap.put(notifications, notification.id, updatedNotification);
      };
    };
  };

  public shared ({ caller }) func deleteNotification(notificationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete notifications");
    };

    switch (textMap.get(notifications, notificationId)) {
      case null {
        Debug.trap("Notification not found");
      };
      case (?notification) {
        if (notification.user != caller) {
          Debug.trap("Unauthorized: Can only delete your own notifications");
        };
        notifications := textMap.delete(notifications, notificationId);
      };
    };
  };

  public shared ({ caller }) func deleteAllNotifications() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete notifications");
    };

    for (notification in textMap.vals(notifications)) {
      if (notification.user == caller) {
        notifications := textMap.delete(notifications, notification.id);
      };
    };
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view notification count");
    };

    var count = 0;
    for (notification in textMap.vals(notifications)) {
      if (notification.user == caller and not notification.read) {
        count += 1;
      };
    };
    count;
  };

  public shared ({ caller }) func createBookingNotification(bookingId : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can create booking notifications");
    };

    switch (textMap.get(bookings, bookingId)) {
      case null {
        Debug.trap("Booking not found");
      };
      case (?booking) {
        let notificationId = Text.concat("notification-", Nat.toText(Int.abs(Time.now())));
        let notification : Notification = {
          id = notificationId;
          user = booking.user;
          message;
          type_ = "booking";
          timestamp = Time.now();
          read = false;
        };

        notifications := textMap.put(notifications, notificationId, notification);
      };
    };
  };

  public shared ({ caller }) func createSessionReminder(bookingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can create session reminders");
    };

    switch (textMap.get(bookings, bookingId)) {
      case null {
        Debug.trap("Booking not found");
      };
      case (?booking) {
        let notificationId = Text.concat("notification-", Nat.toText(Int.abs(Time.now())));
        let notification : Notification = {
          id = notificationId;
          user = booking.user;
          message = "Your session starts in 10 minutes";
          type_ = "reminder";
          timestamp = Time.now();
          read = false;
        };

        notifications := textMap.put(notifications, notificationId, notification);
      };
    };
  };

  public shared ({ caller }) func createAnnouncement(message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can create announcements");
    };

    for (user in principalMap.keys(userProfiles)) {
      let notificationId = Text.concat("notification-", Nat.toText(Int.abs(Time.now())));
      let notification : Notification = {
        id = notificationId;
        user;
        message;
        type_ = "announcement";
        timestamp = Time.now();
        read = false;
      };

      notifications := textMap.put(notifications, notificationId, notification);
    };
  };

  // Points Guide System
  var pointsGuide : Text = "Earn points by booking sessions, purchasing merchandise, and participating in events. Points are awarded based on your membership tier multiplier.";

  public query func getPointsGuide() : async Text {
    pointsGuide;
  };

  public shared ({ caller }) func updatePointsGuide(newGuide : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update points guide");
    };
    pointsGuide := newGuide;
  };

  // Points Earning Categories
  public type PointsCategory = {
    id : Text;
    name : Text;
    description : Text;
    multiplier : Nat;
    type_ : Text;
  };

  var pointsCategories = textMap.empty<PointsCategory>();

  public query func getPointsCategories() : async [PointsCategory] {
    Iter.toArray(textMap.vals(pointsCategories));
  };

  public shared ({ caller }) func createPointsCategory(category : PointsCategory) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can create points categories");
    };
    pointsCategories := textMap.put(pointsCategories, category.id, category);
    category.id;
  };

  public shared ({ caller }) func updatePointsCategory(category : PointsCategory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update points categories");
    };
    pointsCategories := textMap.put(pointsCategories, category.id, category);
  };

  public shared ({ caller }) func deletePointsCategory(categoryId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can delete points categories");
    };
    pointsCategories := textMap.delete(pointsCategories, categoryId);
  };

  // Loyalty Points Settings
  var awardPointsForPromotionalBookings : Bool = true;

  public query func getAwardPointsForPromotionalBookings() : async Bool {
    awardPointsForPromotionalBookings;
  };

  public shared ({ caller }) func setAwardPointsForPromotionalBookings(value : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update loyalty points settings");
    };
    awardPointsForPromotionalBookings := value;
  };
};


