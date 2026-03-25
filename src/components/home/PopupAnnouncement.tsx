import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface PopupData {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  link_text: string | null;
}

export const PopupAnnouncement = () => {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchPopup = async () => {
      const { data } = await supabase
        .from('popup_announcements')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true })
        .limit(1)
        .single();

      if (data) {
        // Check if user has dismissed this popup in this session
        const dismissedPopups = sessionStorage.getItem('dismissedPopups');
        const dismissed = dismissedPopups ? JSON.parse(dismissedPopups) : [];
        
        if (!dismissed.includes(data.id)) {
          setPopup(data);
          setOpen(true);
        }
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    if (popup) {
      const dismissedPopups = sessionStorage.getItem('dismissedPopups');
      const dismissed = dismissedPopups ? JSON.parse(dismissedPopups) : [];
      dismissed.push(popup.id);
      sessionStorage.setItem('dismissedPopups', JSON.stringify(dismissed));
    }
    setOpen(false);
  };

  if (!popup) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[350px] sm:max-w-[400px] md:max-w-[450px] p-0 border-2 border-primary/50 overflow-hidden bg-transparent">
        <DialogTitle className="sr-only">{popup.title}</DialogTitle>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <img
            src={popup.image_url}
            alt={popup.title}
            className="w-full max-h-[60vh] object-contain rounded-lg"
          />
          
          {popup.link_url && (
            <div className="absolute bottom-4 right-4">
              {popup.link_url.startsWith('http') ? (
                <a href={popup.link_url} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold">
                    {popup.link_text || 'Register Now'}
                  </Button>
                </a>
              ) : (
                <Link to={popup.link_url}>
                  <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold">
                    {popup.link_text || 'Register Now'}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
