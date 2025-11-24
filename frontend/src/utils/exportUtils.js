export const downloadCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8,"
        + data.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const generateFinancialReportCSV = (stats, buildings) => {
    const rows = [];

    // Header
    rows.push(['Financial Report', new Date().toLocaleDateString()]);
    rows.push([]);

    // Summary Stats
    rows.push(['Summary Statistics']);
    rows.push(['Total Collections', stats?.totalCollections || 0]);
    rows.push(['Total Expenses', stats?.totalExpenses || 0]);
    rows.push(['Net Profit', stats?.netProfit || 0]);
    rows.push(['Collection Rate', `${stats?.collectionRate || 0}%`]);
    rows.push(['Occupancy Rate', `${stats?.occupancyRate || 0}%`]);
    rows.push([]);

    // Building Breakdown
    rows.push(['Building Breakdown']);
    rows.push(['Name', 'Address', 'Total Rooms', 'Occupied', 'Vacant']);

    buildings.forEach(b => {
        rows.push([
            b.name,
            b.address,
            b.totalFloors * 4, // Estimate or fetch actual room count if available
            '-', // Detailed room stats might need more data
            '-'
        ]);
    });

    return rows;
};
