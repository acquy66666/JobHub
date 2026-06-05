const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('https://job-hub-two.vercel.app/login');
  await page.fill('input[type=email]', 'admin@jobhub.vn');
  await page.fill('input[type=password]', 'Demo@2026');
  await Promise.all([
    page.waitForResponse(r => r.url().includes('/auth/login')),
    page.click('button[type=submit]'),
  ]);
  await page.waitForTimeout(1500);
  const r = await page.evaluate(async () => {
    const ref = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    const { accessToken } = await ref.json();
    const res = await fetch('/api/admin/users?role=EMPLOYER&limit=50', {
      headers: { Authorization: 'Bearer ' + accessToken }
    });
    return res.json();
  });
  console.log('keys:', Object.keys(r));
  console.log('users count:', r.users?.length);
  if (r.users && r.users[0]) {
    console.log('first user:', JSON.stringify(r.users[0], null, 2));
  }
  const emp = (r.users || []).find(u => u.email === 'employer@jobhub.vn');
  console.log('employer match:', emp ? 'YES' : 'NO');
  if (emp) console.log(JSON.stringify(emp, null, 2));
  await browser.close();
})();
