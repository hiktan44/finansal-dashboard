import { useState } from 'react';
import { ChevronLeft, ChevronRight, Globe, TrendingUp, BarChart3, AlertTriangle, LineChart, X } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  slides: number[];
  count: number;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  isOpen,
  onToggle
}: CategorySidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-72 md:sticky md:top-16
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onToggle}
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategoriler</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Veri kategorilerine göre filtreleyin
          </p>
        </div>

        {/* Categories */}
        <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    onSelectCategory(category.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg 
                    transition-colors group
                    ${isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="text-sm font-medium text-left">
                      {category.label}
                    </span>
                  </div>
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${isSelected 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Toplam {categories.find(c => c.id === 'all')?.count || 0} grafik ve tablo
          </p>
        </div>
      </aside>

      {/* Toggle Button (Desktop) */}
      <button
        onClick={onToggle}
        className={`
          hidden lg:flex fixed top-20 z-40 items-center justify-center
          w-8 h-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          rounded-r-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all
          ${isOpen ? 'left-72' : 'left-0'}
        `}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>
    </>
  );
}

// Export category icons for use in EconomicReports
export const categoryIcons = {
  all: Globe,
  global: Globe,
  turkiye: TrendingUp,
  sektorel: BarChart3,
  risk: AlertTriangle,
  forecast: LineChart,
};
