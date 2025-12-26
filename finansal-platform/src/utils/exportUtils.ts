import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PptxGenJS from 'pptxgenjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  onProgress?: (progress: number, message: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Export slides to PDF
 */
export async function exportToPDF(
  slideElements: HTMLElement[],
  filename: string = 'ekonomik-raporlar.pdf',
  options: ExportOptions = {}
) {
  try {
    const { onProgress, onComplete, onError } = options;
    
    onProgress?.(0, 'PDF hazırlanıyor...');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    for (let i = 0; i < slideElements.length; i++) {
      const element = slideElements[i];
      if (!element) continue;

      onProgress?.(
        Math.round(((i + 1) / slideElements.length) * 100),
        `Slide ${i + 1}/${slideElements.length} işleniyor...`
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      
      // Center image vertically if smaller than page
      const yPos = imgHeight < pageHeight - 2 * margin 
        ? (pageHeight - imgHeight) / 2 
        : margin;

      pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, Math.min(imgHeight, pageHeight - 2 * margin));
    }

    pdf.save(filename);
    onComplete?.();
  } catch (error) {
    console.error('PDF export error:', error);
    options.onError?.('PDF oluşturulurken hata oluştu');
  }
}

/**
 * Export slides to PPTX
 */
export async function exportToPPTX(
  slides: Array<{ title: string; content: string; slideNumber: number }>,
  filename: string = 'ekonomik-raporlar.pptx',
  options: ExportOptions = {}
) {
  try {
    const { onProgress, onComplete, onError } = options;
    
    onProgress?.(0, 'PPTX hazırlanıyor...');
    
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'Ekonomik Raporlar Sistemi';
    pptx.company = 'Türkiye Ekonomi Platformu';
    pptx.subject = 'Ekonomik Veriler ve Analizler';
    pptx.title = 'Ekonomik Raporlar';

    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];
      
      onProgress?.(
        Math.round(((i + 1) / slides.length) * 100),
        `Slide ${i + 1}/${slides.length} oluşturuluyor...`
      );

      const slide = pptx.addSlide();
      
      // Add title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 1,
        fontSize: 24,
        bold: true,
        color: '1F2937',
        align: 'center'
      });

      // Add content
      if (slideData.content) {
        slide.addText(slideData.content, {
          x: 0.5,
          y: 2,
          w: '90%',
          h: 4,
          fontSize: 14,
          color: '4B5563',
          valign: 'top'
        });
      }

      // Add slide number
      slide.addText(`Slide ${slideData.slideNumber}`, {
        x: '90%',
        y: '95%',
        w: 1,
        h: 0.3,
        fontSize: 10,
        color: '9CA3AF',
        align: 'right'
      });
    }

    await pptx.writeFile({ fileName: filename });
    onComplete?.();
  } catch (error) {
    console.error('PPTX export error:', error);
    options.onError?.('PPTX oluşturulurken hata oluştu');
  }
}

/**
 * Export data to Excel
 */
export function exportToExcel(
  data: any[],
  filename: string = 'ekonomik-raporlar.xlsx',
  options: ExportOptions = {}
) {
  try {
    const { onProgress, onComplete, onError } = options;
    
    onProgress?.(50, 'Excel hazırlanıyor...');

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Raporlar');

    // Style headers
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: '0066FF' } },
        alignment: { horizontal: 'center' }
      };
    }

    onProgress?.(100, 'İndiriliyor...');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, filename);

    onComplete?.();
  } catch (error) {
    console.error('Excel export error:', error);
    options.onError?.('Excel oluşturulurken hata oluştu');
  }
}

/**
 * Print current page
 */
export function printPage(options: ExportOptions = {}) {
  try {
    const { onComplete } = options;
    
    // Add print-specific styles
    const styleElement = document.createElement('style');
    styleElement.id = 'print-styles';
    styleElement.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-area, .print-area * {
          visibility: visible;
        }
        .print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        @page {
          size: A4;
          margin: 1cm;
        }
      }
    `;
    document.head.appendChild(styleElement);

    window.print();
    
    // Remove print styles after printing
    setTimeout(() => {
      document.getElementById('print-styles')?.remove();
      onComplete?.();
    }, 1000);
  } catch (error) {
    console.error('Print error:', error);
  }
}

/**
 * Share to WhatsApp
 */
export function shareToWhatsApp(reportCount: number = 259) {
  try {
    const currentDate = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `TURKIYE EKONOMISI RAPORU

${reportCount} slide kapsamli analiz
PDF/PPTX export mumkun
Guncel veriler - ${currentDate}

Platform: FinansPlatform
Link: ${window.location.href}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('WhatsApp share error:', error);
  }
}

/**
 * Share to Email
 */
export function shareToEmail(reportCount: number = 259) {
  try {
    const currentDate = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const subject = `Turkiye Ekonomi Raporu - ${currentDate}`;
    
    const body = `Turkiye Ekonomisinin Degerlendirilmesi ve Ongoruleri

Bu rapor sunlari icermektedir:
- Buyume ve Milli Gelir Verileri
- Enflasyon Analizi (TUFE/UFE)
- Butce ve Mali Durum
- Issizlik Istatistikleri
- Dis Ticaret ve Cari Acik
- Ekonomik Ongoruler (2025-2026)

Toplam: ${reportCount} slide kapsamli analiz

Platform: FinansPlatform
Tarih: ${currentDate}
Link: ${window.location.href}

PDF ve PPTX formatinda export edebilirsiniz.`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoUrl;
  } catch (error) {
    console.error('Email share error:', error);
  }
}

/**
 * Copy current page link to clipboard
 */
export function copyLinkToClipboard(options: ExportOptions = {}) {
  try {
    const { onComplete, onError } = options;
    
    const currentUrl = window.location.href;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        onComplete?.();
        console.log('Link kopyalandı:', currentUrl);
      }).catch((err) => {
        console.error('Link kopyalama hatası:', err);
        onError?.('Link kopyalanırken hata oluştu');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        onComplete?.();
        console.log('Link kopyalandı (fallback):', currentUrl);
      } catch (err) {
        console.error('Link kopyalama hatası (fallback):', err);
        onError?.('Link kopyalanırken hata oluştu');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  } catch (error) {
    console.error('Copy link error:', error);
    options.onError?.('Link kopyalanırken hata oluştu');
  }
}
