export const SEO_CONFIG = {
    defaultTitle: 'AISA Club | AI&DS Department, Pune',
    titleTemplate: '%s | AISA Club - ISBM COE',
    description: 'AISA Club at AI&DS Department, Pune fosters student innovation, research, startups, and entrepreneurship through mentorship and incubation support.',
    siteUrl: 'https://aisaclub.isbm.co.in',
    siteName: 'AISA Club - ISBM COE',
    twitterHandle: '@isbm_pune', // Replace with actual handle if available
    defaultImage: '/og-image.png',
    keywords: [
        'AISA Club AI&DS Department',
        'ISBM AISA Club Pune',
        'AISA Club in AI&DS Department',
        'College AISA Club Pune',
        'AISA Club Engineering College Pune',
        'AISA Club in Pune',
        'Best AISA Club in Pune',
        'AISA Club Engineering College Pune Maharashtra',
        'Student AISA Club Pune',
        'AISA Club Maharashtra',
        'Research and AISA Club ISBM',
        'Institutional AISA Club ISBMCOE',
        'Innovation and Entrepreneurship Cell Pune',
        'Campus Innovation Hub ISBM',
        'Student Research and Innovation Pune',
        'Startup Incubation Cell Pune',
        'Entrepreneurship Development Cell ISBM',
        'Student Startup Support Pune',
        'Innovation and Startup Ecosystem Pune',
        'College Startup Incubation Maharashtra',
        'Engineering Student Innovation Projects Pune',
        'AI IoT Student Projects Pune',
        'Research and Development Cell ISBM',
        'Emerging Technology Innovation Pune',
        'Final Year Engineering Innovation Projects'
    ]
};

export const generateOrganizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'AISA Club - AI&DS Department',
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}/logo.png`, // Verify logo path
    sameAs: [
        'https://www.facebook.com/isbmpune',
        'https://twitter.com/isbm_pune',
        'https://www.linkedin.com/school/isbm-college-of-engineering-pune',
        'https://www.instagram.com/isbm_pune'
    ],
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'S. No. 44/1, 44/1/2, Nande Village, Pashan Sus Road',
        addressLocality: 'Pune',
        addressRegion: 'Maharashtra',
        postalCode: '412115',
        addressCountry: 'IN'
    },
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-20-22933441',
        contactType: 'customer service'
    }
});

export const generateBreadcrumbSchema = (items: { name: string; item: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${SEO_CONFIG.siteUrl}${item.item}`
    }))
});
