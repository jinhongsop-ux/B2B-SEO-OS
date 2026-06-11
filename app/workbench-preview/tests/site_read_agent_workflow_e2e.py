import os
import re

from playwright.sync_api import expect, sync_playwright


ROOT_URL = os.environ.get("ROOT_URL", "http://127.0.0.1:3001")


def main() -> None:
    console_errors: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1200})
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        page.goto(f"{ROOT_URL}/project-center")
        page.wait_for_load_state("networkidle")

        expect(page.get_by_role("heading", name="站点接入与读取")).to_be_visible()
        expect(page.get_by_text("站点读取智能体闭环")).to_be_visible()
        expect(page.get_by_text("主流程：生成 AgentTaskPack")).to_be_visible()
        expect(page.get_by_text("数据源状态")).to_be_visible()

        page.get_by_label("项目名称").fill("E2E 工业供应商项目")
        page.get_by_label("网站域名").fill("example-b2b.com")
        page.get_by_label("公司名称").fill("E2E 工业有限公司")
        page.get_by_label("行业").fill("工业零部件")
        page.get_by_label("目标市场").fill("美国，欧洲")
        page.get_by_label("核心产品").fill("CNC 零件，金属冲压件")
        page.get_by_label("目标客户").fill("采购经理，OEM 工程团队")
        page.get_by_label("转化目标").fill("提交询盘")

        with page.expect_response(lambda response: "/api/project" in response.url and response.status == 200):
            page.get_by_role("button", name="保存项目档案").click()
        expect(page.get_by_text("已保存").first).to_be_visible()

        with page.expect_response(lambda response: "/api/task-packs/generate" in response.url and response.status == 201):
            page.get_by_role("button", name="生成 AgentTaskPack").click()
        expect(page.get_by_text("site_read_snapshot_v1").first).to_be_visible()
        expect(page.get_by_text("禁止写入 WordPress").first).to_be_visible()

        page.get_by_role("button", name="填入示例").click()
        expect(page.locator("textarea").filter(has_text="site_read_snapshot_v1")).to_be_visible()

        with page.expect_response(lambda response: "/api/artifacts" in response.url and response.status == 201):
            page.get_by_role("button", name="保存回填").click()

        with page.expect_response(lambda response: "/api/ingestion-runs" in response.url and response.status == 201):
            page.get_by_role("button", name="AI 解析校验").click()
        expect(page.get_by_text(re.compile(r"质量分\s+\d+"))).to_be_visible()
        expect(page.get_by_text("是否可推进")).to_be_visible()

        with page.expect_response(lambda response: "/api/ingestion-runs/" in response.url and response.url.endswith("/review") and response.status == 200):
            page.get_by_role("button", name="人工批准入库").click()
        expect(page.get_by_text("已批准入库").first).to_be_visible()
        expect(page.get_by_text("已批准站点快照").first).to_be_visible()

        page.goto(f"{ROOT_URL}/overview")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("网站现状审计").first).to_be_visible()
        expect(page.get_by_text(re.compile("当前：.*网站现状审计|当前：.*审计")).first).to_be_visible()

        browser.close()

    if console_errors:
        raise AssertionError("Browser console/page errors:\n" + "\n".join(console_errors))


if __name__ == "__main__":
    main()
