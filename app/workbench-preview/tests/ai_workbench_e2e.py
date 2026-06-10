import os
import re

from playwright.sync_api import expect, sync_playwright


ROOT_URL = os.environ.get("ROOT_URL", "http://127.0.0.1:3001")


def main() -> None:
    console_errors: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1100})
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        page.goto(f"{ROOT_URL}/ai-workbench")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", name=re.compile("任务型 AI"))).to_be_visible()
        expect(page.get_by_text("提示词库")).to_be_visible()
        expect(page.get_by_text("关键词 AI 清洗提示词")).to_be_visible()
        expect(page.get_by_text("本地后端")).to_be_visible()
        expect(page.get_by_text("可用").first).to_be_visible()

        page.get_by_role("button", name="新建执行").click()
        expect(page.locator("textarea")).to_be_visible()
        expect(page.get_by_role("button", name="生成手动提示词包")).to_be_visible()
        page.get_by_role("button", name="生成手动提示词包").click()
        page.get_by_role("button", name="执行记录").click()
        run_row = page.locator("tbody tr").filter(has_text="run_").first
        expect(run_row).to_be_visible()

        run_row.click()
        dialog = page.get_by_role("dialog")
        expect(dialog).to_be_visible()
        expect(dialog.get_by_text("手动提示词包", exact=True)).to_be_visible()
        expect(dialog.get_by_text("模拟输出字段")).to_be_visible()
        page.get_by_role("button", name="复制提示词").click()
        page.get_by_label("关闭详情抽屉").last.click()

        page.get_by_role("button", name="人工审核").click()
        expect(page.get_by_role("button", name="批准输出").first).to_be_visible()
        page.get_by_role("button", name="批准输出").first.click()
        page.get_by_role("button", name="执行记录").click()
        expect(page.get_by_text("已完成").first).to_be_visible()

        page.goto(f"{ROOT_URL}/settings")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("本地后端").first).to_be_visible()
        expect(page.get_by_text("4310 API 提供提示词库和执行记录")).to_be_visible()
        expect(page.get_by_text("手动 / 模拟模式，不调用真实 API")).to_be_visible()

        for route in ["/overview", "/keywords", "/tasks", "/delivery", "/tutorial"]:
            page.goto(f"{ROOT_URL}{route}")
            page.wait_for_load_state("networkidle")
            expect(page.locator("main")).to_be_visible()

        browser.close()

    if console_errors:
        raise AssertionError("Browser console/page errors:\n" + "\n".join(console_errors))


if __name__ == "__main__":
    main()
