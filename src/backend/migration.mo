import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Stripe "stripe/stripe";
import Principal "mo:base/Principal";
import Storage "blob-storage/Storage";
import InviteLinksModule "invite-links/invite-links-module";

module {
    type OldActor = {
        membershipTiers : OrderedMap.Map<Text, {
            id : Text;
            name : Text;
            description : Text;
            monthlyFee : Nat;
            benefits : [Text];
            rewardMultiplier : Nat;
        }>;
        userProfiles : OrderedMap.Map<Principal, {
            name : Text;
            email : Text;
            membershipId : Text;
            loyaltyPoints : Nat;
            membershipTier : Text;
        }>;
        bookings : OrderedMap.Map<Text, {
            id : Text;
            user : Principal;
            timeSlot : Time.Time;
            status : Text;
            createdAt : Time.Time;
        }>;
        timeSlots : OrderedMap.Map<Text, {
            startTime : Time.Time;
            duration : Nat;
            isEnabled : Bool;
            isLive : Bool;
        }>;
        products : OrderedMap.Map<Text, {
            id : Text;
            name : Text;
            description : Text;
            price : Nat;
            category : Text;
            stock : Nat;
        }>;
        orders : OrderedMap.Map<Text, {
            id : Text;
            user : Principal;
            items : [Text];
            totalAmount : Nat;
            status : Text;
            createdAt : Time.Time;
        }>;
        leaderboard : OrderedMap.Map<Text, {
            user : Principal;
            score : Nat;
            rank : Nat;
        }>;
        reviews : OrderedMap.Map<Text, {
            id : Text;
            user : Principal;
            rating : Nat;
            comment : Text;
            createdAt : Time.Time;
        }>;
        venueInfo : ?{
            name : Text;
            location : Text;
            hours : Text;
            facilities : [Text];
            rules : [Text];
            faqs : [Text];
        };
        stripeConfig : ?Stripe.StripeConfiguration;
        stripeSessions : OrderedMap.Map<Text, Principal>;
        files : OrderedMap.Map<Text, {
            id : Text;
            blob : Storage.ExternalBlob;
            name : Text;
            uploadedAt : Time.Time;
        }>;
        inviteState : InviteLinksModule.InviteLinksSystemState;
        adminInvitations : OrderedMap.Map<Text, {
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
        }>;
        notifications : OrderedMap.Map<Text, {
            id : Text;
            user : Principal;
            message : Text;
            type_ : Text;
            timestamp : Time.Time;
            read : Bool;
        }>;
        pointsGuide : Text;
        pointsCategories : OrderedMap.Map<Text, {
            id : Text;
            name : Text;
            description : Text;
            multiplier : Nat;
            type_ : Text;
        }>;
        awardPointsForPromotionalBookings : Bool;
        businessContactInfo : ?{
            phone : Text;
            email : Text;
            address : Text;
            description : Text;
        };
    };

    type NewActor = {
        membershipTiers : OrderedMap.Map<Text, {
            id : Text;
            name : Text;
            description : Text;
            monthlyFee : Nat;
            benefits : [Text];
            rewardMultiplier : Nat;
        }>;
        userProfiles : OrderedMap.Map<Principal, {
            name : Text;
            email : Text;
            membershipId : Text;
            loyaltyPoints : Nat;
            membershipTier : Text;
        }>;
        bookings : OrderedMap.Map<Text, {
            id : Text;
            user : Principal;
            timeSlot : Time.Time;
            status : Text;
            createdAt : Time.Time;
        }>;
        timeSlots : OrderedMap.Map<Text, {
            startTime : Time.Time;
            duration : Nat;
            isEnabled : Bool;
            isLive : Bool;
        }>;
        products : OrderedMap.Map<Text, {
            id : Text;
            name : Text;
            description : Text;
            price : Nat;
            category : Text;
            stock : Nat;
        }>;
        orders : OrderedMap.Map<Text, {
            id : Text;
            user : Principal;
            items : [Text];
            totalAmount : Nat;
            status : Text;
            createdAt : Time.Time;
        }>;
        leaderboard : OrderedMap.Map<Text, {
            user : Principal;
            score : Nat;
            rank : Nat;
        }>;
        reviews : OrderedMap.Map<Text, {
            id : Text;
            user : Principal;
            rating : Nat;
            comment : Text;
            createdAt : Time.Time;
        }>;
        venueInfo : ?{
            name : Text;
            location : Text;
            hours : Text;
            facilities : [Text];
            rules : [Text];
            faqs : [Text];
        };
        stripeConfig : ?Stripe.StripeConfiguration;
        stripeSessions : OrderedMap.Map<Text, Principal>;
        files : OrderedMap.Map<Text, {
            id : Text;
            blob : Storage.ExternalBlob;
            name : Text;
            uploadedAt : Time.Time;
        }>;
        inviteState : InviteLinksModule.InviteLinksSystemState;
        adminInvitations : OrderedMap.Map<Text, {
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
        }>;
        notifications : OrderedMap.Map<Text, {
            id : Text;
            user : Principal;
            message : Text;
            type_ : Text;
            timestamp : Time.Time;
            read : Bool;
        }>;
        pointsGuide : Text;
        pointsCategories : OrderedMap.Map<Text, {
            id : Text;
            name : Text;
            description : Text;
            multiplier : Nat;
            type_ : Text;
        }>;
        awardPointsForPromotionalBookings : Bool;
        businessContactInfo : ?{
            phone : Text;
            email : Text;
            address : Text;
            description : Text;
        };
    };

    public func run(old : OldActor) : NewActor {
        let map = OrderedMap.Make<Text>(Text.compare);
        let updatedTimeSlots = map.map<{ startTime : Time.Time; duration : Nat; isEnabled : Bool; isLive : Bool }, { startTime : Time.Time; duration : Nat; isEnabled : Bool; isLive : Bool }>(
            old.timeSlots,
            func(_k, slot) {
                { slot with isLive = true };
            },
        );

        {
            old with
            timeSlots = updatedTimeSlots
        };
    };
};
