'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Clock, MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useActionState } from 'react';
import { sendContactMessage } from './actions';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useBranding } from '@/providers/branding-provider';
import { useLocale } from 'next-intl';

export default function ContactPage() {
  const { branding } = useBranding();
  const locale = useLocale();
  const siteName = branding?.name || 'Kyrn';
  const isEnglish = locale === 'en';
  const supportEmail = `hello@${siteName.toLowerCase().replace(/\s+/g, '').replace('kyrn', 'kyrn.nl').includes('.') ? '' : 'kyrn.nl'}`;

  const [state, formAction, isPending] = useActionState(sendContactMessage, {});

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full h-full lg:grid lg:grid-cols-2">

        <div className="relative flex flex-col justify-center p-8 md:p-12 lg:p-20 bg-muted/30 border-r border-border min-h-[50vh] lg:min-h-screen">
          <Link href="/">
            <Button variant="ghost" className="absolute top-6 left-6 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> {isEnglish ? 'Back to home' : 'Terug naar home'}
            </Button>
          </Link>

          <div className="max-w-md mx-auto lg:mx-0 mt-10 lg:mt-0">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {isEnglish ? 'Get in touch' : 'Neem contact op'}
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              {isEnglish
                ? 'Have questions about plans, integrations, or enterprise features? Send us a message and we will get back to you within 1 business day.'
                : 'Vragen over plannen, integraties of enterprise-functies? Stuur ons een bericht en we reageren binnen 1 werkdag.'}
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground mt-1">hello@{siteName.toLowerCase().replace(/\s+/g, '')}.nl</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{isEnglish ? 'Response time' : 'Reactietijd'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isEnglish ? 'We reply within 1 business day, Mon-Fri (CET).' : 'We reageren binnen 1 werkdag, maandag t/m vrijdag (CET).'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Enterprise?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isEnglish ? 'For volume pricing and custom integrations, mention it in your message.' : 'Voor volumeprijzen en maatwerkintegraties kun je dit in je bericht vermelden.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 md:p-12 lg:p-20 bg-background">
          <Card className="w-full max-w-lg border-none shadow-none lg:border lg:shadow-sm">
            <CardContent className="p-0 lg:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold">{isEnglish ? 'Send us a message' : 'Stuur ons een bericht'}</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  {isEnglish ? 'Fill out the form below and we will get back to you as soon as possible.' : 'Vul het formulier hieronder in en we nemen zo snel mogelijk contact met je op.'}
                </p>
              </div>

              <form action={formAction} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{isEnglish ? 'First name' : 'Voornaam'}</Label>
                    <Input id="firstName" name="firstName" placeholder={isEnglish ? 'John' : 'Jan'} required disabled={isPending} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{isEnglish ? 'Last name' : 'Achternaam'}</Label>
                    <Input id="lastName" name="lastName" placeholder={isEnglish ? 'Doe' : 'Jansen'} required disabled={isPending} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{isEnglish ? 'Email address' : 'E-mailadres'}</Label>
                  <Input id="email" name="email" type="email" placeholder={isEnglish ? 'john@example.com' : 'jan@bedrijf.nl'} required disabled={isPending} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{isEnglish ? 'Subject' : 'Onderwerp'}</Label>
                  <Input id="subject" name="subject" placeholder={isEnglish ? 'How can we help?' : 'Waar kunnen we mee helpen?'} required disabled={isPending} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{isEnglish ? 'Message' : 'Bericht'}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder={isEnglish ? 'Tell us more about your inquiry...' : 'Vertel ons kort waar je naar zoekt...'}
                    className="min-h-[150px] resize-none"
                    required
                    disabled={isPending}
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEnglish ? 'Sending...' : 'Versturen...'}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> {isEnglish ? 'Send message' : 'Bericht versturen'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}
