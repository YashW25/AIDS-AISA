import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Plus, Award, Search, Upload, FileImage, Download, Eye, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormModal } from '@/components/admin/FormModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useClub } from '@/contexts/ClubContext';
import { Slider } from '@/components/ui/slider';

interface Certificate {
  id: string;
  user_id: string;
  event_id: string;
  certificate_type: string;
  certificate_number: string;
  certificate_url: string | null;
  rank: string | null;
  issued_at: string;
  user_profiles: { full_name: string; enrollment_number: string } | null;
  events: { title: string } | null;
}

interface Template {
  id: string;
  club_id: string;
  event_id: string | null;
  template_name: string;
  template_url: string;
  name_position_x: number;
  name_position_y: number;
  date_position_x: number;
  date_position_y: number;
  cert_number_position_x: number;
  cert_number_position_y: number;
  qr_position_x: number;
  qr_position_y: number;
  rank_position_x: number;
  rank_position_y: number;
  font_size: number;
  font_color: string;
  is_active: boolean;
  events?: { title: string } | null;
}

interface User {
  user_id: string;
  full_name: string;
  enrollment_number: string;
}

interface Event {
  id: string;
  title: string;
}

const CertificatesPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { clubId } = useClub();
  
  // Issue certificate state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [certType, setCertType] = useState('participation');
  const [rank, setRank] = useState('');
  
  // Template state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [templateEventId, setTemplateEventId] = useState('');
  const [namePos, setNamePos] = useState({ x: 50, y: 50 });
  const [datePos, setDatePos] = useState({ x: 50, y: 65 });
  const [certNumPos, setCertNumPos] = useState({ x: 85, y: 90 });
  const [qrPos, setQrPos] = useState({ x: 10, y: 80 });
  const [rankPos, setRankPos] = useState({ x: 50, y: 45 });
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('#000000');
  
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);

  // Fetch certificates
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['admin-certificates', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select(`*, events!inner (title, club_id)`)
        .eq('events.club_id', clubId)
        .order('issued_at', { ascending: false });
      if (error) throw error;
      
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, enrollment_number')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data.map(cert => ({
        ...cert,
        user_profiles: profileMap.get(cert.user_id) || null,
      })) as Certificate[];
    },
    enabled: !!clubId,
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ['certificate-templates', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificate_templates')
        .select(`*, events (title)`)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Template[];
    },
    enabled: !!clubId,
  });

  // Fetch users with registrations
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-list', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, enrollment_number')
        .eq('club_id', clubId)
        .order('full_name');
      if (error) throw error;
      return data as User[];
    },
    enabled: !!clubId,
  });

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ['admin-events-list', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('club_id', clubId)
        .order('event_date', { ascending: false });
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!clubId,
  });

  // Create/Update template mutation
  const templateMutation = useMutation({
    mutationFn: async () => {
      if (!templateName || !templateUrl) throw new Error('Template name and image are required');
      
      const templateData = {
        club_id: clubId,
        event_id: templateEventId || null,
        template_name: templateName,
        template_url: templateUrl,
        name_position_x: namePos.x,
        name_position_y: namePos.y,
        date_position_x: datePos.x,
        date_position_y: datePos.y,
        cert_number_position_x: certNumPos.x,
        cert_number_position_y: certNumPos.y,
        qr_position_x: qrPos.x,
        qr_position_y: qrPos.y,
        rank_position_x: rankPos.x,
        rank_position_y: rankPos.y,
        font_size: fontSize,
        font_color: fontColor,
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('certificate_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('certificate_templates')
          .insert(templateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
      toast({ title: editingTemplate ? 'Template updated' : 'Template created successfully' });
      closeTemplateModal();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Generate certificate mutation
  const generateCertificate = async () => {
    if (!selectedUser || !selectedEvent || !selectedTemplate) {
      toast({ title: 'Please select user, event, and template', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: {
          user_id: selectedUser,
          event_id: selectedEvent,
          template_id: selectedTemplate,
          certificate_type: certType,
          rank: rank || null,
          club_id: clubId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
      toast({ title: 'Certificate generated successfully' });
      
      // Offer download
      if (data.certificateUrl) {
        window.open(data.certificateUrl, '_blank');
      }
      
      closeIssueModal();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const closeIssueModal = () => {
    setIssueModalOpen(false);
    setSelectedUser('');
    setSelectedEvent('');
    setSelectedTemplate('');
    setCertType('participation');
    setRank('');
  };

  const closeTemplateModal = () => {
    setTemplateModalOpen(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateUrl('');
    setTemplateEventId('');
    setNamePos({ x: 50, y: 50 });
    setDatePos({ x: 50, y: 65 });
    setCertNumPos({ x: 85, y: 90 });
    setQrPos({ x: 10, y: 80 });
    setRankPos({ x: 50, y: 45 });
    setFontSize(24);
    setFontColor('#000000');
  };

  const openEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.template_name);
    setTemplateUrl(template.template_url);
    setTemplateEventId(template.event_id || '');
    setNamePos({ x: template.name_position_x, y: template.name_position_y });
    setDatePos({ x: template.date_position_x, y: template.date_position_y });
    setCertNumPos({ x: template.cert_number_position_x, y: template.cert_number_position_y });
    setQrPos({ x: template.qr_position_x, y: template.qr_position_y });
    setRankPos({ x: template.rank_position_x, y: template.rank_position_y });
    setFontSize(template.font_size);
    setFontColor(template.font_color);
    setTemplateModalOpen(true);
  };

  const filteredCertificates = certificates.filter(cert => {
    return search === '' || 
      cert.user_profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      cert.user_profiles?.enrollment_number?.toLowerCase().includes(search.toLowerCase()) ||
      cert.events?.title?.toLowerCase().includes(search.toLowerCase()) ||
      cert.certificate_number?.toLowerCase().includes(search.toLowerCase());
  });

  const getCertColor = (type: string) => {
    switch (type) {
      case 'winner': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'runner_up': return 'bg-gray-400/10 text-gray-600 border-gray-400/20';
      case 'special': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Certificates</h1>
          <p className="text-muted-foreground">Manage templates and issue certificates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTemplateModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
          <Button onClick={() => setIssueModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Certificate
          </Button>
        </div>
      </div>

      <Tabs defaultValue="certificates">
        <TabsList>
          <TabsTrigger value="certificates">Issued Certificates</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, enrollment, event, or certificate number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Certificates List */}
          <Card>
            <CardHeader>
              <CardTitle>Issued Certificates ({filteredCertificates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredCertificates.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No certificates issued yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCertificates.map((cert) => (
                    <div key={cert.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className={getCertColor(cert.certificate_type)}>
                          {cert.certificate_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(cert.issued_at), 'PP')}
                        </span>
                      </div>
                      <h4 className="font-semibold">{cert.user_profiles?.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{cert.user_profiles?.enrollment_number}</p>
                      <p className="text-sm text-primary mt-2">{cert.events?.title}</p>
                      {cert.rank && (
                        <p className="text-sm font-medium text-yellow-600 mt-1">Rank: {cert.rank}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{cert.certificate_number}</p>
                      {cert.certificate_url && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3 mr-1" /> View
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={cert.certificate_url} download>
                              <Download className="h-3 w-3 mr-1" /> Download
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Templates ({templates.length})</CardTitle>
              <CardDescription>Upload and configure certificate templates for each event</CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <FileImage className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No templates uploaded yet</p>
                  <Button className="mt-4" onClick={() => setTemplateModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Template
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-[16/9] relative bg-muted">
                        <img 
                          src={template.template_url} 
                          alt={template.template_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold">{template.template_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.events?.title || 'General Template'}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-3 w-full"
                          onClick={() => openEditTemplate(template)}
                        >
                          <Settings2 className="h-3 w-3 mr-1" /> Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Issue Certificate Modal */}
      <FormModal title="Generate Certificate" open={issueModalOpen} onClose={closeIssueModal}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Template *</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.template_name} {template.events?.title ? `(${template.events.title})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select User *</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name} ({user.enrollment_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Event *</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Certificate Type *</Label>
            <Select value={certType} onValueChange={setCertType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participation">Participation</SelectItem>
                <SelectItem value="winner">Winner</SelectItem>
                <SelectItem value="runner_up">Runner Up</SelectItem>
                <SelectItem value="special">Special Recognition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {certType !== 'participation' && (
            <div className="space-y-2">
              <Label>Rank/Position</Label>
              <Input
                placeholder="e.g., 1, 2, 3 or Best Performer"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={closeIssueModal}>Cancel</Button>
            <Button onClick={generateCertificate} disabled={generating}>
              {generating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate Certificate
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Template Modal */}
      <FormModal 
        title={editingTemplate ? 'Edit Template' : 'Upload Certificate Template'} 
        open={templateModalOpen} 
        onClose={closeTemplateModal}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label>Template Name *</Label>
            <Input
              placeholder="e.g., Participation Certificate 2025"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Event (Optional)</Label>
            <Select
              value={templateEventId || '__none__'}
              onValueChange={(v) => setTemplateEventId(v === '__none__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event or leave for general use" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">General Template</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Template Image *</Label>
            <ImageUpload
              value={templateUrl}
              onChange={setTemplateUrl}
              folder="certificate-templates"
            />
            <p className="text-xs text-muted-foreground">
              Upload a blank certificate template (PNG or JPG). Text will be overlaid on this.
            </p>
          </div>

          {templateUrl && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Position Settings (% from top-left)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm">Name Position X: {namePos.x}%</Label>
                    <Slider 
                      value={[namePos.x]} 
                      onValueChange={([v]) => setNamePos(p => ({...p, x: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm">Name Position Y: {namePos.y}%</Label>
                    <Slider 
                      value={[namePos.y]} 
                      onValueChange={([v]) => setNamePos(p => ({...p, y: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-3">
                    <Label className="text-sm">Rank Position X: {rankPos.x}%</Label>
                    <Slider 
                      value={[rankPos.x]} 
                      onValueChange={([v]) => setRankPos(p => ({...p, x: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm">Rank Position Y: {rankPos.y}%</Label>
                    <Slider 
                      value={[rankPos.y]} 
                      onValueChange={([v]) => setRankPos(p => ({...p, y: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-3">
                    <Label className="text-sm">Date/Event X: {datePos.x}%</Label>
                    <Slider 
                      value={[datePos.x]} 
                      onValueChange={([v]) => setDatePos(p => ({...p, x: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm">Date/Event Y: {datePos.y}%</Label>
                    <Slider 
                      value={[datePos.y]} 
                      onValueChange={([v]) => setDatePos(p => ({...p, y: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-3">
                    <Label className="text-sm">QR Code X: {qrPos.x}%</Label>
                    <Slider 
                      value={[qrPos.x]} 
                      onValueChange={([v]) => setQrPos(p => ({...p, x: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm">QR Code Y: {qrPos.y}%</Label>
                    <Slider 
                      value={[qrPos.y]} 
                      onValueChange={([v]) => setQrPos(p => ({...p, y: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-3">
                    <Label className="text-sm">Cert Number X: {certNumPos.x}%</Label>
                    <Slider 
                      value={[certNumPos.x]} 
                      onValueChange={([v]) => setCertNumPos(p => ({...p, x: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm">Cert Number Y: {certNumPos.y}%</Label>
                    <Slider 
                      value={[certNumPos.y]} 
                      onValueChange={([v]) => setCertNumPos(p => ({...p, y: v}))} 
                      min={0} max={100} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-3">
                    <Label className="text-sm">Font Size: {fontSize}px</Label>
                    <Slider 
                      value={[fontSize]} 
                      onValueChange={([v]) => setFontSize(v)} 
                      min={12} max={48} 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm">Font Color</Label>
                    <Input 
                      type="color" 
                      value={fontColor} 
                      onChange={(e) => setFontColor(e.target.value)}
                      className="h-10 w-full"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={closeTemplateModal}>Cancel</Button>
            <Button onClick={() => templateMutation.mutate()} disabled={templateMutation.isPending}>
              {templateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default CertificatesPage;
