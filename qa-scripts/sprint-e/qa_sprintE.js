const { chromium } = require('playwright');
const BASE = 'https://job-hub-two.vercel.app';
const PWD = 'Demo@2026';

async function login(page, email) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForSelector('input[type=email]', { timeout: 30000 });
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', PWD);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/auth/login'), { timeout: 60000 }),
    page.click('button[type=submit]'),
  ]);
  await page.waitForTimeout(1500);
}

async function apiCall(page, method, path, body) {
  return page.evaluate(async ({ method, path, body }) => {
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    const refreshData = await refreshRes.json();
    const at = refreshData.accessToken;
    const r = await fetch(path, {
      method,
      credentials: 'include',
      headers: {
        ...(at ? { Authorization: `Bearer ${at}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let data = null;
    try { data = await r.json(); } catch {}
    return { status: r.status, data };
  }, { method, path, body });
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const results = [];

  try {
    // TC0: API route mounted (no-auth → 401 from authGuard)
    console.log('\n=== TC0: API routes mounted (401) ===');
    await page.goto(BASE);
    const tc0a = await page.evaluate(() => fetch('/api/admin/billing/stats').then(r => r.status));
    const tc0b = await page.evaluate(() => fetch('/api/admin/coupons').then(r => r.status));
    const tc0 = tc0a === 401 && tc0b === 401;
    console.log(`  /admin/billing/stats=${tc0a}, /admin/coupons=${tc0b}  ${tc0 ? '✓' : '✗'}`);
    results.push(['TC0 API routes mounted (401)', tc0]);

    // Login admin
    await login(page, 'admin@jobhub.vn');

    // TC1: /admin/billing render 3 tabs + summary
    console.log('\n=== TC1: /admin/billing render + summary stats ===');
    await page.goto(BASE + '/admin/billing', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const tabs = await page.$$eval('button[role=tab]', (els) => els.map((e) => e.textContent?.trim()));
    const hasOverview = tabs.some((t) => t?.includes('Tổng quan'));
    const hasOrders = tabs.some((t) => t?.includes('Đơn hàng'));
    const hasGrant = tabs.some((t) => t?.includes('Cấp credit'));
    const body = await page.locator('body').innerText();
    const hasRevenueLabel = /Tổng doanh thu/i.test(body);
    const hasAvgLabel = /Giá trị TB/i.test(body);
    const tc1 = hasOverview && hasOrders && hasGrant && hasRevenueLabel && hasAvgLabel;
    console.log(`  tabs=${tabs.length} (Overview/Orders/Grant) revenue+avg labels=${hasRevenueLabel && hasAvgLabel}  ${tc1 ? '✓' : '✗'}`);
    await page.screenshot({ path: 'screenshots/qa_sprintE_TC1_billing_overview.png', fullPage: true });
    results.push(['TC1 /admin/billing 3 tabs + summary', tc1]);

    // TC2: granularity switch via preset click — verify URL param sent
    console.log('\n=== TC2: granularity preset switch triggers API ===');
    let statsParams = null;
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/admin/billing/stats') && url.includes('granularity=day')) {
        statsParams = url;
      }
    });
    // Click "7 ngày" preset
    await page.getByRole('button', { name: '7 ngày' }).click();
    await page.waitForTimeout(2000);
    const tc2 = statsParams !== null;
    console.log(`  request granularity=day captured=${tc2 ? 'yes' : 'no'}  ${tc2 ? '✓' : '✗'}`);
    results.push(['TC2 preset 7d → granularity=day', tc2]);

    // TC3: Orders tab → API call with employerId etc
    console.log('\n=== TC3: Orders tab loads ===');
    await page.getByRole('tab', { name: /Đơn hàng/ }).click();
    await page.waitForTimeout(2000);
    const ordersRes = await apiCall(page, 'GET', '/api/admin/billing/orders?page=1&limit=20');
    const tc3 = ordersRes.status === 200 && Array.isArray(ordersRes.data?.orders);
    console.log(`  orders API status=${ordersRes.status} total=${ordersRes.data?.total ?? '?'}  ${tc3 ? '✓' : '✗'}`);
    results.push(['TC3 orders API 200', tc3]);

    // TC4: Grant credits API
    console.log('\n=== TC4: Grant +2 BASIC to employer@jobhub.vn ===');
    // Find employer id
    const empRes = await apiCall(page, 'GET', '/api/admin/users?role=EMPLOYER&limit=50');
    const empUser = empRes.data?.users?.find((u) => u.email === 'employer@jobhub.vn');
    const employerId = empUser?.employer?.id;
    let tc4 = false;
    if (employerId) {
      const grantRes = await apiCall(page, 'PATCH', '/api/admin/billing/credits', {
        employerId,
        tier: 'BASIC',
        amount: 2,
        note: 'QA Sprint E grant test',
      });
      tc4 = grantRes.status === 200 && typeof grantRes.data?.basicCredits === 'number';
      console.log(`  employer.id=${employerId} grant status=${grantRes.status} basic=${grantRes.data?.basicCredits}  ${tc4 ? '✓' : '✗'}`);
    } else {
      console.log(`  ✗ employer not found`);
    }
    results.push(['TC4 grant credits PATCH 200', tc4]);

    // TC5: /admin/packages list + isActive toggle
    console.log('\n=== TC5: /admin/packages list 9 + toggle ===');
    await page.goto(BASE + '/admin/packages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const pkgRows = await page.locator('tbody tr').count();
    const tc5render = pkgRows >= 9;
    console.log(`  rows=${pkgRows} (>=9)  ${tc5render ? '✓' : '✗'}`);
    await page.screenshot({ path: 'screenshots/qa_sprintE_TC5_packages.png', fullPage: true });
    results.push(['TC5 /admin/packages list >=9', tc5render]);

    // TC6: /admin/coupons create + delete cleanup
    console.log('\n=== TC6: /admin/coupons create QA test coupon ===');
    const testCode = 'QASPRINTE' + Date.now().toString().slice(-5);
    const createRes = await apiCall(page, 'POST', '/api/admin/coupons', {
      code: testCode,
      name: 'QA test',
      discountType: 'PERCENT',
      discountValue: 5,
      bonusCredits: 0,
      perEmployerLimit: 1,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
    });
    const couponId = createRes.data?.id;
    const tc6create = createRes.status === 201 && createRes.data?.code === testCode;
    console.log(`  create status=${createRes.status} code=${createRes.data?.code}  ${tc6create ? '✓' : '✗'}`);

    await page.goto(BASE + '/admin/coupons', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const couponBody = await page.locator('body').innerText();
    const tc6visible = couponBody.includes(testCode);
    console.log(`  test code visible in list  ${tc6visible ? '✓' : '✗'}`);
    await page.screenshot({ path: 'screenshots/qa_sprintE_TC6_coupons.png', fullPage: true });

    // Cleanup: expire the test coupon
    if (couponId) {
      await apiCall(page, 'DELETE', `/api/admin/coupons/${couponId}`);
    }
    results.push(['TC6 coupon create + visible', tc6create && tc6visible]);

    // TC7: Coupon list has _count.redemptions
    console.log('\n=== TC7: Coupon list includes redemptionCount ===');
    const cListRes = await apiCall(page, 'GET', '/api/admin/coupons');
    const hasCount = Array.isArray(cListRes.data) && cListRes.data.some((c) => c._count && typeof c._count.redemptions === 'number');
    console.log(`  list len=${cListRes.data?.length} has _count.redemptions=${hasCount}  ${hasCount ? '✓' : '✗'}`);
    results.push(['TC7 coupon _count.redemptions present', hasCount]);

    // TC8: Mobile 375 — billing/packages/coupons no overflow
    console.log('\n=== TC8: Mobile 375 — 3 admin pages ===');
    await ctx.clearCookies();
    await page.setViewportSize({ width: 375, height: 800 });
    await login(page, 'admin@jobhub.vn');

    let mobileFailed = [];
    for (const path of ['/admin/billing', '/admin/packages', '/admin/coupons']) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const bodyW = await page.evaluate(() => document.body.scrollWidth);
      const ok = bodyW <= 400;
      console.log(`  ${path} bodyW=${bodyW}  ${ok ? '✓' : '✗'}`);
      if (!ok) mobileFailed.push(path);
    }
    const tc8 = mobileFailed.length === 0;
    await page.screenshot({ path: 'screenshots/qa_sprintE_TC8_mobile.png', fullPage: true });
    results.push(['TC8 mobile 375 no overflow', tc8]);

  } catch (e) {
    console.error('FATAL:', e.message);
    await page.screenshot({ path: 'screenshots/qa_sprintE_FATAL.png' }).catch(() => {});
  } finally {
    console.log('\n=== SUMMARY ===');
    let pass = 0, fail = 0;
    for (const [name, ok] of results) {
      console.log(`  ${ok ? '✓ PASS' : '✗ FAIL'}  ${name}`);
      if (ok) pass++; else fail++;
    }
    console.log(`\nTotal: ${pass} PASS / ${fail} FAIL (of ${results.length})`);
    await browser.close();
    process.exit(fail > 0 ? 1 : 0);
  }
})();
