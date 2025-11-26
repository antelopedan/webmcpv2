
import React, { useState, useEffect, useCallback } from 'react';
import { BrandList, BrandListItemSkeleton } from '../BrandList';
import { EditBrandModal } from '../EditBrandModal';
import { AddBrandModal } from '../AddBrandModal';
// FIX: Corrected import path for types
import type { Brand, BrandStats, BrandListResponse, BrandCreate, BrandUpdate, SocialProfile } from '../../types';
// FIX: Corrected import path for api
import { api } from '../../api';
import { BrandsIcon, AccountsIcon, ContentIcon, EngagementsIcon, FollowersIcon, ViewsIcon } from '../icons/metrics';
import { SearchIcon } from '../icons/SearchIcon';
import { TimestampCalendarIcon } from '../icons/TimestampCalendarIcon';
import { StyledDropdown } from '../shared/StyledDropdown';
import { PlusIcon } from '../icons/PlusIcon';
import { getSocialPlatform, getSocialIcon } from '../utils/socialUtils';
import { GridViewIcon, ListViewIcon } from '../icons/reports';
import { BrandAvatar } from '../utils/brandUtils';
import { EditIcon } from '../icons/EditIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { SyncingIcon } from '../icons/SyncingIcon';

const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

const BrandCardSkeleton: React.FC = () => (
    <div className="bg-surface border border-border rounded-xl p-6 animate-pulse flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-border rounded-full"></div>
            <div className="w-20 h-5 bg-border rounded"></div>
        </div>
        <div className="space-y-2 flex-1">
            <div className="h-6 w-3/4 bg-border rounded"></div>
            <div className="h-4 w-1/2 bg-border rounded"></div>
        </div>
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
             <div className="flex gap-2">
                <div className="w-6 h-6 bg-border rounded-full"></div>
                <div className="w-6 h-6 bg-border rounded-full"></div>
                <div className="w-6 h-6 bg-border rounded-full"></div>
             </div>
             <div className="w-6 h-6 bg-border rounded"></div>
        </div>
    </div>
);

const BrandCard: React.FC<{ brand: Brand; onEdit: (brand: Brand) => void }> = ({ brand, onEdit }) => {
    return (
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col h-full hover:border-primary/60 transition-all group relative hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
               <BrandAvatar name={brand.name} src={brand.logo_url} size="w-12 h-12" />
               <div className="flex items-center">
                    {brand.status === 'syncing' || brand.status === 'pending' ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-light-blue bg-light-blue/10 px-2 py-1 rounded-full">
                            <SyncingIcon />
                            <span>Syncing</span>
                        </div>
                    ) : brand.status === 'error' ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-danger bg-danger/10 px-2 py-1 rounded-full" title="Syncing failed">
                            <ErrorIcon />
                            <span>Error</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                           <CheckCircleIcon />
                           <span>Synced</span>
                        </div>
                    )}
               </div>
            </div>
            <div className="flex-1">
               <h3 className="text-lg font-semibold text-text-main mb-1 truncate" title={brand.name}>{brand.name}</h3>
               <p className="text-body text-text-secondary">{brand.social_profiles.length} social profiles</p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
               <div className="flex gap-2 overflow-hidden">
                  {brand.social_profiles.slice(0, 4).map((profile) => (
                        <a key={profile.id} href={profile.profile_url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors" title={profile.profile_url}>
                            {getSocialIcon(profile.profile_url)}
                        </a>
                    ))}
                    {brand.social_profiles.length > 4 && (
                        <span className="text-xs text-text-secondary flex items-center">+{brand.social_profiles.length - 4}</span>
                    )}
               </div>
               <button onClick={() => onEdit(brand)} className="text-text-secondary hover:text-primary transition-colors p-1 rounded-md hover:bg-border" title="Edit Brand">
                  <EditIcon />
               </button>
            </div>
        </div>
    );
};

const formatCompactNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumSignificantDigits: 3,
  }).format(num);
};

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const useCountUp = (end: number, duration = 1500) => {
  const [count, setCount] = useState(0);
  const frameRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setCount(progress * end);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);
    return () => { if(frameRef.current) cancelAnimationFrame(frameRef.current) };
  }, [end, duration]);

  return count;
};

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const MetricTile: React.FC<MetricTileProps> = ({ icon, label, value }) => {
  const animatedValue = useCountUp(value);
  return (
    <div className="bg-surface p-4 rounded-lg border border-border flex items-center gap-4 transition-all hover:border-primary/70 hover:shadow-md">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-xl font-bold text-text-main">{formatCompactNumber(Math.round(animatedValue))}</p>
        <p className="text-caption font-medium text-text-secondary">{label}</p>
      </div>
    </div>
  );
};

const sortOptionMapping: { [key: string]: string } = {
    date_desc: 'date_added_desc',
    name_asc: 'name_asc',
};

export const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchBrands = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if(debouncedSearchQuery) params.append('search', debouncedSearchQuery);
        params.append('sort_by', sortOptionMapping[sortOption]);
        
        const response = await api.get<BrandListResponse>(`brands?${params.toString()}`);
        setBrands(response.brands);
      } catch (err: any) {
        setError('Failed to fetch brands. Please ensure the server is running and accessible (check CORS settings).');
        console.error("Failed to fetch brands:", err);
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
  }, [debouncedSearchQuery, sortOption]);
  
  const fetchStats = useCallback(async () => {
    try {
        const statsData = await api.get<BrandStats>('brands/stats');
        setStats(statsData);
    } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError(prev => prev ? 'Failed to load page data.' : 'Failed to fetch stats.');
        setStats(null);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const addBrand = async (newBrandData: { name: string, logoUrl?: string, socialUrls: string[] }) => {
    setIsAddModalOpen(false);
    
    const tempId = Date.now().toString();
    const loadingBrand: Brand = {
      id: tempId,
      name: newBrandData.name,
      description: null,
      logo_url: newBrandData.logoUrl || null,
      social_profiles: newBrandData.socialUrls.map((url, i): SocialProfile => ({ 
        id: (Date.now() + i).toString(), 
        platform: getSocialPlatform(url),
        username: null,
        profile_url: url,
        created_at: new Date().toISOString(),
        last_synced_at: null,
      })),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: 'temp-owner',
      isLoading: true,
    };
    setBrands(prevBrands => [loadingBrand, ...prevBrands].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    try {
        const createPayload: BrandCreate = {
            name: newBrandData.name,
            logo_url: newBrandData.logoUrl || null,
            social_profiles: newBrandData.socialUrls.map(url => ({ 
                platform: getSocialPlatform(url),
                profile_url: url 
            }))
        };
        const createdBrand = await api.post<Brand>('brands', createPayload);
        const syncedBrand = await api.post<Brand>(`brands/${createdBrand.id}/sync`, {});

        setBrands(prevBrands =>
            prevBrands.map(b => b.id === tempId ? { ...syncedBrand, isLoading: false } : b)
        );
        fetchStats();
        setLastUpdated(new Date());
    } catch (err: any) {
        console.error("Failed to add brand:", err);
        setError('Failed to add brand. Please try again.');
        setBrands(prev => prev.filter(b => b.id !== tempId));
    }
  };

  const updateBrand = async (brandWithUpdates: Brand & { socialUrls: string[], logoUrl?: string }) => {
    const { socialUrls, logoUrl, ...updatedBrand } = brandWithUpdates;
    const originalBrands = [...brands];
    
    const finalBrandState: Brand = {
        ...updatedBrand,
        logo_url: logoUrl || null,
        status: 'syncing', // Show syncing status immediately
        social_profiles: socialUrls.map((url) => {
            const existing = updatedBrand.social_profiles.find(p => p.profile_url === url);
            return existing || { 
                id: (Date.now() + Math.random()).toString(), 
                profile_url: url, 
                platform: getSocialPlatform(url),
                username: null,
                created_at: new Date().toISOString(),
                last_synced_at: null,
            };
        })
    };

    setBrands(brands.map(b => (b.id === updatedBrand.id ? finalBrandState : b)));
    setEditingBrand(null);
    
    try {
        const payload: BrandUpdate = {
            name: updatedBrand.name,
            logo_url: logoUrl || null,
            social_profiles: socialUrls.map(url => ({ 
                platform: getSocialPlatform(url),
                profile_url: url 
            })),
        };
        const newBrand = await api.put<Brand>(`brands/${updatedBrand.id}`, payload);
        const syncedBrand = await api.post<Brand>(`brands/${newBrand.id}/sync`, {});
        setBrands(brands.map(b => (b.id === syncedBrand.id ? syncedBrand : b)));
        fetchStats();
        setLastUpdated(new Date());
    } catch (err: any) {
        console.error("Failed to update brand:", err);
        setError('Failed to update brand. Reverting changes.');
        setBrands(originalBrands);
    }
  };

  const deleteBrand = async (brandId: string) => {
    const originalBrands = [...brands];
    setBrands(brands.filter(b => b.id !== brandId));
    setEditingBrand(null);

    try {
        await api.delete(`brands/${brandId}`);
        fetchStats();
        setLastUpdated(new Date());
    } catch(err: any) {
        console.error("Failed to delete brand:", err);
        setError('Failed to delete brand. Reverting changes.');
        setBrands(originalBrands);
    }
  };

  const metrics = [
    { label: 'Brands', value: stats?.total_brands ?? 0, icon: <BrandsIcon /> },
    { label: 'Accounts', value: stats?.total_accounts ?? 0, icon: <AccountsIcon /> },
    { label: 'Content', value: stats?.total_content ?? 0, icon: <ContentIcon /> },
    { label: 'Engagements', value: stats?.total_engagements ?? 0, icon: <EngagementsIcon /> },
    { label: 'Followers', value: stats?.total_followers ?? 0, icon: <FollowersIcon /> },
    { label: 'Views', value: stats?.total_views ?? 0, icon: <ViewsIcon /> },
  ];
  
  const sortOptions: { [key: string]: string } = {
    date_desc: 'Date Added (Newest)',
    name_asc: 'Name (A-Z)',
  };

  return (
    <div className="fade-in">
      <div className="container mx-auto space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-semibold text-text-main">Brands Management</h1>
          <p className="text-body text-text-secondary mt-2">Manage the brands you are tracking and ensure your data is updated</p>
        </header>

        <section>
            <h2 className="text-xl font-semibold text-text-main mb-4">Data Tracked</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {metrics.map(metric => (
                <MetricTile key={metric.label} {...metric} />
              ))}
            </div>
        </section>
        
        <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-text-main">Manage Brands</h2>
            </div>
            
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-surface rounded-lg border border-border">
                <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <SearchIcon />
                    </div>
                    <input 
                      type="text" 
                      id="search-input" 
                      placeholder="Search brands..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border text-text-main rounded-md placeholder-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                        <label htmlFor="sort-select" className="text-sm font-medium text-text-secondary flex-shrink-0">Sort by:</label>
                        <div className="w-full sm:w-52">
                            <StyledDropdown
                                triggerContent={sortOptions[sortOption]}
                                widthClass="w-full"
                            >
                                {(closeDropdown) => (
                                    <>
                                        {Object.entries(sortOptions).map(([key, label]) => (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setSortOption(key);
                                                    closeDropdown();
                                                }}
                                                className={`w-full text-left p-2 text-body rounded-md cursor-pointer transition-colors ${sortOption === key ? 'bg-primary/20 text-text-main' : 'hover:bg-border text-text-secondary'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </StyledDropdown>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-background rounded-lg border border-border">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary'}`}><GridViewIcon /></button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary'}`}><ListViewIcon /></button>
                    </div>
                </div>
            </div>
             {error && (
                <div className="mb-4 p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm flex items-center space-x-3 fade-in">
                    <span>{error}</span>
                </div>
             )}
            
            {isLoading ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <BrandCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <BrandListItemSkeleton />
                        <BrandListItemSkeleton />
                        <BrandListItemSkeleton />
                    </div>
                )
            ) : (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {brands.map((brand) => (
                            <BrandCard key={brand.id} brand={brand} onEdit={setEditingBrand} />
                        ))}
                    </div>
                ) : (
                    <BrandList brands={brands} onEditBrand={setEditingBrand} />
                )
            )}
        </section>
        
        <div className="mt-6">
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full border-2 border-dashed border-border text-text-secondary hover:border-primary hover:text-primary transition-colors p-4 rounded-lg flex items-center justify-center space-x-2 font-medium"
            >
                <PlusIcon />
                <span>Add New Brand</span>
            </button>
            <div className="mt-4 flex justify-end">
                <div className="flex items-center gap-2 text-body text-text-secondary font-medium">
                    <TimestampCalendarIcon />
                    <span>Last updated: {lastUpdated.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddBrandModal 
          onAddBrand={addBrand}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {editingBrand && (
        <EditBrandModal
          brand={editingBrand}
          onUpdate={updateBrand}
          onDelete={deleteBrand}
          onClose={() => setEditingBrand(null)}
        />
      )}
    </div>
  );
};
