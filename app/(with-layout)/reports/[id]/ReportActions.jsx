'use client'

import { useState } from 'react'
import { Download, Share2, BookmarkPlus, Printer, FileJson, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function ReportActions({ hoa }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      // Find the main content area to capture
      const reportElement = document.querySelector('main')
      if (!reportElement) {
        throw new Error('Report content not found')
      }

      // Hide the scan lines overlay and action buttons during capture
      const scanLines = document.querySelector('.bg-scan-lines')
      const actionsFooter = document.querySelector('[data-report-actions]')
      if (scanLines) scanLines.style.display = 'none'
      if (actionsFooter) actionsFooter.style.display = 'none'

      // Capture the page content
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0a0f1a', // dossier-bg color
        windowWidth: 1200, // Consistent width for PDF
      })

      // Restore hidden elements
      if (scanLines) scanLines.style.display = ''
      if (actionsFooter) actionsFooter.style.display = ''

      // Calculate dimensions for PDF
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      let position = 0

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      )
      heightLeft -= pageHeight

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        )
        heightLeft -= pageHeight
      }

      // Generate filename
      const filename = `${hoa.hoa_name.replace(/[^a-zA-Z0-9]/g, '-')}-report.pdf`

      // Download the PDF
      pdf.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleDownloadJSON = () => {
    // Prepare clean data for export
    const exportData = {
      reportId: hoa.id,
      generatedAt: new Date().toISOString(),
      hoaInfo: {
        name: hoa.hoa_name,
        city: hoa.city,
        state: hoa.state,
        zipCode: hoa.zip_code,
        managementCompany: hoa.management_company,
        totalUnits: hoa.total_units,
        yearEstablished: hoa.year_established,
        propertyType: hoa.property_type,
        monthlyFee: hoa.monthly_fee,
      },
      scores: {
        overall: hoa.overall_score,
        financialHealth: hoa.financial_health_score,
        managementQuality: hoa.management_quality_score,
        communitySentiment: hoa.community_sentiment_score,
        restrictiveness: hoa.restrictiveness_score,
      },
      analysis: {
        summary: hoa.one_sentence_summary,
        redFlags: hoa.red_flags || [],
        yellowFlags: hoa.yellow_flags || [],
        greenFlags: hoa.green_flags || [],
      },
      financial: {
        reserveFundBalance: hoa.reserve_fund_balance,
        reserveFundPercentFunded: hoa.reserve_fund_percent_funded,
        recentSpecialAssessments: hoa.recent_special_assessments,
        feeIncreaseHistory: hoa.fee_increase_history,
      },
      recommendations: {
        questionsToAsk: hoa.questions_to_ask || [],
        documentsToRequest: hoa.documents_to_request || [],
      },
      publicRecords: hoa.public_records || null,
      dataQuality: {
        completeness: hoa.data_completeness,
        lastUpdated: hoa.last_updated,
      },
    }

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${hoa.hoa_name.replace(/[^a-zA-Z0-9]/g, '-')}-data.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareData = {
      title: `${hoa.hoa_name} - HOA Report`,
      text: hoa.one_sentence_summary || `HOA intelligence report for ${hoa.hoa_name}`,
      url: window.location.href,
    }

    // Try native share API first (mobile)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Report link copied to clipboard!')
    } catch (err) {
      // Final fallback: show the URL
      prompt('Copy this link to share:', window.location.href)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSaveToAccount = () => {
    // TODO: Implement save to account functionality when auth is added
    alert('Save to Account feature coming soon! Sign up to save reports.')
  }

  return (
    <div className="flex flex-wrap gap-3" data-report-actions>
      {/* Primary action: Download PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
        className="flex items-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-dossier-bg font-mono text-sm font-semibold rounded transition-colors"
      >
        {isGeneratingPDF ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download PDF
          </>
        )}
      </button>

      {/* Download JSON */}
      <button
        onClick={handleDownloadJSON}
        className="flex items-center gap-2 px-5 py-3 bg-dossier-surface hover:bg-slate-700 text-slate-300 font-mono text-sm rounded border border-dossier-border transition-colors"
      >
        <FileJson className="h-4 w-4" />
        Export Data
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-5 py-3 bg-dossier-surface hover:bg-slate-700 text-slate-300 font-mono text-sm rounded border border-dossier-border transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share Report
      </button>

      {/* Save to Account */}
      <button
        onClick={handleSaveToAccount}
        className="flex items-center gap-2 px-5 py-3 bg-dossier-surface hover:bg-slate-700 text-slate-300 font-mono text-sm rounded border border-dossier-border transition-colors"
      >
        <BookmarkPlus className="h-4 w-4" />
        Save to Account
      </button>

      {/* Print */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-5 py-3 bg-dossier-surface hover:bg-slate-700 text-slate-300 font-mono text-sm rounded border border-dossier-border transition-colors"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  )
}
