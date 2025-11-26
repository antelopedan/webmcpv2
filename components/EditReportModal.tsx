
import React, { useState, useEffect } from 'react';
import type { Report } from './types';

interface EditReportModalProps {
  report: Report;
  onSave: (id: number, data: { headline: string; explanation: string }) => void;
  onClose: () => void;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({ report, onSave, onClose }) => {
  const [headline, setHeadline] = useState(report.headline || '');
  const [explanation, setExplanation] = useState(report.explanation || '');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = () => {
    if (!headline.trim()) {
      setError('Report name is required.');
      return;
    }
    onSave(report.id, { headline, explanation });
  };

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in"
      onClick={onClose}
    >
        <div 
          className="bg-surface rounded-lg shadow-lg p-6 border border-border w-full max-w-lg modal-content"
          onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-text-main">Edit Report</h2>
                <button onClick={onClose} className="text-text-secondary hover:text-text-main text-3xl leading-none">&times;</button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="report-headline" className="block text-body font-medium text-text-secondary mb-1">Report Name</label>
                    <input 
                      type="text" 
                      id="report-headline" 
                      value={headline}
                      onChange={e => { setHeadline(e.target.value); setError(''); }}
                      className="w-full px-4 py-2 text-text-main bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                      placeholder="Enter report name"
                    />
                </div>
                
                <div>
                    <label htmlFor="report-explanation" className="block text-body font-medium text-text-secondary mb-1">Description</label>
                    <textarea 
                      id="report-explanation" 
                      value={explanation}
                      onChange={e => setExplanation(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 text-text-main bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 resize-none"
                      placeholder="Enter report description"
                    />
                </div>
                
                {error && <p className="text-danger text-sm">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="bg-border text-text-main font-semibold px-4 py-2 rounded-md hover:bg-border/80 transition-colors">Cancel</button>
                <button onClick={handleSubmit} className="bg-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors">Save Changes</button>
            </div>
        </div>
        <style>{`
          .fade-in { animation: fadeIn 0.3s ease-out forwards; }
          .modal-content { animation: slideIn 0.3s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
    </div>
  );
};
