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

    console.log('Navigating to http://localhost:8080/test-video.html ...');
    await page.goto('http://localhost:8080/test-video.html', { waitUntil: 'networkidle0' });

    // Wait a bit for video load
    await new Promise(r => setTimeout(r, 2000));

    const artifactPath = (filename) => `C:\\Users\\shubham\\.gemini\\antigravity-ide\\brain\\bcef5039-6d36-451d-b9eb-d7776dc0d108\\${filename}`;

    async function inspectScroll(scrollVal) {
        console.log(`Scrolling to ${scrollVal}px...`);
        await page.evaluate((val) => {
            window.scrollTo(0, val);
        }, scrollVal);
        
        await new Promise(r => setTimeout(r, 1000)); // wait longer for video seeking

        const state = await page.evaluate(() => {
            const video = document.getElementById('anim-video');
            return {
                scrollY: window.scrollY,
                currentTime: video.currentTime,
                readyState: video.readyState,
                paused: video.paused
            };
        });
        console.log(`Video State at scroll=${scrollVal}:`, state);

        const imgPath = artifactPath(`video-scroll-${scrollVal}.png`);
        await page.screenshot({ path: imgPath });
        console.log(`Saved screenshot: ${imgPath}`);
    }

    await inspectScroll(0);
    await inspectScroll(500);
    await inspectScroll(1500);
    await inspectScroll(3000);

    await browser.close();
    console.log('Done!');
})();
