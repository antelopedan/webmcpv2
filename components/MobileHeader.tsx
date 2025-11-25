
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { MenuIcon } from './icons/MenuIcon';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 z-10">
            <button onClick={onMenuClick} className="text-text-main p-2">
                <MenuIcon />
            </button>
            <div className="flex items-center gap-2">
                <LogoIcon />
                <span className="text-lg font-bold text-text-main">Antelope</span>
            </div>
            <div className="w-8"></div>
        </header>
    );
};
