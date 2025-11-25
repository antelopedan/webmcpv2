
import type { ReportBrandsConfig, BrandDisplayItem } from '../../types';

// Helper to extract searchable brand names from the new ReportBrandsConfig structure
export const getBrandNamesFromReport = (brandsConfig: ReportBrandsConfig | null): string[] => {
    if (!brandsConfig || !brandsConfig.display) return [];
    
    return brandsConfig.display
        .filter(item => item.type === 'logo')
        .map(item => item.name);
};

// Helper to get the first brand for display purposes (e.g. headers)
export const getFirstBrandItem = (brandsConfig: ReportBrandsConfig | null): BrandDisplayItem | null => {
    if (!brandsConfig || !brandsConfig.display) return null;
    return brandsConfig.display.find(item => item.type === 'logo') || null;
};

export const getCategoryColor = (category: string): string => {
    const colors = ['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-pink-500', 'bg-sky-500', 'bg-rose-500'];
    if (!category || category.length === 0) return colors[0];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
};
