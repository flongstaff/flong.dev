/**
 * Scroll-triggered animations using Intersection Observer API
 * Handles fade-ins, parallax effects, and smooth scrolling
 */

// ============================================
// Scroll Progress Indicator
// ============================================
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

// ============================================
// Intersection Observer for Scroll Animations
// ============================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');

        // Optional: Unobserve after animation to improve performance
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with animation classes
  const animatedElements = document.querySelectorAll(
    '[data-animate], .project-card, .skill-category, .stat-card, ' +
    '.contact-card, .timeline-item, .fade-in-scale, .fade-in-rotate, ' +
    '.blur-reveal, .zoom-in, .slide-reveal'
  );

  animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// Parallax Scrolling Effect
// ============================================
function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax-layer, .parallax-bg');

  if (parallaxElements.length === 0) return;

  // Check if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach((element, index) => {
      const speed = element.dataset.speed || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
}

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Ignore empty hash or just "#"
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================
// Animated Counter
// ============================================
function animateCounter(element) {
  const target = parseInt(element.dataset.counter);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const updateCounter = () => {
    current += step;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };

  updateCounter();
}

function initCounters() {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(counter => {
    counterObserver.observe(counter);
  });
}

// ============================================
// Ripple Effect on Buttons
// ============================================
function initRippleEffect() {
  document.querySelectorAll('.btn-primary, .btn-secondary, .magnetic-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ============================================
// Magnetic Button Effect
// ============================================
function initMagneticButtons() {
  const magneticButtons = document.querySelectorAll('.magnetic-btn');

  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

// ============================================
// Stagger Animation for Grid Items
// ============================================
function initStaggerAnimations() {
  const staggerContainers = document.querySelectorAll('.grid-stagger');

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  staggerContainers.forEach(container => {
    staggerObserver.observe(container);
  });
}

// ============================================
// Tilt Effect on Hover (3D card effect)
// ============================================
function initTiltEffect() {
  const tiltElements = document.querySelectorAll('.tilt-hover, .card-3d-hover');

  tiltElements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
}

// ============================================
// Lazy Load Images with Fade In
// ============================================
function initLazyImages() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add('animate-in');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ============================================
// Scroll-triggered Parallax Sections
// ============================================
function initParallaxSections() {
  const sections = document.querySelectorAll('.parallax-section');

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    sections.forEach(section => {
      const speed = section.dataset.speed || 0.5;
      const yPos = -(scrolled * speed);
      const bg = section.querySelector('.parallax-bg');
      if (bg) {
        bg.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    });
  });
}

// ============================================
// Header Hide/Show on Scroll
// ============================================
function initHeaderScroll() {
  let lastScrollY = window.scrollY;
  const header = document.querySelector('header');

  if (!header) return;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down
      header.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up
      header.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScrollY;
  });
}

// ============================================
// Initialize All Animations
// ============================================
function initAllAnimations() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
    return;
  }

  // Initialize all animation features
  initScrollProgress();
  initScrollAnimations();
  initSmoothScroll();
  initCounters();
  initRippleEffect();
  initMagneticButtons();
  initStaggerAnimations();
  initTiltEffect();
  initLazyImages();

  // Only init parallax on non-mobile devices
  if (window.innerWidth > 768) {
    initParallax();
    initParallaxSections();
  }

  // Optional: Header hide/show (uncomment if desired)
  // initHeaderScroll();

  console.log('🎨 Scroll animations initialized');
}

// Auto-initialize when script loads
initAllAnimations();

// Re-initialize on page show (for back/forward cache)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    initAllAnimations();
  }
});
