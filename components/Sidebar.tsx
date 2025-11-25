
import React, { useState } from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { TagIcon } from './icons/TagIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { CogIcon } from './icons/CogIcon';
import { LogoIcon } from './icons/LogoIcon';
import { LogOutIcon } from './icons/LogOutIcon';
// FIX: Corrected import path for types
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
    className={`flex items-center px-4 py-3 text-text-secondary transition-colors duration-200 transform rounded-lg hover:bg-primary/20 hover:text-text-main ${
      active ? 'bg-primary text-white font-semibold' : ''
    }`}
  >
    {icon}
    <span className={'mx-4'}>{label}</span>
  </a>
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

  const mainNavItems: {id: View, icon: React.ReactNode, label: string}[] = [
    { id: 'Home', icon: <HomeIcon />, label: 'Home' },
    { id: 'Brands', icon: <TagIcon />, label: 'Brands' },
    { id: 'Analytics', icon: <ChartBarIcon />, label: 'Analytics' },
    { id: 'Reports', icon: <DocumentIcon />, label: 'Reports' },
    { id: 'Settings', icon: <CogIcon />, label: 'Settings' },
  ];

  const sidebarClasses = `
    flex flex-col w-64 bg-surface text-text-main transition-transform duration-300 ease-in-out z-30
    md:relative md:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    fixed inset-y-0 left-0
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-center h-20 border-b border-border">
        <LogoIcon />
        <span className="text-xl font-bold ml-2 text-text-main">Antelope</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {mainNavItems.map(item => (
          <NavLink
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeView === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div 
          className="relative"
          onMouseEnter={() => setIsUserMenuOpen(true)}
          onMouseLeave={() => setIsUserMenuOpen(false)}
        >
          {isUserMenuOpen && (
            <div 
              className="absolute left-0 bottom-full w-full z-50 pb-2"
            >
              <div className="bg-background rounded-md shadow-lg py-1 border border-border mx-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('Settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-body text-text-secondary hover:bg-primary/20 hover:text-text-main transition-colors"
                >
                  <CogIcon />
                  <span>Settings</span>
                </a>
                <div className="my-1 h-px bg-border mx-2"></div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Logged out!'); // Placeholder action
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-body text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
                >
                  <LogOutIcon />
                  <span>Log Out</span>
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-md transition-colors hover:bg-primary/20">
              <img src="https://i.imgur.com/GnC09mW.png" alt={`${user ? `${user.first_name} ${user.last_name}` : 'User'}'s profile picture`} className="w-8 h-8 rounded-full" />
              <span className="text-body font-medium text-text-main truncate">
                {user ? `${user.first_name} ${user.last_name ? `${user.last_name[0]}.` : ''}`.trim() : 'Loading...'}
              </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
