import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectEgyptianCarrier,
  formatDistanceAndEta,
  findNearestLocation,
  encodeLocationPinMsg,
  encodeDealHandshakeMsg,
  parseSpecialChatMessage,
  groupNotificationsSmart,
  hasCompletedDealBetween
} from './ux-enhancements';

test('detectEgyptianCarrier detects Vodafone, Etisalat, Orange, WE and normalizes Arabic numerals', () => {
  const vf = detectEgyptianCarrier('٠١٠١٢٣٤٥٦٧٨');
  assert.equal(vf.cleanDigits, '01012345678');
  assert.equal(vf.carrier, 'فودافون');
  assert.equal(vf.formatted, '010 1234 5678');
  assert.equal(vf.isValid, true);

  const et = detectEgyptianCarrier('+201198765432');
  assert.equal(et.carrier, 'اتصالات e&');
  assert.equal(et.isValid, true);

  const or = detectEgyptianCarrier('012345');
  assert.equal(or.carrier, 'أورانج');
  assert.equal(or.isComplete, false);
  assert.equal(or.isValid, false);

  const we = detectEgyptianCarrier('01555555555');
  assert.equal(we.carrier, 'وي WE');
  assert.equal(we.isValid, true);
});

test('formatDistanceAndEta calculates distance and estimated minutes accurately', () => {
  const near = formatDistanceAndEta(0.4);
  assert.ok(near.short.includes('أقل من كيلو'));
  assert.ok(near.mins >= 2);

  const mid = formatDistanceAndEta(2.5);
  assert.ok(mid.short.includes('2.5 كم'));
  assert.ok(mid.short.includes('دقايق'));
});

test('findNearestLocation finds nearest Egyptian governorate and city from GPS coordinates', () => {
  const cityXY = {
    'مدينة نصر': [30.06, 31.34],
    'المنصورة': [31.04, 31.38]
  };
  const govXY = {
    'القاهرة': [30.04, 31.24],
    'الدقهلية': [31.04, 31.38]
  };
  const res = findNearestLocation(30.058, 31.339, cityXY, govXY, c => (c === 'مدينة نصر' ? 'القاهرة' : 'الدقهلية'));
  assert.ok(res);
  assert.equal(res.g, 'القاهرة');
  assert.equal(res.c, 'مدينة نصر');
});

test('encode and parse special chat messages for location pin and deal handshake cards', () => {
  const pinRaw = encodeLocationPinMsg(30.0444, 31.2357, 'شارع التحرير - الدقي');
  const parsedPin = parseSpecialChatMessage(pinRaw);
  assert.equal(parsedPin.type, 'pin');
  assert.equal(parsedPin.lat, 30.0444);
  assert.equal(parsedPin.lng, 31.2357);
  assert.ok(parsedPin.mapUrl?.includes('30.0444,31.2357'));

  const dealRaw = encodeDealHandshakeMsg(450, 'اليوم الساعة 5 م', 'تركيب خلاط وصيانة سباكة', 'pending');
  const parsedDeal = parseSpecialChatMessage(dealRaw);
  assert.equal(parsedDeal.type, 'deal');
  assert.equal(parsedDeal.price, 450);
  assert.equal(parsedDeal.when, 'اليوم الساعة 5 م');
  assert.equal(parsedDeal.dealStatus, 'pending');
});

test('hasCompletedDealBetween strictly blocks chat-only or uncompleted requests and allows completed requests', () => {
  const myUid = 'user_1';
  const provUid = 'prov_2';

  // Only open request -> must NOT allow reporting/warning
  const openReqs = [
    { id: 'r1', mine: true, ownerId: myUid, rawStatus: 'open', t: 'تصليح تكييف', offers: [{ providerId: provUid, s: 1 }] }
  ];
  assert.equal(hasCompletedDealBetween(myUid, provUid, openReqs, []), null);

  // Completed request -> MUST allow reporting/warning
  const completedReqs = [
    { id: 'r2', mine: true, ownerId: myUid, rawStatus: 'completed', completedProviderId: provUid, t: 'تأسيس سباكة', offers: [] }
  ];
  const proof = hasCompletedDealBetween(myUid, provUid, completedReqs, []);
  assert.ok(proof);
  assert.equal(proof.ok, true);
  assert.ok(proof.label.includes('تأسيس سباكة'));
});

test('groupNotificationsSmart groups notifications for the same request', () => {
  const list = [
    { id: 'n1', reqId: 'r10', kind: 'interaction', txt: 'عرض 1', count: 2 },
    { id: 'n2', reqId: 'r10', kind: 'interaction', txt: 'عرض 2', count: 3 },
    { id: 'n3', reqId: '', kind: 'system', txt: 'تنبيه نظام' }
  ];
  const grouped = groupNotificationsSmart(list);
  assert.equal(grouped.length, 2);
  assert.equal(grouped[0].count, 3);
  assert.ok(grouped[0].actors.length >= 2);
});
