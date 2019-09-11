import { fixture, assert, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
// import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../saved-menu.js';

describe('<saved-menu>', function() {
  async function basicFixture() {
    return await fixture(`<saved-menu style="height: 300px;" noauto></saved-menu>`);
  }

  async function draggableFixture() {
    return await fixture(`<saved-menu noauto draggableenabled></saved-menu>`);
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

  describe('_computeA11yCommand()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns passed letter with CMD/CTRL', () => {
      const result = element._computeA11yCommand('s');
      assert.isTrue(/(meta|ctrl)\+s/.test(result));
    });
  });

  describe('Basic UI', () => {
    before(async () => {
      await DataGenerator.insertSavedRequestData();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
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
      assert.equal(node.children.length, 25);
    });
  });

  describe('_scrollHandler()', () => {
    before(async () => {
      await DataGenerator.insertSavedRequestData();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
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

  describe('_openSaved()', () => {
    before(async () => {
      await DataGenerator.insertSavedRequestData();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
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
      assert.equal(spy.args[0][0].detail.type, 'saved');
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
      await DataGenerator.insertSavedRequestData();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
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
      const data = e.dataTransfer.getData('arc/saved-request');
      assert.equal(data, element.requests[0]._id);
    });

    it('Sets arc-source/saved-menu transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc-source/saved-menu');
      assert.equal(data, element.requests[0]._id);
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });
  });

  describe('_dragoverHandler()', () => {
    before(async () => {
      await DataGenerator.insertSavedRequestData();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture();
      await element._loadPage();
      await nextFrame();
    });

    function dispatch(element, types) {
      if (!types) {
        types = ['arc/request-object'];
      }
      const e = new Event('dragover', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      element.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragoverHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      dispatch(element, ['other']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Ignores event when arc/saved-request is set', () => {
      dispatch(element, ['arc/saved-request']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Sets drop-target class on the element', () => {
      dispatch(element);
      assert.isTrue(element.classList.contains('drop-target'));
    });

    it('Sets class name only once', () => {
      element.classList.add('drop-target');
      dispatch(element);
      assert.isTrue(element.classList.contains('drop-target'));
    });
  });

  describe('_dragleaveHandler()', () => {
    before(async () => {
      await DataGenerator.insertSavedRequestData();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture();
      await element._loadPage();
      await nextFrame();
    });

    function dispatch(element, types) {
      if (!types) {
        types = ['arc/request-object'];
      }
      const e = new Event('dragleave', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      element.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragleaveHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      dispatch(element, ['other']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Ignores event when arc/saved-request is set', () => {
      dispatch(element, ['arc/saved-request']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Removes drop-target class on the element', () => {
      element.classList.add('drop-target');
      dispatch(element);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Removes class name only once', () => {
      dispatch(element);
      assert.isFalse(element.classList.contains('drop-target'));
    });
  });

  describe('_dropHandler()', () => {
    before(async () => {
      await DataGenerator.insertSavedRequestData();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture();
      await element._loadPage();
      await nextFrame();
    });

    function dispatch(element, types, content) {
      if (!types) {
        types = ['arc/request-object'];
      }
      if (content === undefined) {
        content = '{"_id":"test-id", "_rev":"test-rev"}';
      }
      const e = new Event('drop', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, content);
      });
      element.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dropHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      dispatch(element, ['other']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Ignores event when arc/saved-request is set', () => {
      dispatch(element, ['arc/saved-request']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Removes drop-target class on the element', () => {
      element.classList.add('drop-target');
      dispatch(element);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Removes class name only once', () => {
      dispatch(element);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Calls _appendRequest() with request', () => {
      element._appendRequest = () => {};
      const spy = sinon.spy(element, '_appendRequest');
      dispatch(element);
      assert.deepEqual(spy.args[0][0], {
        _id: 'test-id',
        _rev: 'test-rev'
      });
    });

    it('Ignores when no request object data', () => {
      const spy = sinon.spy(element, '_appendRequest');
      dispatch(element, null, '');
      assert.isFalse(spy.called);
    });
  });

  describe('_appendRequest()', () => {
    before(async () => {
      await DataGenerator.insertSavedRequestData();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture();
      await element._loadPage();
      await nextFrame();
    });

    it('replaces `_id`', async () => {
      const obj = { _id: 'test' };
      const result = await element._appendRequest(obj);
      assert.notEqual(result._id, 'test');
    });

    it('replaces `_rev`', async () => {
      const obj = { _id: 'test', _rev: 'test' };
      const result = await element._appendRequest(obj);
      assert.notEqual(result._rev, 'test');
    });

    it('Adds default name', async () => {
      const obj = {};
      const result = await element._appendRequest(obj);
      assert.equal(result.name, 'Unnamed');
    });

    it('Keeps existing name', async () => {
      const obj = { name: 'test' };
      const result = await element._appendRequest(obj);
      assert.equal(result.name, 'test');
    });
  });

  describe('a11y', () => {
    before(async () => {
      await DataGenerator.insertSavedRequestData();
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
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
