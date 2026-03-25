import { useParams } from 'react-router-dom';
import { useCustomPageBySlug } from '@/hooks/useCustomPages';
import { MainLayout } from '@/components/layout/MainLayout';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '@/hooks/useSiteData';

const CustomPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useCustomPageBySlug(slug || '');
  const { data: settings } = useSiteSettings();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-20 text-center text-muted-foreground">Loading...</div>
      </MainLayout>
    );
  }

  if (error || !page) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>{page.title} | {settings?.club_name || 'Site'}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
      </Helmet>
      <section className="py-16">
        <div className="container max-w-4xl">
          <h1 className="font-display text-4xl font-bold text-foreground mb-8">{page.title}</h1>
          {page.content && (
            <div
              className="prose prose-lg max-w-none text-foreground
                prose-headings:font-display prose-headings:text-foreground
                prose-p:text-muted-foreground prose-a:text-primary
                prose-img:rounded-xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default CustomPage;
