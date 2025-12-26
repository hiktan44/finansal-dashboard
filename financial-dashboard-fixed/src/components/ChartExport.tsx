import React, { useRef } from 'react'
import { Download, FileImage, FileText, FileSpreadsheet } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface ChartExportProps {
  chartRef: React.RefObject<HTMLDivElement>
  data: any[]
  fileName: string
  title?: string
}

const ChartExport: React.FC<ChartExportProps> = ({ chartRef, data, fileName, title }) => {
  const [exporting, setExporting] = React.useState(false)

  const exportToPNG = async () => {
    if (!chartRef.current) return
    
    try {
      setExporting(true)
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#1F2937',
        scale: 2, // Higher quality
        logging: false
      })
      
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${fileName}.png`)
        }
        setExporting(false)
      })
    } catch (error) {
      console.error('PNG export hatası:', error)
      setExporting(false)
    }
  }

  const exportToPDF = async () => {
    if (!chartRef.current) return
    
    try {
      setExporting(true)
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#1F2937',
        scale: 2,
        logging: false
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      if (title) {
        pdf.setFontSize(16)
        pdf.text(title, 20, 30)
      }
      pdf.save(`${fileName}.pdf`)
      setExporting(false)
    } catch (error) {
      console.error('PDF export hatası:', error)
      setExporting(false)
    }
  }

  const exportToCSV = () => {
    try {
      setExporting(true)
      const worksheet = XLSX.utils.json_to_sheet(data)
      const csv = XLSX.utils.sheet_to_csv(worksheet)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, `${fileName}.csv`)
      setExporting(false)
    } catch (error) {
      console.error('CSV export hatası:', error)
      setExporting(false)
    }
  }

  const exportToExcel = () => {
    try {
      setExporting(true)
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Veri')
      XLSX.writeFile(workbook, `${fileName}.xlsx`)
      setExporting(false)
    } catch (error) {
      console.error('Excel export hatası:', error)
      setExporting(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={exportToPNG}
        disabled={exporting}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="PNG olarak indir"
      >
        <FileImage className="h-4 w-4" />
        <span className="text-sm">PNG</span>
      </button>
      
      <button
        onClick={exportToPDF}
        disabled={exporting}
        className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="PDF olarak indir"
      >
        <FileText className="h-4 w-4" />
        <span className="text-sm">PDF</span>
      </button>
      
      <button
        onClick={exportToCSV}
        disabled={exporting}
        className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="CSV olarak indir"
      >
        <Download className="h-4 w-4" />
        <span className="text-sm">CSV</span>
      </button>
      
      <button
        onClick={exportToExcel}
        disabled={exporting}
        className="flex items-center space-x-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Excel olarak indir"
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span className="text-sm">Excel</span>
      </button>
    </div>
  )
}

export default ChartExport
