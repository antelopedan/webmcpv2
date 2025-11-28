
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { AnalysisTemplate, SampleReport } from '../../types';
import { iconComponentMap } from '../../data/templates';
import { CopyIcon, CheckCircleIcon } from '../icons/home';
import { BrandAvatar } from '../utils/brandUtils';
import { getFirstBrandItem } from '../utils/reportUtils';

// --- ICONS & ASSETS ---

const ClaudeIcon = () => (
    <img src="https://img.icons8.com/?size=100&id=1G3UNEZHMjPH&format=png&color=FFFFFF" alt="Claude icon" className="w-5 h-5" style={{ minWidth: '20px' }} />
);

const ChatGPTIcon = () => (
    <img src="https://img.icons8.com/?size=100&id=Nts60kQIvGqe&format=png&color=FFFFFF" alt="ChatGPT icon" className="w-5 h-5" style={{ minWidth: '20px' }} />
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// --- UTILS ---

const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// --- MAIN COMPONENT ---

interface TemplateModalProps {
  template: AnalysisTemplate;
  sampleReports: SampleReport[];
  onViewSampleReport: (report: SampleReport) => void;
  onClose: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ template, sampleReports, onViewSampleReport, onClose }) => {
    const [prompt, setPrompt] = useState(template.prompt);
    const [copied, setCopied] = useState(false);
    
    const formattedCategory = formatCategory(template.category);
    const IconComponent = iconComponentMap[formattedCategory];
    
    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenInClaude = () => {
        const encoded = encodeURIComponent(prompt);
        window.open(`https://claude.ai/new?q=${encoded}`, '_blank');
    };

    const handleOpenInChatGPT = () => {
        const encoded = encodeURIComponent(prompt);
        window.open(`https://chat.openai.com/?q=${encoded}`, '_blank');
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Card */}
            <div 
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-2">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-50 text-[#E06348] rounded-xl flex items-center justify-center">
                             {IconComponent ? <IconComponent className="w-6 h-6" /> : '✨'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">{template.name}</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">Est. {template.estimated_time_minutes} minutes</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="px-6 py-2">
                    <p className="text-slate-600 leading-relaxed text-sm">
                        {template.description || "This template provides a deeper look at your brand's social media analysis, helping you stay ahead of the curve."}
                    </p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-6">
                    
                    {/* Prompt Box */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example Prompt</label>
                            <button 
                                onClick={handleCopyPrompt} 
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                {copied ? (
                                    <><CheckCircleIcon /> <span className="text-green-600">Copied</span></>
                                ) : (
                                    <><CopyIcon /> Copy</>
                                )}
                            </button>
                        </div>
                        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100/50 relative group">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-32 bg-transparent text-sm text-slate-700 font-medium resize-none focus:outline-none leading-relaxed"
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* Sample Reports */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">View Sample Reports</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {sampleReports.length > 0 ? (
                                sampleReports.map(report => {
                                    const brand = getFirstBrandItem(report.brands);
                                    return (
                                        <button 
                                            key={report.id}
                                            onClick={() => { onClose(); onViewSampleReport(report); }}
                                            className="flex flex-col items-start p-3 rounded-xl border border-slate-200 bg-white hover:border-primary/50 hover:shadow-md transition-all text-left group h-full"
                                        >
                                            <div className="flex items-center gap-2 mb-2 w-full">
                                                {brand ? (
                                                    <>
                                                        <BrandAvatar name={brand.name} src={brand.url || brand.logo} size="w-6 h-6" />
                                                        <span className="text-sm font-bold text-slate-700 truncate group-hover:text-primary">{brand.name}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-700">Sample</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-3 leading-tight">
                                                {report.component_category || "View sample analysis report"}
                                            </p>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="col-span-3 py-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400 italic">No sample reports available for this category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Open In</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleOpenInClaude}
                            className="bg-[#E6523C] hover:bg-[#D1453A] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
                        >
                            <ClaudeIcon /> Claude
                        </button>
                        <button 
                            onClick={handleOpenInChatGPT}
                            className="bg-[#10A37F] hover:bg-[#0E906F] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
                        >
                            <ChatGPTIcon /> ChatGPT
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};
