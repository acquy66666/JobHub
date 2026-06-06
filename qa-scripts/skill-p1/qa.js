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
    const refreshData = await refreshRes.json().catch(() => ({}));
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
    // TC0: /skills/search public (no auth)
    console.log('\n=== TC0: /skills/search public ===');
    await page.goto(BASE);
    const tc0 = await page.evaluate(async () => {
      const r = await fetch('/api/skills/search?q=react');
      return { status: r.status, data: await r.json().catch(() => null) };
    });
    const tc0pass = tc0.status === 200 && Array.isArray(tc0.data) && tc0.data.some((s) => s.slug === 'react');
    console.log(`  status=${tc0.status} len=${tc0.data?.length} found react=${tc0.data?.some((s) => s.slug === 'react')}  ${tc0pass ? '✓' : '✗'}`);
    results.push(['TC0 /skills/search public 200', tc0pass]);

    // TC1: /skills/by-category public
    console.log('\n=== TC1: /skills/by-category groups ===');
    const tc1 = await page.evaluate(async () => {
      const r = await fetch('/api/skills/by-category');
      return { status: r.status, data: await r.json().catch(() => null) };
    });
    const cats = tc1.data ? Object.keys(tc1.data) : [];
    const total = tc1.data ? Object.values(tc1.data).reduce((n, list) => n + list.length, 0) : 0;
    const tc1pass = tc1.status === 200 && cats.length === 10 && total >= 160;
    console.log(`  status=${tc1.status} categories=${cats.length} total skills=${total}  ${tc1pass ? '✓' : '✗'}`);
    results.push(['TC1 /skills/by-category 10 groups 160+ total', tc1pass]);

    // Login candidate
    await login(page, 'candidate@jobhub.vn');

    // TC2: Profile page renders combobox
    console.log('\n=== TC2: /candidate/profile SkillCombobox render ===');
    await page.goto(BASE + '/candidate/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const tc2input = await page.locator('input[placeholder*="kỹ năng" i]').count();
    const tc2pass = tc2input > 0;
    console.log(`  combobox input count=${tc2input}  ${tc2pass ? '✓' : '✗'}`);
    await page.screenshot({ path: 'screenshots/qa_skillP1_TC2_profile.png', fullPage: true });
    results.push(['TC2 SkillCombobox renders on profile', tc2pass]);

    // TC3: Fuzzy search trong combobox + chọn skill
    console.log('\n=== TC3: Fuzzy search "rea" → React picks ===');
    const input = page.locator('input[placeholder*="kỹ năng" i]').first();
    await input.click();
    await input.fill('rea');
    await page.waitForTimeout(800);
    const reactBtnVisible = await page.getByRole('button', { name: /^React( ·|$)/ }).count();
    let tc3pass = false;
    if (reactBtnVisible > 0) {
      await page.getByRole('button', { name: /^React( ·|$)/ }).first().click();
      await page.waitForTimeout(500);
      await input.fill('');
      const chip = await page.locator('text=/^React$/').count();
      tc3pass = chip > 0;
    }
    console.log(`  react button visible=${reactBtnVisible} chip after pick=${tc3pass}  ${tc3pass ? '✓' : '✗'}`);
    await page.screenshot({ path: 'screenshots/qa_skillP1_TC3_fuzzy.png', fullPage: true });
    results.push(['TC3 fuzzy "rea" → React selectable', tc3pass]);

    // TC4: Save profile via API with valid slugs → reload reads back
    console.log('\n=== TC4: PUT profile with valid slugs persists ===');
    const saveRes = await apiCall(page, 'PUT', '/api/candidate/profile', {
      skills: ['react', 'typescript', 'tieng-anh'],
    });
    let tc4pass = false;
    if (saveRes.status === 200) {
      const getRes = await apiCall(page, 'GET', '/api/candidate/profile');
      const saved = getRes.data?.skills ?? [];
      tc4pass = ['react', 'typescript', 'tieng-anh'].every((s) => saved.includes(s));
      console.log(`  save status=${saveRes.status} reload skills=${JSON.stringify(saved)}  ${tc4pass ? '✓' : '✗'}`);
    } else {
      console.log(`  save status=${saveRes.status} msg=${saveRes.data?.message}  ✗`);
    }
    results.push(['TC4 save+reload valid slugs persist', tc4pass]);

    // TC5: Strict reject invalid slug
    console.log('\n=== TC5: PUT profile with fake slug → 422 ===');
    const badRes = await apiCall(page, 'PUT', '/api/candidate/profile', {
      skills: ['react', 'fake-skill-xyz-123'],
    });
    const tc5pass = badRes.status === 422 && badRes.data?.code === 'INVALID_SKILLS' && Array.isArray(badRes.data?.invalidSkills);
    console.log(`  status=${badRes.status} code=${badRes.data?.code} invalid=${JSON.stringify(badRes.data?.invalidSkills)}  ${tc5pass ? '✓' : '✗'}`);
    results.push(['TC5 strict reject fake slug 422', tc5pass]);

    // TC6: Mobile 375
    console.log('\n=== TC6: Mobile 375 combobox no overflow ===');
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(BASE + '/candidate/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const tc6pass = bodyW <= 400;
    console.log(`  bodyW=${bodyW}  ${tc6pass ? '✓' : '✗'}`);
    await page.screenshot({ path: 'screenshots/qa_skillP1_TC6_mobile.png', fullPage: true });
    results.push(['TC6 mobile 375 no overflow', tc6pass]);

  } catch (e) {
    console.error('FATAL:', e.message);
    await page.screenshot({ path: 'screenshots/qa_skillP1_FATAL.png' }).catch(() => {});
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
