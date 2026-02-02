const plexifyGsap = function(){
  
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    MotionPathPlugin,
    SplitText
  );
  let smoother;

  if (!smoother) {
    smoother = ScrollSmoother.create({
      smooth: 2,
      effects: true,
      normalizeScroll: true,
      smoothTouch: 0.1, 
    });
  }

  const handleTeamHover = () => {
    let destroyFn = null;

    ScrollTrigger.matchMedia({
      "(min-width: 567px)": () => {
        const boxes = document.querySelectorAll(".pxl-team-list .box-item");
        const cleanups = [];

        boxes.forEach((box) => {
          const reveal = box.querySelector(".item-image");
          const revealImg = reveal?.querySelector(".reveal-image");

          if (!reveal || !revealImg) return;

          const positionElement = (ev) => {
            const parent = ev.currentTarget;
            const parentRect = parent.getBoundingClientRect();
            const parentWidth = parent.offsetWidth;
            const revealWidth = reveal.offsetWidth;
            const mouseX = ev.clientX - parentRect.left;
            const padding = 60;
            const finalX = mouseX + padding;

            reveal.style.top = "50%";
            reveal.style.transform = "translateY(-50%)";

            if (finalX + revealWidth > parentWidth) {
              const rightDistance = parentWidth - mouseX;
              reveal.style.right = `${rightDistance + padding}px`;
              reveal.style.left = "auto";
            } else {
              reveal.style.left = `${finalX}px`;
              reveal.style.right = "auto";
            }
          };

          const showImage = () => {
            gsap.killTweensOf(revealImg);
            gsap.timeline()
              .set(reveal, { opacity: 1, zIndex: 1000 })
              .fromTo(
                revealImg,
                { scaleX: 0, opacity: 0, transformOrigin: "left center" },
                { scaleX: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
              );
          };

          const hideImage = () => {
            gsap.killTweensOf(revealImg);
            gsap.timeline()
              .to(revealImg, {
                scaleX: 0,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                transformOrigin: "right center",
              })
              .set(reveal, { opacity: 0, zIndex: "" });
          };

          const mouseEnterHandler = (e) => {
            positionElement(e);
            showImage();
          };

          const mouseMoveHandler = (e) => {
            positionElement(e);
          };

          box.addEventListener("mouseenter", mouseEnterHandler);
          box.addEventListener("mousemove", mouseMoveHandler);
          box.addEventListener("mouseleave", hideImage);

          cleanups.push(() => {
            box.removeEventListener("mouseenter", mouseEnterHandler);
            box.removeEventListener("mousemove", mouseMoveHandler);
            box.removeEventListener("mouseleave", hideImage);
          });
        });

        destroyFn = () => {
          cleanups.forEach((fn) => fn());
        };
      },
    });

    return () => {
      if (destroyFn) destroyFn();
    };
  };

  const stickyCard = () => {
    let cleanupFn;

    ScrollTrigger.matchMedia({
      "(min-width: 1200px)": () => {
        const contentElements = gsap.utils.toArray(".content--sticky");
        if (contentElements.length === 0) return;

        const total = contentElements.length;
        const triggers = [];
        const timelines = [];

        contentElements.forEach((el, index) => {
          const isLast = index === total - 1;

          if (!isLast) {
            const pinTrigger = ScrollTrigger.create({
              trigger: el,
              start: "top top",
              end: "bottom top",
              pin: true,
              pinSpacing: false,
              anticipatePin: 1,
            });
            triggers.push(pinTrigger);
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=100%",
              scrub: true,
            },
          });

          tl.to(
            el,
            {
              ease: "none",
              startAt: {
                filter: "brightness(100%) contrast(100%)",
              },
              filter: isLast ? "none" : "brightness(60%) contrast(135%)",
              yPercent: isLast ? 0 : -15,
            },
            0
          );

          const image = el.querySelector(".content-img");
          if (image) {
            tl.to(
              image,
              {
                scale: 1.5,
                ease: "power1.in",
              },
              0
            );
          }

          timelines.push(tl);
        });

        ScrollTrigger.refresh();

        cleanupFn = () => {
          triggers.forEach((trigger) => trigger.kill());
          timelines.forEach((tl) => tl.scrollTrigger?.kill());
        };

        return cleanupFn;
      },
    });

    return () => {
      if (cleanupFn) cleanupFn();
    };
  };

  const headerSticky = () => {
    const header = document.querySelector(".site-header");
    const sidebarStickyWrap = document.querySelector(".sidebar-sticky");

    if (!header) return;

    let lastScroll = 0;
    let animationFrameId;

    const updateStickyHeader = (scrollY) => {
      const scrollingDown = scrollY > lastScroll;
      const shouldFix = !scrollingDown && scrollY > 0;

      header.classList.toggle("is-fixed", shouldFix);

      if (sidebarStickyWrap) {
        const headerHeight = header.offsetHeight || 80;
        sidebarStickyWrap.style.top = shouldFix
          ? `${headerHeight + 10}px`
          : "60%";
      }

      lastScroll = scrollY;
    };

    const smootherScrollLoop = () => {
      if (typeof smoother?.scrollTop === "function") {
        const currentScroll = smoother.scrollTop();
        updateStickyHeader(currentScroll);
      } else {
        const currentScroll = window.scrollY || document.documentElement.scrollTop;
        updateStickyHeader(currentScroll);
      }

      animationFrameId = requestAnimationFrame(smootherScrollLoop);
    };

    animationFrameId = requestAnimationFrame(smootherScrollLoop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  };

  const linkSmoothScroll = () => {
    const clickHandler = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();

      if (typeof smoother?.scrollTo === "function") {
        smoother.scrollTo(targetEl, true);
      } else {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    };

    document.addEventListener("click", clickHandler);

    return () => {
      document.removeEventListener("click", clickHandler);
    };
  };

  let cleanupSticky = null;
  const initStickyPosition = (selector = ".my-sticky", offset = 100) => {
    ScrollTrigger.matchMedia({
      "(min-width: 992px)": () => {
        const elements = document.querySelectorAll(selector);
        const triggers = [];
        elements.forEach((el) => {
          const parent = el.parentElement;
          if (!parent) return;

          const spacer = document.createElement("div");
          spacer.style.position = "relative";
          spacer.style.height = el.classList.contains("sidebar-sticky") ? 0 : `${el.offsetHeight + offset}px`;
          parent.insertBefore(spacer, el);
          spacer.appendChild(el);

          Object.assign(el.style, {
            position: "absolute",
            top: el.classList.contains("space-top-0") ?  0 : `${offset}px`,
            left: 0,
            right: 0,
          });

          const trigger = ScrollTrigger.create({
            trigger: spacer,
            start: "top top",
            end: () => `+=${parent.offsetHeight - el.offsetHeight - offset}`,
            pin: el,
            pinSpacing: false,
            scroller: "#smooth-wrapper",
            anticipatePin: 1,
          });

          triggers.push({ trigger, spacer, el });
        });

        return () => {
          triggers.forEach(({ trigger, spacer, el }) => {
            trigger.kill();

            const parent = spacer.parentElement;
            if (parent) {
              parent.insertBefore(el, spacer);
              parent.removeChild(spacer);
            }

            Object.assign(el.style, {
              position: "",
              top: "",
              left: "",
              right: "",
            });
          });
        };

      }
    });
  };  

  const applySticky = () => {
    if (cleanupSticky) cleanupSticky();       
    cleanupSticky = initStickyPosition();   
  };

  const initVideoAnimation = () => {
    const imgZoomElements = document.querySelectorAll(".img-zoom");

    imgZoomElements.forEach((imgZoom) => {
      const target = imgZoom.querySelector(".img-box");
      if (!target) return;

      ScrollTrigger.create({
        trigger: imgZoom,
        start: "top+=100 bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const scaleValue = Math.min(1.5, 1 + progress);
          target.style.transform = `scale(${scaleValue.toFixed(3)})`;
        },
      });
    });
  };

  const headingAnimation = () => {
    const triggers = [];

    const headings = document.querySelectorAll(".pxl-heading-scroll-effect .heading-text");

    if (headings.length === 0) return;

    headings.forEach((heading) => {
      if (!heading) return;

      const split = new SplitText(heading, { type: "lines" });

      split.lines.forEach((line) => {
        const tween = gsap.to(line, {
          backgroundPositionX: "0%",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: line,
            start: "top 50%",
            end: "bottom center",
            scrub: 1,
          },
        });

        if (tween.scrollTrigger) {
          triggers.push(tween.scrollTrigger);
        }
      });
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  };
  
  const customScroll = () => {
    const content = document.querySelectorAll('.custom-scroll');

    content.forEach((item) => {
      item.addEventListener('wheel', function (e) {
        e.stopPropagation();
      }, { passive: false });

      let startY = 0;
      let startX = 0;

      item.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startY = touch.clientY;
        startX = touch.clientX;
      }, { passive: true });

      item.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const deltaY = startY - touch.clientY;
        const deltaX = startX - touch.clientX;

        item.scrollTop += deltaY;
        item.scrollLeft += deltaX;

        startY = touch.clientY;
        startX = touch.clientX;

        e.stopPropagation();
        e.preventDefault();
      }, { passive: false });
    });
  };

	document.querySelectorAll(".sticky-update-btn").forEach((btn) => {
		btn.addEventListener("click",() => {
			setTimeout(() => {
				applySticky(); 
			}, 200); 				
		});
	  });


  return {
    init(){
      handleTeamHover();
      stickyCard();
      headerSticky();
      linkSmoothScroll();
      applySticky();
      initVideoAnimation();
      headingAnimation();
	    customScroll();
    },
  };
};

window.addEventListener("load", () => {
  plexifyGsap().init();
});

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});