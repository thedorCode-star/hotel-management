'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Download, FileText, TrendingUp } from 'lucide-react';

interface AnalyticsReportProps {
  userAnalytics: any;
  stats: any;
  allUsersData: any[];
}

export default function AnalyticsReport({ userAnalytics, stats, allUsersData }: AnalyticsReportProps) {
  
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('🏨 LUXURY HOTEL MANAGEMENT', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Performance Analytics Report', 105, 25, { align: 'center' });
    
    // Title page
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ANALYTICS DASHBOARD REPORT', 105, 60, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 120, { align: 'center' });
    
    // Executive summary
    doc.addPage();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 EXECUTIVE SUMMARY', 20, 30);
    
    // Summary boxes
    const boxWidth = 50;
    const boxHeight = 30;
    const startX = 20;
    const startY = 50;
    
    // Total Bookings
    doc.setFillColor(59, 130, 246);
    doc.rect(startX, startY, boxWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(stats.totalBookings?.toString() || '0', startX + boxWidth/2, startY + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Total Bookings', startX + boxWidth/2, startY + 25, { align: 'center' });
    
    // Total Payments
    doc.setFillColor(34, 197, 94);
    doc.rect(startX + 60, startY, boxWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(stats.totalPayments?.toString() || '0', startX + 60 + boxWidth/2, startY + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Total Payments', startX + 60 + boxWidth/2, startY + 25, { align: 'center' });
    
    // Total Users
    doc.setFillColor(168, 85, 247);
    doc.rect(startX + 120, startY, boxWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(stats.totalUsers?.toString() || '0', startX + 120 + boxWidth/2, startY + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Total Users', startX + 120 + boxWidth/2, startY + 25, { align: 'center' });
    
    // Top performers
    if (userAnalytics?.topBookers) {
      doc.addPage();
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('🏆 TOP PERFORMERS', 20, 30);
      
      const topBookersData = userAnalytics.topBookers.map((user: any, index: number) => [
        `#${index + 1}`,
        user.name || 'Unknown',
        user.count?.toString() || '0',
        `$${(user.totalSpent || 0).toLocaleString()}`
      ]);
      
      autoTable(doc, {
        head: [['Rank', 'Name', 'Bookings', 'Total Spent']],
        body: topBookersData,
        startY: 40,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }
      });
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, 20, 285);
      doc.text(`© ${new Date().getFullYear()} Luxury Hotel Management`, 190, 285, { align: 'right' });
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`hotel-analytics-report-${timestamp}.pdf`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button 
        onClick={generatePDFReport}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Full Report
      </Button>
      
      <Button 
        variant="outline"
        className="border-blue-200 text-blue-700 hover:bg-blue-50"
        onClick={() => {
          const doc = new jsPDF();
          doc.setFillColor(59, 130, 246);
          doc.rect(0, 0, 210, 30, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.text('🏨 LUXURY HOTEL MANAGEMENT', 105, 18, { align: 'center' });
          doc.addPage();
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(18);
          doc.text('📊 EXECUTIVE SUMMARY', 20, 30);
          doc.setFontSize(12);
          doc.text(`Total Users: ${stats.totalUsers || 0}`, 20, 50);
          doc.text(`Total Bookings: ${stats.totalBookings || 0}`, 20, 60);
          doc.text(`Total Payments: ${stats.totalPayments || 0}`, 20, 70);
          const timestamp = new Date().toISOString().split('T')[0];
          doc.save(`hotel-summary-${timestamp}.pdf`);
        }}
      >
        <FileText className="h-4 w-4 mr-2" />
        Quick Summary
      </Button>
    </div>
  );
}
