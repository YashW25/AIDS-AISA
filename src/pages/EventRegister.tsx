import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails, useCheckRegistration } from '@/hooks/useUserData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EventRegister = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { data: event, isLoading: eventLoading } = useEventDetails(eventId);
  const { data: existingReg, isLoading: regLoading } = useCheckRegistration(user?.id, eventId);

  const [paymentMethod, setPaymentMethod] = useState<'cashfree' | 'manual'>('manual');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=/event/${eventId}/register`);
    }
    if (!authLoading && user && !profile?.is_profile_complete) {
      navigate('/admin/dashboard');
    }
  }, [user, profile, authLoading, navigate, eventId]);

  const handleRegister = async () => {
    if (!user || !event) return;

    setIsSubmitting(true);
    try {
      // Create registration
      const { data: registration, error: regError } = await supabase
        .from('event_registrations')
        .insert({
          user_id: user.id,
          event_id: event.id,
          registration_status: event.entry_fee > 0 ? 'pending' : 'confirmed',
          payment_status: event.entry_fee > 0 ? 'pending' : 'paid',
        })
        .select()
        .single();

      if (regError) throw regError;

      // Create payment record
      if (event.entry_fee > 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            event_registration_id: registration.id,
            amount: event.entry_fee,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'manual' ? 'pending' : 'pending',
            transaction_id: transactionId || null,
            notes: notes || null,
          });

        if (paymentError) throw paymentError;

        toast({
          title: 'Registration Submitted!',
          description: paymentMethod === 'manual'
            ? 'Your registration is pending payment verification by admin.'
            : 'Proceeding to payment...',
        });
      } else {
        // Free event - create a free payment record
        await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            event_registration_id: registration.id,
            amount: 0,
            payment_method: 'free',
            payment_status: 'completed',
          });

        toast({
          title: 'Registration Successful!',
          description: 'You have been registered for this event.',
        });
      }

      // Update participant count
      await supabase
        .from('events')
        .update({ current_participants: (event.current_participants || 0) + 1 })
        .eq('id', event.id);

      navigate('/admin/dashboard');
    } catch (error: any) {
      if (error.message?.includes('unique constraint')) {
        toast({
          title: 'Already Registered',
          description: 'You have already registered for this event.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration Failed',
          description: error.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || eventLoading || regLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold">Event Not Found</h2>
            <Link to="/events">
              <Button className="mt-4">Back to Events</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (existingReg) {
    return (
      <MainLayout>
        <div className="min-h-screen py-20 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Already Registered!</h2>
              <p className="text-muted-foreground mb-4">
                You have already registered for this event.
              </p>
              <div className="flex gap-3 justify-center">
                <Badge className="capitalize">{existingReg.registration_status}</Badge>
                <Badge variant="outline">Payment: {existingReg.payment_status}</Badge>
              </div>
              <Link to="/admin/dashboard">
                <Button className="mt-6">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const isFull = event.max_participants && event.current_participants >= event.max_participants;

  return (
    <MainLayout title="Register for Event">
      <section className="py-12 bg-muted/30 min-h-screen">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">{event.title}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                )}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>{format(new Date(event.event_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>
                      {format(new Date(event.event_date), 'h:mm a')}
                      {event.end_date && ` - ${format(new Date(event.end_date), 'h:mm a')}`}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.max_participants && (
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-accent" />
                      <span>{event.current_participants}/{event.max_participants} participants</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Entry Fee</span>
                    <span className="text-2xl font-bold text-primary">
                      {event.entry_fee > 0 ? `₹${event.entry_fee}` : 'FREE'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Form */}
            <Card>
              <CardHeader>
                <CardTitle>Register for Event</CardTitle>
                <CardDescription>
                  Complete your registration{event.entry_fee > 0 ? ' and payment' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Info */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="font-medium">{profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.enrollment_number} • {profile?.branch}
                  </p>
                </div>

                {isFull ? (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                    <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
                    <p className="font-medium text-destructive">Event is Full</p>
                    <p className="text-sm text-muted-foreground">
                      This event has reached maximum capacity.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Payment Method */}
                    {event.entry_fee > 0 && (
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Payment Method</Label>
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={(v) => setPaymentMethod(v as 'cashfree' | 'manual')}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                            <RadioGroupItem value="manual" id="manual" />
                            <Label htmlFor="manual" className="flex-1 cursor-pointer">
                              <span className="font-medium">Manual Payment</span>
                              <p className="text-sm text-muted-foreground">
                                Pay via UPI/Bank transfer and enter transaction ID
                              </p>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 opacity-50">
                            <RadioGroupItem value="cashfree" id="cashfree" disabled />
                            <Label htmlFor="cashfree" className="flex-1 cursor-pointer">
                              <span className="font-medium">Online Payment (Coming Soon)</span>
                              <p className="text-sm text-muted-foreground">
                                Pay securely via Cashfree gateway
                              </p>
                            </Label>
                          </div>
                        </RadioGroup>

                        {paymentMethod === 'manual' && (
                          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                            <div className="space-y-2">
                              <Label>UPI Payment Details</Label>
                              <p className="text-sm text-muted-foreground">
                                Pay ₹{event.entry_fee} to: <strong>AISA@upi</strong>
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="transactionId">Transaction ID / Reference</Label>
                              <Input
                                id="transactionId"
                                placeholder="Enter UPI transaction ID"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes">Additional Notes (Optional)</Label>
                              <Textarea
                                id="notes"
                                placeholder="Any additional information..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      onClick={handleRegister}
                      disabled={isSubmitting || (event.entry_fee > 0 && paymentMethod === 'manual' && !transactionId)}
                      className="w-full gradient-accent"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          {event.entry_fee > 0 ? `Pay ₹${event.entry_fee} & Register` : 'Register Now'}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By registering, you agree to our terms and conditions.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default EventRegister;
