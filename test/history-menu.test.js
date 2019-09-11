import { fixture, assert, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
// import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../history-menu.js';

describe('<history-menu>', function() {
  async function basicFixture() {
    return await fixture(`<history-menu style="height: 300px;" noauto></history-menu>`);
  }

  async function draggableFixture() {
    return await fixture(`<history-menu noauto draggableenabled></history-menu>`);
  }

  // DataTransfer polyfill
  if (typeof DataTransfer === 'undefined') {
    class DataTransfer {
      setData(type, data) {
        this._data[type] = data;
      }
      getData(type) {
        if (!this._data) {
          return null;
        }
        return this._data[type];
      }
    }
    window.DataTransfer = DataTransfer;
  }

  describe('Basic UI', () => {
    before(async () => {
      await DataGenerator.insertHistoryRequestData();
    });

    after(async () => {
      await DataGenerator.destroyHistoryData();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await element._loadPage();
    });

    it('hasRequests is set', () => {
      assert.isTrue(element.hasRequests);
    });

    it('dataUnavailable is computed', () => {
      assert.isFalse(element.dataUnavailable);
    });

    it('Empty message is not rendered', () => {
      const node = element.shadowRoot.querySelector('.empty-message');
      assert.notOk(node);
    });

    it('The list renders children', () => {
      const node = element.shadowRoot.querySelector('.list');
      // 25 items + headers
      assert.isAbove(node.children.length, 25);
    });
  });

  describe('_scrollHandler()', () => {
    before(async () => {
      await DataGenerator.insertHistoryRequestData();
    });

    after(async () => {
      await DataGenerator.destroyHistoryData();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await element._loadPage();
      await nextFrame();
    });

    it('Does nothin when querying', () => {
      element._querying = true;
      const spy = sinon.spy(element, 'loadNext');
      element._scrollHandler();
      assert.isFalse(spy.called);
    });

    it('Does nothing when scroll treshold is not reached', async () => {
      const spy = sinon.spy(element, 'loadNext');
      element._scrollHandler();
      assert.isFalse(spy.called);
    });

    it('Calls loadNext() when scroll treshold is reached', () => {
      const spy = sinon.spy(element, 'loadNext');
      const node = element.shadowRoot.querySelector('.list');
      node.scrollTop = node.scrollHeight;
      element._scrollHandler();
      assert.isTrue(spy.called);
    });
  });

  describe('_openHistory()', () => {
    before(async () => {
      await DataGenerator.insertHistoryRequestData();
    });

    after(async () => {
      await DataGenerator.destroyHistoryData();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await element._loadPage();
      await nextFrame();
    });

    it('Dispatches navigate event', () => {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      node.click();
      assert.isTrue(spy.called);
    });

    it('The event bubbles', () => {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      node.click();
      assert.isTrue(spy.args[0][0].bubbles);
    });

    it('The event has base', () => {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      node.click();
      assert.equal(spy.args[0][0].detail.base, 'request');
    });

    it('The event has type', () => {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      node.click();
      assert.equal(spy.args[0][0].detail.type, 'history');
    });

    it('The event has id', () => {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      node.click();
      assert.equal(spy.args[0][0].detail.id, element.requests[0]._id);
    });
  });

  describe('_dragStart()', () => {
    before(async () => {
      await DataGenerator.insertHistoryRequestData();
    });

    after(async () => {
      await DataGenerator.destroyHistoryData();
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture();
      await element._loadPage();
      await nextFrame();
    });

    function dispatch(element) {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const e = new Event('dragstart');
      e.dataTransfer = new DataTransfer();
      node.dispatchEvent(e);
      return e;
    }

    it('sets arc/request-object transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc/request-object');
      assert.typeOf(data, 'string');
    });

    it('Sets arc/history-request data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc/history-request');
      assert.equal(data, element.requests[0]._id);
    });

    it('Sets arc-source/history-menu transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc-source/history-menu');
      assert.equal(data, element.requests[0]._id);
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });
  });

  describe('a11y', () => {
    before(async () => {
      await DataGenerator.insertHistoryRequestData();
    });

    after(async () => {
      await DataGenerator.destroyHistoryData();
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture();
      await element._loadPage();
      await nextFrame();
    });

    it('is accessible with list items', async () => {
      await assert.isAccessible(element);
    });
  });
});
