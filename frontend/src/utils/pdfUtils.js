import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (stats, buildings, month, year) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 150, 200); // Cyan-ish
    doc.text('Financial Report', pageWidth / 2, 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100);
    const period = month && year ? `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}` : 'All Time';
    doc.text(`Period: ${period}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 36, { align: 'center' });

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary Statistics', 14, 50);

    const summaryData = [
        ['Total Collections', `Rs. ${stats?.totalCollections?.toLocaleString() || 0}`],
        ['Total Expenses', `Rs. ${stats?.totalExpenses?.toLocaleString() || 0}`],
        ['Net Profit', `Rs. ${stats?.netProfit?.toLocaleString() || 0}`],
        ['Collection Rate', `${stats?.collectionRate || 0}%`],
        ['Occupancy Rate', `${stats?.occupancyRate || 0}%`]
    ];

    doc.autoTable({
        startY: 55,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 200] },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // Building Breakdown Section
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Building Breakdown', 14, finalY);

    const buildingData = buildings.map(b => [
        b.name,
        b.address,
        b.totalFloors * 4 + ' (Est.)', // Placeholder for room count logic if not available
        '-',
        '-'
    ]);

    doc.autoTable({
        startY: finalY + 5,
        head: [['Building Name', 'Address', 'Total Rooms', 'Occupied', 'Vacant']],
        body: buildingData,
        theme: 'striped',
        headStyles: { fillColor: [100, 100, 100] },
        styles: { fontSize: 9, cellPadding: 3 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`financial-report-${period.replace(' ', '-')}.pdf`);
};
