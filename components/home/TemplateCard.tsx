import React from 'react';
import type { AnalysisTemplate } from '../../types';
import { iconComponentMap } from '../../data/templates';
import { ClockIcon } from '../icons/home';

interface TemplateCardProps {
  template: AnalysisTemplate;
  onSelect: () => void;
}

const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const formattedCategory = formatCategory(template.category);
  const IconComponent = iconComponentMap[formattedCategory];

  return (
    <div 
      onClick={onSelect} 
      className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between group transition-all hover:border-primary/60 hover:-translate-y-1 cursor-pointer"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 text-primary">
            {IconComponent && <IconComponent className="w-6 h-6" />}
            <span className="text-sm font-semibold">{formattedCategory}</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-text-main mb-2">{template.name}</h3>
        <p className="text-body text-text-secondary line-clamp-2">{template.description}</p>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <button className="text-sm font-semibold text-primary group-hover:underline">
          View Template &rarr;
        </button>
        <div className="flex items-center gap-2 text-caption text-text-secondary">
          <ClockIcon />
          <span>{template.estimated_time_minutes} min</span>
        </div>
      </div>
    </div>
  );
};
