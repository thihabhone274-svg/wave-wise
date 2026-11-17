const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadStoreModule() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'store.js'), 'utf8');
  const context = {
    window: { __MTP_LIKES: {}, __MTP_SYNC: null, __MTP_USER: null },
    API: { services: { get: () => null }, plans: {} },
    MTPStorage: { forUser: (k, uid) => `${k}:${uid || 'anon'}`, get: () => [], set: () => {} },
    console
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context;
}

test('normalizes activity timing from selectedVariant and computes end time from duration', () => {
  const context = loadStoreModule();
  const item = context.normalizePlannerItem({
    category: 'Activity',
    name: 'Sunset Cruise',
    selectedVariant: { id: 'v1', startTime: '10:30', duration: '90 minutes' }
  });

  assert.equal(item.startTime, '10:30');
  assert.equal(item.duration, '90 minutes');
  assert.equal(item.endTime, '12:00');
});

test('only warns when activity windows truly overlap', () => {
  const context = loadStoreModule();

  const nonOverlapPlan = {
    budget: 500000,
    items: [
      { category: 'Activity', name: 'Morning Walk', date: '2026-08-10', startTime: '10:00', endTime: '11:00' },
      { category: 'Activity', name: 'Lunch Break', date: '2026-08-10', startTime: '11:00', endTime: '12:00' }
    ]
  };
  const nonOverlapWarnings = context.Compute.warnings(nonOverlapPlan);
  assert.equal(nonOverlapWarnings.filter(w => w.title === 'Time overlap').length, 0);

  const overlapPlan = {
    budget: 500000,
    items: [
      { category: 'Activity', name: 'Morning Walk', date: '2026-08-10', startTime: '10:00', endTime: '12:00' },
      { category: 'Activity', name: 'Lunch Break', date: '2026-08-10', startTime: '11:00', endTime: '13:00' }
    ]
  };
  const overlapWarnings = context.Compute.warnings(overlapPlan);
  assert.equal(overlapWarnings.filter(w => w.title === 'Time overlap').length, 1);
});
