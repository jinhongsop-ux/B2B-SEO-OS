import type { Project, WordPressSnapshot } from '../types'

export const mockProject: Project = {
  projectId: 'proj-001',
  projectName: 'Demo Industrial Components Supplier',
  domain: 'https://demo-b2b-site.com',
  company: 'Hengda Industrial Co., Ltd.',
  industry: '五金 / 金属零部件制造',
  targetMarkets: ['North America', 'Europe', 'Southeast Asia'],
  supplierIdentity: '工贸一体 / OEM Supplier',
  coreProducts: ['Custom Metal Parts', 'Stainless Steel Fasteners', 'CNC Machined Components', 'Marine Hardware'],
  targetCustomers: ['OEM Buyers', 'Industrial Distributors', 'Engineering Procurement Teams'],
  primaryConversionGoal: 'Request a Quote',
  currentStage: '关键词审核与页面修复',
  safetyMode: 'read_only',
}

export const mockSnapshot: WordPressSnapshot = {
  snapshotAt: '2025-06-08T14:32:00Z',
  pageCount: 86,
  postCount: 42,
  productCount: 38,
  mediaCount: 128,
  menuCount: 3,
  formCount: 4,
  seoFieldCount: 112,
  detectedPageTypes: ['Home', 'Product Category', 'Product Detail', 'Solution', 'Application', 'Capability', 'Quality / QC', 'Certification', 'About', 'Contact / RFQ', 'Blog / Resource', 'FAQ'],
  detectedForms: ['Contact Form 7 - Main Contact', 'Contact Form 7 - RFQ', 'WPForms - Newsletter', 'Gravity Forms - Quick Quote'],
  trustPages: ['/about-us/', '/certifications/', '/quality-control/', '/factory-tour/'],
  seoFields: ['Yoast SEO Title', 'Yoast Meta Description', 'Yoast Focus Keyword', 'Yoast Canonical', 'Open Graph'],
  anomalies: [
    '12 个页面缺少 Meta Description',
    '8 个产品页没有设置 Focus Keyword',
    '3 个页面存在重复 Title',
    '首页 H1 与 SEO Title 不一致',
    '5 个图片缺少 ALT 标签',
  ],
}
