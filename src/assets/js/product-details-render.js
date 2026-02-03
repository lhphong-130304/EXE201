document.addEventListener('DOMContentLoaded', async function () {
    // 1. Lấy ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (!productId) {
        console.error('Product ID not found in URL');
        return;
    }

    // 2. Fetch dữ liệu từ API
    const API_URL = `https://gymfinder953.runasp.net/api/products/${productId}`;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch product');

        const product = await response.json();

        // 3. Render dữ liệu
        renderProductDetails(product);

        // 4. Render Reviews List nếu có
        renderReviewsList(product.reviews || []);

    } catch (error) {
        console.error('Error loading product details:', error);
        document.querySelector('.page-content').innerHTML = `
            <div class="container py-100 text-center">
                <h2 class="text-4xl mb-4 text-red-500">Lỗi tải dữ liệu</h2>
                <p class="mb-8">Không thể kết nối với máy chủ để lấy thông tin sản phẩm.</p>
                <a href="shop-standard.html" class="btn btn-primary">Quay lại cửa hàng</a>
            </div>
        `;
    }
});

function renderProductDetails(product) {
    // Tên sản phẩm
    const nameEl = document.getElementById('detail-product-name');
    if (nameEl) nameEl.textContent = product.name;

    // Giá hiện tại
    const priceEl = document.getElementById('detail-product-price');
    if (priceEl) priceEl.textContent = product.price;

    // Giá gốc
    const originalPriceContainer = document.getElementById('detail-product-original-price-container');
    if (originalPriceContainer) {
        if (product.originalPrice) {
            originalPriceContainer.textContent = product.originalPrice;
            originalPriceContainer.style.display = 'inline-block';
        } else {
            originalPriceContainer.style.display = 'none';
        }
    }

    // Tồn kho
    const stockEl = document.getElementById('detail-product-stock');
    if (stockEl) {
        if (product.unitsInStock > 0) {
            stockEl.innerHTML = `<span class="text-green-500 font-bold">Còn hàng (${product.unitsInStock})</span>`;
        } else {
            stockEl.innerHTML = `<span class="text-red-500 font-bold">Hết hàng</span>`;
        }
    }



    // Mô tả ngắn
    const descEl = document.getElementById('detail-product-description');
    if (descEl) {
        descEl.textContent = Array.isArray(product.description) ? product.description[0] : product.description;
    }

    // Mô tả dài (render mảng các dòng)
    const longDescEl = document.getElementById('detail-product-long-description');
    if (longDescEl) {
        if (Array.isArray(product.description)) {
            longDescEl.innerHTML = product.description.map(line => `<p class="dark:text-lightgrey text-bodytext mb-20">${line}</p>`).join('');
        } else {
            longDescEl.innerHTML = `<p class="dark:text-lightgrey text-bodytext mb-20">${product.description}</p>`;
        }
    }

    // Category
    const categoryEl = document.getElementById('detail-product-category');
    if (categoryEl) {
        categoryEl.innerHTML = `<a href="shop-standard.html">${product.category}</a>`;
    }

    // Ảnh Gallery & Thumbnails
    // Template hiện tại dùng 1 ảnh chính đơn giản với ID 'detail-product-image'
    const mainImageEl = document.getElementById('detail-product-image');
    if (mainImageEl) {
        mainImageEl.src = product.image;
        // Update href cho lightbox nếu cần
        const parentLink = mainImageEl.closest('a');
        if (parentLink) {
            parentLink.href = product.image;
            parentLink.setAttribute('data-src', product.image);
        }
        // Update Swiper gallery nếu có (fallback)
        const galleryWrapper = document.getElementById('detail-product-gallery');
        const thumbWrapper = document.getElementById('detail-product-thumbnails');

        if (galleryWrapper && thumbWrapper) {
            const images = [product.image, product.image, product.image];
            galleryWrapper.innerHTML = images.map(img => `
                <div class="swiper-slide">
                    <div class="relative overflow-hidden DZoomImage group">
                        <a class="mfp-link lg-item" href="${img}" data-src="${img}">
                            <i class="fa-solid fa-expand dz-maximize absolute top-20 right-20 size-40 text-2xl !flex items-center justify-center duration-500 opacity-0 group-hover:!opacity-100"></i>
                        </a>
                        <img src="${img}" alt="${product.name}" class="size-full">
                    </div>
                </div>
            `).join('');

            thumbWrapper.innerHTML = images.map(img => `
                <div class="swiper-slide !mb-15 lg:!w-79 !w-50">
                    <img src="${img}" alt="${product.name}" class="border-2 border-transparent duration-500">
                </div>
            `).join('');
        }
    }

    // Đánh giá (Rating) - Giả lập render sao dựa trên product.rating
    const ratingList = document.getElementById('detail-product-rating-stars');
    if (ratingList) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            const starClass = i <= product.rating ? 'las la-star text-yellow' : 'las la-star text-grey';
            starsHtml += `<li class="inline-block text-sm leading-none"><i class="${starClass}"></i></li>`;
        }
        ratingList.innerHTML = starsHtml;
    }

    const ratingTextEl = document.getElementById('detail-product-rating-text');
    if (ratingTextEl) {
        ratingTextEl.textContent = `${product.rating} (${product.reviewCount || 0} đánh giá)`;
    }

    // 3 ảnh ở phần chi tiết sản phẩm (dưới tab Description)
    const img1 = document.getElementById('detail-product-img-1');
    const img2 = document.getElementById('detail-product-img-2');
    const img3 = document.getElementById('detail-product-img-3');

    if (img1) img1.src = product.image;
    if (img2) img2.src = product.image;
    if (img3) img3.src = product.image;



    // --- CHỨC NĂNG THÊM VÀO GIỎ HÀNG ---
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const quantityInput = document.getElementById('detail-product-quantity');

    if (addToCartBtn && typeof Cart !== 'undefined') {
        // Xóa listener cũ nếu có (đề phòng render nhiều lần)
        const newBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);

        newBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // Check auth first
            const user = Auth.getUser();
            if (!user) {
                // Must Login
                window.location.href = 'login.html';
                return;
            }

            const qty = quantityInput ? parseInt(quantityInput.value) : 1;

            // Kiểm tra tồn kho trước khi thêm
            if (qty > product.unitsInStock) {
                alert(`Rất tiếc, chỉ còn ${product.unitsInStock} sản phẩm trong kho.`);
                return;
            }

            if (qty > 0) {
                Cart.add(product, qty);
            }
        });
    }

    // Update max quantity input
    if (quantityInput) {
        quantityInput.max = product.unitsInStock;
        quantityInput.min = product.unitsInStock > 0 ? 1 : 0;
        if (product.unitsInStock === 0) quantityInput.value = 0;
    }

}

function renderReviewsList(reviews) {
    const reviewsContainer = document.getElementById('detail-product-reviews-list');
    if (!reviewsContainer) return;

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="text-secondary italic">Chưa có đánh giá nào cho sản phẩm này.</p>';
        return;
    }

    reviewsContainer.innerHTML = reviews.map(rev => `
        <div class="mb-20 pb-20 border-b border-black/10 dark:border-white/10">
            <div class="flex items-center gap-10 mb-5">
                <ul class="flex">
                    ${Array.from({ length: 5 }, (_, i) => `
                        <li><i class="las la-star ${i < rev.rating ? 'text-yellow' : 'text-grey'}"></i></li>
                    `).join('')}
                </ul>
                <span class="text-xs text-secondary">${rev.date}</span>
            </div>
            <p class="text-sm dark:text-white text-dark mb-0">${rev.comment}</p>
        </div>
    `).join('');
}
