const plexifyCarousel = function(){
  
  const handleBrandSwiper = () => {
    new Swiper(".brand-swiper", {
      speed: 1500,
      parallax: true,
      slidesPerView: 4,
      spaceBetween: 30,
      loop: true,
      centeredSlides: true,
      autoplay: {
        delay: 3000,
      },
      breakpoints: {
        300: {
          slidesPerView: 1,
          spaceBetween: 30,
        },
        360: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        767: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        991: {
          slidesPerView: 3,
          spaceBetween: 50,
        },
      },
    });
  };

  const handleBrandSwiper2 = () => {
    new Swiper(".brand-swiper2", {
      speed: 1500,
      parallax: true,
      slidesPerView: 4,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 3000,
      },
      breakpoints: {
        300: {
          slidesPerView: 1,
        },
        360: {
          slidesPerView: 2,
        },
        767: {
          slidesPerView: 3,
        },
        991: {
          slidesPerView: 4,
        },
      },
    });
  };

  const handleBlogSwiper = () => {
    new Swiper(".blog-swiper", {
      speed: 1500,
      parallax: true,
      slidesPerView: 1,
      spaceBetween: 35,
      loop: true,
      autoplay: {
        delay: 3000,
      },
      breakpoints: {
        567: {
          slidesPerView: 1,
          spaceBetween: 15,
        },
        767: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1025: {
          slidesPerView: 3,
          spaceBetween: 35,
        },
      },
    });
  };

  function productGallerySwiper1() {
    const gallerySwiperEl = document.querySelector(".product-gallery-swiper");
    if (gallerySwiperEl) {
      const swiper = new Swiper(".product-gallery-swiper", {
        spaceBetween: 10,
        slidesPerView: 2,
        pagination: {
          el: ".swiper-pagination-trading",
        },
      });

      new Swiper(".product-gallery-swiper2", {
        spaceBetween: 0,
        updateOnWindowResize: true,
        navigation: {
          nextEl: ".gallery-button-next",
          prevEl: ".gallery-button-prev",
        },
        thumbs: {
          swiper: swiper,
        },
      });
    }
  }

  const productDetails = () => {
    const thumbsSwiper = new Swiper(".product-detail-thumbs", {
      spaceBetween: 0,
      slidesPerView: 1,
      freeMode: true,
      effect: "fade",
      loop: true,
      watchSlidesProgress: true,
    });

    new Swiper(".product-detail", {
      spaceBetween: 10,
      slidesPerView: 1,
      breakpoints: {
        567: {
          spaceBetween: 10,
          slidesPerView: 1,
        },
        767: {
          spaceBetween: 30,
          slidesPerView: 2,
        },
        1025: {
          spaceBetween: 54,
          slidesPerView: 3,
        },
      },
      loop: true,
      pagination: {
        el: ".swiper-pagination",
      },
      thumbs: {
        swiper: thumbsSwiper,
      },
    });
  };

  return {
    load() {
      handleBrandSwiper();
      handleBrandSwiper2();
      handleBlogSwiper();
      productGallerySwiper1();
      productDetails();
    },
  };
};

window.addEventListener("load", function () {
  plexifyCarousel().load();
});
