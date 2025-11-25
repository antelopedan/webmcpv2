
import React, { useState } from 'react';
import { getSocialIcon } from './utils/socialUtils';

interface AddBrandModalProps {
  onAddBrand: (data: { name: string, logoUrl?: string, socialUrls: string[] }) => void;
  onClose: () => void;
}

export const AddBrandModal: React.FC<AddBrandModalProps> = ({ onAddBrand, onClose }) => {
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [stagedUrls, setStagedUrls] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleAddUrl = () => {
    if (!socialUrl.trim()) return;
    try {
        // Use robust parsing logic to validate, allowing for special characters like '@'.
        const sanitizedUrl = socialUrl.replace(/@/g, '%40');
        const fullUrl = sanitizedUrl.startsWith('http') ? sanitizedUrl : `https://${sanitizedUrl}`;
        new URL(fullUrl); // This is for validation.

        // If it doesn't throw, the URL is valid.
        setStagedUrls([...stagedUrls, socialUrl]);
        setSocialUrl('');
        setError('');
    } catch {
      setError('Please enter a valid URL.');
    }
  };

  const removeUrl = (index: number) => {
    setStagedUrls(stagedUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Brand name is required.');
      return;
    }
     if (stagedUrls.length === 0) {
      setError('Please add at least one social URL.');
      return;
    }
    setError('');
    onAddBrand({ name, logoUrl, socialUrls: stagedUrls });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
        <div className="modal-content bg-surface rounded-xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col">
            <header className="p-6 border-b border-border flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Add a New Brand</h2>
                    <p className="text-body text-text-secondary">Enter brand details and social profiles.</p>
                </div>
                <button onClick={onClose} className="text-2xl text-text-secondary hover:text-text-main">&times;</button>
            </header>
            <div className="p-6 overflow-y-auto space-y-4">
                <div>
                    <label htmlFor="addBrandName" className="text-body font-medium text-text-secondary">Brand Name</label>
                    <input 
                        type="text" 
                        id="addBrandName" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., QuantumLeap" 
                        className="w-full mt-1 px-3 py-2 bg-background border border-border text-text-main rounded-md shadow-sm placeholder-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>
                <div>
                    <label htmlFor="addBrandLogo" className="text-body font-medium text-text-secondary">Logo URL (Optional)</label>
                    <input 
                        type="url" 
                        id="addBrandLogo" 
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png" 
                        className="w-full mt-1 px-3 py-2 bg-background border border-border text-text-main rounded-md shadow-sm placeholder-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>
                <div>
                    <label htmlFor="addSocialUrl" className="text-body font-medium text-text-secondary">Social Media URL</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input 
                            type="text" 
                            id="addSocialUrl"
                            value={socialUrl}
                            onChange={(e) => setSocialUrl(e.target.value)}
                            placeholder="https://twitter.com/quantumleap" 
                            className="w-full px-3 py-2 bg-background border border-border text-text-main rounded-md shadow-sm placeholder-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <button onClick={handleAddUrl} className="bg-border h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-md hover:bg-primary transition-colors font-bold text-lg">+</button>
                    </div>
                </div>
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                     {stagedUrls.map((url, index) => (
                        <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md text-body">
                            <div className="flex items-center gap-2 truncate">
                                <span className="flex-shrink-0">{getSocialIcon(url)}</span>
                                <span className="truncate text-text-secondary" title={url}>{url}</span>
                            </div>
                            <button onClick={() => removeUrl(index)} className="remove-staged-url-btn text-text-secondary hover:text-red-500 font-bold">&times;</button>
                        </div>
                    ))}
                </div>
                {error && <p className="text-body text-red-500">{error}</p>}
            </div>
            <footer className="p-6 mt-auto border-t border-border flex justify-end gap-4">
                <button onClick={onClose} className="bg-border font-semibold px-4 py-2 rounded-md text-text-main">Cancel</button>
                <button onClick={handleSubmit} className="bg-accent text-white font-semibold px-4 py-2 rounded-md">+ Add Brand</button>
            </footer>
        </div>
    </div>
  );
};