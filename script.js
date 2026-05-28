function init() {

    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Sticky Header Scroll Effect
    const header = document.querySelector('.main-header');
    const scrollThreshold = 50;
    const navLinks = document.querySelectorAll('.main-nav ul li a, .mobile-nav ul li a');
    const sections = document.querySelectorAll('section');

    function handleScroll() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        updateActiveNavLinks();
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once initially

    function updateActiveNavLinks() {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    // 3. Mobile Navigation Drawer
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavDrawer = document.querySelector('.mobile-nav-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMobileNav() {
        mobileNavToggle.classList.toggle('active');
        mobileNavDrawer.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden');
    }

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', toggleMobileNav);
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNavDrawer.classList.contains('active')) {
                toggleMobileNav();
            }
        });
    });

    // 4. Hero Stats Counter Animation
    const statsNumbers = document.querySelectorAll('.stat-number');
    
    function startCounterAnimation(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 1800; // ms
        const stepTime = 15; // ms
        const steps = duration / stepTime;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, stepTime);
    }

    // Trigger counters immediately on load since they are in the hero section
    statsNumbers.forEach(stat => {
        startCounterAnimation(stat);
    });

    // 5. Scroll Reveal Intersection Observer
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 6. Interactive 3D 360° Office Simulator
    const viewport = document.getElementById('officeViewport');
    const imgWrapper = document.getElementById('officeImgWrapper');
    const officeImg = document.getElementById('officeImg');
    const loader = document.getElementById('viewportLoader');
    
    // HUD HUD elements
    const hudScale = document.getElementById('hudScale');
    const hudYaw = document.getElementById('hudYaw');
    
    // Buttons
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');

    // 360 State Variables
    let scale = 1.25;
    let targetScale = 1.25;

    let panX = 0;
    let panY = 0;
    let targetPanX = 0;
    let targetPanY = 0;

    let rotateX = 0;
    let rotateY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;

    let isHovering = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // Loader hiding
    if (officeImg) {
        if (officeImg.complete) {
            hideLoader();
        } else {
            officeImg.addEventListener('load', hideLoader);
        }
    }

    function hideLoader() {
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    // Panning & Rotation tracking (Desktop Mouse Move)
    if (viewport && imgWrapper) {
        
        viewport.addEventListener('mousemove', (e) => {
            if (isDragging) return; // Prioritize drag on active holds
            
            isHovering = true;
            const rect = viewport.getBoundingClientRect();
            
            // Normalize cursor position: -0.5 (left/top) to +0.5 (right/bottom)
            const normX = ((e.clientX - rect.left) / rect.width) - 0.5;
            const normY = ((e.clientY - rect.top) / rect.height) - 0.5;
            
            // Calculate max panning range based on current scale
            // If scale is 1.25, we have 25% of image width spilling over the container
            const maxPanX = (targetScale - 1) * rect.width * 0.5;
            const maxPanY = (targetScale - 1) * rect.height * 0.5;

            // Pan in opposite direction of mouse movement for realistic look-around
            targetPanX = -normX * maxPanX * 1.5;
            targetPanY = -normY * maxPanY * 1.5;

            // Calculate 3D tilt angle
            targetRotateY = normX * 14;  // Rotate around Y axis
            targetRotateX = -normY * 10; // Rotate around X axis (inverted)
        });

        viewport.addEventListener('mouseleave', () => {
            isHovering = false;
            if (!isDragging) {
                // Return to center slowly
                targetPanX = 0;
                targetPanY = 0;
                targetRotateX = 0;
                targetRotateY = 0;
            }
        });

        // Touch and Drag (Grab navigation) support
        viewport.addEventListener('mousedown', (e) => {
            // Ignore click on control buttons
            if (e.target.closest('.view-controls') || e.target.closest('.hotspot')) return;
            
            isDragging = true;
            startX = e.clientX - targetPanX;
            startY = e.clientY - targetPanY;
            viewport.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = viewport.getBoundingClientRect();
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const maxPanX = (targetScale - 1) * rect.width * 0.5;
            const maxPanY = (targetScale - 1) * rect.height * 0.5;
            
            // Clamp within pan boundary
            targetPanX = Math.max(-maxPanX * 1.6, Math.min(maxPanX * 1.6, deltaX));
            targetPanY = Math.max(-maxPanY * 1.6, Math.min(maxPanY * 1.6, deltaY));

            // Map drag to slight rotation
            targetRotateY = (targetPanX / (maxPanX || 1)) * 14;
            targetRotateX = -(targetPanY / (maxPanY || 1)) * 10;
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                viewport.style.cursor = 'grab';
            }
        });

        // Touch support
        viewport.addEventListener('touchstart', (e) => {
            if (e.target.closest('.view-controls') || e.target.closest('.hotspot')) return;
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX - targetPanX;
            startY = touch.clientY - targetPanY;
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const rect = viewport.getBoundingClientRect();
            
            const maxPanX = (targetScale - 1) * rect.width * 0.5;
            const maxPanY = (targetScale - 1) * rect.height * 0.5;
            
            targetPanX = Math.max(-maxPanX * 1.6, Math.min(maxPanX * 1.6, touch.clientX - startX));
            targetPanY = Math.max(-maxPanY * 1.6, Math.min(maxPanY * 1.6, touch.clientY - startY));

            targetRotateY = (targetPanX / (maxPanX || 1)) * 14;
            targetRotateX = -(targetPanY / (maxPanY || 1)) * 10;
        }, { passive: true });

        viewport.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // Animation Loop: Inertial interpolation (Lerp) for butter-smooth rotation & translation
    function animate360() {
        const lerpFactor = 0.08; // Small number = smoother, larger number = tighter tracking

        // Lerp positions
        panX += (targetPanX - panX) * lerpFactor;
        panY += (targetPanY - panY) * lerpFactor;
        rotateX += (targetRotateX - rotateX) * lerpFactor;
        rotateY += (targetRotateY - rotateY) * lerpFactor;
        scale += (targetScale - scale) * lerpFactor;

        // Apply bindings to DOM CSS custom properties
        if (imgWrapper) {
            imgWrapper.style.setProperty('--pan-x', `${panX}px`);
            imgWrapper.style.setProperty('--pan-y', `${panY}px`);
            imgWrapper.style.setProperty('--rotate-x', `${rotateX}deg`);
            imgWrapper.style.setProperty('--rotate-y', `${rotateY}deg`);
            imgWrapper.style.setProperty('--scale', scale);
        }

        // Update HUD readouts
        if (hudScale) {
            hudScale.textContent = `${scale.toFixed(2)}x`;
        }
        if (hudYaw) {
            // Map rotateY to a yaw angle representation (around the cylinder)
            const yawDegrees = Math.round(rotateY * 15);
            hudYaw.textContent = `${yawDegrees}°`;
        }

        requestAnimationFrame(animate360);
    }
    animate360(); // Start loop

    // Zoom Controls Implementation
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            targetScale = Math.min(2.5, targetScale + 0.25);
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            targetScale = Math.max(1.0, targetScale - 0.25);
            // Re-clamp panning to avoid revealing background gaps
            const rect = viewport.getBoundingClientRect();
            const maxPanX = (targetScale - 1) * rect.width * 0.5;
            const maxPanY = (targetScale - 1) * rect.height * 0.5;
            targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
            targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));
        });
    }

    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            targetScale = 1.25;
            targetPanX = 0;
            targetPanY = 0;
            targetRotateX = 0;
            targetRotateY = 0;
        });
    }

    // Hotspot Tooltip click behaviors (for touch devices)
    const hotspots = document.querySelectorAll('.hotspot');
    hotspots.forEach(hot => {
        hot.addEventListener('click', (e) => {
            e.stopPropagation();
            // Toggle active state for tooltips on mobile taps
            const activeTooltip = document.querySelector('.hotspot.active');
            if (activeTooltip && activeTooltip !== hot) {
                activeTooltip.classList.remove('active');
            }
            hot.classList.toggle('active');
        });
    });

    // Dismiss active tooltips when clicking anywhere else
    document.addEventListener('click', () => {
        const activeTooltip = document.querySelector('.hotspot.active');
        if (activeTooltip) {
            activeTooltip.classList.remove('active');
        }
    });

    // 7. Form Submission Audit
    const quoteForm = document.getElementById('quoteForm');
    const formAlert = document.getElementById('formAlert');

    // 7. Form Submission is handled natively by HTML5 and FormSubmit.co
    // Removed AJAX override to prevent local browser CORS blocking issues.

    function showFormAlert(message, type) {
        if (!formAlert) return;
        
        formAlert.textContent = message;
        formAlert.className = 'form-alert'; // reset classes
        formAlert.classList.add(type);
        formAlert.style.display = 'block';

        // Scroll to alert for small screens
        formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Hide success alerts after 8 seconds
        if (type === 'success') {
            setTimeout(() => {
                formAlert.style.fadeOut = 'slow';
                setTimeout(() => {
                    formAlert.style.display = 'none';
                }, 400);
            }, 8000);
        }
    }

    // 8. Branch Tab Switcher Logic
    const branchBtns = document.querySelectorAll('.branch-tab-btn');
    const branchPanes = document.querySelectorAll('.branch-info-pane');

    // Image mapping for branches
    const branchImages = {
        karnataka: 'office.png',
        ap: 'WhatsApp Image 2026-05-27 at 11.05.10 AM.jpeg',
        telangana: 'WhatsApp Image 2026-05-27 at 11.13.47 AM.jpeg',
        odisha: 'WhatsApp Image 2026-05-27 at 11.13.44 AM (1).jpeg'
    };

    if (branchBtns.length > 0 && officeImg) {
        branchBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const branch = btn.getAttribute('data-branch');
                
                // Set active class on buttons
                branchBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Set active class on info panes
                branchPanes.forEach(pane => pane.classList.remove('active'));
                const targetPane = document.getElementById(`branch-${branch}`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }

                // Show loader and switch image source
                if (loader) {
                    loader.classList.remove('hidden');
                }

                // Temporary opacity drop during transition for smooth visual feedback
                officeImg.style.transition = 'opacity 0.2s ease';
                officeImg.style.opacity = '0.3';

                // Change source
                officeImg.src = branchImages[branch] || 'office.png';

                // Update active hotspots wrapper class for filtering
                if (imgWrapper) {
                    imgWrapper.className = `office-360-image-wrapper show-${branch}`;
                }

                // Show/hide 360 viewer container (only Karnataka main headquarters gets the simulator)
                const viewerContainer = document.querySelector('.branch-viewer-container');
                if (viewerContainer) {
                    if (branch === 'karnataka') {
                        viewerContainer.style.display = 'block';
                    } else {
                        viewerContainer.style.display = 'none';
                    }
                }

                // Re-center perspective variables on branch change
                targetScale = 1.25;
                targetPanX = 0;
                targetPanY = 0;
                targetRotateX = 0;
                targetRotateY = 0;

                // Re-initialize Lucide Icons for safety
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        });

        // Listen for new branch image loads to hide spinner and restore opacity
        officeImg.addEventListener('load', () => {
            officeImg.style.opacity = '1';
            if (loader) {
                loader.classList.add('hidden');
            }
        });
    }

    // 9. Bulletproof Video Autoplay & Native Loop Fallback
    const heroVideo = document.querySelector('.hero-video-bg');
    if (heroVideo) {
        const playVideo = () => {
            if (heroVideo.paused) {
                heroVideo.play().catch(err => {
                    console.log('Autoplay forced playback blocked:', err);
                });
            }
        };

        playVideo();

        // Check intermittently on user interaction (helps bypass strict mobile media policies)
        document.addEventListener('click', playVideo, { once: true });
        document.addEventListener('touchstart', playVideo, { once: true });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
