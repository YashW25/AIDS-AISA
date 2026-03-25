import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Database, Shield, ExternalLink, CheckCircle, XCircle, Loader2, Copy, Info } from 'lucide-react';
import { useAllClubs } from '@/hooks/useClubAdminData';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const SuperAdminSettings = () => {
  const { data: clubs = [] } = useAllClubs();
  const [testDomain, setTestDomain] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; club?: string; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const testDomainDetection = () => {
    setTesting(true);
    setTestResult(null);

    setTimeout(() => {
      // Simulate domain detection logic
      const hostname = testDomain.toLowerCase().trim();
      
      // Check against clubs
      const matchedClub = clubs.find(club => 
        club.primary_domain === hostname || 
        club.staging_domain === hostname ||
        hostname.startsWith(club.slug + '-') ||
        hostname.startsWith(club.slug + '.')
      );

      if (matchedClub) {
        setTestResult({
          success: true,
          club: matchedClub.name,
          message: `Domain "${hostname}" will route to club "${matchedClub.name}"`
        });
      } else {
        // Check for slug extraction
        const parts = hostname.split(/[-\.]/);
        const potentialSlug = parts[0];
        const slugMatch = clubs.find(c => c.slug === potentialSlug);
        
        if (slugMatch) {
          setTestResult({
            success: true,
            club: slugMatch.name,
            message: `Domain "${hostname}" will route to club "${slugMatch.name}" (slug match)`
          });
        } else {
          setTestResult({
            success: false,
            message: `No club found for domain "${hostname}". It will fall back to the default club.`
          });
        }
      }
      setTesting(false);
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground">Multi-tenant configuration, domains, and documentation</p>
      </div>

      {/* Domain Tester */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Domain Detection Tester
          </CardTitle>
          <CardDescription>
            Test which club a domain will route to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="e.g., AISA-isbmcoe.netlify.app"
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
              />
            </div>
            <Button onClick={testDomainDetection} disabled={!testDomain || testing}>
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
            </Button>
          </div>
          {testResult && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${testResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{testResult.message}</p>
                {testResult.club && (
                  <p className="text-sm text-muted-foreground mt-1">Club ID will be loaded for: {testResult.club}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configured Domains */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Club Domains</CardTitle>
          <CardDescription>All clubs and their associated domains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clubs.map((club) => (
              <div key={club.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{club.name}</p>
                  <p className="text-sm text-muted-foreground">Slug: {club.slug}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {club.staging_domain && (
                    <Badge variant="secondary" className="text-xs">
                      {club.staging_domain}
                    </Badge>
                  )}
                  {club.primary_domain && (
                    <Badge variant="default" className="text-xs">
                      {club.primary_domain}
                    </Badge>
                  )}
                  {!club.staging_domain && !club.primary_domain && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      No domain configured
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Database Type</span>
                <span className="font-medium">Single, Multi-tenant</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Data Isolation</span>
                <span className="font-medium">Row-Level Security (RLS)</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Club Detection</span>
                <span className="font-medium">Domain/Subdomain Based</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Total Clubs</span>
                <span className="font-medium">{clubs.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Hierarchy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded bg-primary/10">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div>
                <p className="font-medium text-sm">Super Admin</p>
                <p className="text-xs text-muted-foreground">Full access to all clubs and system settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded bg-blue-500/10">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="font-medium text-sm">Club Admin</p>
                <p className="text-xs text-muted-foreground">Full access to assigned club only</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded bg-green-500/10">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium text-sm">Teacher</p>
                <p className="text-xs text-muted-foreground">Limited admin access to assigned club</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded bg-muted">
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Student</p>
                <p className="text-xs text-muted-foreground">Public user, event registration access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DNS Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Domain Configuration Guide
          </CardTitle>
          <CardDescription>
            Step-by-step instructions for setting up club domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="netlify">
              <AccordionTrigger>Netlify Subdomain (Development/Staging)</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  During development, each club uses a Netlify subdomain. All domains point to the same deployment.
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <Label className="text-xs text-muted-foreground">Pattern</Label>
                  <code className="block text-sm">clubslug-collegename.netlify.app</code>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Examples:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>AISA-isbmcoe.netlify.app</li>
                    <li>innovationcell-isbmcoe.netlify.app</li>
                    <li>ecell-isbmcoe.netlify.app</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="platform">
              <AccordionTrigger>Adding Domain in Platform</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to Project Settings → Domains</li>
                  <li>Click "Connect Domain"</li>
                  <li>Enter the domain (e.g., AISA-isbmcoe.netlify.app)</li>
                  <li>Follow DNS verification steps if required</li>
                  <li>Wait for SSL provisioning</li>
                </ol>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3">
                  <Info className="h-5 w-5 text-yellow-500 shrink-0" />
                  <p className="text-sm">All club domains must be added to the hosting platform for SSL to work properly.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="custom">
              <AccordionTrigger>Custom Domain (Production)</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For production, configure custom domains at your DNS provider:
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">A Record (Root & WWW)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm flex-1">185.158.133.1</code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard('185.158.133.1')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">TXT Record (Verification)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm flex-1">_verify → verify_domain=YOUR_CODE</code>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">DNS Records for AISA.isbmcoe.org:</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2">A</td>
                        <td className="py-2">AISA</td>
                        <td className="py-2">185.158.133.1</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">A</td>
                        <td className="py-2">www.AISA</td>
                        <td className="py-2">185.158.133.1</td>
                      </tr>
                      <tr>
                        <td className="py-2">TXT</td>
                        <td className="py-2">_verify.AISA</td>
                        <td className="py-2">verify_domain=ABC123</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="newclub">
              <AccordionTrigger>Adding a New Club</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Create Club:</span> Go to Clubs page and add new club with slug, name, and college
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Set Staging Domain:</span> Enter Netlify subdomain (e.g., newclub-isbmcoe.netlify.app)
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Add to Platform:</span> Add the domain in Project Settings → Domains
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Assign Admin:</span> Create or assign a club admin to manage the club
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Configure Branding:</span> Admin can customize logo, colors, and content
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Production Domain:</span> Later, add custom domain with DNS configuration
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminSettings;
