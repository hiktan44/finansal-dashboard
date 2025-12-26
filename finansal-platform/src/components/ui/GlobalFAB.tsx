import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FileDown, X, FileText, FileSpreadsheet, Printer, Share2, Mail } from 'lucide-react';
import { shareToWhatsApp, shareToEmail } from '@/utils/exportUtils';

export function GlobalFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Debug logging
  console.log('GlobalFAB rendered on:', location.pathname);
  console.log('GlobalFAB should show:', location.pathname !== '/reports');

  // Ekonomik Raporlar sayfasında FAB zaten var, orada gösterme
  if (location.pathname === '/reports') {
    console.log('GlobalFAB hidden on /reports page');
    return null;
  }

  console.log('GlobalFAB rendering at bottom-8 right-8 with z-index 99999');

  const handleShareWhatsApp = () => {
    shareToWhatsApp();
    setIsOpen(false);
  };

  const handleShareEmail = () => {
    shareToEmail();
    setIsOpen(false);
  };

  const handleShare = () => {
    // Generic share for current page
    const pageTitle = document.title;
    const message = `${pageTitle}\n\n${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: pageTitle,
        text: message,
        url: window.location.href
      }).catch(() => {
        // Fallback to WhatsApp if native share fails
        handleShareWhatsApp();
      });
    } else {
      handleShareWhatsApp();
    }
  };

  return (
    <div 
      className="fixed bottom-8 right-8 print:hidden" 
      style={{ 
        pointerEvents: 'auto', 
        zIndex: 40,
        position: 'fixed'
      }}
    >
      {/* Action Buttons */}
      <div className={`
        flex flex-col gap-3 mb-3 transition-all duration-300 transform origin-bottom
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}
      `}>
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            handleShare(); 
          }}
          className="flex items-center gap-3 bg-white hover:bg-blue-50 text-blue-600 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group"
          title="Paylaş"
          type="button"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Paylaş</span>
        </button>

        {/* Divider */}
        <div className="h-px bg-gray-200 mx-4"></div>

        {/* Share Buttons */}
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            handleShareWhatsApp(); 
          }}
          className="flex items-center gap-3 bg-white hover:bg-green-50 text-green-600 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group"
          title="WhatsApp ile paylaş"
          type="button"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">WhatsApp</span>
        </button>

        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            handleShareEmail(); 
          }}
          className="flex items-center gap-3 bg-white hover:bg-blue-50 text-blue-600 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group"
          title="Email ile paylaş"
          type="button"
        >
          <Mail className="w-5 h-5" />
          <span className="font-medium">Email</span>
        </button>
      </div>

      {/* Main FAB Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('FAB button clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        className={`
          w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl 
          hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
        style={{ 
          pointerEvents: 'auto', 
          position: 'relative', 
          zIndex: 41,
          backgroundColor: '#2563eb',
          border: 'none',
          cursor: 'pointer'
        }}
        title={isOpen ? 'Kapat' : 'Paylaşım seçenekleri'}
        type="button"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
      </button>
    </div>
  );
}
