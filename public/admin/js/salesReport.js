/**
 * Antigravity UI: Sales Report
 * Target: /public/admin/js/salesReport.js
 */

import { showToast } from "/utils/toast.js";

// Global exposure
window.applyFilters = function() {
    const dateFilter = document.getElementById('dateFilter').value;
    const paymentFilter = document.getElementById('paymentFilter').value;
    const url = new URL(window.location.href);
    url.searchParams.set('dateFilter', dateFilter);
    url.searchParams.set('paymentFilter', paymentFilter);
    window.location.href = url.toString();
};

window.customFiltering = function(event) {
    event.preventDefault(); 
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (startDate > endDate) {
        showToast("The start date must be before the end date.", "error");
        return;
    }

    const paymentFilter = document.getElementById('paymentFilter').value;
    const url = `/admin/sales/report?dateFilter=custom&startDate=${startDate}&endDate=${endDate}` + 
                (paymentFilter ? `&paymentFilter=${paymentFilter}` : '');
    window.location.href = url;
};


window.downloadPDF = function() {
    const currentUrl = window.location.href;
    const url = `${currentUrl}?download=pdf`; 
    window.open(url, '_blank'); 
};

window.downloadExcel = function() {
    const currentUrl = window.location.href; 
    const url = `${currentUrl}?download=excel`; 
    window.open(url, '_blank'); 
};

window.resetHand = function() {
    window.location.href = "/admin/sales/report";
};

// Expose showToast if ejs calls it directly (though usage here is mostly inside functions)
window.showToast = showToast;

document.addEventListener('DOMContentLoaded', () => {
    const dateFilter = document.getElementById('dateFilter');
    if (!dateFilter) return;

    dateFilter.addEventListener('change', function() {
        // Logic for toggling custom date inputs
        const selectedValue = this.value;
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate && endDate) {
            // Find parent form-group or column to hide/show
            // The HTML structure is: <div class="col-md-6"><label...><input...></div>
            const startContainer = startDate.closest('.col-md-6');
            const endContainer = endDate.closest('.col-md-6');
            
            if (startContainer && endContainer) {
                 if (selectedValue === 'custom') {
                    startContainer.style.display = 'block';
                    endContainer.style.display = 'block';
                } else {
                    startContainer.style.display = 'none';
                    endContainer.style.display = 'none';
                }
            }
        }
    });
    
    // Initialize
    dateFilter.dispatchEvent(new Event('change'));
});
