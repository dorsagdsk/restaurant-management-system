document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/admin/best-selling-products/');
        if (!response.ok) {
            throw new Error('Failed to fetch best-selling products');
        }

        const data = await response.json();

        const tableBody = document.getElementById('best-selling-products-table').getElementsByTagName('tbody')[0];
        data.forEach(product => {
            const row = tableBody.insertRow();
            const productNameCell = row.insertCell(0);
            const totalSalesCell = row.insertCell(1);

            productNameCell.textContent = product.product_name;
            totalSalesCell.textContent = product.total_sales;
        });
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching best-selling products.');
    }
});
