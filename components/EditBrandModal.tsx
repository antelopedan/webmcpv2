
import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for types
import type { Brand } from '../types';
import { getSocialIcon } from './utils/socialUtils';
import { DeleteIcon } from './icons/DeleteIcon';

interface EditBrandModalProps {
  brand: Brand;
  onUpdate: (brand: Brand & { socialUrls: string[], logoUrl?: string }) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const EditBrandModal: React.FC<EditBrandModalProps> = ({ brand, onUpdate, onDelete, onClose }) => {
  const [name, setName] = useState(brand.name);
  const [socialUrls, setSocialUrls] = useState(brand.social_profiles.map(p => p.profile_url));
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleAddUrl = () => {
    if (!newUrl.trim()) return;
    if (socialUrls.some(u => u === newUrl)) {
        setUrlError('This URL has already been added.');
        return;
    }

    try {
        // Use robust parsing logic to validate, allowing for special characters like '@'.
        const sanitizedUrl = newUrl.replace(/@/g, '%40');
        const fullUrl = sanitizedUrl.startsWith('http') ? sanitizedUrl : `https://${sanitizedUrl}`;
        new URL(fullUrl); // This is for validation.

        // If it doesn't throw, the URL is valid.
        setSocialUrls([...socialUrls, newUrl]);
        setNewUrl('');
        setUrlError('');
    } catch {
        setUrlError('Please enter a valid URL.');
    }
  };
  
  const removeUrl = (index: number) => {
    setSocialUrls(socialUrls.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate({ ...brand, name, logoUrl: brand.logo_url || undefined, socialUrls });
  };
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the brand "${brand.name}"?`)) {
      onDelete(brand.id);
    }
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
                <h2 className="text-2xl font-semibold text-text-main">Edit Brand</h2>
                <button onClick={onClose} className="text-text-secondary hover:text-text-main text-3xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="edit-brand-name" className="block text-body font-medium text-text-secondary mb-1">Brand Name</label>
                    <input 
                      type="text" 
                      id="edit-brand-name" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2 text-text-main bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                    />
                </div>
                <div>
                    <label htmlFor="edit-social-url" className="block text-body font-medium text-text-secondary mb-1">Add Social URL</label>
                    <div className="flex gap-2">
                        <input 
                          type="url" 
                          id="edit-social-url" 
                          value={newUrl}
                          onChange={e => { setNewUrl(e.target.value); setUrlError(''); }}
                          placeholder="https://new-profile.com/brand"
                          className="w-full px-4 py-2 text-text-main bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                        />
                        <button onClick={handleAddUrl} className="flex-shrink-0 bg-primary/20 text-primary font-bold px-4 rounded-md hover:bg-primary/30 transition-colors">+</button>
                    </div>
                    {urlError && <p className="text-danger text-caption mt-1">{urlError}</p>}
                </div>
                <div className="space-y-2 py-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {socialUrls.map((url, index) => (
                        <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md text-body">
                            <div className="flex items-center gap-2 overflow-hidden">
                               <span className="text-text-secondary flex-shrink-0">{getSocialIcon(url)}</span>
                                <span className="text-text-secondary truncate" title={url}>{url}</span>
                            </div>
                            <button onClick={() => removeUrl(index)} className="text-red-500 font-bold flex-shrink-0">&times;</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-danger text-white font-semibold px-4 py-2 rounded-md hover:bg-danger/90 transition-colors">
                  <DeleteIcon /> Delete
                </button>
                <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <button onClick={onClose} className="bg-border text-text-main font-semibold px-4 py-2 rounded-md hover:bg-border/80 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="bg-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition-colors">Save Changes</button>
                </div>
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
