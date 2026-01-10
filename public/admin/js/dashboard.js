let myChart;
console.log("dgnkjefojkdfnkojdv kmerv v erds fvepioj nfbjk k ");

function initChart(monthlyData, yearlyData, currentYear) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const labelsMonthly = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labelsYearly = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsMonthly,
            datasets: [{
                label: 'Monthly Revenue',
                data: monthlyData,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });

    window.updateChart = function() {
        const filter = document.getElementById('dataFilter').value;
        if (filter === "yr") {
            myChart.data.labels = labelsYearly;
            myChart.data.datasets[0].data = yearlyData;
            myChart.data.datasets[0].label = 'Yearly Revenue';
        } else {
            myChart.data.labels = labelsMonthly;
            myChart.data.datasets[0].data = monthlyData;
            myChart.data.datasets[0].label = 'Monthly Revenue';
        }
        myChart.update();
    };
}