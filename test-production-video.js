const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1526, height: 754 });

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    console.log('Waiting for preloader to fade out...');
    await page.waitForSelector('#preloader.fade-out', { timeout: 15000 });
    console.log('Preloader faded out!');

    const artifactPath = (filename) => `C:\\Users\\shubham\\.gemini\\antigravity-ide\\brain\\bcef5039-6d36-451d-b9eb-d7776dc0d108\\${filename}`;

    async function inspectScroll(scrollVal) {
        console.log(`Scrolling to ${scrollVal}px...`);
        await page.evaluate((val) => {
            window.scrollTo(0, val);
        }, scrollVal);
        
        await new Promise(r => setTimeout(r, 1000)); // wait for video seeking

        const state = await page.evaluate(() => {
            const video = document.getElementById('animation-video');
            const scrollContainer = document.querySelector('.scroll-container');
            const stickyContainer = document.querySelector('.sticky-container');
            
            const getRect = (el) => el ? {
                top: el.getBoundingClientRect().top,
                bottom: el.getBoundingClientRect().bottom,
                height: el.getBoundingClientRect().height,
                position: window.getComputedStyle(el).position
            } : null;

            return {
                scrollY: window.scrollY,
                currentTime: video ? video.currentTime : null,
                readyState: video ? video.readyState : null,
                videoTransform: video ? window.getComputedStyle(video).transform : null,
                videoWidth: video ? window.getComputedStyle(video).width : null,
                videoHeight: video ? window.getComputedStyle(video).height : null,
                scrollContainer: getRect(scrollContainer),
                stickyContainer: getRect(stickyContainer)
            };
        });
        console.log(`State at scroll=${scrollVal}:`, JSON.stringify(state, null, 2));

        const imgPath = artifactPath(`prod-scroll-${scrollVal}.png`);
        await page.screenshot({ path: imgPath });
        console.log(`Saved screenshot: ${imgPath}`);
    }

    await inspectScroll(0);
    await inspectScroll(500);
    await inspectScroll(1500);
    await inspectScroll(3000);
    await inspectScroll(4500);

    await browser.close();
    console.log('Done!');
})();
