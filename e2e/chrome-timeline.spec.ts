import { test, expect, type Page } from "@playwright/test";
import { TIMELINE } from "../content/timeline";

const PAGES = ["/", "/timeline", "/chat"] as const;

/**
 * Contrast of an element's text against --color-bg, folding in the text
 * color's alpha and every ancestor's opacity. Uses a canvas so any CSS color
 * syntax (rgb, oklab, color-mix output) is resolved by the browser.
 */
async function contrastOf(page: Page, selector: string): Promise<number[]> {
  return page.$$eval(selector, (els) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no 2d context");
    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-bg")
      .trim();

    const lum = ([r, g, b]: number[]): number => {
      const f = (c: number): number => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };

    return els.map((el) => {
      let opacity = 1;
      for (let n: Element | null = el; n; n = n.parentElement) {
        opacity *= parseFloat(getComputedStyle(n).opacity);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1, 1);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = getComputedStyle(el).color;
      ctx.fillRect(0, 0, 1, 1);
      const fg = Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3));
      ctx.globalAlpha = 1;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1, 1);
      const back = Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3));
      const [a, b] = [lum(fg), lum(back)];
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
  });
}

test.describe("nav padding", () => {
  for (const path of PAGES) {
    test(`AC-1 desktop gutter on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const logo = await page.getByRole("banner").locator("a").first().boundingBox();
      const btn = await page
        .getByRole("button", { name: "Open command palette" })
        .boundingBox();
      expect(logo?.x).toBeGreaterThanOrEqual(16);
      expect(btn).not.toBeNull();
      expect(btn!.x + btn!.width).toBeLessThanOrEqual(1440 - 16);
    });

    test(`AC-2 mobile gutter on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 852 });
      await page.goto(path);
      const header = page.getByRole("banner");
      const pad = await header.evaluate((h) => {
        const cs = getComputedStyle(h);
        return [parseFloat(cs.paddingLeft), parseFloat(cs.paddingRight)];
      });
      expect(pad[0]).toBeGreaterThanOrEqual(12);
      expect(pad[1]).toBeGreaterThanOrEqual(12);
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(393);
      const items = header.locator("nav a, nav button");
      for (let i = 0; i < (await items.count()); i++) {
        const box = await items.nth(i).boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(393);
      }
    });
  }

  test("AC-3 nav padding honours the safe-area inset", async ({ page }) => {
    await page.goto("/");
    const rules = await page.evaluate(() => {
      const out: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        const walk = (list: CSSRuleList): void => {
          for (const r of Array.from(list)) {
            if (r instanceof CSSStyleRule && /\.safe-x-3\b/.test(r.selectorText)) {
              out.push(r.style.paddingLeft, r.style.paddingRight);
            }
            if ("cssRules" in r) walk((r as CSSGroupingRule).cssRules);
          }
        };
        walk(sheet.cssRules);
      }
      return out;
    });
    expect(rules.length).toBeGreaterThanOrEqual(2);
    for (const v of rules) {
      expect(v).toMatch(/max\(env\(safe-area-inset-(left|right)\)/);
    }
  });
});

test("AC-4 labels reach 4.5:1 on / and /timeline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/");
  const homeSelectors = [
    "header nav a",
    "header nav a > span.hidden",
    "text=press",
    "text=scroll · or · navigate",
  ];
  // The hero fades in after the boot sequence; poll until it has settled.
  for (const sel of homeSelectors) {
    await expect
      .poll(async () => Math.min(...(await contrastOf(page, sel))), {
        message: sel,
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(4.5);
  }

  await page.goto("/timeline");
  const timelineSelectors = [
    "[data-testid=timeline-year]",
    "[data-testid=timeline-hud-label]",
    "text=› timeline",
  ];
  for (const sel of timelineSelectors) {
    const ratios = await contrastOf(page, sel);
    expect(ratios.length, sel).toBeGreaterThan(0);
    for (const ratio of ratios) {
      expect(ratio, sel).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test("AC-5 scrubber shows each year once, one tick per event, aligned", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/timeline");

  const ticks = page.getByTestId("timeline-tick");
  await expect(ticks).toHaveCount(TIMELINE.length);

  const years = page.getByTestId("timeline-year");
  const unique = [...new Set(TIMELINE.map((e) => e.year))];
  await expect(years).toHaveText(unique);

  // Each label sits at the tick of the first event with that year.
  for (let i = 0; i < unique.length; i++) {
    const eventIdx = TIMELINE.findIndex((e) => e.year === unique[i]);
    const label = await years.nth(i).boundingBox();
    const tick = await ticks.nth(eventIdx).boundingBox();
    expect(Math.abs(label!.x - tick!.x)).toBeLessThanOrEqual(1);
  }
});

test("AC-6 HUD label reads viewing and the year follows scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/timeline");
  const hud = page.getByTestId("timeline-hud-label");
  await expect(hud).toHaveText("› viewing");
  const year = hud.locator("xpath=following-sibling::span[1]");
  await expect(year).toHaveText(TIMELINE[0].year);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(year).toHaveText(TIMELINE[TIMELINE.length - 1].year, {
    timeout: 5000,
  });
});

test("AC-7 keyboard reaches every nav item with a visible, unclipped focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/timeline");
  const items = page.getByRole("banner").locator("nav a, nav button");
  const count = await items.count();

  await page.getByRole("banner").locator("a").first().focus();
  for (let i = 0; i < count; i++) {
    await page.keyboard.press("Tab");
    const focused = items.nth(i);
    await expect(focused).toBeFocused();
    const style = await focused.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { shadow: cs.boxShadow, border: cs.borderColor, color: cs.color };
    });
    // Links show a ring (box-shadow); the palette button changes its border.
    if ((await focused.evaluate((el) => el.tagName)) === "A") {
      expect(style.shadow).not.toBe("none");
    }
    const box = await focused.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
  }
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("AC-8 fallback layout still renders every event", async ({ page }) => {
    await page.goto("/timeline");
    const titles = page.locator("h2");
    await expect(titles).toHaveCount(TIMELINE.length);
    for (let i = 0; i < TIMELINE.length; i++) {
      await expect(titles.nth(i)).toBeVisible();
    }
    await expect(page.getByText("› current")).toHaveCount(0);
  });
});

test("AC-9 no console errors or CSP violations", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(errors).toEqual([]);
});
