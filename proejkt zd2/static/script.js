document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('name');
        const quantity = document.getElementById('quantity').value;
        const price = document.getElementById('price').value;
        const comment = document.getElementById('comment').value || '-'; // Default '-' if comment is empty

        // Walidacja
        if (!nameInput.value || !isNaN(nameInput.value)) {
            alert("Please enter a valid product name.");
            return;
        }

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        if (!price || isNaN(price) || price <= 0) {
            alert("Please enter a valid price.");
            return;
        }

        // Capitalize the first letter of the product name
        const name = nameInput.value.charAt(0).toUpperCase() + nameInput.value.slice(1).toLowerCase();
        addProduct(name, quantity, price, comment);
    });
});

function fetchProducts() {
    fetch('/products')
        .then(response => response.json())
        .then(data => {
            const productList = document.getElementById('productList');
            productList.innerHTML = '';
            let totalPrice = 0;

            data.forEach((product, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>${product.comment}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="editProduct(${product.id}, '${product.name}', ${product.quantity}, ${product.price}, '${product.comment || ''}')">Edit</button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                `;
                productList.appendChild(tr);
                totalPrice += product.price * product.quantity;

                // Add Total Price row under the last product's Price
                if (index === data.length - 1) {
                    const totalRow = document.createElement('tr');
                    const totalCell = document.createElement('td');
                    totalCell.colSpan = 4; // Span across all columns except Actions
                    totalCell.innerHTML = `<strong>Total price: ${totalPrice.toFixed(2)}</strong>`;
                    totalRow.appendChild(totalCell);
                    productList.appendChild(totalRow);
                }
            });

            document.getElementById('totalPrice').textContent = `Total Price: ${totalPrice.toFixed(2)}`;
        });
}

function addProduct(name, quantity, price, comment) {
    fetch('/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, quantity, price, comment })
    })
    .then(response => response.json())
    .then(() => {
        fetchProducts();
        document.getElementById('productForm').reset(); // Clear form after successful addition
    });
}

function deleteProduct(id) {
    fetch(`/products/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(() => {
        fetchProducts();
    });
}

function editProduct(id, currentName, currentQuantity, currentPrice, currentComment) {
    const name = prompt("Enter new name:", currentName);
    const quantity = prompt("Enter new quantity:", currentQuantity);
    const price = prompt("Enter new price:", currentPrice);
    const comment = prompt("Enter new comment:", currentComment);

    // Validations for edit input
    if (!name || !isNaN(name)) {
        alert("Please enter a valid product name.");
        return;
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    if (!price || isNaN(price) || price <= 0) {
        alert("Please enter a valid price.");
        return;
    }

    fetch(`/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, quantity, price, comment })
    })
    .then(response => response.json())
    .then(() => {
        fetchProducts();
    });
}
