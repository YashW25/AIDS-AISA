import { AlertTriangle, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SuspendedClubProps {
  clubName?: string;
  reason?: string;
}

const SuspendedClub = ({ clubName = 'This Website', reason }: SuspendedClubProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-destructive/50 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Website Temporarily Suspended
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-slate-300 text-lg">
              <span className="font-semibold text-white">{clubName}</span> has been temporarily restricted.
            </p>
            <p className="text-slate-400">
              {reason || 'This website has been suspended due to pending payment. Please contact the administrator to restore access.'}
            </p>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <p className="text-sm text-slate-400 mb-4">
              For inquiries, please contact:
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a 
                href="mailto:support@innovaradynamics.com" 
                className="flex items-center justify-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                support@innovaradynamics.com
              </a>
              <a 
                href="tel:+919999999999" 
                className="flex items-center justify-center gap-2 text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                +91 99999 99999
              </a>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Innovara Dynamics. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuspendedClub;