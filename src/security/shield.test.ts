import test from 'node:test';
import assert from 'node:assert/strict';
import { esc, cleanInput, safeImgUrl, RateGuard } from './shield';
import { sanitizeSystemMessage, classifyNotifMessage, formatInteractionSummary } from '../app/notif-helpers';

test('esc escapes HTML special characters safely', () => {
  assert.equal(esc('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  assert.equal(esc("a'b`c&d"), 'a&#39;b&#96;c&amp;d');
  assert.equal(esc(null), '');
});

test('cleanInput trims, strips control chars, and enforces max length', () => {
  assert.equal(cleanInput('  مرحبا\u0000 بالعالم  '), 'مرحبا بالعالم');
  assert.equal(cleanInput('1234567890', 5), '12345');
});

test('safeImgUrl allows valid data images and https URLs while rejecting svg/javascript', () => {
  assert.equal(safeImgUrl('javascript:alert(1)'), '');
  assert.equal(safeImgUrl('data:image/svg+xml;base64,PHN2Zz4='), '');
  assert.equal(safeImgUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'), 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA');
  assert.equal(safeImgUrl('https://story-97cf7.web.app/assets/icon-192.png'), 'https://story-97cf7.web.app/assets/icon-192.png');
});

test('RateGuard limits repeated actions within window', () => {
  const key = 'test_action_' + Date.now();
  assert.equal(RateGuard.allow(key, 2, 5000), true);
  assert.equal(RateGuard.allow(key, 2, 5000), true);
  assert.equal(RateGuard.allow(key, 2, 5000), false);
});

test('sanitizeSystemMessage removes technical Firebase error codes cleanly', () => {
  assert.equal(
    sanitizeSystemMessage('معرفناش نسجّل دخولك بجوجل (auth/unauthorized-domain)'),
    'معرفناش نسجّل دخولك بجوجل'
  );
  assert.equal(
    sanitizeSystemMessage('حصلت مشكلة وإحنا بننشر الطلب (permission-denied)'),
    'حصلت مشكلة وإحنا بننشر الطلب'
  );
});

test('classifyNotifMessage assigns visual icon and badge by category', () => {
  const pub = classifyNotifMessage('طلبك اتنشر على وصلة وبقى ظاهر للكل دلوقتي!');
  assert.equal(pub.kind, 'publish');
  assert.equal(pub.icon, 'rocket');

  const inter = classifyNotifMessage(formatInteractionSummary(5, 'سباك يركب خلاط'));
  assert.equal(inter.kind, 'interaction');
  assert.equal(inter.icon, 'sparkle');
  assert.ok(inter.cleanTitle.includes('5 أشخاص'));

  const alert = classifyNotifMessage('معرفناش نسجّل دخولك بجوجل (auth/popup-blocked)');
  assert.equal(alert.kind, 'alert');
  assert.equal(alert.icon, 'warn');
});
