import puppeteer from "puppeteer";
import { elizaLogger } from "@elizaos/core";

/**
 * 获取短链接的重定向目标
 * @param {string} shortUrl - 短链接 URL
 * @returns {Promise<string>} - 返回重定向后的目标 URL
 */
async function resolveShortUrl(shortUrl: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        // 导航到短链接
        elizaLogger.log(`正在解析短链接：${shortUrl}`);
        await page.goto(shortUrl, {
            waitUntil: "networkidle2",
            timeout: 30000,
        });

        // 获取重定向后的 URL
        const resolvedUrl = page.url();
        elizaLogger.log(`短链接解析成功，目标 URL：${resolvedUrl}`);
        return resolvedUrl;
    } catch (error) {
        elizaLogger.error("短链接解析失败：", error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

/**
 * 提取页面中的图片地址
 * @param {string} url - 目标页面 URL
 * @returns {Promise<string[]>} - 返回图片地址数组
 */
async function extractImageUrls(url: string): Promise<string[]> {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        // 设置 User-Agent 模拟真实浏览器
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        );

        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        await page.waitForSelector("img", { timeout: 30000 });

        const imageUrls = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("img")).map(
                (img) => img.src
            );
        });

        elizaLogger.log("图片地址提取成功！");
        return imageUrls;
    } catch (error) {
        elizaLogger.error("提取图片地址失败：", error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

export async function realImgUrl(shortUrl: string) {
    if (!shortUrl.startsWith("https://t.co")) {
        return shortUrl;
    }
    try {
        const resolvedUrl = await resolveShortUrl(shortUrl);
        const imageUrls = await extractImageUrls(resolvedUrl);
        elizaLogger.log("Real URL：", imageUrls);
        const real = imageUrls.find(
            (url) => url.startsWith("https://pbs.twimg.com/media") === true
        );
        return real ?? shortUrl;
    } catch (error) {
        elizaLogger.error("Parse Real URL ERROR：", error);
    }
    return shortUrl;
}
