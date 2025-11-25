import React, { useState, useEffect } from 'react';
import type { Report } from '../../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ReportViewerModalProps {
  report: Report;
  onClose: () => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ report, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const title = report.headline ?? report.component_category;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            onClose();
          }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    return (
        <div 
            className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
            onClick={onClose}
        >
            <div 
                className="modal-content bg-surface rounded-xl shadow-2xl border border-border w-full h-full flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-semibold text-text-main truncate pr-4">{title}</h2>
                    <button onClick={onClose} className="text-2xl text-text-secondary hover:text-text-main">&times;</button>
                </header>
                <div className="flex-grow relative bg-white">
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
                </div>
            </div>
            <style>{`
              .fade-in { animation: fadeIn 0.3s ease-out forwards; }
              .modal-content { animation: slideIn 0.3s ease-out forwards; }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes slideIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};
