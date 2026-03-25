import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSiteSettings } from '@/hooks/useSiteData';
import { Phone, Mail, MapPin, Send, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { generateBreadcrumbSchema, SEO_CONFIG } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const { data: settings } = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('contact_submissions')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        });
      if (error) throw error;
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: Facebook, url: settings?.facebook_url, label: 'Facebook' },
    { icon: Instagram, url: settings?.instagram_url, label: 'Instagram' },
    { icon: Linkedin, url: settings?.linkedin_url, label: 'LinkedIn' },
    { icon: Twitter, url: settings?.twitter_url, label: 'Twitter' },
    { icon: Youtube, url: settings?.youtube_url, label: 'YouTube' },
  ].filter(link => link.url);

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact AISA Club - AI&DS Department',
    url: `${SEO_CONFIG.siteUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: settings?.club_full_name || 'AISA Club - AI&DS Department',
      email: settings?.email,
      telephone: settings?.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings?.address || 'S. No. 44/1, Nande Village, Pashan Sus Road',
        addressLocality: 'Pune',
        addressRegion: 'Maharashtra',
        postalCode: '412115',
        addressCountry: 'IN',
      },
    },
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Contact Us', item: '/contact' },
  ]);

  return (
    <MainLayout
      title="Contact"
      description="Get in touch with the AISA Club at AI&DS Department, Pune. Reach out for collaborations, queries about innovation programs, startup support, and mentorship opportunities."
      keywords="Contact AISA Club Pune, AI&DS Department Contact, AISA Club Email Phone, Student Innovation Support Pune, Engineering College Contact Maharashtra"
      schema={contactSchema}
    >
      {/* Breadcrumb Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero Section */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contact Us
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80">
              Have questions or want to collaborate? We'd love to hear from you
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {settings?.email && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Email</h3>
                      <a href={`mailto:${settings.email}`} className="text-muted-foreground hover:text-primary">
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}
                {settings?.phone && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Phone</h3>
                      <a href={`tel:${settings.phone}`} className="text-muted-foreground hover:text-primary">
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}
                {settings?.address && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Address</h3>
                      <p className="text-muted-foreground">{settings.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all"
                        aria-label={social.label}
                      >
                        <social.icon className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="p-8 rounded-2xl bg-card border border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                    <Input placeholder="Your name" className="border-primary/20 focus:border-primary" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} maxLength={100} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                    <Input type="email" placeholder="Your email" className="border-primary/20 focus:border-primary" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} maxLength={255} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                  <Input placeholder="Subject" className="border-primary/20 focus:border-primary" required value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} maxLength={200} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                  <Textarea
                    placeholder="Your message"
                    rows={5}
                    className="border-primary/20 focus:border-primary resize-none"
                    required
                    value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    maxLength={2000}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full gap-2 bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Contact;
