document.addEventListener("DOMContentLoaded", function () {
  plexifyCarouselAround();
  
  document.querySelectorAll(".pxl-theme-carousel").forEach(function (carousel) {
    pxlSwiperHandler(carousel);
  });

  const testimonialCarousel = document.querySelector(
    ".pxl-testimonial-carousel"
  );
  if (testimonialCarousel) pxlSwiperHandler(testimonialCarousel);

  document
    .querySelectorAll(".pxl-history-carousel")
    .forEach(function (carousel) {
      plexifyCarouselAround(carousel);
    });
});

function plexifyCarouselAround() {
  if (!document.querySelector(".pxl-history-carousel .item-slide")) {
    return;
  }
  gsap.registerPlugin(Draggable, InertiaPlugin);

  let items = gsap.utils.toArray(".pxl-history-carousel .item-slide");

  let carousel = buildCarousel(items, {
    radiusX: 1060,
    radiusY: 800,
    activeAngle: -90,
    draggable: true,

    onClick(element, self) {
      self.to(element, { duration: 3, ease: "linear" }, "short");
    },

    onActivate(element, self) {
      const slides = document.querySelectorAll(".pxl-history-carousel .item-slide");
      const thumbContainer = document.querySelector(".pxl-swiper-thumbs");
      const thumbWrapper = document.querySelector(".pxl-thumbs-wrapper");
      const thumbItems = document.querySelectorAll(".thumb-item");

      if (!slides.length || !thumbItems.length || !thumbWrapper || !thumbContainer) return;

      thumbItems.forEach((thumb) => thumb.classList.remove("active"));

      const activeIndex = Array.from(slides).indexOf(element);
      const thumbIndex = Math.floor(activeIndex / 2); 
      const totalThumbs = thumbItems.length;
      const centerIndex = Math.floor(totalThumbs / 2);

      let realActiveIndex = (centerIndex + (thumbIndex % (totalThumbs / 3)) - Math.floor(totalThumbs / 6)) % totalThumbs;
      if (realActiveIndex < 0) realActiveIndex += totalThumbs;

      const activeThumb = thumbItems[realActiveIndex];
      if (activeThumb) {
        activeThumb.classList.add("active");

        const offset = -(activeThumb.offsetLeft - thumbContainer.offsetWidth / 2 + activeThumb.offsetWidth / 2);

        gsap.to(thumbWrapper, {
          x: offset,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    },
  });

  carousel.render();

  function updateThumbWrapperPosition() {
    const thumbContainer = document.querySelector(".pxl-swiper-thumbs");
    const thumbWrapper = document.querySelector(".pxl-thumbs-wrapper");
    const activeItem = document.querySelector(".thumb-item.active") || document.querySelector(".thumb-item");

    if (!thumbContainer || !thumbWrapper || !activeItem) return;

    const offset = -(activeItem.offsetLeft - thumbContainer.offsetWidth / 2 + activeItem.offsetWidth / 2);

    gsap.to(thumbWrapper, {
      x: offset,
      duration: 0.8,
      ease: "power2.out",
    });
  }

  const thumbContainer = document.querySelector(".pxl-swiper-thumbs");
  if (thumbContainer) {
    const observer = new ResizeObserver(updateThumbWrapperPosition);
    observer.observe(thumbContainer);

    setTimeout(updateThumbWrapperPosition, 100);
  }


  function buildCarousel(
    targets,
    {
      radiusX = 200,
      radiusY = 200,
      activeAngle = -90,
      activeElement,
      onClick,
      onActivate,
      onDeactivate,
      onStart,
      onStop,
      draggable,
      autoAdvance,
    }
  ) {
    targets = gsap.utils.toArray(targets);
    gsap.set(targets, { xPercent: -50, x: 0, yPercent: -50, y: 0 });
    let DEG2RAD = Math.PI / 180,
      eventTypes = (
        "ontouchstart" in document.documentElement
          ? "touchstart,touchmove,touchcancel,touchend"
          : !("onpointerdown" in document.documentElement)
          ? "mousedown,mousemove,mouseup,mouseup"
          : "pointerdown,pointermove,pointercancel,pointerup"
      ).split(","),
      round = (value) => Math.round(value * 10000) / 10000,
      tempDiv = document.createElement("div"),
      quantity = targets.length,
      angleInc = 360 / quantity,
      wrap = gsap.utils.wrap(0, quantity),
      angleWrap = gsap.utils.wrap(0, 360),
      rotation = 0,
      dragged,
      onPressRotation,
      autoAdvanceCall =
        autoAdvance &&
        gsap.delayedCall(parseFloat(autoAdvance) || 2, () => {
          self.next();
          autoAdvanceCall.restart(true);
        }),
      xSetters = targets.map((el) => gsap.quickSetter(el, "x", "px")),
      ySetters = targets.map((el) => gsap.quickSetter(el, "y", "px")),
      self = {
        rotation(value) {
          if (arguments.length) {
            let prevActive = activeElement;
            rotation = angleWrap(value);
            activeElement = targets[wrap(Math.round(-value / angleInc))];
            self.render();
            if (prevActive !== activeElement) {
              onDeactivate && prevActive && onDeactivate(prevActive, self);
              onActivate && onActivate(activeElement, self);
            }
          }
          return rotation;
        },
        resize(rx, ry) {
          radiusX = rx;
          radiusY = ry;
          self.render();
        },
        render() {
          self.render = function () {
            let inc = angleInc * DEG2RAD,
              a = (rotation + activeAngle) * DEG2RAD,
              activeIndex = targets.indexOf(activeElement);

            targets.forEach((el) => el.classList.remove("active"));

            for (let i = 0; i < quantity; i++) {
              xSetters[i](round(Math.cos(a) * radiusX));
              ySetters[i](round(Math.sin(a) * radiusY));

              if (i === activeIndex) {
                gsap.to(targets[i], {
                  opacity: 1,
                  rotate: 0,
                  duration: 0.4,
                  ease: "power1.out",
                });
                targets[i].classList.add("active");
              } else if (
                i === wrap(activeIndex - 1) ||
                i === wrap(activeIndex + 1)
              ) {
                gsap.to(targets[i], {
                  opacity: 1,
                  rotate: i === wrap(activeIndex - 1) ? -10 : 10,
                  duration: 0.4,
                  ease: "power1.out",
                });
              } else if (
                i === wrap(activeIndex - 2) ||
                i === wrap(activeIndex + 2)
              ) {
                gsap.to(targets[i], {
                  opacity: 0,
                  rotate: i === wrap(activeIndex - 2) ? -20 : 20,
                  duration: 0.4,
                  ease: "power1.out",
                });
              } else if (
                i === wrap(activeIndex - 3) ||
                i === wrap(activeIndex + 3)
              ) {
                gsap.to(targets[i], {
                  opacity: 0,
                  rotate: i === wrap(activeIndex - 3) ? -40 : 40,
                  duration: 0.4,
                  ease: "power1.out",
                });
              } else {
                gsap.to(targets[i], {
                  opacity: 0,
                  rotate: 0,
                  duration: 0.4,
                  ease: "power1.out",
                });
              }

              a += inc;
            }
          };
        },

        activeElement(value) {
          if (arguments.length) {
            self.rotation(self.elementRotation(value));
          }
          return activeElement;
        },
        elementRotation(element) {
          let index = targets.indexOf(gsap.utils.toArray(element)[0]);
          return (quantity - index) * angleInc;
        },
        to(elOrRotation, vars, direction) {
          vars = vars || {};
          vars.rotation =
            typeof elOrRotation === "number"
              ? elOrRotation
              : self.elementRotation(elOrRotation) || parseFloat(elOrRotation);
          vars.overwrite = true;
          let { onUpdate, onComplete } = vars,
            _onStart = vars.onStart;
          autoAdvanceCall && autoAdvanceCall.pause();
          vars.onStart = function () {
            onStart && onStart(activeElement, self);
            _onStart && _onStart.call(this);
          };
          vars.onComplete = function () {
            onStop && onStop(activeElement, self);
            onComplete && onComplete.call(this);
            autoAdvanceCall && autoAdvanceCall.restart(true);
          };
          if (direction) {
            let getter = gsap.getProperty(tempDiv);
            vars.onUpdate = function () {
              self.rotation(getter("rotation"));
              onUpdate && onUpdate.call(this);
            };
            vars.rotation += "_" + direction;
            return gsap.fromTo(tempDiv, { rotation: rotation }, vars);
          }
          return gsap.to(self, vars);
        },
        next(vars, direction) {
          vars = {
            ...vars,
            duration: 1,
          };
          let element = targets[wrap(targets.indexOf(activeElement) + 2)];
          self.to(element, vars, direction || "ccw");
        },
        previous(vars, direction) {
          vars = {
            ...vars,
            duration: 1,
          };
          let element = targets[wrap(targets.indexOf(activeElement) - 2)];
          self.to(element, vars, direction || "cw");
        },
        kill() {
          targets.forEach((el) => {
            el.removeEventListener("click", _onClick);
            el.removeEventListener(eventTypes[0], onPress);
            el.removeEventListener(eventTypes[2], onRelease);
            el.removeEventListener(eventTypes[3], onRelease);
          });
          gsap.killTweensOf(self);
          tempDiv.parentNode && tempDiv.parentNode.removeChild(tempDiv);
          autoAdvanceCall && autoAdvanceCall.kill();
          draggable && draggable.kill();
        },
        autoAdvance: autoAdvanceCall,
      },
      _onClick = (e) => {
        if (!dragged) {
          autoAdvanceCall && autoAdvanceCall.restart(true);
          onClick && onClick(e.currentTarget, self);
        }
      },
      onPress = (e) => {
        onPressRotation = rotation;
        gsap.set(tempDiv, { rotation: rotation });
        autoAdvanceCall && autoAdvanceCall.pause();
        gsap.killTweensOf(self);
        draggable.startDrag(e);
        dragged = false;
      },
      onRelease = (e) => {
        draggable.endDrag(e);
        if (rotation === onPressRotation) {
          autoAdvanceCall && autoAdvanceCall.restart(true);
          draggable.tween && draggable.tween.kill();
          _onClick(e);
        }
      },
      syncDraggable = () => {
        if (!dragged) {
          onStart && onStart(activeElement, self);
          dragged = true;
        }
        self.rotation(draggable.rotation);
      };
    targets[0].parentNode.appendChild(tempDiv);
    gsap.set(tempDiv, {
      visibility: "hidden",
      position: "absolute",
      width: 0,
      height: 0,
      top: "50%",
      left: "50%",
      xPercent: -50,
      yPercent: -50,
    });
    targets.forEach((el) => {
      if (draggable) {
        el.addEventListener(eventTypes[0], onPress);
        el.addEventListener(eventTypes[2], onRelease);
        el.addEventListener(eventTypes[3], onRelease);
      } else {
        el.addEventListener("click", _onClick);
      }
    });

    self.snap = angleInc;
    draggable &&
      (self.draggable = draggable =
        Draggable.create(tempDiv, {
          type: "rotation",
          snap: gsap.utils.snap(2 * angleInc),
          inertia: true,
          onThrowComplete: () => {
            autoAdvanceCall && autoAdvanceCall.restart(true);
            onStop && onStop(activeElement, self);
          },
          onThrowUpdate: syncDraggable,
          onDrag: syncDraggable,
        })[0]);
    self.activeElement(gsap.utils.toArray(activeElement)[0] || targets[0]);
    return self;
  }

  let isScrolling = false;

  const carouselContainer = document.querySelector(".pxl-history-carousel.layout-1");

  if (carouselContainer && typeof carousel !== "undefined") {
    carouselContainer.addEventListener("click", (e) => {
      const prevBtn = e.target.closest(".pxl-swiper-arrow-prev");
      const nextBtn = e.target.closest(".pxl-swiper-arrow-next");

      if ((prevBtn || nextBtn) && !isScrolling) {
        isScrolling = true;

        if (prevBtn) {
          carousel.previous();
        } else if (nextBtn) {
          carousel.next();
        }

        setTimeout(() => {
          isScrolling = false;
        }, 500);
      }
    });
  }

}

function pxlSwiperHandler(scope) {
  const carousels = scope.classList.contains("pxl-swiper-slider")
    ? [scope]
    : Array.from(scope.querySelectorAll(".pxl-swiper-slider"));

  carousels.forEach(function (carousel) {
    let swiperContainer = carousel.querySelector(".pxl-swiper-container");
    if (!swiperContainer) return;

    let swiperSettings = swiperContainer.dataset.settings
      ? JSON.parse(swiperContainer.dataset.settings)
      : {};

    let nextArrow = carousel.querySelector(".pxl-swiper-arrow-next");
    let prevArrow = carousel.querySelector(".pxl-swiper-arrow-prev");
    let dotsElement = carousel.querySelector(".pxl-swiper-dots");

    if (carousel.classList.contains("swiper-parent")) {
      const parentContainer = carousel.querySelector(
        ".pxl-swiper-container.swiper-parent"
      );
      swiperSettings = parentContainer?.dataset.settings
        ? JSON.parse(parentContainer.dataset.settings)
        : swiperSettings;

      nextArrow = carousel.querySelector(".pxl-swiper-arrow-next.swiper-parent");
      prevArrow = carousel.querySelector(".pxl-swiper-arrow-prev.swiper-parent");
      dotsElement = carousel.querySelector(".pxl-swiper-dots.swiper-parent");
    }

    const swiperConfig = {
      direction: swiperSettings.slide_direction || "horizontal",
      effect: swiperSettings.slide_mode || "slide",
      wrapperClass: "pxl-swiper-wrapper",
      slideClass: "pxl-swiper-slide",
      slidesPerView: swiperSettings.slides_to_show || 1,
      slidesPerGroup: swiperSettings.slides_to_scroll || 1,
      slidesPerColumn: swiperSettings.slide_percolumn || 1,
      spaceBetween: parseInt(swiperSettings.slides_gutter || 0),
      autoplayDisableOnInteraction: false,
      lazy: true,
      navigation: {
        nextEl: nextArrow || '.pxl-swiper-arrow-next',
        prevEl: prevArrow || '.pxl-swiper-arrow-prev',
      },
      pagination: {
        el: dotsElement,
        clickable: true,
        type:
          swiperSettings.dots_style === "bullets" ||
          swiperSettings.dots_style === "bullets-number"
            ? "bullets"
            : swiperSettings.dots_style || "bullets",
        modifierClass: "pxl-swiper-pagination-",
        bulletClass: "pxl-swiper-pagination-bullet",
      },
      speed: parseInt(swiperSettings.speed || 500),
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      observer: true,
      observeParents: true,
      creativeEffect: {
        prev: { shadow: true, translate: ["-120%", 0, -500] },
        next: { shadow: true, translate: ["120%", 0, -500] },
      },
      breakpoints: {
        0: {
          slidesPerView: swiperSettings.slides_to_show_xs || 1,
          slidesPerGroup: swiperSettings.slides_to_scroll || 1,
          spaceBetween: swiperSettings.slides_gutter_xs || 0,
        },
        576: {
          slidesPerView: swiperSettings.slides_to_show_sm || 1,
          slidesPerGroup: swiperSettings.slides_to_scroll || 1,
          spaceBetween: swiperSettings.slides_gutter_sm || 0,
        },
        768: {
          slidesPerView: swiperSettings.slides_to_show_md || 1,
          slidesPerGroup: swiperSettings.slides_to_scroll || 1,
          spaceBetween: swiperSettings.slides_gutter_md || 0,
        },
        992: {
          slidesPerView: swiperSettings.slides_to_show_lg || 1,
          slidesPerGroup: swiperSettings.slides_to_scroll || 1,
          spaceBetween: swiperSettings.slides_gutter_lg || 0,
        },
        1200: {
          slidesPerView: swiperSettings.slides_to_show || 1,
          slidesPerGroup: swiperSettings.slides_to_scroll || 1,
          spaceBetween: swiperSettings.slides_gutter_xl || 0,
        },
        1600: {
          slidesPerView: swiperSettings.slides_to_show_xxl || 1,
          slidesPerGroup: swiperSettings.slides_to_scroll || 1,
          spaceBetween: swiperSettings.slides_gutter || 0,
        },
      },
      on: {
        beforeInit() {
          carousel.classList.add("pxl-swiper-initialized");
        },
        afterInit(swiper) {
          if (swiperSettings.active_index && swiperSettings.active_index > 0) {
            swiper.slideTo(swiper.activeIndex + swiperSettings.active_index);
          }
        },
        slideChangeTransitionStart() {
          carousel
            .querySelectorAll(".pxl-swiper-arrows")
            .forEach((el) => el.classList.add("changing"));
          carousel.classList.remove("slide-transited");
        },
        slideChangeTransitionEnd() {
          carousel
            .querySelectorAll(".pxl-swiper-arrows")
            .forEach((el) => el.classList.remove("changing"));
          carousel.classList.add("slide-transited");
        },
      },
    };

    if (swiperSettings.dots_style === "bullets-number") {
      swiperConfig.pagination = {
        el: dotsElement,
        clickable: true,
        type: "custom",
        renderCustom: (swiper, current, total) =>
          `<span class="swiper-pagination-custom">${current}/${total}</span>`,
      };
    }

    if (swiperSettings.center_slide) swiperConfig.centeredSlides = true;
    if (swiperSettings.loop) swiperConfig.loop = true;

    if (swiperSettings.autoplay) {
      swiperConfig.autoplay = {
        delay: swiperSettings.delay || 3000,
        disableOnInteraction: swiperSettings.pause_on_interaction ?? false,
      };
    } else {
      swiperConfig.autoplay = false;
    }

    if (swiperSettings.mousewheel) {
      swiperConfig.mousewheel = { releaseOnEdges: true };
    }

    if (carousel.querySelector(".pxl-swiper-thumbs")) {
      const thumbsContainer = carousel.querySelector(".pxl-swiper-thumbs");
      const thumbsSwiper = new Swiper(thumbsContainer, {
        effect: "fade",
        loop: true,
      });

      thumbsSwiper.on("resize", () => {
        thumbsSwiper.changeDirection(getDirection(thumbsContainer));
      });

      swiperConfig.thumbs = {
        swiper: thumbsSwiper,
        autoScrollOffset: 1,
      };
    }

    let swiperInstance = new Swiper(swiperContainer, swiperConfig);
    swiperInstance.navigation.update();

    if (swiperSettings.autoplay && swiperSettings.pause_on_hover) {
      swiperContainer.addEventListener("mouseenter", () => swiperInstance.autoplay.stop());
      swiperContainer.addEventListener("mouseleave", () => swiperInstance.autoplay.start());
    }

    swiperInstance.on("slideChangeTransitionEnd", () => {
      const layoutOne = document.querySelector(".pxl-testimonial-carousel.layout-1");
      if (!layoutOne) return;

      const allSlides = layoutOne.querySelectorAll(".pxl-swiper-slide");
      allSlides.forEach((slide) =>
        slide.classList.remove(
          "custom-prev-before-next",
          "custom-next-after-prev",
          "custom-next-after-next",
          "custom-prev-before-prev"
        )
      );

      const nextSlide = layoutOne.querySelector(".pxl-swiper-slide.swiper-slide-next");
      const prevSlide = layoutOne.querySelector(".pxl-swiper-slide.swiper-slide-prev");

      if (nextSlide?.nextElementSibling)
        nextSlide.nextElementSibling.classList.add("custom-prev-before-next");
      if (prevSlide?.previousElementSibling)
        prevSlide.previousElementSibling.classList.add("custom-next-after-prev");
    });

    const filterItems = carousel.querySelectorAll(".swiper-filter-wrap .filter-item");
    filterItems.forEach((filter) => {
      filter.addEventListener("click", () => {
        const target = filter.getAttribute("data-filter-target");
        filterItems.forEach((item) => item.classList.remove("active"));
        filter.classList.add("active");

        const slides = carousel.querySelectorAll(".swiper-slide, [data-filter]");
        slides.forEach((slide) => {
          const attr = slide.getAttribute("data-filter") || "";
          const match = attr === target || attr.includes(` ${target}`);
          slide.classList.toggle("non-swiper-slide", target !== "all" && !match);
          slide.classList.toggle("swiper-slide", target === "all" || match);
        });

        swiperInstance.destroy(true, true);
        swiperInstance = new Swiper(swiperContainer, swiperConfig);
        swiperInstance.navigation.update();
      });
    });

    const themeToggle = document.querySelector(".toggle-theme");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        swiperInstance.destroy(true, true);
        swiperInstance = new Swiper(swiperContainer, swiperConfig);
        swiperInstance.navigation.update();
      });
    }
  });
}


function getDirection(thumbNode) {
  const thumbsSettings = thumbNode.dataset.settings
    ? JSON.parse(thumbNode.dataset.settings)
    : {};
  return window.innerWidth <= 991 && thumbsSettings.slide_direction_mobile
    ? thumbsSettings.slide_direction_mobile
    : thumbsSettings.slide_direction;
}
