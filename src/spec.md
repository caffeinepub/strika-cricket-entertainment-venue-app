# Strika Cricket Entertainment Venue App

A mobile-friendly web application for Strika cricket entertainment venue that allows users to book sessions, purchase merchandise, manage memberships, and track their performance.

## Core Features

### Session Booking System
- Users can view available time slots for cricket sessions
- Book and reserve specific play times
- View and manage their upcoming bookings
- Receive booking confirmations and reminders
- Automatic loyalty points award upon booking creation when promotional booking points are enabled
- Real-time points balance updates in user interface after booking completion
- Success feedback notifications when loyalty points are awarded for bookings

### In-App Notification System
- Real-time notification banners and pop-ups within the app interface
- Notification center accessible from the header showing recent alerts
- Notifications for booking updates, session reminders, and important announcements
- Session reminder notifications triggered 10 minutes before scheduled sessions
- User-specific notifications based on Internet Identity
- Notifications for booking creation, updates, and status changes

### E-commerce Store
- Browse and purchase cricket merchandise
- Order food and beverages
- Shopping cart functionality
- Order history and tracking
- Stripe payment integration supporting Pakistani Rupees (PKR) for all transactions
- Automatic loyalty points calculation and award upon purchase completion based on user's membership tier multiplier

### Membership Management
- Digital membership cards with unique member IDs
- Tiered membership system with configurable tiers (Silver, Gold, Platinum, etc.)
- Each membership tier includes name, description, monthly fee in PKR, benefits list, and reward point multiplier
- Users can view their current tier and upgrade to higher tiers
- Enhanced loyalty rewards system with automatic points accumulation based on tier multipliers for purchases and other qualifying activities
- User accounts track accumulated loyalty points with real-time updates after each qualifying action
- Membership tier benefits and status tracking
- Member-exclusive offers and discounts
- Membership fee payments processed through Stripe in PKR
- Structured "How to Earn Points" system with configurable subsections (Purchases, Bookings, Events, etc.)
- User membership dashboard displaying current points total and earning categories
- Real-time points balance updates without requiring page refresh

### Leaderboard & User Profiles
- Display top players ranked by performance metrics
- User profiles showing personal statistics, current membership tier, and accumulated loyalty points
- Booking history and purchase records
- Achievement badges and rewards earned

### Communication
- Email notifications for booking confirmations and reminders
- Promotional emails for special offers and events
- Booking status updates

### Information Pages
- Venue details including location, hours, and facilities
- Cricket game rules and guidelines
- Frequently asked questions section
- Customer reviews and testimonials display

### Admin Panel
- Administrative interface for managing venue operations
- Admin button in main navigation bar visible only to users with admin privileges
- Admin button must be consistently visible to authenticated users with admin role in both desktop and mobile navigation menus
- Role detection logic must correctly verify user's admin status from backend authentication
- Admin button visibility must persist after page reload or session restore through proper role rechecking
- Fully deployed Invite Admin feature allowing current admins to assign admin privileges to others
- Multiple invitation methods: email, SMS, WhatsApp with additional suggestions for Telegram, Slack, and direct link sharing
- WhatsApp invitations must reliably open WhatsApp Web on desktop or WhatsApp app on mobile with pre-filled messages
- Enhanced iPad compatibility for WhatsApp invitations with improved iPadOS detection using accurate user agent checks for Safari and Chrome browsers
- iPadOS-specific WhatsApp handling: prioritize `whatsapp://send?text=` deep link to open WhatsApp app directly when installed, with fallback to `https://web.whatsapp.com/send?text=` only if app cannot be opened
- Improved app-switching behavior with short delay and retry mechanism to handle iPadOS app-switching delays
- WhatsApp functionality includes fallback handling for when WhatsApp is not installed or accessible, displaying clear alerts or modals with installation instructions
- Cross-browser compatibility testing required for Chrome, Safari, and Edge browsers
- Mobile device compatibility testing required for WhatsApp app integration including iPad devices
- WhatsApp invitations include pre-filled messages with Internet Identity setup instructions and direct links to admin panel and onboarding resources
- Pre-filled message and Internet Identity setup link preservation across both WhatsApp app and web versions on all devices including iPad
- Admin invitations contain clear instructions and links for Internet Identity setup and admin panel access
- Invitation channel suggestions displayed to admins for easy selection and use
- User-friendly prompts displayed when neither WhatsApp app nor web version is available on any device
- Membership Management tab in admin panel for configuring membership tiers and viewing member statistics
- Admin membership tier management interface allowing creation, editing, and deletion of membership tiers
- Admin forms for membership tier configuration with fields for name, description, monthly fee in PKR, benefits list, and reward point multiplier
- Admin dashboard showing membership tier analytics and member distribution across tiers
- "Create Tier" button must properly validate form data and successfully call the backend `createMembershipTier` function with all required parameters
- After successful tier creation, the membership tier list must refresh automatically and display a success message "Tier created successfully" to the admin
- Form validation must ensure all required fields (tier name, description, monthly fee in PKR, benefits, and reward multiplier) are properly filled before submission
- Proper error handling for tier creation failures with clear error messages displayed to the admin
- User feedback system showing loading states during tier creation and clear success/failure notifications
- Automatic refresh of membership tiers list after successful creation to immediately show the new tier in the live environment
- Points Earning Categories Manager tab in admin panel for managing structured earning categories and rules
- Admin interface to create, edit, and delete specific earning categories (Purchases, Bookings, Events, etc.)
- Category configuration forms with fields for category name, description, point calculation rules, and multipliers
- Real-time category management with immediate updates to frontend without redeployment
- Admin editor for defining earning rules and point values for each category type
- Live preview of earning categories as they appear to users on the membership page
- Loyalty Points Settings tab in admin panel with toggleable setting for promotional booking points
- Toggle switch labeled "Award Loyalty Points for Free/Promotional Bookings" with clear visual feedback
- When toggle is ON, users receive loyalty points for all bookings regardless of payment status
- When toggle is OFF, loyalty points are only awarded for paid session bookings
- Toggle setting affects point calculation during booking process with immediate application
- Admin can view current toggle status and change setting with instant effect on new bookings

## Production Deployment
- Application is ready for production deployment as Version 15
- All features are fully functional and tested for real user access
- Application is live and accessible to end users

## Design Requirements
- Green and gold color scheme throughout the application
- Mobile-responsive design optimized for smartphones and tablets
- Intuitive navigation and user-friendly interface
- Clean, modern layout suitable for sports entertainment
- Admin button styled consistently with other navigation items
- Admin button appears in both desktop and mobile menus
- Notification center icon in header with badge showing unread count
- Notification banners and pop-ups styled consistently with app theme
- App content language: English
- Responsive top navigation bar layout with proper spacing and alignment
- Logo positioned on the top left must not overlap with navigation items on iPads or smaller screens
- Flexible spacing and adaptive scaling for logo and navigation elements
- Sufficient padding between logo and navigation links on tablet viewports
- Navigation items must wrap or resize gracefully without overlap on iPad portrait and landscape orientations
- Proper visual balance maintained across all device sizes and screen orientations
- Success feedback notifications for loyalty points awards displayed prominently after booking completion

## Branding Requirements
- All user-visible text across the application must display "Strika" as the venue name
- Frontend pages including header, footer, home page hero, venue info, membership pages, and admin panels must reference "Strika"
- Notifications, email templates, and meta titles must use "Strika" branding
- Logo and favicon must represent the Strika brand
- Dynamic content including venue information, admin-editable sections, notifications, and invitations must reflect "Strika"
- Stripe checkout descriptions and payment references must use "Strika" name
- All brand references throughout the application must be consistent with Strika identity

## Backend Data Storage
- User accounts and profiles with linked membership tier information and accumulated loyalty points field
- Membership tiers with configurable name, description, monthly fee in PKR, benefits, and reward point multipliers
- Session bookings and availability schedules
- Product catalog for merchandise and food items with prices in PKR
- Order records and transaction history in PKR with automatic points calculation and award tracking
- Membership data and loyalty points calculated using tier multipliers with real-time updates
- Leaderboard scores and player statistics
- Reviews and testimonials
- Venue information and FAQ content with Strika branding
- Admin user roles and permissions
- Admin invitation records and status
- Invitation templates and pre-filled message content for different channels with Strika branding
- In-app notifications with user targeting, timestamps, and read status
- Notification templates for different event types with Strika references
- Member statistics and tier distribution data
- Structured points earning categories with configurable subsections (Purchases, Bookings, Events, etc.)
- Point earning rules and multipliers for each category type
- Category configuration data including names, descriptions, and calculation methods
- Loyalty points settings including promotional booking points toggle state
- Strika brand information and messaging templates

## Backend Operations
- Process booking requests and manage availability
- Handle e-commerce transactions and inventory with PKR pricing
- Automatically calculate and award loyalty points upon purchase completion based on user's membership tier multiplier
- Process membership tier payments through Stripe in PKR with Strika branding in payment descriptions
- Calculate and update loyalty points using tier-specific multipliers and leaderboard rankings with real-time user account updates
- Apply loyalty points settings to determine point eligibility for bookings based on payment status and promotional booking toggle
- Award loyalty points for session bookings according to admin-configured promotional booking setting
- Enhanced `createBooking` function that immediately calculates and assigns loyalty points to users when promotional booking points are enabled
- Use user's membership tier multiplier and booking category points to compute awards during booking creation
- Update user profiles with new loyalty points balance immediately after booking completion
- Send email notifications for bookings and promotions with Strika branding
- Manage user authentication and profile updates
- Store and retrieve reviews and venue information with Strika references
- Process admin invitations and role assignments
- Send admin invitation messages via email, SMS, and WhatsApp with Strika branding
- Generate invitation links and onboarding resources for new admins with Strika references
- Provide pre-filled message templates for WhatsApp with Internet Identity setup instructions and Strika branding
- Generate direct invitation links for easy sharing across multiple channels
- Provide user role information to frontend for admin button visibility
- Create and manage in-app notifications for users with Strika branding
- Trigger session reminder notifications 10 minutes before scheduled sessions
- Generate notifications for booking creation, updates, and status changes with Strika references
- Track notification read status and delivery
- Provide user-specific notification feeds based on Internet Identity
- Manage membership tier creation, editing, and deletion by admins with proper error handling and success responses
- Generate member statistics and tier analytics for admin dashboard
- Handle membership tier upgrades and downgrades
- Validate membership tier data including PKR pricing and reward multipliers with comprehensive error checking
- Provide membership tier management APIs for admin interface with reliable response handling
- Ensure `createMembershipTier` function properly processes all required parameters and returns appropriate success/error responses
- Provide updated membership tier lists after successful creation operations
- Manage structured points earning categories with create, read, update, and delete operations
- Store and retrieve earning category configurations including rules and multipliers
- Provide real-time category updates to frontend without requiring redeployment
- Handle category-specific point calculations for different earning activities
- Validate earning category data and provide proper error handling for admin operations
- Manage loyalty points settings including promotional booking toggle state
- Provide APIs for updating and retrieving promotional booking points setting
- Apply promotional booking setting during booking point calculation process with immediate effect
- Update all backend text references, templates, and messaging to use Strika branding consistently

## Backend Technical Requirements
- Simplified migration system that completes quickly without hanging during deployment
- Migration process must return immediately with minimal or no logic to prevent build pipeline delays
- Ensure smooth backend and frontend build pipeline execution without indefinite waiting on migration steps
