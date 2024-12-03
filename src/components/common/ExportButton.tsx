import { useState } from 'react'
import { renderToString } from 'react-dom/server'
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  data: any
  filename: string
  title: string
  description: string
  chartType?: 'line' | 'bar' | 'pie' | 'radar'
  chartData?: any[]
}

export function ExportButton({ 
  data, 
  filename, 
  title, 
  description, 
  chartType,
  chartData 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToExcel = async () => {
    try {
      setIsExporting(true)
      const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPDF = async () => {
    try {
      setIsExporting(true)
      const doc = new jsPDF()
      
      // Add title and description
      doc.setFontSize(16)
      doc.text(title, 20, 20)
      doc.setFontSize(12)
      doc.text(description, 20, 30)

      // Add chart if available
      if (chartType && chartData) {
        const chart = renderChart()
        if (chart) {
          const svg = document.createElement('div')
          svg.style.width = '500px'
          svg.style.height = '300px'
          const container = document.createElement('div')
          container.appendChild(svg)
          document.body.appendChild(container)
          
          // Render chart to SVG
          const chartInstance = renderChart()
          if (chartInstance) {
            const svgString = renderToString(chartInstance)
            svg.innerHTML = svgString
            // Convert SVG to image and add to PDF
            const svgData = svg.innerHTML
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()
            img.onload = () => {
              canvas.width = img.width
              canvas.height = img.height
              ctx?.drawImage(img, 0, 0)
              const imgData = canvas.toDataURL('image/png')
              doc.addImage(imgData, 'PNG', 20, 40, 170, 100)
              
              // Add data table below the chart
              autoTable(doc, {
                head: [Object.keys(Array.isArray(data) ? data[0] : data)],
                body: Array.isArray(data) 
                  ? data.map(row => Object.values(row))
                  : [Object.values(data)],
                startY: 150
              })
              
              doc.save(`${filename}.pdf`)
            }
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
          }
          document.body.removeChild(container)
        }
      } else {
        // If no chart, just add data table
        autoTable(doc, {
          head: [Object.keys(Array.isArray(data) ? data[0] : data)],
          body: Array.isArray(data) 
            ? data.map(row => Object.values(row))
            : [Object.values(data)],
          startY: 40
        })
        doc.save(`${filename}.pdf`)
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToJSON = async () => {
    try {
      setIsExporting(true)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      saveAs(blob, `${filename}.json`)
    } catch (error) {
      console.error('Error exporting to JSON:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const renderChart = () => {
    if (!chartData) return null

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        )
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar
                name="value"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToExcel}>
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          Export to PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          Export to JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
