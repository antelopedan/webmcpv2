
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../../api';
import { TemplateCard } from '../home/TemplateCard';
import { TemplateModal } from '../home/TemplateModal';
import type { AnalysisTemplate, SampleReport, HomeStats, View, BrandListResponse, Report } from '../../types';
import { StatsIcon, UsersIcon, StarIcon, ClockIcon, GridIcon, SparklesIcon } from '../icons/home';
import { FlagIcon } from '../icons/FlagIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { DocumentIcon } from '../icons/DocumentIcon';
import { SearchIcon } from '../icons/SearchIcon';

// Define local types for the raw API response
type RawTemplate = {
    id: number;
    title: string;
    description: string;
    prompt: string;
    category: string;
    details: string;
    sample_reports: SampleReport[];
};

// API now returns RawTemplate[] directly, so we don't need RawTemplatesResponse wrapper for the main endpoint
// However, suggestions endpoint might still use a wrapper or return array. Assuming array based on context.

const TemplateSection: React.FC<{ title: string, icon: React.ReactNode, templates: AnalysisTemplate[], onSelectTemplate: (t: AnalysisTemplate) => void }> = 
({ title, icon, templates, onSelectTemplate }) => {
    if (templates.length === 0) return null;
    return (
        <section className="fade-in mb-8">
            <div className="flex items-center gap-3 mb-4">
                {icon} <h2 className="text-xl font-semibold text-text-main">{title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <TemplateCard key={template.id} template={template} onSelect={() => onSelectTemplate(template)} />
                ))}
            </div>
        </section>
    );
};

const SearchResultsSkeleton: React.FC = () => (
    <section>
        <div className="h-8 w-48 bg-surface rounded-md animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-surface border border-border rounded-xl p-6 h-40 animate-pulse"></div>)}
        </div>
    </section>
);

interface AnalysisPromptProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onSuggest: () => void;
}

const AnalysisPrompt: React.FC<AnalysisPromptProps> = ({ searchTerm, onSearchChange, onSuggest }) => {
    const suggestions = useMemo(() => [
        'Audience sentiment analysis',
        'Competitor content strategy',
        'Emerging industry trends'
    ], []);

    const placeholders = useMemo(() => [
        'Analyze the most engaging video',
        ...suggestions
    ], [suggestions]);

    const [placeholder, setPlaceholder] = useState('');
    const [isCursorVisible, setIsCursorVisible] = useState(true);

    const placeholderIndex = useRef(0);
    const charIndex = useRef(0);
    const isDeleting = useRef(false);
    const typingTimeoutRef = useRef<number | null>(null);

    const typeEffect = useCallback(() => {
        const currentPlaceholder = placeholders[placeholderIndex.current];
        let typeSpeed = 120;

        if (isDeleting.current) {
            // Deleting
            setPlaceholder(currentPlaceholder.substring(0, charIndex.current - 1));
            charIndex.current--;
            typeSpeed = 60;
        } else {
            // Typing
            setPlaceholder(currentPlaceholder.substring(0, charIndex.current + 1));
            charIndex.current++;
        }

        if (!isDeleting.current && charIndex.current === currentPlaceholder.length) {
            // Pause at end of word
            isDeleting.current = true;
            typeSpeed = 2000;
        } else if (isDeleting.current && charIndex.current === 0) {
            isDeleting.current = false;
            placeholderIndex.current = (placeholderIndex.current + 1) % placeholders.length;
            typeSpeed = 500;
        }

        typingTimeoutRef.current = window.setTimeout(typeEffect, typeSpeed);
    }, [placeholders]);

    useEffect(() => {
        if (placeholders.length) {
            typingTimeoutRef.current = window.setTimeout(typeEffect, 1000);
        }
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [typeEffect, placeholders]);
    
    useEffect(() => {
        const cursorBlink = setInterval(() => {
            setIsCursorVisible(v => !v);
        }, 500);
        return () => clearInterval(cursorBlink);
    }, []);
    
    const handleSuggestionClick = (suggestion: string) => {
        onSearchChange(suggestion);
    };

    return (
        <div className="fade-in flex flex-col items-center">
            {/* Search Container */}
            <div className="bg-surface border border-border rounded-xl p-8 w-full max-w-4xl mx-auto">
                <h2 className="text-xl font-semibold text-text-main mb-4">What would you like to discover about your content?</h2>
                <div className="relative">
                    <textarea
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={placeholder + (isCursorVisible ? '|' : '')}
                        className="w-full h-32 bg-background border border-border rounded-lg p-4 pr-32 resize-none text-body text-text-main placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Content analysis prompt"
                    />
                    <button 
                        onClick={onSuggest}
                        className="absolute bottom-4 right-4 bg-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors flex items-center gap-2 text-sm"
                    >
                        <SparklesIcon />
                        <span>Suggest</span>
                    </button>
                </div>
            </div>
            
            {/* Suggestions Container - Floating below */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
                {suggestions.map((text) => (
                    <button 
                        key={text}
                        onClick={() => handleSuggestionClick(text)}
                        className="bg-surface border border-border text-text-secondary text-body px-4 py-2 rounded-full hover:border-primary hover:text-primary transition-colors text-sm shadow-sm"
                    >
                        {text}
                    </button>
                ))}
            </div>
        </div>
    );
};


interface HomePageProps {
    onNavigate: (view: View, payload?: { report: Report }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const [viewingTemplate, setViewingTemplate] = useState<AnalysisTemplate | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState<HomeStats | null>(null);
    const [hasBrands, setHasBrands] = useState(false);
    
    // Data Sources
    const [allTemplates, setAllTemplates] = useState<AnalysisTemplate[]>([]);
    const [suggestedTemplates, setSuggestedTemplates] = useState<AnalysisTemplate[]>([]);

    // State
    const [isLoading, setIsLoading] = useState(true); // Initial load only
    const [isSearching, setIsSearching] = useState(false); // API Fallback search
    
    const [searchQuery, setSearchQuery] = useState('');

    // Filter local templates instantly
    const filteredTemplates = useMemo(() => {
        if (!searchQuery) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return allTemplates.filter(t => 
            (t.name?.toLowerCase() ?? '').includes(lowerQuery) || 
            (t.description?.toLowerCase() ?? '').includes(lowerQuery) ||
            (t.category?.toLowerCase() ?? '').includes(lowerQuery)
        );
    }, [allTemplates, searchQuery]);

    const transformTemplates = (rawTemplates: RawTemplate[]): AnalysisTemplate[] => {
        return rawTemplates.map(rawTemplate => {
            const timeMatch = rawTemplate.details.match(/\d+/);
            return {
                id: rawTemplate.id,
                name: rawTemplate.title,
                description: rawTemplate.description,
                prompt: rawTemplate.prompt,
                category: rawTemplate.category,
                estimated_time_minutes: timeMatch ? parseInt(timeMatch[0], 10) : 5,
                sample_reports: rawTemplate.sample_reports || []
            };
        });
    };

    // Initial Load - Fetch Everything Once
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Stats
                setStats({
                    analyses_run_this_week: 2238,
                    active_users: 842,
                    avg_rating: 4.7,
                });
                
                // 2. Check for Brands
                const brandsResponse = await api.get<BrandListResponse>('brands?limit=1');
                setHasBrands(brandsResponse.total > 0);

                // 3. Fetch All Templates
                // The API now returns RawTemplate[] directly
                const response = await api.get<RawTemplate[]>('templates');
                
                // Handle case where it might be wrapped (if API changes back or varies)
                // safely casting or checking would be ideal, but assuming array per user instruction
                const templatesData = Array.isArray(response) ? response : (response as any).templates;
                
                const transformed = transformTemplates(templatesData);
                setAllTemplates(transformed);

            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleManualSuggest = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const endpoint = `templates?search=${encodeURIComponent(searchQuery)}`;
            const response = await api.get<RawTemplate[]>(endpoint);
            // Handle potential wrapper here too just in case
            const templatesData = Array.isArray(response) ? response : (response as any).templates;
            setSuggestedTemplates(transformTemplates(templatesData));
        } catch (e) {
            console.error("Manual suggest failed", e);
            setSuggestedTemplates([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleViewSampleReport = (report: SampleReport) => {
        onNavigate('Reports', { report });
    };
    
    const renderTemplates = () => {
        // Case 1: Initial load empty
        if (allTemplates.length === 0 && !hasBrands && !isLoading) {
             return (
                <div className="text-center py-16 bg-surface rounded-lg border border-border">
                    <DocumentIcon />
                    <h3 className="mt-4 text-xl font-semibold">No templates available.</h3>
                    <p className="mt-2 text-body text-text-secondary">Try checking back later.</p>
                </div>
            );
        }

        // Case 2: Searching...
        if (searchQuery) {
            // 2a. Local Matches Found
            if (filteredTemplates.length > 0) {
                return (
                    <TemplateSection 
                        title="Search Results" 
                        icon={<GridIcon />} 
                        templates={filteredTemplates} 
                        onSelectTemplate={setViewingTemplate} 
                    />
                );
            }
            
            // 2b. Waiting for API Fallback
            if (isSearching) {
                return <SearchResultsSkeleton />;
            }
            
            // 2c. API Matches Found
            if (suggestedTemplates.length > 0) {
                return (
                    <TemplateSection 
                        title="AI Suggestions" 
                        icon={<SparklesIcon />} 
                        templates={suggestedTemplates} 
                        onSelectTemplate={setViewingTemplate} 
                    />
                );
            }

            // 2d. No Matches Anywhere
            return (
                 <div className="text-center py-16 bg-surface rounded-lg border border-border fade-in">
                    <h3 className="text-xl font-semibold text-text-main">No Results Found</h3>
                    <p className="mt-2 text-body text-text-secondary">We couldn't find any templates matching "{searchQuery}".</p>
                    <p className="mt-4 text-body text-text-secondary">
                        Press <span className="text-accent font-bold">Suggest</span> for AI-powered recommendations.
                    </p>
                </div>
            );
        }

        // Case 3: Default View (No Search)
        return (
             <>
                <TemplateSection 
                    title="Recently Used" 
                    icon={<ClockIcon />} 
                    templates={allTemplates.slice(0, 3)} 
                    onSelectTemplate={setViewingTemplate} 
                />
                <TemplateSection 
                    title="All Templates" 
                    icon={<GridIcon />} 
                    templates={allTemplates} 
                    onSelectTemplate={setViewingTemplate} 
                />
            </>
        );
    };

    if (isLoading) {
        return (
            <div className="container mx-auto fade-in space-y-8">
                 <div className="max-w-4xl mx-auto space-y-8">
                    <header className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-text-main">Social Media Analysis Library</h1>
                        <p className="text-lg text-text-secondary mt-2 max-w-2xl mx-auto">Discover powerful insights with pre-built analysis templates</p>
                    </header>
                    <div className="bg-surface rounded-xl animate-pulse p-8 md:p-12 h-64" />
                 </div>
                 <section>
                    <div className="h-8 w-48 bg-surface rounded-md animate-pulse mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => <div key={i} className="bg-surface border border-border rounded-xl p-6 h-40 animate-pulse"></div>)}
                    </div>
                </section>
            </div>
        );
    }

    if (error) {
         return (
             <div className="container mx-auto text-center py-16 bg-surface rounded-lg border border-border mt-8">
                <p className="p-4 bg-danger/20 border border-danger/50 text-danger text-sm rounded-lg text-center inline-block">{error}</p>
                <div className="mt-4">
                    <button onClick={() => window.location.reload()} className="bg-primary text-white font-semibold px-4 py-2 rounded-md">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto fade-in space-y-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-text-main">Social Media Analysis Library</h1>
                    <p className="text-lg text-text-secondary mt-2 max-w-2xl mx-auto">Discover powerful insights with pre-built analysis templates</p>
                </header>
                
                <section>
                     <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-text-secondary font-medium">
                        {!stats ? <div className="h-5 w-96 bg-surface rounded-md animate-pulse" /> : (
                            <>
                                <div className="flex items-center gap-2">
                                    <StatsIcon />
                                    <span><span className="text-accent font-bold">{stats.analyses_run_this_week.toLocaleString()}</span> analyses run this week</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UsersIcon />
                                    <span><span className="text-accent font-bold">{stats.active_users.toLocaleString()}</span> active users</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StarIcon />
                                    <span><span className="text-accent font-bold">{stats.avg_rating.toFixed(1)}</span> avg rating</span>
                                </div>
                            </>
                        )}
                    </div>
                </section>
                
                {hasBrands ? (
                    <AnalysisPrompt 
                        searchTerm={searchQuery} 
                        onSearchChange={setSearchQuery} 
                        onSuggest={handleManualSuggest}
                    />
                ) : (
                    <section className="bg-surface border-2 border-dashed border-border rounded-xl p-8 md:p-12 text-center flex flex-col items-center fade-in">
                        <FlagIcon />
                        <h2 className="text-2xl font-semibold mt-4 text-text-main">Start by Adding Your First Brand</h2>
                        <p className="text-text-secondary mt-2 max-w-md mx-auto">To begin tracking performance, analyzing competitors, and generating insights, you need to add a brand to your workspace.</p>
                        <button 
                            onClick={() => onNavigate('Brands')}
                            className="mt-6 flex items-center justify-center gap-2 bg-primary text-white font-semibold px-5 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <PlusIcon />
                            <span>Add Your First Brand</span>
                        </button>
                    </section>
                )}
            </div>
            
            <div className="w-full">
                {renderTemplates()}
            </div>

            {viewingTemplate && (
                <TemplateModal 
                    template={viewingTemplate}
                    sampleReports={viewingTemplate.sample_reports.slice(0, 3)}
                    onViewSampleReport={handleViewSampleReport}
                    onClose={() => setViewingTemplate(null)}
                />
            )}

        </div>
    );
};
