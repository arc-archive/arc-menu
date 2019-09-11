import { fixture, assert, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../rest-api-menu.js';

describe('<rest-api-menu>', function() {
  async function basicFixture() {
    return await fixture(html`<rest-api-menu></rest-api-menu>`);
  }

  async function dataFixture(apis) {
    return await fixture(html`<rest-api-menu
      .items="${apis}"></rest-api-menu>`);
  }

  describe('empty list', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('hasItems is false', () => {
      assert.isFalse(element.hasItems);
    });

    it('dataUnavailable is true', () => {
      assert.isTrue(element.dataUnavailable);
    });

    it('renders empty message', () => {
      const node = element.shadowRoot.querySelector('.empty-message');
      assert.ok(node);
    });
  });

  describe('list with items', () => {
    let element;
    beforeEach(async () => {
      const items = DataGenerator.generateApiIndexList();
      element = await dataFixture(items);
    });

    it('hasItems is true', () => {
      assert.isTrue(element.hasItems);
    });

    it('dataUnavailable is false', () => {
      assert.isFalse(element.dataUnavailable);
    });

    it('does not render empty message', () => {
      const node = element.shadowRoot.querySelector('.empty-message');
      assert.notOk(node);
    });

    it('renders list items', () => {
      const nodes = element.shadowRoot.querySelectorAll('anypoint-item');
      assert.lengthOf(nodes, 25);
    });

    it('dispatches navigation event when clicked', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      const node = element.shadowRoot.querySelector('anypoint-item');
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
      const detail = spy.args[0][0].detail;
      assert.equal(detail.base, 'api-console');
      assert.equal(detail.id, node.dataset.id);
      assert.equal(detail.version, element.items[0].latest);
    });
  });

  describe('reset()', () => {
    let element;
    beforeEach(async () => {
      const items = DataGenerator.generateApiIndexList();
      element = await dataFixture(items);
    });

    it('Clears nextPageToken', () => {
      element.nextPageToken = 'test';
      element.reset();
      assert.isUndefined(element.nextPageToken);
    });

    it('Clears __queryTimeout', () => {
      element.__queryTimeout = 123;
      element.reset();
      assert.isUndefined(element.__queryTimeout);
    });

    it('Clears querying', () => {
      element.querying = true;
      element.reset();
      assert.isFalse(element.querying);
    });

    it('Clears items', () => {
      element.reset();
      assert.deepEqual(element.items, []);
    });
  });

  describe('_getApiListOptions()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns empty object by default', () => {
      const result = element._getApiListOptions();
      assert.deepEqual(result, {});
    });

    it('Adds nextPageToken', () => {
      element.nextPageToken = 'abc';
      const result = element._getApiListOptions();
      assert.deepEqual(result, {
        nextPageToken: 'abc'
      });
    });
  });

  describe('loadPage()', () => {
    before(async () => {
      await DataGenerator.insertApiData();
    });

    after(async () => {
      await DataGenerator.destroyAllApiData();
    });

    let element;
    beforeEach(async () => {
      // prevents auto query
      element = await dataFixture([]);
    });

    it('Sets result', async () => {
      await element.loadPage();
      assert.lengthOf(element.items, 25);
    });

    it('Sets nextPageToken', async () => {
      await element.loadPage()
      assert.typeOf(element.nextPageToken, 'string');
    });
  });

  describe('_sortData()', () => {
    let element;
    beforeEach(async () => {
      // prevents auto query
      element = await dataFixture([]);
    });

    it('Returns -1 when a order is < than b order', () => {
      const result = element._sortData({
        order: 0
      }, {
        order: 1
      });
      assert.equal(result, -1);
    });

    it('Returns 1 when a order is > than b order', () => {
      const result = element._sortData({
        order: 1
      }, {
        order: 0
      });
      assert.equal(result, 1);
    });

    it('Compares names otherwise', () => {
      const result = element._sortData({
        order: 0,
        name: 'a'
      }, {
        order: 0,
        name: 'b'
      });
      assert.equal(result, -1);
    });

    it('Compares names when missing', () => {
      const result = element._sortData({
        order: 0
      }, {
        order: 0,
        name: 'b'
      });
      assert.equal(result, -1);
    });
  });

  describe('Events tests', function() {
    function genIndexItem(id) {
      id = id || 'test-id';
      return {
        _id: id,
        title: 'test-title',
        order: 0,
        latest: 'a',
        versions: ['a']
      };
    }

    function fire(type, detail, cancelable) {
      if (typeof cancelable !== 'boolean') {
        cancelable = false;
      }
      const e = new CustomEvent(type, {
        detail,
        cancelable,
        bubbles: true
      });
      document.body.dispatchEvent(e);
      return e;
    }

    function fireUpdated(id, cancelable) {
      return fire('api-index-changed', {
        apiInfo: genIndexItem(id)
      }, cancelable);
    }

    function fireDeleted(id, cancelable) {
      return fire('api-deleted', {
        id: id || 'test-id'
      }, cancelable);
    }

    function fireDbDeleted(name) {
      const detail = {};
      if (name) {
        detail.datastore = name;
      }
      return fire('datastore-destroyed', detail);
    }

    function fireSelected(id) {
      const detail = {
        value: id
      };
      return fire('selected-rest-api-changed', detail);
    }

    function fireImported() {
      const detail = {};
      return fire('data-imported', detail);
    }

    describe('Update event', function() {
      let element;
      beforeEach(async () => {
        // prevents auto query
        element = await dataFixture([]);
      });

      it('Ignores cancelable events', () => {
        fireUpdated(undefined, true);
        assert.deepEqual(element.items, []);
      });

      it('Adds an item to undefined list', () => {
        fireUpdated();
        assert.typeOf(element.items, 'array');
        assert.lengthOf(element.items, 1);
      });

      it('Computes `hasItems` after adding', () => {
        fireUpdated();
        assert.isTrue(element.hasItems);
      });

      it('Updates an existing item', () => {
        const item = genIndexItem();
        item.title = 'test-updated';
        element.items = [item];
        fireUpdated();
        assert.lengthOf(element.items, 1);
        const current = element.items[0];
        assert.equal(current.title, 'test-title');
      });

      it('Adds new item to existing list', () => {
        const item = genIndexItem();
        item._id = 'test-id2';
        element.items = [item];
        fireUpdated();
        assert.lengthOf(element.items, 2);
      });
    });

    describe('Delete event', function() {
      let element;
      beforeEach(async () => {
        // prevents auto query
        element = await dataFixture([]);
      });

      it('Ignores cancelable events', () => {
        fireDeleted(undefined, true);
        assert.deepEqual(element.items, []);
      });

      it('Do nothing if item is not on the list', () => {
        const item = genIndexItem();
        item._id = 'other-id';
        element.items = [item];
        fireDeleted();
        assert.lengthOf(element.items, 1);
      });

      it('Removes item from the list', () => {
        element.items = [genIndexItem()];
        fireDeleted();
        assert.lengthOf(element.items, 0);
      });

      it('Computes `hasItems` after removal', () => {
        element.items = [genIndexItem()];
        fireDeleted();
        assert.isFalse(element.hasItems);
      });
    });

    describe('Delete datastore event', function() {
      let element;
      beforeEach(async () => {
        element = await dataFixture([genIndexItem()]);
      });

      it('Ignores events without `datastore` property', () => {
        fireDbDeleted();
        assert.lengthOf(element.items, 1);
      });

      it('Ignores other deleted data stores', () => {
        fireDbDeleted('test');
        assert.lengthOf(element.items, 1);
      });

      it('Clears items for "api-index"', () => {
        fireDbDeleted('api-index');
        assert.lengthOf(element.items, 0);
      });

      it('Clears items for "all"', () => {
        fireDbDeleted('all');
        assert.lengthOf(element.items, 0);
      });

      it('Clears items for "api-index" as an array', () => {
        fireDbDeleted(['api-index']);
        assert.lengthOf(element.items, 0);
      });
    });

    describe('Selecting API event', function() {
      let element;
      beforeEach(async () => {
        element = await dataFixture([genIndexItem()]);
      });

      it('Selectes the API', () => {
        fireSelected('test-api');
        assert.equal(element.selectedApi, 'test-api');
      });

      it('Wont change selection when the same API is being selected', () => {
        element.selectedApi = 'test-api';
        fireSelected('test-api');
        assert.equal(element.selectedApi, 'test-api');
      });

      it('Deselects when no ID', () => {
        element.selectedApi = 'test-api';
        fireSelected();
        assert.equal(element.selectedApi, '');
      });
    });

    describe('Data import', function() {
      let element;
      beforeEach(async () => {
        // prevents auto query
        element = await dataFixture([]);
      });

      it('calls reset()', () => {
        const spy = sinon.spy(element, 'reset');
        fireImported();
        assert.isTrue(spy.called);
      });

      it('calls refresh()', () => {
        const spy = sinon.spy(element, 'refresh');
        fireImported();
        assert.isTrue(spy.called);
      });
    });
  });
});
