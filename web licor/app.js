// --- CONFIGURACIÓN DE BASE DE DATOS SIMULADA ---
const DB_PRODUCTS_KEY = 'liquor_products';
const DEFAULT_PRODUCTS = [
    {
        id: 'P-001',
        name: 'Old Parr 12 Años',
        category: 'Whisky',
        price: 185000,
        quantity: 15,
        description: 'Whisky escocés añejado durante 12 años, caracterizado por su sabor suave, equilibrado y sus notas frutales con toques de turba y madera.',
        image: 'whisky_bottle.png'
    },
    {
        id: 'P-002',
        name: 'Tequila Don Julio Reposado',
        category: 'Tequila',
        price: 220000,
        quantity: 8,
        description: 'Tequila 100% de agave azul añejado durante 8 meses en barricas de roble blanco americano, con un aroma a pera, manzana y limón.',
        image: 'tequila_bottle.png'
    },
    {
        id: 'P-003',
        name: 'Cerveza Corona Extra',
        category: 'Cerveza',
        price: 6500,
        quantity: 40,
        description: 'Cerveza mexicana tipo Lager, clara, ligera y muy refrescante. Ideal para consumir con una rodaja de limón en el cuello de la botella.',
        image: 'corona_extra.jpg'
    },
    {
        id: 'P-004',
        name: 'Aguardiente Antioqueño (Sin Azúcar)',
        category: 'Aguardiente',
        price: 45000,
        quantity: 4, // Stock < 5 para disparar alerta
        description: 'Aguardiente tradicional colombiano, seco, con sabor a anís natural y elaborado con alcoholes de la más alta calidad.',
        image: 'aguardiente antioqueno.jpg'
    },
    {
        id: 'P-005',
        name: 'Ron Flor de Caña 12 Años',
        category: 'Ron',
        price: 110000,
        quantity: 3, // Stock < 5 para disparar alerta
        description: 'Ron premium nicaragüense añejado a los pies de un volcán activo, con notas de miel, nueces tostadas y coco.',
        image: 'flor de cana.jpg'
    },
    {
        id: 'P-006',
        name: 'Absolut Vodka Blue',
        category: 'Vodka',
        price: 75000,
        quantity: 12,
        description: 'Vodka sueco destilado infinitas veces para lograr una pureza extrema, conservando un sabor con toques de trigo y frutos secos.',
        image: 'absolute vodka blue.jpg'
    },
    {
        id: '007',
        name: 'Wiskey Jameson',
        category: 'Whisky',
        price: 95000,
        quantity: 20,
        description: 'Whisky irlandés triple destilado, suave y con notas de vainilla, miel y un toque de roble.',
        image: 'whisky_bottle.png'
    }
];

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initDatabase();
    
    // Sincronizaciones iniciales
    syncAllViews();

    // Evento para cerrar modales al hacer clic fuera del contenido
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
});

function initDatabase() {
    if (!localStorage.getItem(DB_PRODUCTS_KEY)) {
        localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    } else {
        // Migración: si las imágenes del localStorage siguen usando 'default_beer' o 'default_bottle',
        // actualizarlas a las imágenes reales y corregir precios erróneos si los hay.
        const current = JSON.parse(localStorage.getItem(DB_PRODUCTS_KEY));
        let changed = false;
        current.forEach(p => {
            if (p.id === 'P-003' && p.image === 'default_beer') {
                p.image = 'corona_extra.jpg';
                changed = true;
            }
            if (p.id === 'P-004' && (p.image === 'default_bottle' || p.price === 4)) {
                p.image = 'aguardiente antioqueno.jpg';
                p.price = 45000;
                changed = true;
            }
            if (p.id === 'P-005' && p.image === 'default_bottle') {
                p.image = 'flor de cana.jpg';
                changed = true;
            }
            if (p.id === 'P-006' && p.image === 'default_bottle') {
                p.image = 'absolute vodka blue.jpg';
                changed = true;
            }
            if (p.id === '007' && p.image === 'default_bottle') {
                p.image = 'whisky_bottle.png';
                changed = true;
            }
        });
        // Asegurar que el producto '007' exista en la base actual (si se creó la base vieja antes de esta adición)
        if (!current.some(prod => prod.id === '007')) {
            current.push({
                id: '007',
                name: 'Wiskey Jameson',
                category: 'Whisky',
                price: 95000,
                quantity: 20,
                description: 'Whisky irlandés triple destilado, suave y con notas de vainilla, miel y un toque de roble.',
                image: 'whisky_bottle.png'
            });
            changed = true;
        }
        if (changed) {
            localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(current));
        }
    }
}

// Obtener datos
function getProducts() {
    return JSON.parse(localStorage.getItem(DB_PRODUCTS_KEY)) || [];
}

// Guardar y disparar re-render
function saveProducts(products) {
    localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(products));
    syncAllViews();
}

// Sincronizar todas las vistas
function syncAllViews() {
    updateCategoryBadges();
    filterCatalog();
    updateAdminStats();
    renderInventoryTable();
    renderInspector();
    updateRoleBadge();
}

// --- IMÁGENES VECTORIALES SVG Y DE CATÁLOGO ---
function getProductImageMarkup(imageName, category) {
    if (imageName && (imageName.endsWith('.png') || imageName.endsWith('.jpg') || imageName.endsWith('.jpeg'))) {
        return `<img src="${imageName}" alt="${category}">`;
    }

    let gradientStart = '#D4AF37';
    let gradientEnd = '#855E0E';

    if (category === 'Cerveza') {
        gradientStart = '#f1c40f';
        gradientEnd = '#d35400';
    } else if (category === 'Ron') {
        gradientStart = '#a0522d';
        gradientEnd = '#5c2c16';
    } else if (category === 'Vodka') {
        gradientStart = '#e0f7fa';
        gradientEnd = '#4dd0e1';
    } else if (category === 'Tequila') {
        gradientStart = '#00e676';
        gradientEnd = '#00a152';
    } else if (category === 'Aguardiente') {
        gradientStart = '#eceff1';
        gradientEnd = '#b0bec5';
    }

    if (imageName === 'default_beer') {
        return `
        <div class="fallback-bottle">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="beerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${gradientStart}" />
                        <stop offset="100%" stop-color="${gradientEnd}" />
                    </linearGradient>
                </defs>
                <path d="M35,30 L65,30 L65,85 A5,5 0 0,1 60,90 L40,90 A5,5 0 0,1 35,85 Z" fill="url(#beerGrad)" />
                <path d="M42,30 L42,15 L58,15 L58,30" fill="url(#beerGrad)" />
                <rect x="40" y="10" width="20" height="5" fill="#f39c12" rx="2" />
                <rect x="40" y="45" width="20" height="25" fill="#ffffff" opacity="0.15" rx="2" />
                <circle cx="45" cy="50" r="3" fill="#ffffff" opacity="0.4" />
                <circle cx="55" cy="62" r="2.5" fill="#ffffff" opacity="0.4" />
            </svg>
        </div>`;
    }

    return `
    <div class="fallback-bottle">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bottleGrad-${category}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${gradientStart}" />
                    <stop offset="100%" stop-color="${gradientEnd}" />
                </linearGradient>
            </defs>
            <path d="M40,35 L60,35 L65,45 L65,85 A5,5 0 0,1 60,90 L40,90 A5,5 0 0,1 35,85 L35,45 Z" fill="url(#bottleGrad-${category})" />
            <path d="M46,35 L46,12 L54,12 L54,35" fill="url(#bottleGrad-${category})" />
            <rect x="45" y="8" width="10" height="4" fill="#d4af37" rx="1" />
            <rect x="39" y="52" width="22" height="18" fill="#ffffff" opacity="0.2" rx="2" />
            <line x1="43" y1="61" x2="57" y2="61" stroke="#ffffff" stroke-width="1.5" opacity="0.5" />
        </svg>
    </div>`;
}

// --- CONTROL DE PESTAÑAS (NAVEGACIÓN) ---
let currentTab = 'catalog';

function switchTab(tabId) {
    if (tabId === 'inspector' && !isAdminLoggedIn) {
        tabId = 'catalog';
    }
    currentTab = tabId;

    // Alternar botones activos de la barra de navegación
    document.querySelectorAll('.navbar .nav-item').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`tab-btn-${tabId}`);
    if (btn) btn.classList.add('active');

    // Alternar paneles de contenido
    document.querySelectorAll('.app-container .tab-content').forEach(tab => tab.classList.remove('active'));
    const tab = document.getElementById(`tab-${tabId}`);
    if (tab) tab.classList.add('active');

    updateRoleBadge();
}

// Actualizar indicador de Rol del Header
let isAdminLoggedIn = false;

function updateRoleBadge() {
    const badge = document.getElementById('role-badge');
    const text = document.getElementById('role-text');
    const inspectorBtn = document.getElementById('tab-btn-inspector');
    
    if (isAdminLoggedIn) {
        badge.className = 'nav-role-badge admin-active';
        text.textContent = 'Rol: Administrador';
        if (inspectorBtn) inspectorBtn.style.display = 'flex';
    } else {
        badge.className = 'nav-role-badge';
        text.textContent = 'Rol: Cliente';
        if (inspectorBtn) inspectorBtn.style.display = 'none';
    }
}

// --- VISTA CLIENTE: LÓGICA DE CATÁLOGO ---
let catalogActiveCategory = 'All';

function updateCategoryBadges() {
    const products = getProducts();
    
    // Contar productos por categoría
    const counts = {
        All: products.length,
        Whisky: products.filter(p => p.category === 'Whisky').length,
        Ron: products.filter(p => p.category === 'Ron').length,
        Vodka: products.filter(p => p.category === 'Vodka').length,
        Tequila: products.filter(p => p.category === 'Tequila').length,
        Cerveza: products.filter(p => p.category === 'Cerveza').length,
        Aguardiente: products.filter(p => p.category === 'Aguardiente').length
    };

    // Actualizar badges
    for (const key in counts) {
        const badgeEl = document.getElementById(`badge-${key.toLowerCase()}`);
        if (badgeEl) {
            badgeEl.textContent = counts[key];
        }
    }
}

function filterCatalogByCategory(category, element) {
    catalogActiveCategory = category;

    // Cambiar clase activa en menú lateral
    document.querySelectorAll('#catalog-category-menu .sidebar-menu-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    // Cambiar título de cabecera de catálogo
    const titles = {
        All: 'Todos los Licores',
        Whisky: 'Whiskies Selectos',
        Ron: 'Rones Añejos',
        Vodka: 'Vodkas Premium',
        Tequila: 'Tequilas Artesanales',
        Cerveza: 'Cervezas Refrescantes',
        Aguardiente: 'Aguardientes y Anisados'
    };
    document.getElementById('catalog-category-title').textContent = titles[category] || category;

    filterCatalog();
}

function filterCatalog() {
    const searchQuery = document.getElementById('catalog-search').value.toLowerCase().trim();
    const productsGrid = document.getElementById('catalog-products-grid');
    const products = getProducts();
    
    productsGrid.innerHTML = '';
    
    const filtered = products.filter(p => {
        const matchesCategory = (catalogActiveCategory === 'All' || p.category === catalogActiveCategory);
        const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 60px 20px; font-size: 0.95rem;">
                <i class="fa-solid fa-wine-glass-empty" style="font-size: 3rem; margin-bottom: 15px; display: block; color: var(--border-color);"></i>
                No se encontraron licores que coincidan con la búsqueda
            </div>
        `;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => showProductDetailModal(p.id);

        let stockText = 'Disponible';
        let stockClass = 'available-stock';

        if (p.quantity === 0) {
            stockText = 'Agotado';
            stockClass = 'no-stock';
        }

        const priceFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.price);

        card.innerHTML = `
            <div class="product-card-img-container">
                ${getProductImageMarkup(p.image, p.category)}
            </div>
            <div class="product-card-body">
                <span class="product-card-category">${p.category}</span>
                <h4 class="product-card-name">${p.name}</h4>
                <div class="product-card-footer">
                    <div>
                        <span class="product-card-price" style="display: block;">${priceFormatted}</span>
                        <span class="product-card-stock ${stockClass}">${stockText}</span>
                    </div>
                    <button class="btn btn-primary btn-sm" style="padding: 6px 10px; border-radius: 8px; width: auto; min-width: 36px;" onclick="event.stopPropagation(); buyProduct('${p.id}', 1)" ${p.quantity === 0 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// --- CONTROL DE MODALES (APERTURA Y CIERRE) ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Delay mínimo para trigger de transición opacity
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Esperar transición antes de ocultar
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// Mostrar Detalle de Producto en Modal
function showProductDetailModal(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('detail-modal-img').innerHTML = getProductImageMarkup(product.image, product.category);
    document.getElementById('detail-modal-category').textContent = product.category;
    document.getElementById('detail-modal-name').textContent = product.name;
    
    const priceFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.price);
    document.getElementById('detail-modal-price').textContent = `${priceFormatted} COP`;
    document.getElementById('detail-modal-description').textContent = product.description;

    const stockEl = document.getElementById('detail-modal-stock');
    const statusEl = document.getElementById('detail-modal-status');
    
    if (product.quantity === 0) {
        statusEl.textContent = 'Agotado';
        statusEl.className = 'val low';
        stockEl.textContent = 'Agotado';
        stockEl.className = 'val low';
    } else {
        statusEl.textContent = 'Disponible';
        statusEl.className = 'val ok';
        stockEl.textContent = 'En Existencia';
        stockEl.className = 'val ok';
    }

    // Inyectar botón de compra dinámico
    const buyContainer = document.getElementById('detail-modal-buy-container');
    if (buyContainer) {
        if (product.quantity === 0) {
            buyContainer.innerHTML = `
                <button class="btn btn-secondary" style="width: 100%; cursor: not-allowed; opacity: 0.5;" disabled>
                    <i class="fa-solid fa-ban"></i> Agotado Temporalmente
                </button>
            `;
        } else {
            buyContainer.innerHTML = `
                <button class="btn btn-primary" style="width: 100%;" onclick="buyProductFromModal('${product.id}')">
                    <i class="fa-solid fa-cart-shopping"></i> Comprar Ahora
                </button>
            `;
        }
    }

    openModal('product-detail-modal');
}

// --- VISTA ADMINISTRADOR: INGRESO Y DASHBOARD ---

// Login
function handleAdminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('admin-username').value.trim();
    const pass = document.getElementById('admin-password').value.trim();
    const errorMsg = document.getElementById('login-error-msg');

    if (user === 'admin' && pass === 'admin123') {
        isAdminLoggedIn = true;
        errorMsg.style.display = 'none';
        
        // Limpiar formulario de login
        document.getElementById('admin-username').value = '';
        document.getElementById('admin-password').value = '';
        
        // Cambiar sub-vistas del Admin
        document.getElementById('admin-login-view').style.display = 'none';
        document.getElementById('admin-dashboard-view').style.display = 'flex';
        
        syncAllViews();
    } else {
        errorMsg.style.display = 'block';
    }
}

// Logout
function handleAdminLogout() {
    isAdminLoggedIn = false;
    document.getElementById('admin-login-view').style.display = 'flex';
    document.getElementById('admin-dashboard-view').style.display = 'none';
    
    if (currentTab === 'inspector') {
        switchTab('catalog');
    } else {
        syncAllViews();
    }
}

// Recalcular estadísticas del Dashboard Admin
function updateAdminStats() {
    const products = getProducts();
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, curr) => acc + curr.quantity, 0);
    const lowStockAlerts = products.filter(p => p.quantity < 5).length;

    // Escribir stats en HTML
    document.getElementById('stat-products-count').textContent = totalProducts;
    document.getElementById('stat-bottles-count').textContent = totalStock;
    document.getElementById('stat-alerts-count').textContent = lowStockAlerts;

    // Renderizar panel de alertas críticas si hay al menos una
    const alertPanel = document.getElementById('admin-stock-alerts-panel');
    const alertContainer = document.getElementById('admin-stock-alerts-container');
    alertContainer.innerHTML = '';

    if (lowStockAlerts > 0) {
        alertPanel.style.display = 'block';
        
        products.filter(p => p.quantity < 5).forEach(p => {
            const alertBox = document.createElement('div');
            alertBox.className = 'alert-item-box';
            
            let stockLabel = p.quantity === 0 ? 'AGOTADO' : `${p.quantity} uds`;
            
            alertBox.innerHTML = `
                <span>${p.name} (${p.category})</span>
                <strong>${stockLabel}</strong>
            `;
            alertContainer.appendChild(alertBox);
        });
    } else {
        alertPanel.style.display = 'none';
    }
}

// Renderizar tabla de inventario del administrador
function renderInventoryTable() {
    const tbody = document.getElementById('admin-inventory-table-body');
    const products = getProducts();

    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">
                    No hay licores en el inventario actual.
                </td>
            </tr>
        `;
        return;
    }

    products.forEach(p => {
        const tr = document.createElement('tr');
        
        const isLow = p.quantity < 5;
        const statusClass = isLow ? 'alert' : 'ok';
        const statusText = isLow ? 'Reordenar' : 'Estable';
        const statusIcon = isLow ? 'fa-triangle-exclamation' : 'fa-circle-check';

        const priceFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.price);

        tr.innerHTML = `
            <td>
                <div class="product-cell">
                    <div class="product-cell-img">
                        ${getProductImageMarkup(p.image, p.category)}
                    </div>
                    <div>
                        <span class="product-cell-name">${p.name}</span>
                        <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-top: 2px;">
                            ${p.category}
                        </div>
                    </div>
                </div>
            </td>
            <td style="font-family: monospace; font-weight: 500;">
                ${priceFormatted}
            </td>
            <td>
                <!-- Control de Cantidad Rápida -->
                <div class="stock-control-group">
                    <button class="stock-control-btn" onclick="modifyStock('${p.id}', -1)">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="stock-control-val">${p.quantity}</span>
                    <button class="stock-control-btn" onclick="modifyStock('${p.id}', 1)">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </td>
            <td>
                <span class="status-badge ${statusClass}">
                    <i class="fa-solid ${statusIcon}"></i> ${statusText}
                </span>
            </td>
            <td>
                <div class="actions-row">
                    <button class="btn btn-sm btn-secondary" onclick="openProductFormModal('edit', '${p.id}')">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Operación rápida de re-existencias (+1 / -1)
function modifyStock(productId, delta) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    product.quantity = Math.max(0, product.quantity + delta);
    saveProducts(products);
}

// Control del Formulario modal de productos
let currentSelectedFormImage = 'whisky_bottle.png';

function selectPresetImage(element) {
    document.querySelectorAll('#product-form-modal .preset-img-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    currentSelectedFormImage = element.getAttribute('data-img-name');
}

// Abrir Formulario en modo Add o Edit
function openProductFormModal(mode, productId = null) {
    const form = document.getElementById('product-form');
    form.reset();

    // Default Image Selection
    currentSelectedFormImage = 'whisky_bottle.png';
    document.querySelectorAll('#product-form-modal .preset-img-option').forEach(el => {
        el.classList.remove('active');
        if (el.getAttribute('data-img-name') === 'whisky_bottle.png') {
            el.classList.add('active');
        }
    });

    if (mode === 'add') {
        document.getElementById('form-modal-title').textContent = 'Agregar Licor Nuevo';
        document.getElementById('form-product-id').value = '';
    } else if (mode === 'edit' && productId) {
        document.getElementById('form-modal-title').textContent = 'Modificar Licor';
        
        const products = getProducts();
        const p = products.find(prod => prod.id === productId);
        if (p) {
            document.getElementById('form-product-id').value = p.id;
            document.getElementById('form-name').value = p.name;
            document.getElementById('form-category').value = p.category;
            document.getElementById('form-price').value = p.price;
            document.getElementById('form-quantity').value = p.quantity;
            document.getElementById('form-description').value = p.description;
            
            // Cargar imagen correspondiente
            currentSelectedFormImage = p.image;
            document.querySelectorAll('#product-form-modal .preset-img-option').forEach(el => {
                el.classList.remove('active');
                if (el.getAttribute('data-img-name') === p.image) {
                    el.classList.add('active');
                }
            });
        }
    }

    openModal('product-form-modal');
}

// Submit del Formulario
function handleProductSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('form-product-id').value;
    const name = document.getElementById('form-name').value.trim();
    const category = document.getElementById('form-category').value;
    const price = parseInt(document.getElementById('form-price').value);
    const quantity = parseInt(document.getElementById('form-quantity').value);
    const description = document.getElementById('form-description').value.trim();

    const products = getProducts();

    if (id) {
        // Editar existente
        const idx = products.findIndex(p => p.id === id);
        if (idx !== -1) {
            products[idx] = {
                id,
                name,
                category,
                price,
                quantity,
                description,
                image: currentSelectedFormImage
            };
        }
    } else {
        // Agregar nuevo
        const newId = 'P-' + Math.floor(1000 + Math.random() * 9000);
        const newProduct = {
            id: newId,
            name,
            category,
            price,
            quantity,
            description,
            image: currentSelectedFormImage
        };
        products.push(newProduct);
    }

    saveProducts(products);
    closeModal('product-form-modal');
}

// Eliminar producto
function deleteProduct(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente "${product.name}" del catálogo?`)) {
        const filtered = products.filter(p => p.id !== productId);
        saveProducts(filtered);
    }
}

// --- INSPECTOR DE BASE DE DATOS LOCALSTORAGE ---
let activeInspectorTab = 'products';

function switchInspectorTab(tabId) {
    activeInspectorTab = tabId;

    document.querySelectorAll('.inspector-tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tabId === 'products') {
        document.getElementById('tab-inspect-products').classList.add('active');
        document.getElementById('inspector-table-products').style.display = 'table';
        document.getElementById('inspector-table-users').style.display = 'none';
        renderInspector();
    } else {
        document.getElementById('tab-inspect-users').classList.add('active');
        document.getElementById('inspector-table-products').style.display = 'none';
        document.getElementById('inspector-table-users').style.display = 'table';
    }
}

function renderInspector() {
    const tbody = document.getElementById('inspector-products-body');
    const products = getProducts();

    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="code-badge">${p.id}</td>
            <td style="font-weight: 500; color: var(--text-primary);">${p.name}</td>
            <td><span class="code-badge" style="color: var(--accent-color);">${p.category}</span></td>
            <td style="font-family: monospace;">$${p.price.toLocaleString('es-CO')}</td>
            <td style="font-weight: 600; text-align: center; color: ${p.quantity < 5 ? 'var(--color-alert)' : 'var(--text-secondary)'}">${p.quantity}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.description}</td>
            <td><span style="font-size:0.75rem; color: var(--text-muted); font-family: monospace;">"${p.image}"</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// --- LOGICA DE COMPRA ---
function buyProduct(productId, quantity = 1) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.quantity < quantity) {
        alert(`Lo sentimos, solo quedan ${product.quantity} unidades de ${product.name} en existencia.`);
        return;
    }

    product.quantity -= quantity;
    saveProducts(products);

    alert(`¡Compra exitosa! Has adquirido ${quantity} botella(s) de ${product.name}. El inventario se ha actualizado en tiempo real.`);

    // Si el modal de detalles está abierto, actualizarlo
    const detailModal = document.getElementById('product-detail-modal');
    if (detailModal && detailModal.classList.contains('active')) {
        showProductDetailModal(productId);
    }
}

function buyProductFromModal(productId) {
    buyProduct(productId, 1);
}
