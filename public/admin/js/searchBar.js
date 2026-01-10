document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function () {
            var input = this.value.toLowerCase();
            var rows = document.querySelectorAll('#userTable tr');

            rows.forEach(function (row) {
                // Assuming Name is at index 1 and some other field at index 2 (like Batch/Email)
                // We check if either cell contains the search term
                const cells = row.cells;
                if (cells.length > 2) {
                    var name = cells[1].textContent.toLowerCase();
                    var other = cells[2].textContent.toLowerCase();

                    if (name.includes(input) || other.includes(input)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }
});
