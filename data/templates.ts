
import React from 'react';
import {
    CategoryContentPerformanceIcon,
    CategoryCompetitorAnalysisIcon,
    CategoryAudienceInsightsIcon,
    CategoryViralContentIcon,
    CategoryBrandHealthIcon,
} from '../components/icons/home';

export const templateCategories = [
    { name: 'Content Performance' },
    { name: 'Competitor Analysis' },
    { name: 'Audience Insights' },
    { name: 'Viral Content' },
    { name: 'Brand Health' },
];

export const iconComponentMap: { [key: string]: React.FC<{ className?: string }> } = {
    'Content Performance': CategoryContentPerformanceIcon,
    'Competitor Analysis': CategoryCompetitorAnalysisIcon,
    'Audience Insights': CategoryAudienceInsightsIcon,
    'Viral Content': CategoryViralContentIcon,
    'Brand Health': CategoryBrandHealthIcon,
    'Trend Analysis': CategoryCompetitorAnalysisIcon, // Fallback icon
};