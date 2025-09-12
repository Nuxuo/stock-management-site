// src/components/CategorySelector.tsx
import React from 'react';
import { Category, CategorySlug } from '@/lib/types';
import { iconMap } from '@/lib/icons';

interface CategorySelectorProps {
    categories: Category[];
    activeCategory: CategorySlug;
    onSelectCategory: (slug: CategorySlug) => void;
}

export const CategorySelector = ({ categories, activeCategory, onSelectCategory }: CategorySelectorProps) => {
    const CategoryButton = ({ category }: { category: Category }) => (
        <button
          onClick={() => onSelectCategory(category.slug)}
          className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-1.5 flex-1 ${
            activeCategory === category.slug 
              ? 'border-zinc-600 shadow-lg' 
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
          style={{ 
            background: activeCategory === category.slug 
              ? `linear-gradient(135deg, ${category.color}15 0%, ${category.color}08 100%)` 
              : 'linear-gradient(to right, #1c1c1c 0%, #1c1c1c 100%)' 
          }}
        >
          <div style={{ color: activeCategory === category.slug ? category.color : '#9ca3af' }}>
            {iconMap[category.icon]}
          </div>
          <span className="text-xs font-medium uppercase" style={{ 
            color: activeCategory === category.slug ? category.color : '#9ca3af' 
          }}>
            {category.title}
          </span>
        </button>
    );

    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {categories.map((cat) => (
                <CategoryButton key={cat.id} category={cat} />
            ))}
        </div>
    );
};