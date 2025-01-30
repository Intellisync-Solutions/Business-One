import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Extend the jsPDF type to include autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportOptions {
  filename: string
  format: 'xlsx' | 'pdf' | 'json'
  title?: string
  description?: string
}

export const exportUtils = {
  // Export data to Excel
  exportToExcel: async (data: any[], options: ExportOptions) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add headers
    const headers = Object.keys(data[0] || {});
    worksheet.columns = headers.map(header => ({ header, key: header }));

    // Add data
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const dataBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, `${options.filename}.xlsx`);
  },

  // Export data to PDF
  exportToPDF: (data: any[], options: ExportOptions) => {
    const doc = new jsPDF()
    
    // Add title if provided
    if (options.title) {
      doc.setFontSize(16)
      doc.text(options.title, 14, 15)
    }

    // Add description if provided
    if (options.description) {
      doc.setFontSize(11)
      doc.text(options.description, 14, 25)
    }

    // Convert data to table format
    const tableData = data.map(item => Object.values(item))
    const headers = Object.keys(data[0])

    // Add table
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: options.title || options.description ? 35 : 15,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [66, 66, 66]
      }
    })

    // Save file
    doc.save(`${options.filename}.pdf`)
  },

  // Export data to JSON
  exportToJSON: (data: any, options: ExportOptions) => {
    const jsonString = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([jsonString], { type: 'application/json' })
    saveAs(dataBlob, `${options.filename}.json`)
  },

  // Generic export function
  exportData: (data: any, options: ExportOptions) => {
    switch (options.format) {
      case 'xlsx':
        if (Array.isArray(data)) {
          exportUtils.exportToExcel(data, options)
        } else {
          exportUtils.exportToExcel([data], options)
        }
        break
      
      case 'pdf':
        if (Array.isArray(data)) {
          exportUtils.exportToPDF(data, options)
        } else {
          exportUtils.exportToPDF([data], options)
        }
        break
      
      case 'json':
        exportUtils.exportToJSON(data, options)
        break
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }
}
