import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { elizaLogger } from "@elizaos/core";

export async function kline() {
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        // set win width and height
        await page.setViewport({
            width: 1920,
            height: 1080,
        });
        // open your TradingView chart URL
        //await page.goto('https://www.gate.io/zh/trade/BLADE_USDT');
        await page.goto(
            "https://www.tradingview.com/chart/hIV4GuP8/?symbol=CFXUSDT&interval=1H",
            { waitUntil: "networkidle0" }
        );
        const imageDir = path.join(process.cwd(), "data", "generatedKLines");
        elizaLogger.log("Usage: KLines", imageDir);
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
        }
        const filePath = path.join(
            imageDir,
            `kline-${new Date().getTime()}.png`
        );
        // set clip ares
        const chartElement = await page.$(".chart-container"); // select DOM
        const chartData = await chartElement?.screenshot({ path: filePath });

        await browser.close();
        const mediaBuffer = Buffer.from(chartData);
        return { filePath, buffer: mediaBuffer, mediaType: "image/png" };
    } catch (error) {
        elizaLogger.error("Generating Kline Error", error);
        return null;
    }
}
