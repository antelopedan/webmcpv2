
import React from 'react';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedInIcon, YouTubeIcon, XIcon, TikTokIcon, DefaultIcon } from '../icons/social';
import type { SocialPlatform } from '../../types';

// The API supports these platforms
const platformDetectionRules: { id: SocialPlatform; domain: string; icon: React.ReactNode }[] = [
    { id: 'facebook', domain: 'facebook.com', icon: <FacebookIcon /> },
    { id: 'twitter', domain: 'x.com', icon: <XIcon /> },
    { id: 'twitter', domain: 'twitter.com', icon: <TwitterIcon /> },
    { id: 'instagram', domain: 'instagram.com', icon: <InstagramIcon /> },
    { id: 'linkedin', domain: 'linkedin.com', icon: <LinkedInIcon /> },
    { id: 'youtube', domain: 'youtube.com', icon: <YouTubeIcon /> },
    { id: 'tiktok', domain: 'tiktok.com', icon: <TikTokIcon /> },
];

export const getSocialIcon = (url: string): React.ReactNode => {
    if (!url) return <DefaultIcon />;
    try {
        // Sanitize URL for characters like '@' that the URL constructor dislikes in paths,
        // and ensure it has a protocol for robust parsing.
        const sanitizedUrl = url.replace(/@/g, '%40');
        const fullUrl = sanitizedUrl.startsWith('http') ? sanitizedUrl : `https://${sanitizedUrl}`;
        
        const hostname = new URL(fullUrl).hostname.replace('www.', '');
        const platform = platformDetectionRules.find(p => hostname.includes(p.domain));
        return platform ? platform.icon : <DefaultIcon />;
    } catch (e) {
        // If parsing still fails, return the default icon.
        return <DefaultIcon />;
    }
};

export const getSocialPlatform = (url: string): SocialPlatform => {
    if (!url) return 'website';
    try {
        // Sanitize URL for characters like '@' that the URL constructor dislikes in paths,
        // and ensure it has a protocol for robust parsing.
        const sanitizedUrl = url.replace(/@/g, '%40');
        const fullUrl = sanitizedUrl.startsWith('http') ? sanitizedUrl : `https://${sanitizedUrl}`;
        
        const hostname = new URL(fullUrl).hostname.replace('www.', '');
        const platform = platformDetectionRules.find(p => hostname.includes(p.domain));
        return platform ? platform.id : 'website';
    } catch (e) {
        // If parsing fails, return 'website' as a fallback.
        return 'website';
    }
};