import test from 'node:test';
import assert from 'node:assert/strict';
import {brandFromWebsite,createFreeVision} from './free-vision.mjs';

test('derives a readable placeholder brand from an existing website',()=>{
  assert.equal(brandFromWebsite('https://www.stromation.com/work'),'Stromation');
  assert.equal(brandFromWebsite('north-line.co'),'North Line');
});

test('creates a zero-network vision using only explicit brief fields',()=>{
  const vision=createFreeVision({projectMode:'existing',website:'https://stromation.com/',changeNotes:'Make the offer bold and easier to understand.'});
  assert.equal(vision.brand,'Stromation');
  assert.equal(vision.domain,'stromation.com');
  assert.match(vision.requested,/offer bold/);
  assert.equal(vision.signals.length,3);
});

test('changes the visual argument from the selected feeling',()=>{
  assert.equal(createFreeVision({business:'Acme',feelings:['Warm']}).theme,'editorial');
  assert.equal(createFreeVision({business:'Acme',feelings:['Bold']}).theme,'kinetic');
  assert.equal(createFreeVision({business:'Acme',industry:'Technology product'}).theme,'system');
});

test('keeps customer text compact for the preview surface',()=>{
  const vision=createFreeVision({business:'A'.repeat(80),goal:'x'.repeat(300)});
  assert.ok(vision.brand.length<=40);assert.ok(vision.requested.length<=150);
});

test('different briefs produce different visible arguments',()=>{
  const booking=createFreeVision({business:'Halo Dental',industry:'Health and wellness',goal:'Help patients book an appointment',feelings:['Warm']});
  const sales=createFreeVision({business:'Forge Supply',industry:'Technology product',goal:'Sell equipment to plant managers',feelings:['Technical']});
  assert.notDeepEqual([booking.headline,booking.summary,booking.signals],[sales.headline,sales.summary,sales.signals]);
  assert.match(booking.signals.join(' '),/booking/i);
  assert.match(sales.signals.join(' '),/purchase/i);
});
