import { useState } from 'react';
import { Share2, X, FileText, FileSpreadsheet, Printer, Mail, Copy, Download, Globe, FileImage } from 'lucide-react';

interface ExportFABProps {
  onExportPDF: () => void;
  onExportPPTX: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  onShareWhatsApp: () => void;
  onShareEmail: () => void;
  onCopyLink: () => void;
  isCurrentPage?: boolean;
  title?: string;
}

export function ExportFAB({ 
  onExportPDF, 
  onExportPPTX, 
  onExportExcel, 
  onPrint, 
  onShareWhatsApp, 
  onShareEmail,
  onCopyLink,
  isCurrentPage = true,
  title = "Finansal Analiz Raporu"
}: ExportFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[9999] print:hidden" style={{ pointerEvents: 'auto' }}>
      {/* Action Buttons */}
      <div className={`
        flex flex-col gap-3 mb-3 transition-all duration-300 transform origin-bottom
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}
      `}>
        
        {/* Export/Download Section */}
        <div className="text-xs text-gray-500 font-medium text-center px-2">
          📊 İndir
        </div>
        
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            onExportPDF(); 
            setIsOpen(false); 
          }}
          className="flex items-center gap-3 bg-white hover:bg-red-50 text-red-600 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group"
          title="PDF olarak indir"
          type="button"
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">PDF</span>
        </button>
        
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            onExportExcel(); 
            setIsOpen(false); 
          }}
          className="flex items-center gap-3 bg-white hover:bg-green-50 text-green-600 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group"
          title="Excel olarak indir"
          type="button"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="font-medium">Excel</span>
        </button>
        
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            onExportPPTX(); 
            setIsOpen(false); 
          }}
          className="flex items-center gap-3 bg-white hover:bg-orange-50 text-orange-600 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group"
          title="PowerPoint sunumu indir"
          type="button"
        >
          <FileImage className="w-5 h-5" />
          <span className="font-medium">Sunum</span>
        </button>

        {/* Print */}
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            onPrint(); 
            setIsOpen(false); 
          }}
          className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group"
          title="Yazdır"
          type="button"
        >
          <Printer className="w-5 h-5" />
          <span className="font-medium">Yazdır</span>
        </button>

        {/* Divider */}
        <div className="h-px bg-gray-200 mx-4"></div>

        {/* Share Section */}
        <div className="text-xs text-gray-500 font-medium text-center px-2">
          🔗 Paylaş
        </div>

        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            onCopyLink(); 
            setIsOpen(false); 
          }}
          className="flex items-center gap-3 bg-white hover:bg-purple-50 text-purple-600 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group"
          title="Link kopyala"
          type="button"
        >
          <Copy className="w-5 h-5" />
          <span className="font-medium">Link</span>
        </button>
        
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            onShareWhatsApp(); 
            setIsOpen(false); 
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
            onShareEmail(); 
            setIsOpen(false); 
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
          setIsOpen(!isOpen);
        }}
        className={`
          bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
          text-white rounded-full shadow-2xl hover:shadow-xl transition-all transform hover:scale-110 
          flex items-center justify-center gap-2 px-4 py-3
          ${isOpen ? 'rotate-180' : 'rotate-0'}
        `}
        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10000 }}
        title={isOpen ? 'Seçenekleri kapat' : 'Paylaş ve indir seçenekleri'}
        type="button"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <Share2 className="w-5 h-5" />
            <span className="font-medium text-sm hidden sm:inline">Paylaş</span>
          </>
        )}
      </button>
      
      {/* Context Info */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-black/80 text-white text-xs px-3 py-2 rounded-lg max-w-xs">
          <div className="font-medium mb-1">
            {isCurrentPage ? 'Bu Sayfa' : 'Tüm Site'} - {title}
          </div>
          <div className="text-gray-300">
            Paylaşım ve indirme seçenekleriniz
          </div>
        </div>
      )}
    </div>
  );
}
