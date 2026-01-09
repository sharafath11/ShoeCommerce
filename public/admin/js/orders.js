import { debounce } from "/utils/debounce.js";

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchOrdersInput");
    
    if (searchInput) {
        const liveSearch = debounce((query) => {            
            const rows = document.querySelectorAll("tbody tr");
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query.toLowerCase()) ? "" : "none";
            });
        }, 400); 

        searchInput.addEventListener("input", (e) => liveSearch(e.target.value));
    }
});