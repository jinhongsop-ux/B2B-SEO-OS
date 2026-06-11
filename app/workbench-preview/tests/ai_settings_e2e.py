import os

from playwright.sync_api import expect, sync_playwright


ROOT_URL = os.environ.get("ROOT_URL", "http://127.0.0.1:3001")


def main() -> None:
    console_errors: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1200})
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        page.goto(f"{ROOT_URL}/settings")
        page.wait_for_load_state("networkidle")

        expect(page.get_by_role("heading", name="双 AI 层、安全边界和本地运行设置")).to_be_visible()
        expect(page.get_by_text("全局 AI API 设置")).to_be_visible()
        expect(page.get_by_text("这是整个程序统一使用的 AI 调用能力")).to_be_visible()

        page.get_by_label("调用模式").select_option("manual_mock")
        page.get_by_label("Provider").select_option("openai_compatible")
        page.get_by_label("API Endpoint").fill("")
        page.get_by_label("模型名称").fill("manual-mock")
        page.get_by_label("Temperature").fill("0.2")
        page.get_by_label("Max Tokens").fill("4000")

        with page.expect_response(lambda response: "/api/ai/settings" in response.url and response.status == 200):
            page.get_by_role("button", name="保存 AI 设置").click()
        expect(page.get_by_text("手动模拟模式").first).to_be_visible()
        expect(page.get_by_role("button", name="保存 AI 设置")).to_be_visible()
        expect(page.get_by_text("全局 AI API 设置已保存。")).to_be_visible()

        with page.expect_response(lambda response: "/api/ai/test-connection" in response.url and response.status == 200):
            page.get_by_role("button", name="测试连接").click()
        expect(page.get_by_text("手动模拟模式可用")).to_be_visible()

        page.get_by_text("调用冒烟测试").scroll_into_view_if_needed()
        page.locator("textarea").filter(has_text="请用一句话说明当前 AI API").fill("请确认全局 AI API 调用链路可以用于元提示词编译。")
        with page.expect_response(lambda response: "/api/ai/generate" in response.url and response.status == 200):
            page.get_by_role("button", name="试生成").click()
        expect(page.get_by_text("模拟 AI 输出")).to_be_visible()
        expect(page.locator("tbody tr").filter(has_text="settings_panel_smoke_test").first).to_be_visible()

        page.get_by_text("AI 调用日志").scroll_into_view_if_needed()
        row = page.locator("tbody tr").filter(has_text="settings_panel_smoke_test").first
        expect(row).to_be_visible()
        row.click()
        expect(page.get_by_role("dialog")).to_be_visible()
        expect(page.get_by_text("AI 调用详情")).to_be_visible()
        expect(page.get_by_text("输出预览", exact=True)).to_be_visible()

        browser.close()

    if console_errors:
        raise AssertionError("Browser console/page errors:\n" + "\n".join(console_errors))


if __name__ == "__main__":
    main()
