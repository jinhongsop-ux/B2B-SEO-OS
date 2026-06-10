import os
import re

from playwright.sync_api import expect, sync_playwright


ROOT_URL = os.environ.get("ROOT_URL", "http://127.0.0.1:3002")


def main() -> None:
    console_errors: list[str] = []

    with sync_playwright() as p:
      browser = p.chromium.launch(headless=True)
      page = browser.new_page(viewport={"width": 1440, "height": 1100})
      page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
      page.on("pageerror", lambda exc: console_errors.append(str(exc)))

      page.goto(f"{ROOT_URL}/overview")
      page.wait_for_load_state("networkidle")
      expect(page.get_by_role("heading", name=re.compile("关键词审核与页面修复"))).to_be_visible()

      tutorial_links = page.locator('a[href="/tutorial"][target="_blank"]')
      assert tutorial_links.count() >= 1, "overview should expose a target=_blank tutorial link"
      expect(tutorial_links.first).to_contain_text("使用教程")

      with page.expect_popup() as popup_info:
          tutorial_links.first.click()
      tutorial = popup_info.value
      tutorial.wait_for_load_state("networkidle")
      expect(tutorial.locator("main")).to_be_visible()
      expect(tutorial.get_by_role("heading", name=re.compile("从接手一个 B2B WordPress 网站"))).to_be_visible()
      expect(tutorial.locator('a[href="#keyword-flow"]')).to_be_visible()

      tutorial.locator('a[href="#keyword-flow"]').click()
      tutorial.wait_for_timeout(300)
      assert "#keyword-flow" in tutorial.url, "tutorial table of contents should jump to keyword section"
      expect(tutorial.locator("#keyword-flow")).to_be_visible()

      keyword_link = tutorial.locator('a[href="/keywords"]').first
      expect(keyword_link).to_be_visible()
      keyword_link.click()
      tutorial.wait_for_load_state("networkidle")
      expect(tutorial.get_by_role("heading", name=re.compile("关键词先入总库"))).to_be_visible()

      tutorial.goto(f"{ROOT_URL}/tutorial")
      tutorial.wait_for_load_state("networkidle")
      overview_link = tutorial.locator('header a[href="/overview"]').first
      expect(overview_link).to_be_visible()
      overview_link.click()
      tutorial.wait_for_load_state("networkidle")
      expect(tutorial.get_by_role("heading", name=re.compile("关键词审核与页面修复"))).to_be_visible()

      tutorial.goto(f"{ROOT_URL}/tutorial")
      tutorial.wait_for_load_state("networkidle")
      tutorial.screenshot(path="tutorial-page-desktop.png", full_page=True)

      mobile = browser.new_page(viewport={"width": 390, "height": 900})
      mobile.goto(f"{ROOT_URL}/tutorial")
      mobile.wait_for_load_state("networkidle")
      expect(mobile.get_by_role("heading", name=re.compile("从接手一个 B2B WordPress 网站"))).to_be_visible()
      mobile.screenshot(path="tutorial-page-mobile.png", full_page=True)

      browser.close()

    if console_errors:
        raise AssertionError("Browser console/page errors:\n" + "\n".join(console_errors))


if __name__ == "__main__":
    main()
