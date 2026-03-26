import { useState, useEffect } from 'react';
import { X, Bell, Download, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface NoticeItem {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  published_date: string | null;
}

export const NoticePopup = () => {
  const [notice, setNotice] = useState<NoticeItem | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchLatestNotice = async () => {
      const { data } = await supabase
        .from('news')
        .select('id, title, content, image_url, attachment_url, attachment_type, published_date')
        .eq('is_active', true)
        .eq('is_marquee', true)
        .order('published_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const key = `notice_popup_seen_${data.id}`;
        const alreadySeen = sessionStorage.getItem(key);
        if (!alreadySeen) {
          setNotice(data);
          setOpen(true);
        }
      }
    };

    fetchLatestNotice();
  }, []);

  const handleClose = () => {
    if (notice) {
      sessionStorage.setItem(`notice_popup_seen_${notice.id}`, '1');
    }
    setOpen(false);
  };

  if (!notice) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[380px] sm:max-w-[440px] p-0 border-2 border-primary/40 overflow-hidden">
        <DialogTitle className="sr-only">{notice.title}</DialogTitle>

        {/* Header bar */}
        <div className="gradient-primary px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-white shrink-0" />
            <span className="text-white text-sm font-semibold uppercase tracking-wide">
              Notice
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-7 w-7 shrink-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image (if any) */}
        {notice.image_url && (
          <div className="w-full max-h-52 overflow-hidden">
            <img
              src={notice.image_url}
              alt={notice.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <h3 className="text-base font-bold text-foreground leading-snug">{notice.title}</h3>

          {notice.published_date && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(notice.published_date), 'dd MMM yyyy')}
            </div>
          )}

          {notice.content && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {notice.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {notice.attachment_url && (
              <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="sm" className="w-full gap-2 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  Download Attachment
                </Button>
              </a>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-xs"
              onClick={handleClose}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
