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
  const stamp = Date.now();
  const proposalName = `QA Test Skill ${stamp}`;
  let createdProposalId = null;

  try {
    // Login candidate
    await login(page, 'candidate@jobhub.vn');

    // TC1: candidate POST proposal → 201
    console.log('\n=== TC1: candidate POST /skill-proposals ===');
    const tc1 = await apiCall(page, 'POST', '/api/skill-proposals', {
      name: proposalName,
      category: 'IT',
      reason: 'QA automated test',
    });
    const tc1pass = tc1.status === 201 && tc1.data?.id && tc1.data?.status === 'PENDING';
    createdProposalId = tc1.data?.id;
    console.log(`  status=${tc1.status} id=${createdProposalId} proposalStatus=${tc1.data?.status}  ${tc1pass ? '✓' : '✗'}`);
    results.push(['TC1 candidate POST proposal 201', tc1pass]);

    // TC2: duplicate (already pending) → 409
    console.log('\n=== TC2: duplicate proposal → 409 ===');
    const tc2 = await apiCall(page, 'POST', '/api/skill-proposals', {
      name: proposalName,
      category: 'IT',
    });
    const tc2pass = tc2.status === 409 && tc2.data?.code === 'PROPOSAL_PENDING';
    console.log(`  status=${tc2.status} code=${tc2.data?.code}  ${tc2pass ? '✓' : '✗'}`);
    results.push(['TC2 duplicate proposal 409', tc2pass]);

    // TC3: existing skill name → 409
    console.log('\n=== TC3: propose existing skill "React" → 409 ===');
    const tc3 = await apiCall(page, 'POST', '/api/skill-proposals', { name: 'React', category: 'IT' });
    const tc3pass = tc3.status === 409 && tc3.data?.code === 'SKILL_EXISTS';
    console.log(`  status=${tc3.status} code=${tc3.data?.code}  ${tc3pass ? '✓' : '✗'}`);
    results.push(['TC3 existing skill 409', tc3pass]);

    // TC4: GET /mine includes new proposal
    console.log('\n=== TC4: GET /mine includes new proposal ===');
    const tc4 = await apiCall(page, 'GET', '/api/skill-proposals/mine');
    const tc4pass = tc4.status === 200 && Array.isArray(tc4.data) && tc4.data.some((p) => p.id === createdProposalId);
    console.log(`  status=${tc4.status} found=${tc4pass}  ${tc4pass ? '✓' : '✗'}`);
    results.push(['TC4 GET /mine includes new proposal', tc4pass]);

    // Render propose page
    console.log('\n=== TC5: /candidate/skills/propose renders form + mine list ===');
    await page.goto(BASE + '/candidate/skills/propose?q=Test', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const formInput = await page.locator('input[placeholder*="Figma" i]').count();
    const submitBtn = await page.getByRole('button', { name: /Gửi đề xuất/i }).count();
    const tc5pass = formInput > 0 && submitBtn > 0;
    console.log(`  formInput=${formInput} submitBtn=${submitBtn}  ${tc5pass ? '✓' : '✗'}`);
    await page.screenshot({ path: 'screenshots/qa_skillP5_TC5_candidate_propose.png', fullPage: true });
    results.push(['TC5 propose page renders + prefill', tc5pass]);

    // Logout, login admin
    await page.context().clearCookies();
    await login(page, 'admin@jobhub.vn');

    // TC6: admin GET pending sees new proposal
    console.log('\n=== TC6: admin GET /admin?status=PENDING sees new proposal ===');
    const tc6 = await apiCall(page, 'GET', '/api/skill-proposals/admin?status=PENDING&limit=100');
    const tc6pass = tc6.status === 200 && tc6.data?.items?.some((p) => p.id === createdProposalId);
    console.log(`  status=${tc6.status} total=${tc6.data?.total} found=${tc6pass}  ${tc6pass ? '✓' : '✗'}`);
    results.push(['TC6 admin sees PENDING proposal', tc6pass]);

    // TC7: admin approve → Skill created + status APPROVED
    console.log('\n=== TC7: admin approve → Skill xuất hiện trong bank ===');
    const tc7a = await apiCall(page, 'PATCH', `/api/skill-proposals/admin/${createdProposalId}/approve`, { adminNote: 'QA approve' });
    await page.waitForTimeout(500);
    const tc7b = await page.evaluate(async (q) => {
      const r = await fetch(`/api/skills/search?q=${encodeURIComponent(q)}`);
      return { status: r.status, data: await r.json().catch(() => null) };
    }, proposalName);
    const tc7pass = tc7a.status === 200 && tc7a.data?.proposal?.status === 'APPROVED' && tc7a.data?.skill?.id
      && tc7b.status === 200 && Array.isArray(tc7b.data) && tc7b.data.some((s) => s.nameVi === proposalName);
    console.log(`  approve status=${tc7a.status} newSkillId=${tc7a.data?.skill?.id} foundInBank=${tc7b.data?.some?.((s) => s.nameVi === proposalName)}  ${tc7pass ? '✓' : '✗'}`);
    results.push(['TC7 admin approve creates Skill', tc7pass]);

    // TC8: mobile 375 propose page
    console.log('\n=== TC8: Mobile 375 candidate propose no overflow ===');
    await page.context().clearCookies();
    await login(page, 'candidate@jobhub.vn');
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(BASE + '/candidate/skills/propose', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const tc8pass = bodyW <= 400;
    console.log(`  bodyW=${bodyW}  ${tc8pass ? '✓' : '✗'}`);
    await page.screenshot({ path: 'screenshots/qa_skillP5_TC8_mobile.png', fullPage: true });
    results.push(['TC8 mobile 375 no overflow', tc8pass]);

  } catch (e) {
    console.error('FATAL:', e.message);
    await page.screenshot({ path: 'screenshots/qa_skillP5_FATAL.png' }).catch(() => {});
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
