import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  FileText, Save, ExternalLink, Info, ChevronDown, ChevronUp,
  Copy, Download, CheckCheck,
} from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteData';

const SAMPLE_CHARTER_TEXT = (clubName: string, clubFullName: string, college: string) => `
═══════════════════════════════════════════════════════════════
           OFFICIAL CHARTER & CONSTITUTION
     ${clubFullName} (${clubName})
          ${college}, Pune
═══════════════════════════════════════════════════════════════

PREAMBLE
────────
We, the students of the Artificial Intelligence & Data Science
department at ${college}, Pune, hereby establish the
${clubFullName} (${clubName}) to foster technical excellence,
collaborative learning, and professional development among our
student community.


ARTICLE I — NAME & IDENTITY
────────────────────────────
1.1  Full Name   : ${clubFullName}
1.2  Short Name  : ${clubName} Club
1.3  Department  : Artificial Intelligence & Data Science (AI&DS)
1.4  Institution : ${college}, Pune
1.5  Type        : Non-profit, student-run organization


ARTICLE II — MISSION & VISION
──────────────────────────────
2.1  MISSION
     To foster technical excellence and professional growth among
     AI & DS students through workshops, hackathons, seminars, and
     industry collaborations — bridging the gap between academic
     knowledge and real-world application.

2.2  VISION
     To be the premier student-led organization that empowers future
     AI & DS engineers with the skills, knowledge, and professional
     network needed to become innovators and responsible leaders.


ARTICLE III — OBJECTIVES
─────────────────────────
The ${clubName} Club shall strive to:

3.1  Organize technical workshops, seminars, and training sessions
     relevant to Artificial Intelligence, Machine Learning, and
     Data Science.

3.2  Conduct hackathons, coding contests, and project exhibitions
     to encourage innovation and problem-solving.

3.3  Facilitate industry-academia interaction through guest lectures,
     industrial visits, and internship drives.

3.4  Provide a platform for students to publish research, showcase
     projects, and build professional portfolios.

3.5  Promote awareness of ethical AI and responsible technology
     development practices.

3.6  Support interdisciplinary collaboration between students of
     all academic years.

3.7  Organize cultural, sports, and social events to build community
     spirit and belonging among members.

3.8  Maintain an active online presence through social media,
     newsletters, and event documentation.


ARTICLE IV — CORE VALUES
─────────────────────────
4.1  EXCELLENCE    — Striving for the highest standards in all
                     our endeavors.
4.2  INTEGRITY     — Maintaining honesty and transparency in all
                     club activities.
4.3  COLLABORATION — Working together to achieve shared goals and
                     support every member.
4.4  INNOVATION    — Embracing creative thinking and new ideas to
                     solve real-world problems.
4.5  RESPECT       — Valuing every member's contribution and
                     maintaining an inclusive environment.
4.6  LEADERSHIP    — Developing future leaders through mentorship,
                     responsibility, and initiative.


ARTICLE V — CLUB STRUCTURE & OFFICE BEARERS
─────────────────────────────────────────────
5.1  FACULTY ADVISOR
     • Appointed by the HOD/Department.
     • Provides guidance and approves major decisions.
     • Acts as liaison between the club and college administration.

5.2  PRESIDENT
     • Elected by the student members annually.
     • Responsible for overall operations of the club.
     • Represents the club in all official matters.
     • Chairs all executive and general body meetings.

5.3  VICE PRESIDENT
     • Assists the President in all club activities.
     • Oversees project execution and task delegation.
     • Takes over all Presidential duties in the President's absence.

5.4  GENERAL SECRETARY
     • Maintains all club records and correspondence.
     • Prepares and circulates meeting minutes.
     • Handles administrative tasks and official communication.

5.5  TREASURER
     • Manages all club finances and accounts.
     • Collects membership fees and event contributions.
     • Prepares and presents financial reports at general meetings.

5.6  TECHNICAL HEAD
     • Leads all technical events, workshops, and hackathons.
     • Oversees the technical sub-committee members.
     • Reviews and approves technical content for club activities.

5.7  EVENT MANAGER
     • Plans logistics, venue, and execution for all events.
     • Coordinates with external vendors and college administration.
     • Prepares event reports post each activity.

5.8  PR & MEDIA HEAD
     • Manages social media accounts and digital presence.
     • Oversees photography, graphic design, and publications.
     • Handles all public communications and outreach.

5.9  COMMITTEE MEMBERS
     • Support heads in organizing and executing activities.
     • Volunteer at events and represent the club.


ARTICLE VI — MEMBERSHIP
────────────────────────
6.1  ELIGIBILITY
     (a) Any student currently enrolled in the AI&DS department
         at ${college} is eligible for full membership.
     (b) Students from other departments may apply for associate
         membership subject to approval by the executive committee.
     (c) Alumni of the department may be awarded honorary membership
         by a resolution of the general body.

6.2  MEMBERSHIP FEE
     The annual membership fee shall be determined by the executive
     committee at the start of each academic year and communicated
     to all eligible students.

6.3  MEMBER RESPONSIBILITIES
     (a) Attend general body meetings and participate in club events.
     (b) Pay applicable membership fees before the stipulated deadline.
     (c) Uphold the club's code of conduct and core values at all times.
     (d) Contribute actively to at least one club initiative per semester.
     (e) Represent the club positively in all academic and social settings.

6.4  TERMINATION OF MEMBERSHIP
     Membership may be terminated for:
     (a) Repeated violation of the code of conduct.
     (b) Non-payment of fees for two consecutive years.
     (c) Misconduct bringing disrepute to the club or institution.
     Termination requires a two-thirds majority vote by the
     executive committee, subject to Faculty Advisor approval.


ARTICLE VII — MEETINGS & DECISION MAKING
─────────────────────────────────────────
7.1  GENERAL BODY MEETING (GBM)
     • Held at least once per semester.
     • Open to all members.
     • Key decisions, annual reports, and elections are conducted.
     • Quorum: 50% of registered members.

7.2  EXECUTIVE COMMITTEE MEETING
     • Held at least once per month.
     • Attended by all office bearers and heads.
     • Reviews ongoing activities, plans future events.
     • Quorum: 50% of executive committee members.

7.3  EMERGENCY MEETING
     • May be called at any time by the President or Faculty Advisor.
     • For urgent matters requiring immediate decision.

7.4  DECISION MAKING
     • Routine decisions: Simple majority (>50%) of present members.
     • Constitutional amendments: Two-thirds (≥67%) majority of
       present members at a GBM.
     • Tie votes are decided by the President's casting vote.
     • All decisions must be recorded in official meeting minutes.


ARTICLE VIII — ELECTIONS
──────────────────────────
8.1  All office bearer positions (except Faculty Advisor) shall be
     filled through elections held annually before the end of the
     academic year (typically in March–April).

8.2  Any full member in good standing (fees paid, no active
     disciplinary action) may contest for any position.

8.3  Elections shall be conducted by a returning officer (a faculty
     member or senior student not contesting) in a free and fair
     manner, either by show of hands or secret ballot.

8.4  The outgoing executive committee shall conduct a formal
     handover to the newly elected team within 7 days of elections.


ARTICLE IX — FINANCES
──────────────────────
9.1  The club shall maintain a dedicated bank account in the name
     of the ${clubName} Club, operated jointly by the Treasurer
     and Faculty Advisor.

9.2  All expenditures above ₹1,000 require prior approval from
     the President and Faculty Advisor.

9.3  A financial report shall be presented at every General Body
     Meeting, and an annual audit shall be conducted at the end of
     each academic year.

9.4  No member shall derive personal financial benefit from club
     funds or activities.


ARTICLE X — RULES & CODE OF CONDUCT
──────────────────────────────────────
10.1 All members must behave respectfully and professionally at all
     club events, meetings, and online platforms.

10.2 Members must not misuse club resources, funds, or the club's
     name for personal gain or political purposes.

10.3 Plagiarism, dishonesty, or unethical behavior at any club
     event will result in immediate disqualification and may lead
     to further disciplinary action.

10.4 Any member found violating the code of conduct may be issued
     a written warning, suspended for a period, or removed from
     membership by a majority vote of the executive committee.

10.5 Conflicts of interest must be disclosed to the President or
     Faculty Advisor immediately upon identification.

10.6 All club communications must be inclusive, free from
     discrimination, and respectful of diversity in gender, caste,
     religion, region, and socioeconomic background.

10.7 Members leaving the club or completing their term must return
     all club property and complete a formal handover of their
     responsibilities and records.


ARTICLE XI — AMENDMENTS & RATIFICATION
────────────────────────────────────────
11.1 Any proposed amendment to this Charter must be submitted in
     writing to the General Secretary at least 14 days before a
     General Body Meeting.

11.2 Amendments require approval by a two-thirds majority of
     members present at the General Body Meeting, AND final
     ratification by the Faculty Advisor.

11.3 Amendments come into effect from the date of the Faculty
     Advisor's ratification signature.

11.4 The amended Charter shall be published and made available to
     all members within 7 days of ratification.


ARTICLE XII — DISSOLUTION
───────────────────────────
12.1 The club may be dissolved only if:
     (a) A two-thirds majority of the general body votes in favor, AND
     (b) The Faculty Advisor and Department Head approve the dissolution.

12.2 Upon dissolution, all remaining club assets and funds shall be
     transferred to the department for academic use, as decided by
     the Faculty Advisor and HOD.


═══════════════════════════════════════════════════════════════
RATIFICATION
═══════════════════════════════════════════════════════════════

This Charter is hereby ratified and comes into effect on the
date of signing below.


President                       Faculty Advisor
${clubName} Club              AI&DS Department

___________________________     ___________________________
Name:                           Name:
Date:                           Date:


HOD, AI&DS Department           Principal
${college}            ${college}

___________________________     ___________________________
Name:                           Name:
Date:                           Date:


═══════════════════════════════════════════════════════════════
     © ${clubFullName} — All Rights Reserved
═══════════════════════════════════════════════════════════════
`.trim();

const CharterPage = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    title: 'AISA Club Charter',
    description: '',
    file_url: '',
    drive_url: '',
  });
  const [showSample, setShowSample] = useState(false);
  const [copied, setCopied] = useState(false);

  const clubName = settings?.club_name || 'AISA';
  const clubFullName = settings?.club_full_name || 'Artificial Intelligence and Student Association';
  const college = settings?.college_name || 'ISBM College of Engineering';
  const sampleText = SAMPLE_CHARTER_TEXT(clubName, clubFullName, college);

  const { data: charter, isLoading } = useQuery({
    queryKey: ['charter-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charter_settings')
        .select('id, title, description, file_url, drive_url')
        .limit(1)
        .maybeSingle();
      if (error) { console.error(error); return null; }
      return data;
    },
  });

  useEffect(() => {
    if (charter) {
      setFormData({
        title: (charter as any).title || 'AISA Club Charter',
        description: (charter as any).description || '',
        file_url: (charter as any).file_url || '',
        drive_url: (charter as any).drive_url || '',
      });
    }
  }, [charter]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if ((charter as any)?.id) {
        const { error } = await supabase
          .from('charter_settings')
          .update(data as any)
          .eq('id', (charter as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('charter_settings')
          .insert(data as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charter-settings'] });
      queryClient.invalidateQueries({ queryKey: ['charter-settings-admin'] });
      toast.success('Charter settings updated successfully');
    },
    onError: (error: any) => toast.error(`Failed to update: ${error.message}`),
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sampleText);
      setCopied(true);
      toast.success('Sample charter copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Copy failed — please select and copy manually.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sampleText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clubName}_Charter_Template.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Charter template downloaded!');
  };

  const documentUrl = formData.file_url || formData.drive_url;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Charter</h1>
        <p className="text-muted-foreground">Manage the Charter document displayed on the public Charter page.</p>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">How the Charter page works</p>
          <p className="text-blue-700 dark:text-blue-300">
            The public <strong>/charter</strong> page always shows the club's mission, vision, core values, and structure.
            Upload a PDF or paste a Drive link below and it will appear as an embedded viewer with download options.
          </p>
        </div>
      </div>

      {/* ── Settings Form ── */}
      <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(formData); }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Charter Document Settings
            </CardTitle>
            <CardDescription>
              Set the title, description, and document link for the public Charter page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="AISA Club Charter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (shown in the hero section)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="The guiding principles and constitution that define our organization's purpose and governance..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file_url">Direct File URL (PDF)</Label>
              <Input
                id="file_url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                placeholder="https://... (paste the uploaded PDF URL here)"
              />
              <p className="text-xs text-muted-foreground">
                Paste the URL after uploading to Supabase Storage, Google Drive, or any file host.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drive_url">Google Drive Link (alternative)</Label>
              <Input
                id="drive_url"
                value={formData.drive_url}
                onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
              />
              <p className="text-xs text-muted-foreground">
                Share your Google Drive file publicly ("Anyone with the link can view") before pasting here.
              </p>
            </div>

            {documentUrl && (
              <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Document linked</p>
                  <p className="text-xs text-muted-foreground truncate">{documentUrl}</p>
                </div>
                <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="outline" size="sm" className="gap-2 flex-shrink-0">
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
                </a>
              </div>
            )}

            <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* ── Sample Charter Template ── */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setShowSample(v => !v)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base text-amber-900 dark:text-amber-200">
                  Sample Charter Template
                </CardTitle>
                <CardDescription className="text-amber-700/70 dark:text-amber-400/70 text-xs mt-0.5">
                  Use this as a reference to draft your official charter document
                </CardDescription>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" className="text-amber-700 dark:text-amber-400 gap-1.5">
              {showSample ? (
                <><ChevronUp className="w-4 h-4" />Hide</>
              ) : (
                <><ChevronDown className="w-4 h-4" />View Sample</>
              )}
            </Button>
          </div>
        </CardHeader>

        {showSample && (
          <CardContent className="space-y-4">
            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-border">
              <p className="text-sm text-muted-foreground flex-1">
                This is a <strong>ready-to-use template</strong> pre-filled with your club details.
                Copy the text, paste it into MS Word or Google Docs, format it, and save as PDF.
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleCopy}
                >
                  {copied
                    ? <><CheckCheck className="w-4 h-4 text-green-600" />Copied!</>
                    : <><Copy className="w-4 h-4" />Copy Text</>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                  Download .txt
                </Button>
              </div>
            </div>

            {/* The charter text */}
            <div className="relative">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-foreground bg-muted/40 border border-border rounded-xl p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
                {sampleText}
              </pre>
            </div>

            {/* How-to steps */}
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900">
              <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                Steps to create your official charter PDF:
              </p>
              <ol className="text-sm text-green-800 dark:text-green-300 space-y-1 list-decimal list-inside">
                <li>Click <strong>"Download .txt"</strong> or <strong>"Copy Text"</strong> above.</li>
                <li>Paste into <strong>Microsoft Word</strong> or <strong>Google Docs</strong>.</li>
                <li>Format with your college letterhead, logo, and signature blocks.</li>
                <li>Get it signed by the President, Faculty Advisor, HOD, and Principal.</li>
                <li>Export as <strong>PDF</strong> and upload the link back here.</li>
              </ol>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CharterPage;
