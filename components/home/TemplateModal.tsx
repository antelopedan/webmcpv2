import React, { useState, useEffect } from 'react';
import type { AnalysisTemplate, SampleReport } from '../../types';
import { iconComponentMap } from '../../data/templates';
import { CopyIcon, CheckCircleIcon } from '../icons/home';
import { getAvatarColor } from '../utils/brandUtils';

// --- Helper Components & Data ---

const ClaudeIcon = () => (
    <img src="https://img.icons8.com/?size=100&id=1G3UNEZHMjPH&format=png&color=FFFFFF" alt="Claude icon" className="w-5 h-5" style={{ minWidth: '20px' }} />
);

const ChatGPTIcon = () => (
    <img src="https://img.icons8.com/?size=100&id=Nts60kQIvGqe&format=png&color=FFFFFF" alt="ChatGPT icon" className="w-5 h-5" style={{ minWidth: '20px' }} />
);

const SampleReportItem: React.FC<{ report: SampleReport; onView: (report: SampleReport) => void }> = ({ report, onView }) => {
    const brand = report.brands?.[0];
    if (!brand) return null;

    const avatarColorClass = getAvatarColor(brand.name);

    return (
        <button
            onClick={() => onView(report)}
            className="flex items-center gap-3 w-full bg-background/50 border border-transparent hover:border-primary hover:bg-surface rounded-lg p-3 cursor-pointer transition-all text-left group"
        >
            <div className={`w-9 h-9 min-w-[36px] rounded-full flex items-center justify-center text-base font-bold text-white ${avatarColorClass}`}>
                {brand.name.charAt(0)}
            </div>
            <div className="flex-1">
                <div className="text-body font-medium text-text-main mb-0.5 group-hover:text-primary transition-colors">
                    {brand.name}
                </div>
                <div className="text-caption text-text-secondary leading-tight">
                    {report.component_category}
                </div>
            </div>
        </button>
    );
};


const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

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
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 fade-in font-sans"
            onClick={onClose}
        >
            <div 
                className="bg-gradient-to-br from-[#1F3A4E] to-[#172A38] rounded-xl border border-primary/30 shadow-2xl w-full max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center border border-accent/30 text-accent">
                                {IconComponent ? <IconComponent className="w-6 h-6" /> : '✨'}
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-text-main">{template.name}</h2>
                                <p className="text-caption text-text-secondary">Est. {template.estimated_time_minutes} minutes</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-text-secondary hover:text-text-main text-2xl p-0 transition-colors">✕</button>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {template.description} This template provides a deeper look at your brand's social media analysis, helping you stay ahead of the curve.
                    </p>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 modal-scrollbar custom-scrollbar">
                    {/* Prompt Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-caption font-semibold text-text-main uppercase tracking-wider">Example Prompt</label>
                            <button onClick={handleCopyPrompt} className={`border rounded px-2 py-1 text-xs font-medium flex items-center gap-1.5 transition-all duration-300 ${copied ? 'bg-success/80 border-success text-white' : 'border-border text-text-secondary hover:border-primary hover:text-primary'}`}>
                                {copied ? <><CheckCircleIcon /> Copied</> : <><CopyIcon /> Copy</>}
                            </button>
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-32 bg-background border border-border rounded-lg p-3 text-sm text-text-main font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        />
                    </div>
                    
                    {/* Samples Section */}
                    <div>
                         <h3 className="text-caption font-semibold text-text-main uppercase tracking-wider mb-2">View Sample Reports</h3>
                         <div className="space-y-2">
                            {sampleReports.map((report) => (
                                <SampleReportItem
                                    key={report.id}
                                    report={report}
                                    onView={(report) => {
                                        onClose();
                                        onViewSampleReport(report);
                                    }}
                                />
                            ))}
                         </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5 bg-black/20">
                     <label className="text-xs font-semibold text-text-main uppercase tracking-wider mb-2 block">Open In</label>
                     <div className="grid grid-cols-2 gap-2">
                         <button onClick={handleOpenInClaude} className="bg-[#E6523C] text-white font-semibold py-2.5 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-[#D1453A] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E6523C]/30">
                             <ClaudeIcon /> Claude
                         </button>
                         <button onClick={handleOpenInChatGPT} className="bg-[#E6523C] text-white font-semibold py-2.5 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-[#D1453A] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E6523C]/30">
                             <ChatGPTIcon /> ChatGPT
                         </button>
                     </div>
                </div>
            </div>
        </div>
    );
};