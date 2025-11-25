
import React, { useState } from 'react';
import type { Report } from '../../types';
import { BrandAvatar } from '../utils/brandUtils';
import { BackArrowIcon } from '../icons/reports';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { getFirstBrandItem } from '../utils/reportUtils';

export const ReportDetailPage: React.FC<{ report: Report; onBack: () => void; }> = ({ report, onBack }) => {
    const brandItem = getFirstBrandItem(report.brands);
    const title = report.headline ?? report.component_category;
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="container mx-auto fade-in flex flex-col h-full">
            <header className="flex-shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-main mb-4 transition-colors">
                    <BackArrowIcon />
                    <span>Back to All Reports</span>
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-text-main">{title}</h1>
                        <p className="text-text-secondary mt-1">Live Report</p>
                    </div>
                    {brandItem && (
                        <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-border">
                            <BrandAvatar name={brandItem.name} src={brandItem.url || brandItem.logo} />
                            <span className="font-semibold">{brandItem.name}</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-grow mt-6 relative rounded-xl overflow-hidden border border-border min-h-[75vh]">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background">
                        <LoadingSpinner />
                    </div>
                )}
                <iframe
                    src={report.report_url}
                    title={`Report: ${title}`}
                    className={`w-full h-full border-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsLoading(false)}
                    sandbox="allow-scripts allow-same-origin"
                ></iframe>
            </main>
        </div>
    );
};
