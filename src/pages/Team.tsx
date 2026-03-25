import { Linkedin, Mail } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTeamMembers } from '@/hooks/useSiteData';
import { useTeamCategories } from '@/hooks/useTeamCategories';
import { generateBreadcrumbSchema } from '@/lib/seo';

const Team = () => {
  const { data: members, isLoading } = useTeamMembers();
  const { data: categories = [] } = useTeamCategories();

  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);

  const categoryOrder = categories.map(c => c.name);

  const getInitials = (name?: string | null) => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0] || '').join('').toUpperCase().slice(0, 2) || '??';
  };

  const groupedMembers = categoryOrder.reduce((acc, category) => {
    const categoryMembers = members?.filter(m => m.category === category) || [];
    if (categoryMembers.length > 0) {
      acc[category] = categoryMembers;
    }
    return acc;
  }, {} as Record<string, typeof members>);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Our Team', item: '/team' },
  ]);

  return (
    <MainLayout
      title="Our Team"
      description="Meet the dedicated faculty coordinators, core team members, and student leaders driving innovation, research, and entrepreneurship at AI&DS Department, Pune."
      keywords="AISA Club Team ISBM, Student Leaders Pune, Faculty Coordinators ISBM, Engineering College Team Maharashtra, AISA Club Members"
      schema={breadcrumbSchema}
    >
      {/* Hero */}
      <section className="py-16 md:py-24 gradient-hero relative overflow-hidden">
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our Team
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Meet the dedicated individuals who drive innovation and excellence at our organization
            </p>
          </div>
        </div>
      </section>

      {/* Team Sections */}
      <div className="bg-background min-h-screen">
        {isLoading ? (
          <section className="py-16">
            <div className="container">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl bg-card border border-border p-8 animate-pulse">
                    <div className="w-28 h-28 rounded-full bg-muted mx-auto mb-4" />
                    <div className="h-5 bg-muted rounded w-3/4 mx-auto mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          Object.entries(groupedMembers).map(([category, categoryMembers]) => (
            <section key={category} className="py-12 first:pt-16">
              <div className="container">
                <div className="text-center mb-10">
                  <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    {categoryLabels[category] || category}
                  </h2>
                  <div className="mt-3 mx-auto w-20 h-1 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent" />
                </div>
                <div className={`grid gap-6 ${category === 'faculty' || (categoryMembers?.length || 0) <= 3
                  ? 'sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto justify-items-center'
                  : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}>
                  {categoryMembers?.map((member, index) => (
                    <article
                      key={member.id}
                      className="group w-full max-w-sm rounded-2xl bg-gradient-to-b from-card to-card/80 border border-accent/20 hover:border-accent/50 p-8 text-center transition-all duration-500 animate-fade-in hover:shadow-[0_0_30px_-5px_hsl(var(--accent)/0.3)]"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative mb-6 mx-auto w-32 h-32">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent via-accent/50 to-accent opacity-80 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500" />
                        <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-br from-accent to-accent/60">
                          {member.image_url ? (
                            <img
                              src={member.image_url}
                              alt={`${member.name} - ${member.role} at AISA Club ISBM`}
                              className="w-full h-full rounded-full object-cover bg-background"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full flex items-center justify-center bg-background text-accent font-display text-2xl font-bold">
                              {getInitials(member.name)}
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-accent font-medium text-sm mb-4">{member.role}</p>
                      {member.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{member.description}</p>
                      )}
                      {(() => {
                        let skillsArray = [];

                        if (Array.isArray(member.skills)) {
                          skillsArray = member.skills;
                        } else if (typeof member.skills === "string") {
                          skillsArray = member.skills.split(",").map(s => s.trim());
                        }

                        return skillsArray.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1 mb-4">
                            {skillsArray.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 rounded-md bg-accent/10 text-accent/80 text-xs border border-accent/20"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                      {(member.linkedin_url || member.email) && (
                        <div className="flex justify-center gap-3 mt-auto pt-2">
                          {member.linkedin_url && (
                            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                              className="p-2.5 rounded-lg border border-accent/30 text-accent/70 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300"
                              aria-label={`${member.name}'s LinkedIn profile`}>
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {member.email && (
                            <a href={`mailto:${member.email}`}
                              className="p-2.5 rounded-lg border border-accent/30 text-accent/70 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300"
                              aria-label={`Email ${member.name}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ))
        )}

        {!isLoading && Object.keys(groupedMembers).length === 0 && (
          <section className="py-16">
            <div className="container">
              <div className="text-center py-12 text-muted-foreground">
                No team members found
              </div>
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default Team;
