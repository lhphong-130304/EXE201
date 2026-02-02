document.addEventListener('DOMContentLoaded', async function () {
    const pageSize = 6;
    let currentPage = 1;
    let allProducts = [];
    let filteredProducts = [];
    //category,badge
    let selectedCategoryId = null;
    let selectedBadge = null;
    let selectedSort = '';
    let minPrice = 0;
    let maxPrice = Infinity;



    let categoriesData = [];
    let badgesData = [];

    /* ================= BADGE ================= */
    const badgeContainer = document.getElementById('badge-list');
    const BADGE_API = 'http://localhost:5037/api/badge';

    async function loadBadges() {
        if (!badgeContainer) return;
        try {
            const res = await fetch(BADGE_API);
            if (!res.ok) throw new Error('Failed to fetch badges');
            badgesData = await res.json();
            renderBadges(badgesData);
        } catch (err) {
            console.error('Error loading badges:', err);
            badgeContainer.innerHTML = `<span class="text-sm text-red-500">Không thể tải badge</span>`;
        }
    }

    /* ================= CATEGORY ================= */
    const categoryList = document.getElementById('category-list');
    const CATEGORY_API = 'http://localhost:5037/api/category';

    async function loadCategories() {
        if (!categoryList) return;
        try {
            const res = await fetch(CATEGORY_API);
            if (!res.ok) throw new Error('Failed to fetch categories');
            categoriesData = await res.json();
            renderCategories(categoriesData);
        } catch (err) {
            console.error('Error loading categories:', err);
            categoryList.innerHTML = `<li class="py-8 text-sm text-red-500">Không thể tải danh mục</li>`;
        }
    }

    function getCountForCategory(catId) {
        if (catId === null) return allProducts.length;
        return allProducts.filter(p => p.categoryId === catId).length;
    }

    function renderCategories(categories) {
        if (!categoryList) return;
        let html = '';

        // Tất cả
        html += `
            <li class="py-10 text-sm">
                <a href="javascript:void(0)"
                   onclick="filterByCategory(null)"
                   class="flex justify-between items-center group ${selectedCategoryId === null ? 'text-primary font-bold' : 'dark:text-white text-dark'}">
                    <span class="link-hover after:!bg-primary">Tất cả sản phẩm</span>
                    <span class="opacity-50">(${allProducts.length})</span>
                </a>
            </li>
        `;

        categories.forEach(cat => {
            const count = getCountForCategory(cat.id);
            html += `
                <li class="py-10 text-sm">
                    <a href="javascript:void(0)"
                       onclick="filterByCategory(${cat.id})"
                       class="flex justify-between items-center group ${selectedCategoryId === cat.id ? 'text-primary font-bold' : 'dark:text-white text-dark'}">
                        <span class="link-hover after:!bg-primary">${cat.name}</span>
                        <span class="opacity-50">(${count})</span>
                    </a>
                </li>
            `;
        });

        categoryList.innerHTML = html;
    }

    function renderBadges(badges) {
        if (!badgeContainer) return;
        let html = '';

        html += `
            <a href="javascript:void(0)"
               onclick="filterByBadge(null)"
               class="inline-block mr-10 mb-10 px-15 py-8 text-sm duration-300 ${selectedBadge === null ? 'bg-primary text-dark font-bold' : 'bg-light hover:bg-secondary hover:text-white text-dark'}">
                Tất cả
            </a>
        `;

        badges.forEach(badge => {
            const isActive = selectedBadge === badge.name;
            html += `
                <a href="javascript:void(0)"
                   onclick="filterByBadge('${badge.name}')"
                   class="relative py-8 px-15 inline-block mr-10 mb-10 text-sm duration-300
                          ${isActive ? 'bg-primary text-dark font-bold' : 'bg-light hover:bg-secondary hover:text-white text-dark'}"
                >
                    ${badge.name}
                </a>
            `;
        });

        badgeContainer.innerHTML = html;
    }

    // Load initial data
    await Promise.all([loadCategories(), loadBadges()]);

    /* ================= PRODUCT ================= */
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    const API_URL = 'http://localhost:5037/api/products';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch products');

        const products = await response.json();
        allProducts = products;
        filteredProducts = products;

        // Render initial filters
        if (categoriesData) renderCategories(categoriesData);
        if (badgesData) renderBadges(badgesData);

        initPriceSlider();
        renderWithPagination();

    } catch (error) {
        console.error('Error loading products from API:', error);
        productGrid.innerHTML = `
            <div class="col-span-12 text-center py-50">
                <p class="text-red-500">
                    Không thể tải dữ liệu sản phẩm từ Backend. Vui lòng kiểm tra server .NET.
                </p>
            </div>`;
    }

    function renderProducts(productsList) {
        let productsHTML = '';

        productsList.forEach(product => {

            // Stars
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                starsHTML += `
                <li class="inline-block text-sm leading-none">
                    <i class="las la-star ${i <= product.rating ? 'text-yellow' : 'text-grey'}"></i>
                </li>`;
            }

            // Badges
            let badgesHTML = '';
            product.badges?.forEach((badge, index) => {
                let position = index === 1 ? 'right-0' : 'left-0';
                let cls = ['hot', 'new', 'featured'].includes(badge.toLowerCase())
                    ? 'bg-primary text-dark'
                    : 'bg-secondary text-white';

                badgesHTML += `
                <span class="absolute top-0 ${position} px-10 py-3 text-xs font-semibold uppercase ${cls}">
                    ${badge}
                </span>`;
            });

            // Price
            let priceHTML = product.originalPrice
                ? `
                <del class="text-base font-medium text-bodytext">${formatPriceVN(product.originalPrice)}</del>
                <span class="text-base font-medium text-white">${formatPriceVN(product.price)}</span>
              `
                : `<span class="text-base font-medium text-white">${formatPriceVN(product.price)}</span>`;

            // Image
            let imageHTML = product.hoverImage
                ? `
                <img src="${product.image}" class="absolute top-0 left-0 size-full object-cover">
                <img src="${product.hoverImage}" class="opacity-0 size-full relative object-cover duration-500 group-hover:opacity-100 group-hover:scale-110">
              `
                : `
                <img src="${product.image}" class="size-full object-cover duration-500 group-hover:scale-110">
              `;

            productsHTML += `
            <div class="2xl:col-span-4 xl:col-span-4 lg:col-span-4 md:col-span-6 sm:col-span-6 col-span-12">
                <div class="group relative">
                    <div class="overflow-hidden relative">
                        <a href="product-details.html?id=${product.id}">
                            ${imageHTML}
                        </a>

                        <!-- Hover actions -->
                        <div class="flex items-center gap-13 absolute -bottom-100 left-1/2 -translate-x-1/2 duration-500 group-hover:bottom-23">
                            <a href="product-details.html?id=${product.id}" class="btn btn-sm btn-black rounded-[2px]">Xem nhanh</a>

                            <a href="javascript:void(0)" data-id="${product.id}" class="btn btn-icon btn-black rounded-[2px] add-to-cart-btn">
                                <i class="fa-solid fa-cart-shopping"></i>
                            </a>
                        </div>
                        ${badgesHTML}
                    </div>

                    <div class="p-20 text-center">
                        <h5 class="text-lg">
                            <a href="product-details.html?id=${product.id}" class="link-hover after:!bg-dark">
                                ${product.name}
                            </a>
                        </h5>
                        <ul>${starsHTML}</ul>
                        <div class="flex justify-center gap-14">
                            ${priceHTML}
                        </div>
                    </div>
                </div>
            </div>`;
        });

        productGrid.innerHTML = productsHTML;
    }

    //format tien
    function formatPriceVN(value) {
        if (value === null || value === undefined) return '';

        // Nếu backend trả number
        if (typeof value === 'number') {
            return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
        }

        // Nếu backend trả string → bóc số ra rồi format lại
        const number = Number(value.replace(/[^\d]/g, ''));
        return new Intl.NumberFormat('vi-VN').format(number) + 'đ';
    }

    // ===== ADD TO CART (SHOP PAGE) =====
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;

        e.preventDefault();

        const productId = parseInt(btn.dataset.id);
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        const user = Auth.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const qty = 1;
        if (qty > 0 && typeof Cart !== 'undefined') {
            Cart.add(product, qty);
        }
    });

    /* ================= PAGINATION ================= */
    function renderWithPagination() {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        renderProducts(filteredProducts.slice(start, end));
        renderPagination();
    }

    function renderPagination() {
        const pagination = document.getElementById('pagination');
        const info = document.getElementById('paging-info');

        const totalItems = filteredProducts.length;
        const totalPages = Math.ceil(totalItems / pageSize);

        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
        const endItem = Math.min(currentPage * pageSize, totalItems);

        /* ====== TEXT "SHOWING X–Y OF Z" ====== */
        info.textContent = `Hiển thị ${startItem}–${endItem} trong tổng số ${totalItems} sản phẩm`;

        let html = '';

        /* ====== PREV ====== */
        if (currentPage > 1) {
            html += `
            <li>
                <a href="javascript:void(0)"
                   onclick="goToPage(${currentPage - 1})"
                   class="py-10 px-15 flex items-center justify-center rounded-full
                          dark:text-white text-dark hover:bg-primary hover:text-dark uppercase">
                    Prev
                </a>
            </li>
        `;
        }

        /* ====== PAGE NUMBERS ====== */
        for (let i = 1; i <= totalPages; i++) {
            html += `
            <li>
                <a href="javascript:void(0)"
                   onclick="goToPage(${i})"
                   class="size-38 flex items-center justify-center rounded-full
                          ${i === currentPage
                    ? 'bg-primary text-dark'
                    : 'dark:text-white text-dark hover:bg-primary hover:text-dark'}">
                    ${i}
                </a>
            </li>
        `;
        }

        /* ====== NEXT ====== */
        if (currentPage < totalPages) {
            html += `
            <li>
                <a href="javascript:void(0)"
                   onclick="goToPage(${currentPage + 1})"
                   class="py-10 px-15 flex items-center justify-center rounded-full
                          dark:text-white text-dark hover:bg-primary hover:text-dark uppercase">
                    Next
                </a>
            </li>
        `;
        }

        pagination.innerHTML = html;
    }


    window.goToPage = function (page) {
        currentPage = page;
        renderWithPagination();
    };

    /* ================= PRICE SLIDER ================= */
    function initPriceSlider() {
        const slider = document.getElementById('slider-tooltips');
        if (!slider) return;

        // Get min/max prices from allProducts
        const prices = allProducts.map(p => Number(p.price.replace(/[^\d]/g, '')));
        const absMin = Math.min(...prices, 0);
        const absMax = Math.max(...prices, 2000000);

        if (slider.noUiSlider) {
            slider.noUiSlider.destroy();
        }

        noUiSlider.create(slider, {
            start: [absMin, absMax],
            connect: true,
            range: {
                'min': absMin,
                'max': absMax
            },
            format: wNumb({
                decimals: 0,
                thousand: '.',
                suffix: 'đ'
            })
        });

        const minLabel = document.getElementById('slider-margin-value-min');
        const maxLabel = document.getElementById('slider-margin-value-max');

        slider.noUiSlider.on('update', function (values, handle) {
            const val = values[handle];
            if (handle) {
                maxLabel.innerHTML = val;
                maxPrice = Number(val.replace(/[^\d]/g, ''));
            } else {
                minLabel.innerHTML = val;
                minPrice = Number(val.replace(/[^\d]/g, ''));
            }
            applyFilters();
        });
    }

    /* ================= FILTER BY CATEGORY AND BADGE ================= */
    // (Removed original renderCategories and renderBadges duplicates)

    document.getElementById('sortingSelect')?.addEventListener('change', function () {
        selectedSort = this.value;
        applyFilters();
    });

    function applyFilters() {
        filteredProducts = allProducts.filter(p => {
            const pPriceNum = Number(p.price.replace(/[^\d]/g, ''));

            const matchCategory =
                selectedCategoryId === null ||
                p.categoryId === selectedCategoryId;

            const matchBadge =
                selectedBadge === null ||
                p.badges?.some(b => b.toLowerCase() === selectedBadge.toLowerCase());

            const matchPrice = pPriceNum >= minPrice && pPriceNum <= maxPrice;

            return matchCategory && matchBadge && matchPrice;
        });

        // Update category counts UI to reflect currently selected filters? 
        // User asked for counts of products belongs to category. Usually this means total counts.
        // We'll keep total counts in renderCategories.
        renderCategories(categoriesData);
        renderBadges(badgesData);

        // ===== SORTING =====
        switch (selectedSort) {
            case 'high':
                filteredProducts.sort((a, b) =>
                    Number(a.price.replace(/[^\d]/g, '')) -
                    Number(b.price.replace(/[^\d]/g, ''))
                );
                break;

            case 'low': // price high → low
                filteredProducts.sort((a, b) =>
                    Number(b.price.replace(/[^\d]/g, '')) -
                    Number(a.price.replace(/[^\d]/g, ''))
                );
                break;

            case 'latest':
                filteredProducts.sort((a, b) => b.id - a.id);
                break;

            case 'rating':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;

            case 'sorting':
            default:
                break;
        }

        currentPage = 1;
        renderWithPagination();
    }

    window.filterByCategory = function (categoryId) {
        selectedCategoryId = categoryId;
        applyFilters();
    };

    window.filterByBadge = function (badgeName) {
        selectedBadge = badgeName;
        applyFilters();
    };

    window.sortBy = function (value) {
        selectedSort = value;
        applyFilters();
    };

    // Reset button
    const resetBtn = document.querySelector('.shop-filter .btn-primary');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            selectedCategoryId = null;
            selectedBadge = null;
            selectedSort = 'sorting';
            const slider = document.getElementById('slider-tooltips');
            if (slider && slider.noUiSlider) {
                const prices = allProducts.map(p => Number(p.price.replace(/[^\d]/g, '')));
                const absMin = Math.min(...prices, 0);
                const absMax = Math.max(...prices, 2000000);
                slider.noUiSlider.set([absMin, absMax]);
            }
            if (document.getElementById('sortingSelect')) {
                document.getElementById('sortingSelect').value = 'sorting';
            }
            applyFilters();
        });
    }


});

