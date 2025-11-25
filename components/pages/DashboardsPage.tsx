
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Report, Brand, BrandListResponse, BrandDisplayItem } from '../../types';
import { api } from '../../api';
import { SearchIcon } from '../icons/SearchIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { DocumentIcon } from '../icons/DocumentIcon';
import { GridViewIcon, ListViewIcon, ShareIcon, ActionsMenuIcon } from '../icons/reports';
import { BrandAvatar } from '../utils/brandUtils';
import { useClickOutside } from '../utils/useClickOutside';
import { StyledDropdown } from '../shared/StyledDropdown';
import { ReportDetailPage } from './ReportDetailPage';
import { getCategoryColor, getBrandNamesFromReport, getFirstBrandItem } from '../utils/reportUtils';

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

const ReportCard: React.FC<{ report: Report; onDelete: (id: number) => void; onView: (report: Report) => void }> = ({ report, onDelete, onView }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    useClickOutside(menuRef, () => setIsMenuOpen(false));
    
    const brandsConfig = report.brands;

    const renderBrandsFooter = () => {
        if (!brandsConfig || !brandsConfig.display || brandsConfig.display.length === 0) return null;

        const displayItems = brandsConfig.display;
        const logoCount = displayItems.filter(i => i.type === 'logo').length;
        
        // Default heading if none provided
        const heading = brandsConfig.heading || `Brands Reviewed (${logoCount})`;
        const subheading = brandsConfig.subheading;

        // Overflow logic: Max 5 items visible
        const MAX_ITEMS = 5;
        const visibleItems = displayItems.slice(0, MAX_ITEMS);
        const remainingCount = displayItems.length > MAX_ITEMS ? displayItems.length - MAX_ITEMS : 0;

        return (
            <div className="mt-auto pt-4 border-t border-border">
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold text-text-main truncate" title={heading}>{heading}</h4>
                    {subheading && <p className="text-xs text-text-secondary truncate" title={subheading}>{subheading}</p>}
                </div>
                
                <div className="flex items-center gap-2 mt-3 overflow-hidden">
                    {visibleItems.map((item, idx) => {
                        if (item.type === 'separator') {
                            return (
                                <span key={`${item.id}-${idx}`} className="text-xs text-text-secondary whitespace-nowrap font-medium">
                                    {item.name}
                                </span>
                            );
                        } else {
                            // Handle potential key mismatch (url vs logo)
                            const src = item.url || item.logo;
                            return (
                                <div key={`${item.id}-${idx}`} title={item.name}>
                                    <BrandAvatar name={item.name} src={src} size="w-7 h-7" />
                                </div>
                            );
                        }
                    })}
                    {remainingCount > 0 && (
                        <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-text-secondary font-medium shrink-0">
                            +{remainingCount}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div onClick={() => onView(report)} className="bg-surface border border-border rounded-xl p-6 flex flex-col h-full group transition-all hover:border-primary/60 hover:-translate-y-1 cursor-pointer">
            <div className="flex-1 mb-4">
                <div className="flex justify-between items-start mb-4">
                    <div className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white/90 truncate ${getCategoryColor(report.component_category)}`}>
                        {report.component_category || 'General'}
                    </div>
                     <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsMenuOpen(p => !p)} className="text-text-secondary hover:text-text-main p-1 rounded-full hover:bg-border transition-colors">
                            <ActionsMenuIcon />
                        </button>
                        {isMenuOpen && (
                             <div className="absolute top-full right-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-lg z-10 py-1">
                                <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-border hover:text-text-main">Edit</button>
                                <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-border hover:text-text-main flex items-center gap-2"><ShareIcon /> Share</button>
                                <div className="h-px bg-border my-1"></div>
                                <button onClick={() => onDelete(report.id)} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10">Delete</button>
                            </div>
                        )}
                    </div>
                </div>
                <h3 className="text-lg font-semibold text-text-main mb-2">{report.headline ?? report.component_category}</h3>
                <p className="text-body text-text-secondary line-clamp-2">{report.explanation || 'No description available.'}</p>
            </div>
            {renderBrandsFooter()}
        </div>
    );
};

const ReportListItem: React.FC<{ report: Report; onDelete: (id: number) => void; onView: (report: Report) => void }> = ({ report, onDelete, onView }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    useClickOutside(menuRef, () => setIsMenuOpen(false));
    
    // Get first brand for the list view icon
    const firstBrand = getFirstBrandItem(report.brands);
    const heading = report.brands?.heading || report.headline || report.component_category;
    
    return (
        <div onClick={() => onView(report)} className="flex items-center justify-between p-4 bg-surface border-b border-border group hover:bg-background transition-colors cursor-pointer">
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 w-1/4">
                    {firstBrand && <BrandAvatar name={firstBrand.name} src={firstBrand.url || firstBrand.logo} />}
                    <span className="font-medium text-text-main truncate">{firstBrand ? firstBrand.name : 'Report'}</span>
                </div>
                <p className="text-text-secondary truncate w-1/2">{heading}</p>
            </div>
            <div className="flex items-center gap-6 pl-4">
                 <div className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white/80 truncate ${getCategoryColor(report.component_category)}`}>
                    {report.component_category || 'General'}
                </div>
                 <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setIsMenuOpen(p => !p)} className="text-text-secondary hover:text-text-main p-1 rounded-full hover:bg-border transition-colors opacity-0 group-hover:opacity-100">
                        <ActionsMenuIcon />
                    </button>
                    {isMenuOpen && (
                         <div className="absolute top-full right-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-lg z-10 py-1">
                            <button onClick={() => onDelete(report.id)} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10">Delete</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SkeletonCard: React.FC = () => (
    <div className="bg-surface border border-border rounded-xl p-6 animate-pulse flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
            <div className="h-5 w-2/5 bg-border rounded-full"></div>
            <div className="h-5 w-5 bg-border rounded-full"></div>
        </div>
        <div className="h-6 w-3/4 bg-border rounded mb-2"></div>
        <div className="h-4 w-full bg-border rounded"></div>
        <div className="h-4 w-1/2 bg-border rounded mt-1 mb-6"></div>
        <div className="mt-auto border-t border-border pt-4">
            <div className="h-4 w-1/3 bg-border rounded mb-3"></div>
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-border rounded-full"></div>
                <div className="w-7 h-7 bg-border rounded-full"></div>
                <div className="w-7 h-7 bg-border rounded-full"></div>
            </div>
        </div>
    </div>
);

interface DashboardsPageProps {
  initialReport?: Report;
}

export const DashboardsPage: React.FC<DashboardsPageProps> = ({ initialReport }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const initialReportProp = useRef(initialReport);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Report[]>(`reports`);
      setReports(response);
    } catch (err: any) {
      setError('Failed to fetch reports. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchReports();
    api.get<BrandListResponse>('brands').then(res => setBrands(res.brands)).catch(err => console.error("Failed to fetch brands for filter:", err));
  }, [fetchReports]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
        const searchMatch = debouncedSearchQuery
            ? (report.headline?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
               report.explanation?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
               report.component_category.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
            : true;
        
        const brandMatch = selectedBrand !== 'all'
            ? getBrandNamesFromReport(report.brands).some(name => name === selectedBrand)
            : true;
        
        const typeMatch = selectedType !== 'all'
            ? report.component_category === selectedType
            : true;

        return searchMatch && brandMatch && typeMatch;
    });
  }, [reports, debouncedSearchQuery, selectedBrand, selectedType]);
  
  const reportTypes = useMemo(() => {
      const categories = new Set(reports.map(r => r.component_category));
      return Array.from(categories);
  }, [reports]);

  const handleViewReport = useCallback((report: Report) => {
    setSelectedReport(report);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('reportId', report.id.toString());
    window.history.pushState({ reportId: report.id }, '', newUrl);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedReport(null);
    initialReportProp.current = undefined; // Consume the prop
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('reportId');
    window.history.pushState({}, '', newUrl);
  }, []);

  useEffect(() => {
    if (reports.length === 0) return;
  
    const reportFromNav = initialReportProp.current;
  
    // Priority 1: Handle report passed via navigation prop
    if (reportFromNav && selectedReport?.id !== reportFromNav.id) {
      const fullReport = reports.find(r => r.id === reportFromNav.id) || reportFromNav;
      handleViewReport(fullReport);
      return; 
    }
  
    // Priority 2: Handle report from URL (deep linking/refresh)
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('reportId');
    if (reportId && selectedReport?.id?.toString() !== reportId) {
      const reportToView = reports.find(r => r.id.toString() === reportId);
      if (reportToView) {
        handleViewReport(reportToView);
      }
    }
  }, [reports, selectedReport, handleViewReport]);


  const handleDeleteReport = async (id: number) => {
    const originalReports = [...reports];
    setReports(reports.filter(d => d.id !== id));
    try {
        await api.delete(`reports/${id}`);
    } catch (err) {
        setError('Failed to delete report. Reverting changes.');
        setReports(originalReports);
    }
  };

  if (selectedReport) {
      return <ReportDetailPage report={selectedReport} onBack={handleCloseViewer} />;
  }

  return (
    <div className="fade-in">
      <div className="container mx-auto space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-semibold text-text-main">Reports</h1>
          <p className="text-body text-text-secondary mt-2">Create and manage your custom reports.</p>
        </header>
        
        <section className="bg-surface rounded-xl border border-border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-4">
                <div className="lg:col-span-2">
                    <label className="text-body font-medium text-text-secondary">Search</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                        <input 
                            type="text" 
                            placeholder="Search reports..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border text-text-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <div>
                     <label className="text-body font-medium text-text-secondary">Type</label>
                    <StyledDropdown
                      triggerContent={selectedType === 'all' ? 'All Types' : selectedType}
                      triggerClassName="mt-1"
                    >
                        {(close) => (
                             <>
                                <button onClick={() => { setSelectedType('all'); close(); }} className="w-full text-left p-2 text-body hover:bg-border rounded-md">All Types</button>
                                {reportTypes.map((type) => (
                                    <button key={type} onClick={() => { setSelectedType(type); close(); }} className="w-full text-left p-2 text-body hover:bg-border rounded-md">{type}</button>
                                ))}
                            </>
                        )}
                    </StyledDropdown>
                </div>
                 <div>
                    <label className="text-body font-medium text-text-secondary">Brand</label>
                    <StyledDropdown
                      triggerContent={selectedBrand === 'all' ? 'All Brands' : brands.find(b => b.name === selectedBrand)?.name || selectedBrand}
                      triggerClassName="mt-1"
                    >
                         {(close) => (
                             <>
                                <button onClick={() => { setSelectedBrand('all'); close(); }} className="w-full text-left p-2 text-body hover:bg-border rounded-md">All Brands</button>
                                {brands.map(brand => (
                                    <button key={brand.id} onClick={() => { setSelectedBrand(brand.name); close(); }} className="w-full text-left p-2 text-body hover:bg-border rounded-md flex items-center gap-2">
                                        <BrandAvatar name={brand.name} src={brand.logo_url} />
                                        {brand.name}
                                    </button>
                                ))}
                            </>
                        )}
                    </StyledDropdown>
                </div>
            </div>
             <div className="mt-6 flex justify-between items-center">
                 <button className="flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors">
                    <PlusIcon /> Create Report
                </button>
                <div className="flex items-center gap-2 p-1 bg-background rounded-lg border border-border">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary'}`}><GridViewIcon /></button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary'}`}><ListViewIcon /></button>
                </div>
             </div>
        </section>

        {error && <div className="p-4 bg-danger/20 text-danger border border-danger/50 rounded-lg">{error}</div>}
        
        <main>
             {isLoading ? (
                 viewMode === 'grid' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                     </div>
                 ) : (
                    <div className="bg-surface rounded-lg border border-border animate-pulse">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-[73px] border-b border-border last:border-b-0"></div>)}
                    </div>
                 )
             ) : filteredReports.length === 0 ? (
                <div className="text-center py-16 bg-surface rounded-lg border border-border">
                    <DocumentIcon />
                    <h3 className="mt-4 text-xl font-semibold">No Reports Found</h3>
                    <p className="mt-2 text-body text-text-secondary">Try adjusting your filters or create a new report.</p>
                </div>
             ) : viewMode === 'grid' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map(d => <ReportCard key={d.id} report={d} onDelete={handleDeleteReport} onView={handleViewReport} />)}
                </div>
             ) : (
                 <div className="bg-surface rounded-lg border border-border overflow-hidden">
                    {filteredReports.map(d => <ReportListItem key={d.id} report={d} onDelete={handleDeleteReport} onView={handleViewReport} />)}
                 </div>
             )}
        </main>
      </div>
    </div>
  );
};
