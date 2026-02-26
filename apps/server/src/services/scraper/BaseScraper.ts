import { chromium, Browser, Page } from 'playwright';
import { IScraper, ScraperResult, MatchData } from './types';
import { logger } from '../../utils/logger';

export abstract class BaseScraper implements IScraper {
  abstract name: string;
  abstract url: string;

  protected browser: Browser | null = null;
  protected page: Page | null = null;

  protected async initBrowser(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: process.env.SCRAPER_HEADLESS !== 'false',
        timeout: parseInt(process.env.SCRAPER_TIMEOUT || '30000'),
      });
      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
    } catch (error) {
      logger.error(`Failed to initialize browser for ${this.name}:`, error);
      throw error;
    }
  }

  protected async closeBrowser(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      logger.error(`Error closing browser for ${this.name}:`, error);
    }
  }

  async scrape(): Promise<ScraperResult> {
    const startTime = Date.now();

    try {
      await this.initBrowser();

      if (!this.page) {
        throw new Error('Browser page not initialized');
      }

      logger.info(`Starting scrape for ${this.name}`);

      await this.page.goto(this.url, {
        waitUntil: 'domcontentloaded',
        timeout: parseInt(process.env.SCRAPER_TIMEOUT || '30000'),
      });

      const matches = await this.extractMatches();

      const duration = Date.now() - startTime;
      logger.info(`Scrape completed for ${this.name}: ${matches.length} matches found in ${duration}ms`);

      return {
        bookmaker: this.name,
        success: true,
        matchesFound: matches.length,
        matches,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Scrape failed for ${this.name} after ${duration}ms:`, error);

      return {
        bookmaker: this.name,
        success: false,
        matchesFound: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        matches: [],
      };
    } finally {
      await this.closeBrowser();
    }
  }

  protected abstract extractMatches(): Promise<MatchData[]>;
}
