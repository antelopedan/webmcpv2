
import React, { useState, useRef } from 'react';
import { useClickOutside } from '../utils/useClickOutside';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface StyledDropdownProps {
  triggerContent: React.ReactNode;
  children: (closeDropdown: () => void) => React.ReactNode;
  widthClass?: string;
  triggerClassName?: string;
}

export const StyledDropdown: React.FC<StyledDropdownProps> = ({ triggerContent, children, widthClass = 'w-56', triggerClassName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setIsOpen(false));

  const close = () => setIsOpen(false);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center px-4 py-2 rounded-lg text-body bg-background border border-border text-text-secondary hover:border-primary transition-colors ${triggerClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{triggerContent}</span>
        <ChevronDownIcon className={`w-5 h-5 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 ${widthClass} bg-surface border border-border rounded-lg shadow-xl z-10 p-2 space-y-1 fade-in`}>
          {children(close)}
        </div>
      )}
    </div>
  );
};
