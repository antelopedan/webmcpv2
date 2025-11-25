
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
// FIX: Corrected import path for types
import type { Brand, AnalyticsPost, AnalyticsMetrics, PlatformEngagement, PostTypeDistribution, BrandPostVolumeEngagement, FollowerGrowthTrend, BrandListResponse } from '../../types';
// FIX: Corrected import path for api
import { api } from '../../api';
import { 
    Building2Icon, FileTextIcon, ThumbsUpIcon, EyeIcon, PercentIcon, CalendarIcon
} from '../icons/analytics';
import { FacebookIcon, InstagramIcon, TwitterIcon, YouTubeIcon, XIcon as TikTokIcon } from '../icons/social';
import { StyledDropdown } from '../shared/StyledDropdown';
import { LoadingSpinner } from '../shared/LoadingSpinner';


// --- TYPE DECLARATIONS for external libraries ---
declare var Chart: any;
declare var flatpickr: any;

// --- CONFIGURATION ---
const CHANNELS = ['Instagram', 'TikTok', 'Twitter', 'Facebook', 'YouTube'];
const BRAND_COLORS: { [key: string]: string } = { Nike: '#18898D', Adidas: '#F97316', 'Under Armour': '#EAB308', Puma: '#2563EB', 'New Balance': '#8B5CF6', default: '#94A3B8' };
const CHART_COLORS = ['#18898D', '#F97316', '#EAB308', '#2563EB', '#8B5CF6', '#EF4444', '#22C55E'];
const CHANNEL_ICONS: { [key: string]: React.ReactNode } = { Instagram: <InstagramIcon />, TikTok: <TikTokIcon />, Twitter: <TwitterIcon />, Facebook: <FacebookIcon />, YouTube: <YouTubeIcon /> };

// --- HELPER FUNCTIONS ---
const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
};

const createGradient = (ctx: CanvasRenderingContext2D, color: string) => {
    if (!ctx || !color) return 'rgba(0,0,0,0)';
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    return gradient;
};

const getBrandColor = (brandName: string) => BRAND_COLORS[brandName] || BRAND_COLORS.default;


// --- REACT COMPONENT ---
export const AnalyticsPage: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [brands, setBrands] = useState<Brand[]>([]);
    const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
    const [platformData, setPlatformData] = useState<PlatformEngagement[]>([]);
    const [postTypeData, setPostTypeData] = useState<PostTypeDistribution[]>([]);
    const [performanceData, setPerformanceData] = useState<BrandPostVolumeEngagement[]>([]);
    const [growthData, setGrowthData] = useState<FollowerGrowthTrend | null>(null);
    const [topPosts, setTopPosts] = useState<AnalyticsPost[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [date, setDate] = useState<{ start: Date; end: Date; preset: string }>({ start: new Date(), end: new Date(), preset: 'last_30_days' });
    const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set(['All']));
    const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set(['All']));
    
    // UI State
    const [sort, setSort] = useState({ key: 'engagement_count', direction: 'desc' });
    const [pagination, setPagination] = useState({ currentPage: 1, postsPerPage: 10 });

    // --- CHART REFS ---
    const chartRefs = {
        engagement: useRef<HTMLCanvasElement>(null),
        postTypes: useRef<HTMLCanvasElement>(null),
        performance: useRef<HTMLCanvasElement>(null),
        follower: useRef<HTMLCanvasElement>(null),
    };
    const chartInstances = useRef<{ [key: string]: any }>({});
    
    // --- DATA FETCHING ---
    const fetchAnalyticsData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        const brandIds = brands.filter(b => selectedBrands.has(b.name)).map(b => b.id);
        if (brandIds.length > 0) params.append('brand_ids', brandIds.join(','));
        if (!selectedChannels.has('All')) params.append('channels', Array.from(selectedChannels).join(','));
        
        params.append('start_date', date.start.toISOString().split('T')[0]);
        params.append('end_date', date.end.toISOString().split('T')[0]);

        try {
            const [
                metricsRes,
                platformRes,
                postTypeRes,
                performanceRes,
                growthRes,
                topPostsRes
            ] = await Promise.all([
                api.get<AnalyticsMetrics>(`analytics/metrics?${params.toString()}`),
                api.get<PlatformEngagement[]>(`analytics/engagement-by-platform?${params.toString()}`),
                api.get<PostTypeDistribution[]>(`analytics/post-type-distribution?${params.toString()}`),
                api.get<BrandPostVolumeEngagement[]>(`analytics/post-volume-engagement?${params.toString()}`),
                api.get<FollowerGrowthTrend>(`analytics/follower-growth?${params.toString()}`),
                api.get<AnalyticsPost[]>(`analytics/top-posts?${params.toString()}`),
            ]);
            setMetrics(metricsRes);
            setPlatformData(platformRes);
            setPostTypeData(postTypeRes);
            setPerformanceData(performanceRes);
            setGrowthData(growthRes);
            setTopPosts(topPostsRes);
        } catch (err) {
            console.error("Failed to fetch analytics data", err);
            setError("Failed to load analytics data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [date, selectedBrands, selectedChannels, brands]);
    
    useEffect(() => {
        api.get<BrandListResponse>('brands').then(res => {
            setBrands(res.brands);
        }).catch(err => {
             console.error("Failed to fetch brands for filter", err);
             setError("Could not load brand filter options.");
        });

        const calculateDateRange = (preset: string) => {
            const end = new Date(); let start = new Date(); end.setHours(23, 59, 59, 999); start.setHours(0, 0, 0, 0);
            switch (preset) {
                case 'last_7_days': start.setDate(end.getDate() - 7); break;
                case 'last_30_days': start.setDate(end.getDate() - 30); break;
                case 'last_90_days': start.setDate(end.getDate() - 90); break;
                case 'this_month': start = new Date(end.getFullYear(), end.getMonth(), 1); break;
            }
            return { start, end };
        };
        setDate(d => ({ ...d, ...calculateDateRange(d.preset)}));
    }, []);

    useEffect(() => {
        if (brands.length > 0) {
            fetchAnalyticsData();
        }
    }, [fetchAnalyticsData, brands]);
    
    // --- MEMOIZED DATA PROCESSING for UI ---
    const sortedPosts = useMemo(() => {
        return [...topPosts].sort((a, b) => {
            const valA = a[sort.key as keyof AnalyticsPost];
            const valB = b[sort.key as keyof AnalyticsPost];
            const direction = sort.direction === 'asc' ? 1 : -1;
            if (valA > valB) return 1 * direction;
            if (valA < valB) return -1 * direction;
            return 0;
        });
    }, [topPosts, sort]);

    const paginatedPosts = useMemo(() => {
        const { currentPage, postsPerPage } = pagination;
        return sortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
    }, [sortedPosts, pagination]);

    // --- EFFECTS for setup and teardown ---
    useEffect(() => {
        const dateRangeInput = document.getElementById('date-range-input-hidden');
        if (!dateRangeInput) return;

        const fp = flatpickr(dateRangeInput, {
            mode: "range",
            dateFormat: "Y-m-d",
            defaultDate: [date.start, date.end],
            positionElement: document.getElementById('date-range-btn') as HTMLElement,
            onChange: (selectedDates: Date[]) => {
                if (selectedDates.length === 2) {
                    setDate({ start: selectedDates[0], end: selectedDates[1], preset: '' });
                    setPagination(p => ({ ...p, currentPage: 1 }));
                }
            },
        });
        return () => fp.destroy();
    }, [date.start, date.end]);

    useEffect(() => {
        setPagination(p => ({ ...p, currentPage: 1 }));
    }, [selectedBrands, selectedChannels, date]);
    
    useEffect(() => {
        Chart.defaults.font.family = "'Poppins', sans-serif";
        Chart.defaults.color = '#94A3B8';
        Chart.defaults.borderColor = '#334155';
        const chartBaseConfig = (type: string, extraOptions = {}) => ({
            type, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 20 } } }, ...extraOptions }
        });

        Object.values(chartInstances.current).forEach(chart => {
            if (chart && typeof (chart as any).destroy === 'function') {
                (chart as any).destroy();
            }
        });
        
        const chartsToCreate = {
            engagement: () => new Chart(chartRefs.engagement.current, { ...chartBaseConfig('pie'), data: { labels: platformData.map(d => d.platform), datasets: [{ data: platformData.map(d => d.engagement_count), backgroundColor: CHART_COLORS, borderWidth: 4, borderColor: '#1E293B' }] } }),
            postTypes: () => new Chart(chartRefs.postTypes.current, { ...chartBaseConfig('doughnut', { cutout: '70%' }), data: { labels: postTypeData.map(pt => pt.post_type), datasets: [{ data: postTypeData.map(pt => pt.count), backgroundColor: CHART_COLORS, borderWidth: 4, borderColor: '#1E293B' }] } }),
            performance: () => new Chart(chartRefs.performance.current, { ...chartBaseConfig('scatter', { scales: { x: { type: 'linear', position: 'bottom', grid: { color: '#334155' } }, y: { grid: { color: '#334155' } } } }), data: { datasets: performanceData.map(b => ({ label: b.brand_name, data: [{ x: b.post_count, y: b.engagement_count }], backgroundColor: getBrandColor(b.brand_name), pointRadius: 6, pointHoverRadius: 8 })) } }),
            follower: () => {
                const ctx = chartRefs.follower.current?.getContext('2d');
                if (!ctx || !growthData) return;
                const datasets = growthData.brands.map(b => {
                    const color = getBrandColor(b.brand_name);
                    return { label: b.brand_name, data: b.data_points, borderColor: color, backgroundColor: createGradient(ctx, color), fill: true, tension: 0.4, pointBackgroundColor: color, pointBorderColor: '#fff', pointHoverRadius: 7, pointHoverBorderWidth: 2, pointRadius: 5 }
                });
                return new Chart(chartRefs.follower.current, { ...chartBaseConfig('line', { scales: { x: { grid: { color: '#334155' } }, y: { grid: { color: '#334155' } } } }), data: { labels: growthData.dates, datasets } });
            }
        };

        if (!isLoading) {
            Object.keys(chartRefs).forEach(key => {
                if (chartRefs[key as keyof typeof chartRefs].current) {
                    chartInstances.current[key] = chartsToCreate[key as keyof typeof chartsToCreate]();
                }
            });
        }
        
        return () => {
             Object.values(chartInstances.current).forEach(chart => {
                if(chart && typeof (chart as any).destroy === 'function') (chart as any).destroy();
             });
        }
    }, [isLoading, platformData, postTypeData, performanceData, growthData]);

    // --- RENDER LOGIC & JSX ---
    const renderDropdownText = (selectedSet: Set<string>, defaultText: string) => {
        if (selectedSet.has('All') || selectedSet.size === 0) return defaultText;
        if (selectedSet.size === 1) return selectedSet.values().next().value;
        return `${selectedSet.size} Selected`;
    };

    const handleFilterChange = (value: string, type: 'brand' | 'channel') => {
        const stateSet = type === 'brand' ? selectedBrands : selectedChannels;
        const setter = type === 'brand' ? setSelectedBrands : setSelectedChannels;
        const newSet = new Set(stateSet);
        if (value === 'All') {
            newSet.clear(); newSet.add('All');
        } else {
            newSet.delete('All');
            if (newSet.has(value)) newSet.delete(value); else newSet.add(value);
            if (newSet.size === 0) newSet.add('All');
        }
        setter(newSet);
    };

    const MetricsDisplay = useMemo(() => {
        const metricsData = [
            { label: 'Brands Analyzed', value: metrics?.brands_analyzed ?? 0, icon: <Building2Icon /> },
            { label: 'Total Posts', value: metrics?.total_posts?.toLocaleString() ?? '0', icon: <FileTextIcon /> },
            { label: 'Engagements', value: formatNumber(metrics?.engagements ?? 0), icon: <ThumbsUpIcon /> },
            { label: 'Total Views', value: formatNumber(metrics?.total_views ?? 0), icon: <EyeIcon /> },
            { label: 'Avg. Eng Rate', value: `${(metrics?.avg_engagement_rate ?? 0).toFixed(2)}%`, icon: <PercentIcon /> }
        ];
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {metricsData.map(m => (
                    <div key={m.label} className="bg-surface p-6 rounded-xl border border-border flex items-center gap-4">
                        <div className="w-10 h-10 text-primary">{m.icon}</div>
                        <div>
                            <p className="text-2xl md:text-3xl font-bold text-text-main">{m.value}</p>
                            <p className="text-caption font-medium text-text-secondary">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }, [metrics]);
    
    const brandOptions = useMemo(() => ['All', ...brands.map(b => b.name)], [brands]);

    return (
        <div className="container mx-auto fade-in space-y-12">
            <header>
              <h1 className="text-2xl md:text-3xl font-semibold">Competitive Analytics</h1>
              <p className="text-body text-text-secondary mt-2">Track competitor performance across social platforms</p>
            </header>
            <section className="bg-surface rounded-xl border border-border p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">Filters</h2>
                <div className="flex flex-wrap items-end gap-4">
                    <div className="w-48">
                        <label className="text-body font-medium text-text-secondary">Brands</label>
                        <div className="mt-1">
                            <StyledDropdown triggerContent={renderDropdownText(selectedBrands, 'All Brands')}>
                                {() => (
                                    <>
                                        {brandOptions.map(b => (
                                            <label key={b} className="flex items-center gap-3 p-2 text-body hover:bg-border rounded-md cursor-pointer">
                                                <input type="checkbox" checked={selectedBrands.has(b)} onChange={() => handleFilterChange(b, 'brand')} className="form-checkbox bg-background border-border text-primary focus:ring-primary" />
                                                {b !== 'All' && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getBrandColor(b) }}></div>}
                                                <span className="text-text-main">{b}</span>
                                            </label>
                                        ))}
                                    </>
                                )}
                            </StyledDropdown>
                        </div>
                    </div>
                    <div className="w-48">
                        <label className="text-body font-medium text-text-secondary">Channels</label>
                        <div className="mt-1">
                             <StyledDropdown triggerContent={renderDropdownText(selectedChannels, 'All Channels')}>
                                {() => (
                                    <>
                                        {['All', ...CHANNELS].map(c => (
                                            <label key={c} className="flex items-center gap-3 p-2 text-body hover:bg-border rounded-md cursor-pointer">
                                                <input type="checkbox" checked={selectedChannels.has(c)} onChange={() => handleFilterChange(c, 'channel')} className="form-checkbox bg-background border-border text-primary focus:ring-primary" />
                                                {c !== 'All' && <span className="w-4 h-4 text-text-secondary">{CHANNEL_ICONS[c]}</span>}
                                                <span className="text-text-main">{c}</span>
                                            </label>
                                        ))}
                                    </>
                                )}
                            </StyledDropdown>
                        </div>
                    </div>
                    <div>
                        <label className="text-body font-medium text-text-secondary">Date Range</label>
                        <input type="text" id="date-range-input-hidden" className="hidden" />
                        <button id="date-range-btn" className="filter-btn mt-1 w-full sm:w-64 flex justify-between items-center px-4 py-2 rounded-lg text-body bg-background border border-border text-text-secondary hover:border-primary">
                            <span>{date.preset ? date.preset.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : `${date.start.toLocaleDateString()} - ${date.end.toLocaleDateString()}`}</span>
                            <CalendarIcon />
                        </button>
                    </div>
                </div>
            </section>
            
            {error && <div className="mb-4 p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">{error}</div>}

            {isLoading ? <div className="flex justify-center items-center h-64"><LoadingSpinner /></div> : (
              <>
                <section className="bg-surface rounded-xl border border-border p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-6">Key Metrics</h2>
                    {MetricsDisplay}
                </section>
                
                <section className="bg-surface rounded-xl border border-border p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-6">Top Posts</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-caption text-text-secondary uppercase bg-background/50">
                                <tr>
                                    {['brand_name', 'content', 'engagement_count', 'views', 'engagement_rate'].map(key => {
                                        const isNumeric = ['engagement_count', 'views', 'engagement_rate'].includes(key);
                                        return (
                                            <th key={key} onClick={() => setSort(s => ({ key, direction: s.key === key && s.direction === 'desc' ? 'asc' : 'desc' }))} className={`p-4 cursor-pointer whitespace-nowrap ${isNumeric ? 'text-right' : ''}`}>
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                <span className="ml-2 opacity-30">{sort.key === key ? (sort.direction === 'desc' ? '↓' : '↑') : ''}</span>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="text-body">
                                {paginatedPosts.map(post => (
                                    <tr key={post.id} className="border-b border-border hover:bg-background">
                                        <td className="p-4 flex items-center gap-3 text-text-main font-medium whitespace-nowrap"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getBrandColor(post.brand_name) }}></div>{post.brand_name}</td>
                                        <td className="p-4 text-text-secondary truncate max-w-xs">{post.content}</td>
                                        <td className="p-4 font-semibold text-text-main text-right">{post.engagement_count.toLocaleString()}</td>
                                        <td className="p-4 text-text-secondary text-right">{post.views.toLocaleString()}</td>
                                        <td className="p-4 text-text-secondary whitespace-nowrap text-right">{(post.engagement_rate).toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         <div className="pt-4 flex justify-between items-center text-body">
                            <span>{`Showing ${(pagination.currentPage - 1) * pagination.postsPerPage + 1}-${Math.min(pagination.currentPage * pagination.postsPerPage, sortedPosts.length)} of ${sortedPosts.length}`}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))} disabled={pagination.currentPage === 1} className="bg-border px-3 py-1 rounded-md disabled:opacity-50 hover:bg-border/80">&lt; Prev</button>
                                <button onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))} disabled={pagination.currentPage * pagination.postsPerPage >= sortedPosts.length} className="bg-border px-3 py-1 rounded-md disabled:opacity-50 hover:bg-border/80">Next &gt;</button>
                            </div>
                        </div>
                    </div>
                </section>

                 <section>
                    <h2 className="text-xl font-semibold mb-6">Visualizations</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-surface p-6 md:p-8 rounded-xl border border-border min-h-[400px] flex flex-col"><h3 className="text-lg font-semibold mb-4 flex-shrink-0">Engagement by Platform</h3><div className="relative flex-grow"><canvas ref={chartRefs.engagement}></canvas></div></div>
                        <div className="bg-surface p-6 md:p-8 rounded-xl border border-border min-h-[400px] flex flex-col"><h3 className="text-lg font-semibold mb-4 flex-shrink-0">Post Type Distribution</h3><div className="relative flex-grow"><canvas ref={chartRefs.postTypes}></canvas></div></div>
                        <div className="bg-surface p-6 md:p-8 rounded-xl border border-border min-h-[400px] flex flex-col"><h3 className="text-lg font-semibold mb-4 flex-shrink-0">Post Volume vs. Engagement</h3><div className="relative flex-grow"><canvas ref={chartRefs.performance}></canvas></div></div>
                        <div className="bg-surface p-6 md:p-8 rounded-xl border border-border min-h-[400px] flex flex-col"><h3 className="text-lg font-semibold mb-4 flex-shrink-0">Follower Growth Trend</h3><div className="relative flex-grow"><canvas ref={chartRefs.follower}></canvas></div></div>
                    </div>
                </section>
              </>
            )}
        </div>
    );
};