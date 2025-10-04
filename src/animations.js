/**
 * Scroll-based animations and smooth interactions for flong.dev
 * Uses Intersection Observer API for performance-optimized animations
 */

class ScrollAnimations {
  constructor() {
    this.animatedElements = new Set();
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.setupScrollAnimations();
    this.setupParallaxEffects();
    this.setupCounterAnimations();
    this.setupProgressBars();
    this.addSmoothScrollClasses();
  }

  /**
   * Setup Intersection Observer for scroll-triggered animations
   */
  setupScrollAnimations() {
    // Options for the observer
    const options = {
      root: null,
      rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
      threshold: [0, 0.1, 0.5, 1.0] // Multiple thresholds for different animation stages
    };

    // Create the observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          // Add animation class
          entry.target.classList.add('animate-in');
          this.animatedElements.add(entry.target);

          // Optional: Unobserve after animation
          // observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all elements with animation data attributes
    const elementsToAnimate = document.querySelectorAll(
      '[data-animate], .project-card, .skill-category, .stat-card, .contact-card, .timeline-item, section'
    );

    elementsToAnimate.forEach((el, index) => {
      // Add stagger delay based on index
      if (!el.style.animationDelay) {
        el.style.animationDelay = `${index * 0.1}s`;
      }
      observer.observe(el);
    });
  }

  /**
   * Parallax scrolling effect for hero section
   */
  setupParallaxEffects() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;

      // Apply parallax to hero content
      const heroContent = heroSection.querySelector('.hero-content');
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        heroContent.style.opacity = 1 - (scrolled / 600);
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Animated counters for statistics
   */
  setupCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');

    const observerOptions = {
      threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          this.animateCounter(entry.target);
          entry.target.classList.add('counted');
        }
      });
    }, observerOptions);

    counters.forEach(counter => counterObserver.observe(counter));
  }

  /**
   * Animate a counter element from 0 to its target value
   */
  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'));
    const duration = 2000; // 2 seconds
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  }

  /**
   * Animated progress bars for skills
   */
  setupProgressBars() {
    const progressBars = document.querySelectorAll('[data-progress]');

    const observerOptions = {
      threshold: 0.5
    };

    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('progress-animated')) {
          const targetWidth = entry.target.getAttribute('data-progress');
          entry.target.style.width = targetWidth;
          entry.target.classList.add('progress-animated');
        }
      });
    }, observerOptions);

    progressBars.forEach(bar => progressObserver.observe(bar));
  }

  /**
   * Add smooth scroll behavior to all internal links
   */
  addSmoothScrollClasses() {
    // Smooth scroll is already handled by CSS scroll-behavior: smooth
    // But we can add custom easing here if needed

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();

          // Custom smooth scroll with easing
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition - 80; // 80px offset for header
          const duration = 1000;
          let start = null;

          const easeInOutCubic = (t) => {
            return t < 0.5
              ? 4 * t * t * t
              : 1 - Math.pow(-2 * t + 2, 3) / 2;
          };

          const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);

            window.scrollTo(0, startPosition + (distance * ease));

            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          };

          requestAnimationFrame(animation);
        }
      });
    });
  }
}

// Initialize animations when script loads
const scrollAnimations = new ScrollAnimations();

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.ScrollAnimations = ScrollAnimations;
}
