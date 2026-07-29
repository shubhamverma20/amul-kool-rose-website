const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
    // Launch Chrome using standard Windows installation path
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1526, height: 754 });

    // Capture console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    console.log('Navigating to http://localhost:8080/ ...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });

    // Wait for the loader to finish (fade-out class added)
    console.log('Waiting for preloader to fade out...');
    await page.waitForSelector('#preloader.fade-out', { timeout: 15000 });
    console.log('Preloader faded out!');

    const screenshotDir = 'C:\\Users\\shubham\\.gemini\\antigravity-ide\\[conversation-id]'; // we will edit the actual path
    const artifactPath = (filename) => `C:\\Users\\shubham\\.gemini\\antigravity-ide\\brain\\bcef5039-6d36-451d-b9eb-d7776dc0d108\\${filename}`;

    // Helper to capture scroll screenshot and layout metrics
    async function inspectScroll(scrollVal) {
        console.log(`Scrolling to ${scrollVal}px...`);
        await page.evaluate((val) => {
            window.scrollTo(0, val);
        }, scrollVal);
        
        // Wait a short moment for animation/lerp tick
        await new Promise(r => setTimeout(r, 600));

        // Get elements metrics
        const metrics = await page.evaluate(() => {
            const scrollContainer = document.querySelector('.scroll-container');
            const stickyContainer = document.querySelector('.sticky-container');
            const canvas = document.getElementById('animation-canvas');
            const mixer = document.getElementById('mixer');
            const hero = document.getElementById('hero');

            const getRect = (el) => el ? {
                top: el.getBoundingClientRect().top,
                bottom: el.getBoundingClientRect().bottom,
                height: el.getBoundingClientRect().height,
                display: window.getComputedStyle(el).display,
                visibility: window.getComputedStyle(el).visibility,
                opacity: window.getComputedStyle(el).opacity,
                position: window.getComputedStyle(el).position
            } : null;

            return {
                scrollY: window.scrollY,
                hero: getRect(hero),
                scrollContainer: getRect(scrollContainer),
                stickyContainer: getRect(stickyContainer),
                canvas: getRect(canvas),
                mixer: getRect(mixer)
            };
        });

        console.log(`Metrics at scroll=${scrollVal}:`, JSON.stringify(metrics, null, 2));

        const imgPath = artifactPath(`scroll-${scrollVal}.png`);
        await page.screenshot({ path: imgPath });
        console.log(`Saved screenshot: ${imgPath}`);
    }

    // Inspect at different scroll positions
    await inspectScroll(0);
    await inspectScroll(500);
    await inspectScroll(1500);
    await inspectScroll(3000);
    await inspectScroll(4500);
    await inspectScroll(5500);

    await browser.close();
    console.log('Done!');
})();
