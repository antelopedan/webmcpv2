
import React from 'react';
// FIX: Corrected import path for types
import type { Brand } from '../types';
import { getSocialIcon } from './utils/socialUtils';
import { BrandAvatar } from './utils/brandUtils';
import { EditIcon } from './icons/EditIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SyncingIcon } from './icons/SyncingIcon';

const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);


interface BrandListProps {
  brands: Brand[];
  onEditBrand: (brand: Brand) => void;
}

export const BrandListItemSkeleton: React.FC = () => (
    <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg shadow-sm">
        <div className="flex items-center space-x-4 overflow-hidden w-full animate-pulse">
            <div className="w-10 h-10 rounded-full bg-border flex-shrink-0"></div>
            <div className="overflow-hidden w-full space-y-2">
                <div className="h-5 bg-border rounded w-3/4"></div>
                <div className="h-4 bg-border rounded w-1/2"></div>
            </div>
        </div>
    </div>
);


const BrandListItem: React.FC<{ brand: Brand; onEdit: (brand: Brand) => void }> = ({ brand, onEdit }) => {
    if (brand.isLoading) {
        return <BrandListItemSkeleton />;
    }
    
    return (
        <div className="group flex items-center justify-between p-4 bg-surface border border-border rounded-lg shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-200">
            <div className="flex items-center space-x-4 overflow-hidden">
                <BrandAvatar name={brand.name} size="w-10 h-10" src={brand.logo_url} />
                <div className="overflow-hidden">
                    <p className="font-semibold text-text-main truncate">{brand.name}</p>
                    <div className="flex items-center gap-3 text-body text-text-secondary mt-1">
                        <span>{brand.social_profiles.length} social profiles</span>
                        {brand.social_profiles.length > 0 && <div className="w-px h-4 bg-border"></div>}
                        <div className="hidden sm:flex items-center gap-2">
                            {brand.social_profiles.slice(0, 4).map((profile) => (
                                <a key={profile.id} href={profile.profile_url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors" title={profile.profile_url}>
                                    {getSocialIcon(profile.profile_url)}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 pl-4">
                 {brand.status === 'syncing' || brand.status === 'pending' ? (
                    <div className="flex items-center gap-2 text-sm text-light-blue">
                        <SyncingIcon />
                        <span>Syncing</span>
                    </div>
                ) : brand.status === 'error' ? (
                    <div className="flex items-center gap-2 text-sm text-danger" title="Syncing failed">
                        <ErrorIcon />
                        <span>Error</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-success">
                       <CheckCircleIcon />
                       <span>Updated</span>
                    </div>
                )}
                 <button onClick={() => onEdit(brand)} className="text-text-secondary hover:text-primary transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" title="Edit Brand">
                    <EditIcon />
                </button>
            </div>
        </div>
    );
};


export const BrandList: React.FC<BrandListProps> = ({ brands, onEditBrand }) => (
    <div className="space-y-3">
        {brands.map((brand) => (
             <BrandListItem key={brand.id} brand={brand} onEdit={onEditBrand} />
        ))}
    </div>
);
