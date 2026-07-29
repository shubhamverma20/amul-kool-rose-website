/**
 * Amul Kool Rose Animation website - Main Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENT REFERENCES ---
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const canvas = document.getElementById('animation-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const scrollContainer = document.querySelector('.scroll-container');
    
    // Text Milestones (Mapped to frame equivalent ranges out of 269 frames)
    const totalFrames = 269;
    const cards = [
        { el: document.getElementById('card-1'), start: 0, end: 65 },
        { el: document.getElementById('card-2'), start: 80, end: 135 },
        { el: document.getElementById('card-3'), start: 150, end: 205 },
        { el: document.getElementById('card-4'), start: 220, end: 268 }
    ];

    // --- ANIMATION STATE ---
    const images = [];
    let loadedCount = 0;
    let currentFrame = 0;
    let targetFrame = 0;
    let isLoaded = false;

    // --- 1. IMAGE PRELOADER ---
    function startPreloading() {
        if (!canvas || !ctx) {
            console.error("Canvas or context not found!");
            return;
        }

        // Resize canvas initially
        resizeCanvas();

        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            const frameNum = String(i).padStart(3, '0');
            img.src = `images/ezgif-frame-${frameNum}.jpg`;
            
            img.onload = () => {
                loadedCount++;
                updateProgress();
            };
            
            img.onerror = () => {
                console.warn(`Failed to load image frame: ${frameNum}`);
                loadedCount++;
                updateProgress();
            };
            
            images.push(img);
        }
    }

    function updateProgress() {
        const percent = Math.round((loadedCount / totalFrames) * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `Blending ingredients... ${percent}%`;

        if (loadedCount === totalFrames && !isLoaded) {
            isLoaded = true;
            handlePreloaderComplete();
        }
    }

    function handlePreloaderComplete() {
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 800);
        }

        // Draw initial frame
        drawFrame(0);

        // Start render loop
        requestAnimationFrame(renderLoop);
    }

    // --- 2. CANVAS DRAWING (object-fit: cover implementation) ---
    function drawFrame(frameIndex) {
        const img = images[frameIndex];
        if (!img || !img.complete) return;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = img.width;
        const imgHeight = img.height;

        const canvasRatio = canvasWidth / canvasHeight;
        const imgRatio = imgWidth / imgHeight;

        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgRatio;
            drawX = 0;
            drawY = (canvasHeight - drawHeight) / 2;
        } else {
            drawWidth = canvasHeight * imgRatio;
            drawHeight = canvasHeight;
            drawX = (canvasWidth - drawWidth) / 2;
            drawY = 0;
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        if (isLoaded) {
            const frameIndex = Math.max(0, Math.min(totalFrames - 1, Math.round(currentFrame)));
            drawFrame(frameIndex);
        }
    }

    window.addEventListener('resize', resizeCanvas);

    // --- 3. SCROLL HANDLING & RENDERING ENGINE ---
    function updateScrollProgress() {
        if (!scrollContainer) return;
        
        const rect = scrollContainer.getBoundingClientRect();
        const scrollDistance = -rect.top;
        const maxScrollDistance = rect.height - window.innerHeight;
        
        let scrollPercent = scrollDistance / maxScrollDistance;
        scrollPercent = Math.max(0, Math.min(1, scrollPercent));
        
        targetFrame = scrollPercent * (totalFrames - 1);
    }

    window.addEventListener('scroll', updateScrollProgress);

    function renderLoop() {
        // Linear interpolation (lerp) for silky-smooth momentum
        currentFrame += (targetFrame - currentFrame) * 0.12;
        
        const frameIndex = Math.max(0, Math.min(totalFrames - 1, Math.round(currentFrame)));
        drawFrame(frameIndex);
        
        updateTextMilestones(frameIndex);
        
        requestAnimationFrame(renderLoop);
    }

    function updateTextMilestones(frame) {
        cards.forEach(card => {
            if (card.el) {
                if (frame >= card.start && frame <= card.end) {
                    card.el.classList.add('active');
                } else {
                    card.el.classList.remove('active');
                }
            }
        });
    }

    // --- 4. SCROLL REVEAL ANIMATIONS (IntersectionObserver) ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 5. TOAST NOTIFICATIONS SYSTEM ---
    function showToast(message) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.className = 'px-6 py-3 bg-[#000666] text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2 transform translate-y-4 opacity-0 transition-all duration-300 pointer-events-auto border border-white/20';
        toast.innerHTML = `
            <span class="material-symbols-outlined text-base text-[#fe97b9]">check_circle</span>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger entry animation
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-4', 'opacity-0');
        });
        
        // Remove toast after 3s
        setTimeout(() => {
            toast.classList.add('translate-y-4', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Bind CTA buttons
    document.querySelectorAll('button').forEach(btn => {
        // Exclude menu / close buttons
        if (btn.id === 'menu-btn' || btn.id === 'close-btn') return;

        btn.addEventListener('click', function() {
            const btnText = this.textContent.trim().replace(/^[a-z_]+$/, ''); // clean icon strings if any
            const label = btnText || "Action triggered";
            showToast(`${label} is now active!`);
        });

        // Add mousedown click compression
        btn.addEventListener('mousedown', function() {
            this.classList.add('scale-95');
        });
        btn.addEventListener('mouseup', function() {
            this.classList.remove('scale-95');
        });
        btn.addEventListener('mouseleave', function() {
            this.classList.remove('scale-95');
        });
    });

    // --- 6. HEADER SCROLL & DRAWER TOGGLE ---
    const header = document.getElementById('main-header');
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const overlay = document.getElementById('overlay');
    const drawer = document.getElementById('drawer');

    function toggleDrawer() {
        if (!drawer || !overlay) return;
        drawer.classList.toggle('translate-x-0');
        drawer.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleDrawer);
    if (closeBtn) closeBtn.addEventListener('click', toggleDrawer);
    if (overlay) overlay.addEventListener('click', toggleDrawer);

    // Dynamic transparent-to-glass scroll header
    window.addEventListener('scroll', () => {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Close drawer when link is clicked
    document.querySelectorAll('#drawer a').forEach(link => {
        link.addEventListener('click', () => {
            if (drawer && drawer.classList.contains('translate-x-0')) {
                toggleDrawer();
            }
        });
    });

    // --- 7. BACKEND API INTEGRATION (Node.js + Express + SQLite) ---
    const API_URL = 'http://localhost:3000/api';

    // A. Star Rating Interactive Selection
    const starBtns = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('review-rating');

    starBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const ratingValue = this.getAttribute('data-rating');
            if (ratingInput) ratingInput.value = ratingValue;

            // Highlight selected stars
            starBtns.forEach(star => {
                const starVal = star.getAttribute('data-rating');
                if (parseInt(starVal) <= parseInt(ratingValue)) {
                    star.classList.add('active-star');
                } else {
                    star.classList.remove('active-star');
                }
            });
        });
    });

    // B. Load Dynamic Reviews from Backend
    const reviewsList = document.getElementById('reviews-list');
    
    async function loadReviews() {
        if (!reviewsList) return;
        
        try {
            const response = await fetch(`${API_URL}/reviews`);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            
            const reviews = await response.json();
            
            // Render each review card from backend
            reviews.forEach(review => {
                renderReviewCard(review, false); // append to bottom
            });
        } catch (err) {
            console.warn('Backend server not running. Serving static reviews only.', err.message);
        }
    }

    function renderReviewCard(review, prepend = true) {
        if (!reviewsList) return;

        // Generate theme colors based on name length for visual variety
        const themes = [
            { bg: '#ffd9e2', fill: '#fe97b9' }, // Rose Pink
            { bg: '#d9e2ff', fill: '#000666' }, // Heritage Blue
            { bg: '#d9f2e6', fill: '#00b359' }, // Teal
            { bg: '#ffeed9', fill: '#ff9900' }  // Orange
        ];
        const theme = themes[review.name.length % themes.length];

        const card = document.createElement('div');
        card.className = 'p-8 bg-white rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow reveal revealed';
        
        // Generate rating stars HTML
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const fillVal = i <= review.rating ? " 'FILL' 1" : " 'FILL' 0";
            starsHTML += `<span class="material-symbols-outlined text-sm text-[#fe97b9]" style="font-variation-settings:${fillVal};">star</span>`;
        }

        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                    <svg class="w-12 h-12 rounded-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" fill="${theme.bg}"/>
                        <path d="M50 45C58.2843 45 65 38.2843 65 30C65 21.7157 58.2843 15 50 15C41.7157 15 35 21.7157 35 30C35 38.2843 41.7157 45 50 45Z" fill="${theme.fill}"/>
                        <path d="M50 52C32.3269 52 18 66.3269 18 84C18 84.5 22 88 50 88C78 88 82 84.5 82 84C82 66.3269 67.6731 52 50 52Z" fill="${theme.fill}"/>
                    </svg>
                    <div>
                        <h4 class="font-bold text-primary">${review.name}</h4>
                        <div class="flex">${starsHTML}</div>
                    </div>
                </div>
                <span class="text-xs text-on-surface-variant/60 font-medium">New Review</span>
            </div>
            <p class="text-on-surface-variant italic text-sm">"${review.comment}"</p>
        `;

        if (prepend) {
            reviewsList.insertBefore(card, reviewsList.firstChild);
        } else {
            reviewsList.appendChild(card);
        }
    }

    // C. Submit Review to Backend
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('review-name').value.trim();
            const rating = ratingInput ? ratingInput.value : '';
            const comment = document.getElementById('review-comment').value.trim();

            if (!name || !rating || !comment) {
                showToast('Please fill all review fields and select a rating!');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, rating, comment })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to submit review');
                }

                const newReview = await response.json();
                
                // Add to list and show success
                renderReviewCard(newReview, true);
                showToast('Thank you! Review posted successfully.');
                
                // Reset form
                reviewForm.reset();
                if (ratingInput) ratingInput.value = '';
                starBtns.forEach(star => star.classList.remove('active-star'));

            } catch (err) {
                console.error('Error submitting review:', err);
                showToast(`Failed: ${err.message}`);
            }
        });
    }

    // D. Submit Contact Form to Backend
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const message = document.getElementById('contact-message').value.trim();

            if (!name || !email || !message) {
                showToast('Please fill out all contact fields!');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to send message');
                }

                showToast('Message sent! We will contact you soon.');
                contactForm.reset();

            } catch (err) {
                console.error('Error submitting contact form:', err);
                showToast(`Failed: ${err.message}`);
            }
        });
    }

    // Load initial reviews from database
    loadReviews();

    // --- START PRELOADING ---
    startPreloading();
});
