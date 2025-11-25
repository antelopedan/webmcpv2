import React, { useState, useEffect } from 'react';

export const getAvatarColor = (name: string): string => {
    const colors = [
        'bg-primary', 
        'bg-accent', 
        'bg-dark-blue', 
        'bg-light-blue', 
        'bg-success', 
        'bg-warning', 
        'bg-danger'
    ];
    if (!name || name.length === 0) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

export const BrandAvatar: React.FC<{ name: string; size?: string; src?: string | null }> = ({ name, size = 'w-5 h-5 text-xs', src }) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [src]);

    if (src && !imageError) {
        return React.createElement('img', {
            src: src,
            alt: name,
            onError: () => setImageError(true),
            className: `flex-shrink-0 ${size} rounded-full object-cover border border-border bg-surface`
        });
    }

    const color = getAvatarColor(name);
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    return React.createElement('div', {
        className: `flex-shrink-0 ${size} ${color} rounded-full flex items-center justify-center text-white font-bold`
    }, initial);
};
