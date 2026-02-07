import { MapPin, Clock, Phone, Mail, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useGetVenueInfo, useGetBusinessContactInfo } from '../hooks/useQueries';

export default function VenueInfoPage() {
  const { data: venueInfo } = useGetVenueInfo();
  const { data: contactInfo } = useGetBusinessContactInfo();

  const defaultFaqs = [
    {
      question: 'What are your operating hours?',
      answer: 'We are open 7 days a week from 8:00 AM to 10:00 PM. Extended hours available for special events.',
    },
    {
      question: 'Do I need to bring my own equipment?',
      answer: 'No, we provide all necessary cricket equipment. However, you are welcome to bring your own gear if you prefer.',
    },
    {
      question: 'Can I cancel or reschedule my booking?',
      answer: 'Yes, you can cancel or reschedule up to 24 hours before your session time through your profile page.',
    },
    {
      question: 'Are coaching sessions available?',
      answer: 'Yes, we offer professional coaching sessions for all skill levels. Contact us to schedule a session.',
    },
    {
      question: 'Is there parking available?',
      answer: 'Yes, we have ample free parking available for all our members and visitors.',
    },
  ];

  const defaultRules = [
    'All players must wear appropriate sports attire and non-marking shoes',
    'Safety equipment (helmets, pads) must be worn during batting practice',
    'Respect other players and maintain good sportsmanship',
    'Follow staff instructions and venue guidelines at all times',
    'No outside food or beverages allowed (refreshments available at our store)',
    'Children under 12 must be supervised by an adult',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Venue Information</h1>
          <p className="text-muted-foreground">Everything you need to know about Strika</p>
        </div>

        {/* Venue Image */}
        <div className="rounded-2xl overflow-hidden">
          <img
            src="/assets/generated/venue-exterior.dim_800x600.jpg"
            alt="Strika Venue"
            className="w-full h-[400px] object-cover"
          />
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {contactInfo?.address || venueInfo?.location || '123 Cricket Lane, Sports District, City, State 12345'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {venueInfo?.hours || 'Monday - Sunday: 8:00 AM - 10:00 PM'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {contactInfo?.phone || '(555) 123-4567'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {contactInfo?.email || 'info@strika.com'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {contactInfo?.description && (
          <Card>
            <CardHeader>
              <CardTitle>About Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{contactInfo.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Our Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(venueInfo?.facilities || [
                'Professional cricket nets',
                'Indoor and outdoor pitches',
                'Modern changing rooms',
                'Equipment rental',
                'Refreshment area',
                'Spectator seating',
              ]).map((facility, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Venue Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(venueInfo?.rules || defaultRules).map((rule, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {(venueInfo?.faqs || defaultFaqs).map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {typeof faq === 'string' ? faq : faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {typeof faq === 'string' ? 'Please contact us for more information.' : faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
