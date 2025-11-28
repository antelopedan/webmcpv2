
import React, { useState } from 'react';
import { PromptLibraryIcon } from './icons/sidebarIcons';
import { TagIcon } from './icons/TagIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { CogIcon } from './icons/CogIcon';
import { LogoIcon } from './icons/LogoIcon';
import { LogOutIcon } from './icons/LogOutIcon';
import { QuestionMarkCircleIcon } from './icons/sidebarIcons';
import { ContentStackIcon } from './icons/sidebarIcons';
import type { View, User } from '../types';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, active, onClick }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center px-3 py-2.5 text-sm transition-all duration-200 cut-corner-sm group ${
      active 
        ? 'bg-white/10 font-medium shadow-none' 
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 font-normal'
    }`}
  >
    <span className={`${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
      {icon}
    </span>
    <span className={`mx-3 tracking-wide ${active ? 'text-white' : ''}`}>{label}</span>
  </a>
);

const ClientItem: React.FC<{ name: string; logoUrl: string; isActive?: boolean }> = ({ name, logoUrl, isActive }) => (
    <div className={`group flex items-center gap-3 px-3 py-2 cut-corner-sm transition-all duration-200 ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}>
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden border border-slate-700">
            <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
        </div>
        <span className={`text-sm font-medium tracking-wide ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
            {name}
        </span>
    </div>
);

// Mini Icons for Section Headers
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
    </svg>
);

const WrenchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M19 5.5a4.5 4.5 0 01-4.791 4.49c-.873-.055-1.808.128-2.368.8l-6.024 7.23a2.724 2.724 0 11-3.837-3.837L9.21 8.16c.672-.56.855-1.495.8-2.368a4.5 4.5 0 015.873-4.575c.324.105.39.51.15.752L13.34 4.66a.455.455 0 00-.11.494 3.01 3.01 0 001.617 1.617c.17.07.363.02.493-.111l2.692-2.692c.241-.241.647-.174.752.15.14.435.216.9.216 1.382zM4 17a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);

const AdjustmentsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
    </svg>
);

interface SidebarProps {
    activeView: View;
    onNavigate: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, setIsOpen, user }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const sidebarClasses = `
    flex flex-col w-64 bg-[#122830] text-white transition-transform duration-300 ease-in-out z-30
    md:relative md:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    fixed inset-y-0 left-0 border-r border-slate-800
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center px-6 h-20 border-b border-slate-800">
        <LogoIcon />
        <span className="text-lg font-semibold tracking-wide ml-3 text-white">Antelope</span>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        
        {/* Clients Tier */}
        <div>
            <div className="px-3 mb-2 flex items-center gap-2 text-slate-500">
                <BriefcaseIcon />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Clients</h3>
            </div>
            <div className="space-y-1">
                <ClientItem 
                    name="McDonald's" 
                    logoUrl="https://cdn.brandfetch.io/mcdonalds.com?c=1idxs7KmPQaWsUGW6lU" 
                    isActive={true} 
                />
                <ClientItem 
                    name="Nike" 
                    logoUrl="https://cdn.brandfetch.io/nike.com?c=1idxs7KmPQaWsUGW6lU" 
                    isActive={false} 
                />
                <ClientItem 
                    name="Lululemon" 
                    logoUrl="https://cdn.brandfetch.io/lululemon.com?c=1idxs7KmPQaWsUGW6lU" 
                    isActive={false} 
                />
            </div>
        </div>

        {/* Dashboard Tier */}
        <div>
            <div className="px-3 mb-2 flex items-center gap-2 text-slate-500">
                <WrenchIcon />
                <h3 className="text-xs font-semibold uppercase tracking-wider">TOOLS</h3>
            </div>
            <div className="space-y-1">
                <NavLink
                    icon={<PromptLibraryIcon />}
                    label="Prompt Library"
                    active={activeView === 'Home'}
                    onClick={() => onNavigate('Home')}
                />
                 <NavLink
                    icon={<ContentStackIcon />}
                    label="Content Viewer"
                    active={activeView === 'Content'}
                    onClick={() => onNavigate('Content')}
                />
                 <NavLink
                    icon={<ChartBarIcon />}
                    label="Analytics"
                    active={activeView === 'Analytics'}
                    onClick={() => onNavigate('Analytics')}
                />
                 <NavLink
                    icon={<DocumentIcon />}
                    label="Reports"
                    active={activeView === 'Reports'}
                    onClick={() => onNavigate('Reports')}
                />
            </div>
        </div>

        {/* Configuration Tier */}
        <div>
            <div className="px-3 mb-2 flex items-center gap-2 text-slate-500">
                <AdjustmentsIcon />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Configuration</h3>
            </div>
            <div className="space-y-1">
                <NavLink
                    icon={<TagIcon />}
                    label="Manage Brands"
                    active={activeView === 'Brands'}
                    onClick={() => onNavigate('Brands')}
                />
                <NavLink
                    icon={<CogIcon />}
                    label="Settings"
                    active={activeView === 'Settings'}
                    onClick={() => onNavigate('Settings')}
                />
                 <NavLink
                    icon={<QuestionMarkCircleIcon />}
                    label="FAQ"
                    active={activeView === 'FAQ'}
                    onClick={() => onNavigate('FAQ')}
                />
            </div>
        </div>

      </nav>

      <div className="px-4 py-4 border-t border-slate-800 bg-[#071920]">
        <div 
          className="relative"
          onMouseEnter={() => setIsUserMenuOpen(true)}
          onMouseLeave={() => setIsUserMenuOpen(false)}
        >
          {isUserMenuOpen && (
            <div 
              className="absolute left-0 bottom-full w-full z-50 pb-2"
            >
              <div className="bg-slate-800 rounded-md shadow-lg py-1 border border-slate-700 mx-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('Settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <CogIcon />
                  <span>Settings</span>
                </a>
                <div className="my-1 h-px bg-slate-700 mx-2"></div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Logged out!'); // Placeholder action
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <LogOutIcon />
                  <span>Log Out</span>
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-colors hover:bg-white/5 group">
              <img src="https://i.imgur.com/GnC09mW.png" alt="User profile" className="w-8 h-8 rounded-full border border-slate-600 group-hover:border-slate-400 transition-colors" />
              <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                {user ? `${user.first_name} ${user.last_name}`.trim() : 'Loading...'}
              </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
