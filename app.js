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

    // --- START PRELOADING ---
    startPreloading();
});
