document.getElementById('download-btn').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const orderDetails = document.querySelector('.modal-body');
    html2canvas(orderDetails).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF();
        doc.addImage(imgData, 'PNG', 10, 10);
        doc.save('ST SHOP .pdf');
    });
});
