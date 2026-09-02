const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseUrl = process.env.TEST_BOOKING_URL || 'http://localhost:3000/book/local-shifting';
const debugPort = Number(process.env.CHROME_DEBUG_PORT || Math.floor(12000 + Math.random() * 20000));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, attempts = 40) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw lastError;
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

function createCdp(ws) {
  let id = 0;
  const pending = new Map();
  const events = [];

  ws.on('message', (raw) => {
    const message = JSON.parse(raw.toString());
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result || {});
      return;
    }
    events.push(message);
  });
  ws.on('close', () => {
    for (const { reject } of pending.values()) reject(new Error('Chrome DevTools websocket closed'));
    pending.clear();
  });
  ws.on('error', (error) => {
    for (const { reject } of pending.values()) reject(error);
    pending.clear();
  });

  const send = (method, params = {}) => {
    const messageId = ++id;
    ws.send(JSON.stringify({ id: messageId, method, params }));
    return new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }));
  };

  return { send, events };
}

async function waitForLoad(cdp) {
  await sleep(500);
  for (let i = 0; i < 80; i += 1) {
    const result = await cdp.send('Runtime.evaluate', {
      expression: 'document.readyState',
      returnByValue: true,
    });
    if (result.result?.value === 'complete') {
      await sleep(700);
      return;
    }
    await sleep(250);
  }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
  return result.result?.value;
}

let catalogItem = null;

async function loadCatalogItem() {
  try {
    const response = await fetch('http://localhost:5000/api/items/catalog');
    const payload = await response.json();
    const section = (payload.data || payload.sections || payload || []).find((entry) => entry?.groups?.length);
    const group = section?.groups?.find((entry) => entry?.items?.length);
    const item = group?.items?.[0];
    if (!section || !group || !item) return null;
    const size = item.sizes?.[0] || {};
    const variant = size._id || size.sizeId?._id || size.sizeId || size.sizeKey || 'standard';
    return {
      itemId: item._id,
      _id: item._id,
      itemKey: `${item._id}:${variant}`,
      key: `${item._id}:${variant}`,
      name: item.name || 'Catalog Test Item',
      quantity: 2,
      tag: group.name || item.group || 'Catalog Group',
      groupId: group._id,
      sectionId: section._id,
      categoryId: section._id,
      sizeId: size._id || size.sizeId || size.sizeKey || 'standard',
      sizeVariantId: size._id,
      sizeKey: size.sizeKey || size.label,
      tag: size.sizeKey || size.label || group.name || 'Catalog Group',
      unitPrice: Number(size.price) || 0,
      price: Number(size.price) || 0,
      size: size.label || size.size || 'Standard',
    };
  } catch {
    return null;
  }
}

function bookingDataFor(step) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const scheduledDate = tomorrow.toISOString().slice(0, 10);

  return {
    serviceType: 'local',
    bookingId: 'TEST-DRAFT-REFRESH',
    draftToken: 'test-draft-token',
    pricingRule: { _id: 'test-pricing-rule', serviceType: 'local_shifting' },
    pickupLocation: {
      address: 'Test Pickup, Surat',
      floor: 1,
      liftAvailable: true,
      lat: 21.1702,
      lng: 72.8311,
      manual: true,
    },
    dropLocation: {
      address: 'Test Drop, Surat',
      floor: 2,
      liftAvailable: false,
      lat: 21.1902,
      lng: 72.8511,
      manual: true,
    },
    items: step >= 1 ? [catalogItem || {
      itemId: 'test-item-1',
      _id: 'test-item-1',
      itemKey: 'test-item-1:test-size-1',
      key: 'test-item-1:test-size-1',
      name: 'Test Sofa',
      quantity: 2,
      tag: 'Sofa',
      groupId: 'test-group-1',
      sectionId: 'test-section-1',
      sizeId: 'test-size-1',
      size: 'Standard',
    }] : [],
    specialServices: step >= 4 ? [{
      addonId: 'test-addon-1',
      key: 'test-addon',
      name: 'Test Packing',
      quantity: 1,
      price: 100,
      unit: 'global',
    }] : [],
    scheduledDate: step >= 4 ? scheduledDate : null,
    timeSlot: step >= 4 ? 'morning' : null,
    contactDetails: step >= 5 ? {
      name: 'Refresh Test',
      email: 'refresh@example.com',
      mobile: '9876543210',
    } : { name: '', email: '', mobile: '' },
  };
}

const stepExpectations = [
  { step: 1, name: 'Item Selection', marker: 'Select Items to Move', dataMarkers: ['selected item'] },
  { step: 2, name: 'Add-ons', marker: 'Add-on Services', dataMarkers: ['selected item'] },
  { step: 3, name: 'Schedule', marker: 'Schedule Your Move', dataMarkers: ['selected item'] },
  { step: 4, name: 'Review', marker: 'Review your booking details', dataMarkers: ['selected item', 'Test Packing', 'Test Pickup, Surat'] },
  { step: 5, name: 'Verify OTP', marker: 'Verify & Confirm Booking', dataMarkers: ['Refresh Test', '9876543210'] },
];

async function setDraftAndReload(cdp, step, ignoreCache = false) {
  const payload = JSON.stringify({ state: { currentStep: step, bookingData: bookingDataFor(step) }, version: 1 });
  await evaluate(cdp, `localStorage.setItem('tithi_booking_draft', ${JSON.stringify(payload)})`);
  await cdp.send('Page.reload', { ignoreCache });
  await waitForLoad(cdp);
}

async function setDraft(cdp, step) {
  const payload = JSON.stringify({ state: { currentStep: step, bookingData: bookingDataFor(step) }, version: 1 });
  await evaluate(cdp, `localStorage.setItem('tithi_booking_draft', ${JSON.stringify(payload)})`);
}

async function setDraftData(cdp, step, bookingData) {
  const payload = JSON.stringify({ state: { currentStep: step, bookingData }, version: 1 });
  await evaluate(cdp, `localStorage.setItem('tithi_booking_draft', ${JSON.stringify(payload)})`);
}

async function waitForCondition(cdp, expression, attempts = 40) {
  let lastValue;
  for (let index = 0; index < attempts; index += 1) {
    lastValue = await evaluate(cdp, expression);
    if (lastValue) return lastValue;
    await sleep(250);
  }
  return lastValue;
}

async function observe(cdp) {
  return evaluate(cdp, `(() => {
    const text = document.body.innerText;
    const raw = localStorage.getItem('tithi_booking_draft');
    let parsed = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch {}
    const markers = {
      location: text.includes('Pickup Location') || text.includes('Pickup / Work Location'),
      items: text.includes('Select Items to Move'),
      addons: text.includes('Add-on Services'),
      schedule: text.includes('Schedule Your Move'),
      review: text.includes('Review your booking details'),
      otp: text.includes('Verify & Confirm Booking'),
      fallback: text.includes('Restoring your booking'),
    };
    return {
      url: location.href,
      markers,
      currentStep: parsed?.state?.currentStep ?? null,
      hasPickup: text.includes('Test Pickup, Surat') || Boolean(parsed?.state?.bookingData?.pickupLocation?.address),
      hasDrop: text.includes('Test Drop, Surat') || Boolean(parsed?.state?.bookingData?.dropLocation?.address),
      hasItem: (parsed?.state?.bookingData?.items || []).some((item) => Number(item.quantity || 0) > 0),
      hasAddon: text.includes('Test Packing') || (parsed?.state?.bookingData?.specialServices || []).some((item) => item.name === 'Test Packing'),
      bodySample: text.slice(0, 900),
    };
  })()`);
}

async function testRealItemSelectionPersistence(cdp) {
  await setDraftData(cdp, 1, { ...bookingDataFor(1), items: [] });
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForLoad(cdp);
  await waitForCondition(cdp, `document.body.innerText.includes('Select Items to Move') && document.querySelectorAll('.booking-group-toggle').length > 0`);
  await evaluate(cdp, `(() => {
    document.querySelector('.booking-group-toggle')?.click();
    return true;
  })()`);
  await waitForCondition(cdp, `document.querySelectorAll('.booking-item-add').length >= 3`);
  const clicked = await evaluate(cdp, `(() => {
    const buttons = [...document.querySelectorAll('.booking-item-add')].slice(0, 4);
    buttons.forEach((button) => button.click());
    return buttons.length;
  })()`);
  await waitForCondition(cdp, `(() => {
    const raw = localStorage.getItem('tithi_booking_draft');
    const parsed = raw ? JSON.parse(raw) : null;
    return (parsed?.state?.bookingData?.items || []).length >= Math.min(3, ${clicked});
  })()`);
  const beforeReload = await observeSelectionState(cdp);
  await cdp.send('Page.reload', { ignoreCache: false });
  await waitForLoad(cdp);
  const afterReload = await observeSelectionState(cdp);
  return { clicked, beforeReload, afterReload };
}

async function testRealAddonPersistence(cdp) {
  await setDraft(cdp, 2);
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForLoad(cdp);
  const clicked = await evaluate(cdp, `(() => {
    const button = [...document.querySelectorAll('button')].find((entry) => entry.innerText.trim() === 'Add service');
    button?.click();
    return Boolean(button);
  })()`);
  await waitForCondition(cdp, `(() => {
    const raw = localStorage.getItem('tithi_booking_draft');
    const parsed = raw ? JSON.parse(raw) : null;
    return (parsed?.state?.bookingData?.specialServices || []).length > 0;
  })()`);
  const beforeReload = await observeSelectionState(cdp);
  await cdp.send('Page.reload', { ignoreCache: false });
  await waitForLoad(cdp);
  const afterReload = await observeSelectionState(cdp);
  return { clicked, beforeReload, afterReload };
}

async function testRealSchedulePersistence(cdp) {
  await setDraft(cdp, 3);
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForLoad(cdp);
  await evaluate(cdp, `(() => {
    const day = [...document.querySelectorAll('button.calendar-day:not(:disabled)')].find((button) => /^\\d+$/.test(button.innerText.trim()));
    day?.click();
    const morning = [...document.querySelectorAll('button')].find((button) => button.innerText.includes('Morning') && button.innerText.includes('7:00 AM'));
    morning?.click();
    return true;
  })()`);
  await waitForCondition(cdp, `(() => {
    const raw = localStorage.getItem('tithi_booking_draft');
    const parsed = raw ? JSON.parse(raw) : null;
    const data = parsed?.state?.bookingData || {};
    return Boolean(data.scheduledDate && data.timeSlot);
  })()`);
  const beforeReload = await observeSelectionState(cdp);
  await cdp.send('Page.reload', { ignoreCache: false });
  await waitForLoad(cdp);
  const afterReload = await observeSelectionState(cdp);
  return { beforeReload, afterReload };
}

async function testMapPickerAvailability(cdp) {
  await setDraft(cdp, 0);
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForLoad(cdp);
  const opened = await evaluate(cdp, `(() => {
    const button = [...document.querySelectorAll('button')].find((entry) => entry.innerText.includes('Choose from map'));
    button?.click();
    return Boolean(button);
  })()`);
  await sleep(5000);
  const observed = await evaluate(cdp, `(() => {
    const text = document.body.innerText;
    const modalOpen = text.includes('Choose location from map') || text.includes('Pan the map until the fixed pin');
    const errorLines = text.split('\\n').filter((line) => /Google Maps|Maps API|location|address|denied|too long|unavailable/i.test(line)).slice(0, 12);
    return { opened: ${opened}, modalOpen, errorLines, bodySample: text.slice(0, 900) };
  })()`);
  return observed;
}

async function observeSelectionState(cdp) {
  return evaluate(cdp, `(() => {
    const text = document.body.innerText;
    const raw = localStorage.getItem('tithi_booking_draft');
    let parsed = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch {}
    const data = parsed?.state?.bookingData || {};
    return {
      currentStep: parsed?.state?.currentStep ?? null,
      itemCount: (data.items || []).length,
      itemQuantities: (data.items || []).map((item) => ({ name: item.name, quantity: item.quantity })),
      specialServices: (data.specialServices || []).map((item) => ({ name: item.name, quantity: item.quantity })),
      scheduledDate: data.scheduledDate || null,
      timeSlot: data.timeSlot || null,
      hasSelectedText: text.includes('Selected (') || text.includes('Selected Add-ons') || text.includes('Selected'),
      bodySample: text.slice(0, 900),
    };
  })()`);
}

function findConsoleIssues(events) {
  return events
    .filter((event) => ['Runtime.exceptionThrown', 'Log.entryAdded'].includes(event.method))
    .map((event) => event.params?.entry?.text || event.params?.exceptionDetails?.text || JSON.stringify(event.params))
    .filter(Boolean);
}

async function main() {
  console.error(`Starting booking refresh CDP verification on ${baseUrl}`);
  if (!fs.existsSync(chromePath)) throw new Error(`Chrome not found: ${chromePath}`);
  catalogItem = await loadCatalogItem();
  console.error(`Catalog seed item: ${catalogItem?.name || 'fallback item'}`);

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'booking-refresh-cdp-'));
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-sandbox',
    '--disable-background-networking',
    '--disable-gpu',
    '--disable-gpu-compositing',
    '--disable-gpu-sandbox',
    '--disable-software-rasterizer',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-features=UseSkiaRenderer,VizDisplayCompositor',
    '--use-gl=disabled',
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  chrome.stderr.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text) console.error(`[chrome] ${text}`);
  });
  console.error(`Chrome launched on debug port ${debugPort}`);

  try {
    await getJson(`http://127.0.0.1:${debugPort}/json/version`);
    console.error('Chrome debug endpoint is ready');
    const targetResponse = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' });
    if (!targetResponse.ok) throw new Error(`Could not create Chrome page target: HTTP ${targetResponse.status}`);
    const target = await targetResponse.json();
    const ws = await connect(target.webSocketDebuggerUrl);
    console.error('Connected to Chrome page target');
    const cdp = createCdp(ws);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');

    await cdp.send('Page.navigate', { url: baseUrl });
    await waitForLoad(cdp);
    console.error('Initial booking page loaded');

    const results = [];

    results.push({ test: 'real-item-click-persistence', observed: await testRealItemSelectionPersistence(cdp) });
    console.error('Real item click persistence test complete');

    results.push({ test: 'real-addon-click-persistence', observed: await testRealAddonPersistence(cdp) });
    console.error('Real add-on click persistence test complete');

    results.push({ test: 'real-schedule-click-persistence', observed: await testRealSchedulePersistence(cdp) });
    console.error('Real schedule click persistence test complete');

    results.push({ test: 'map-picker-availability', observed: await testMapPickerAvailability(cdp) });
    console.error('Map picker availability test complete');

    await evaluate(cdp, `localStorage.removeItem('tithi_booking_draft')`);
    await cdp.send('Page.reload', { ignoreCache: true });
    await waitForLoad(cdp);
    results.push({ test: 'fresh-session-no-draft', observed: await observe(cdp) });
    console.error('Fresh session test complete');

    for (const expectation of stepExpectations) {
      await setDraftAndReload(cdp, expectation.step);
      const observed = await observe(cdp);
      results.push({ test: `reload-${expectation.name}`, expectation, observed });
      console.error(`Reload test complete: ${expectation.name}`);
    }

    await setDraftAndReload(cdp, 3);
    const repeated = [];
    for (let i = 0; i < 3; i += 1) {
      await cdp.send('Page.reload', { ignoreCache: false });
      await waitForLoad(cdp);
      repeated.push(await observe(cdp));
    }
    results.push({ test: 'repeat-reload-schedule', observed: repeated });
    console.error('Repeated reload test complete');

    await setDraftAndReload(cdp, 4, true);
    results.push({ test: 'hard-refresh-review', observed: await observe(cdp) });
    console.error('Hard refresh test complete');

    results.push({ test: 'console-issues', observed: findConsoleIssues(cdp.events) });

    fs.writeFileSync(path.join(process.cwd(), 'booking-refresh-cdp-report.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
    console.error(`Wrote booking-refresh-cdp-report.json with ${results.length} result groups.`);
    ws.close();
  } finally {
    chrome.kill();
    await sleep(500);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
    } catch {
      // Chrome can keep Crashpad metrics files locked briefly on Windows.
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
