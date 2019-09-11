import { fixture, assert, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../arc-menu.js';

describe('<arc-menu>', function() {
  async function historyFixture() {
    return await fixture(`<arc-menu historyenabled></arc-menu>`);
  }

  async function savedFixture() {
    return await fixture(`<arc-menu selected="0"></arc-menu>`);
  }

  async function projectsFixture() {
    return await fixture(`<arc-menu selected="1"></arc-menu>`);
  }

  async function apisFixture() {
    return await fixture(`<arc-menu selected="2"></arc-menu>`);
  }

  async function noHistoryFixture() {
    return await fixture(`<arc-menu historyenabled hidehistory></arc-menu>`);
  }

  async function noSavedFixture() {
    return await fixture(`<arc-menu historyenabled hidesaved></arc-menu>`);
  }

  async function noProjectsFixture() {
    return await fixture(`<arc-menu historyenabled hideprojects></arc-menu>`);
  }

  async function noApisFixture() {
    return await fixture(`<arc-menu historyenabled hideapis></arc-menu>`);
  }

  async function popupsFixture() {
    return await fixture(`<arc-menu historyenabled allowpopup></arc-menu>`);
  }

  async function draggableFixture() {
    return await fixture(`<arc-menu historyenabled draggableenabled></arc-menu>`);
  }

  describe('basics', () => {
    it('Opens default menu', async () => {
      const element = await historyFixture();
      const node = element.shadowRoot.querySelector('history-menu');
      assert.ok(node);
    });

    it('opens saved menu', async () => {
      const element = await savedFixture();
      const node = element.shadowRoot.querySelector('saved-menu');
      assert.ok(node);
    });

    it('opens projects menu', async () => {
      const element = await projectsFixture();
      const node = element.shadowRoot.querySelector('projects-menu');
      assert.ok(node);
    });

    it('opens APIs menu', async () => {
      const element = await apisFixture();
      const node = element.shadowRoot.querySelector('rest-api-menu');
      assert.ok(node);
    });
  });

  describe('history hidden', function() {
    let element;
    beforeEach(async () => {
      element = await noHistoryFixture();
    });

    it('Selects saved menu', () => {
      assert.equal(element.selected, 1);
    });

    it('Selects projects menu when saved is also hidden', async () => {
      element.hideSaved = true;
      await nextFrame();
      assert.equal(element.selected, 2);
    });

    it('history is hidden when historyHidden is set', async () => {
      element.selected = 0;
      await nextFrame();
      const node = element.shadowRoot.querySelector('history-menu');
      assert.notOk(node);
    });

    it('history tab is hidden', () => {
      const node = element.shadowRoot.querySelectorAll('anypoint-tab')[0];
      assert.isTrue(node.hasAttribute('hidden'));
    });
  });

  describe('saved hidden', function() {
    let element;
    beforeEach(async () => {
      element = await noSavedFixture();
    });

    it('Keeps default selection', () => {
      assert.equal(element.selected, 0);
    });

    it('Saved panel is not rendered', async () => {
      element.selected = 1;
      await nextFrame();
      const node = element.shadowRoot.querySelector('saved-menu');
      assert.notOk(node);
    });

    it('Saved tab is hidden', () => {
      const node = element.shadowRoot.querySelectorAll('anypoint-tab')[1];
      assert.isTrue(node.hasAttribute('hidden'));
    });
  });

  describe('projects hidden', function() {
    let element;
    beforeEach(async () => {
      element = await noProjectsFixture();
    });

    it('Keeps default selection', () => {
      assert.equal(element.selected, 0);
    });

    it('projects panel is not rendered', async () => {
      element.selected = 2;
      await nextFrame();
      const node = element.shadowRoot.querySelector('projects-menu');
      assert.notOk(node);
    });

    it('Saved tab is hidden', () => {
      const node = element.shadowRoot.querySelectorAll('anypoint-tab')[2];
      assert.isTrue(node.hasAttribute('hidden'));
    });
  });

  describe('apis hidden', function() {
    let element;
    beforeEach(async () => {
      element = await noApisFixture();
    });

    it('Keeps default selection', () => {
      assert.equal(element.selected, 0);
    });

    it('projects panel is not rendered', async () => {
      element.selected = 3;
      await nextFrame();
      const node = element.shadowRoot.querySelector('rest-api-menu');
      assert.notOk(node);
    });

    it('Saved tab is hidden', () => {
      const node = element.shadowRoot.querySelectorAll('anypoint-tab')[3];
      assert.isTrue(node.hasAttribute('hidden'));
    });
  });

  describe('_navigateScreen()', () => {
    let element;
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('Dispatches "navigate" event', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      element._navigateScreen('test');
      assert.isTrue(spy.called);
    });

    it('Detail has base', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      element._navigateScreen('test');
      assert.equal(spy.args[0][0].detail.base, 'test');
    });

    it('Event bubbles', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      element._navigateScreen('test');
      assert.isTrue(spy.args[0][0].bubbles);
    });

    it('Event is cancelable', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      element._navigateScreen('test');
      assert.isTrue(spy.args[0][0].cancelable);
    });

    it('Event is composed', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      element._navigateScreen('test');
      const composed = spy.args[0][0].composed;
      if (composed !== undefined) {
        // edge test...,
        assert.isTrue(composed);
      }
    });
  });

  describe('Panels navigation', () => {
    let element;
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('_openHistoryList() opens history screen', () => {
      const spy = sinon.spy(element, '_navigateScreen');
      element._openHistoryList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'history');
    });

    it('open history button calls _navigateScreen()', () => {
      const spy = sinon.spy(element, '_navigateScreen');
      const node = element.shadowRoot.querySelector('[data-action="open-history"]');
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'history');
    });

    it('_openSavedList() opens saved screen', () => {
      const spy = sinon.spy(element, '_navigateScreen');
      element._openSavedList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'saved');
    });

    it('Open saved button calls _navigateScreen()', async () => {
      element.selected = 1;
      await nextFrame();
      const spy = sinon.spy(element, '_navigateScreen');
      const node = element.shadowRoot.querySelector('[data-action="open-saved"]');
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'saved');
    });

    it('_openSavedList() opens history screen', () => {
      const spy = sinon.spy(element, '_navigateScreen');
      element._openApisList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'rest-projects');
    });

    it('open APIS button calls _navigateScreen()', async () => {
      element.selected = 3;
      await nextFrame();
      const spy = sinon.spy(element, '_navigateScreen');
      const node = element.shadowRoot.querySelector('[data-action="open-rest-apis"]');
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'rest-projects');
    });

    it('_exporeApis() opens history screen', () => {
      const spy = sinon.spy(element, '_navigateScreen');
      element._exporeApis();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'exchange-search');
    });

    it('open APIS button calls _navigateScreen()', async () => {
      element.selected = 3;
      await nextFrame();
      const spy = sinon.spy(element, '_navigateScreen');
      const node = element.shadowRoot.querySelector('[data-action="explore-rest-apis"]');
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'exchange-search');
    });
  });

  describe('Refreshing panels', () => {
    let element;
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('_refreshList() calls refresh() on a panel', () => {
      const panel = element.shadowRoot.querySelector('history-menu');
      const spy = sinon.spy(panel, 'refresh');
      element._refreshList('history-menu');
      assert.isTrue(spy.called);
    });

    it('_refreshList() does nothing when panel do not exist', () => {
      element._refreshList('other-menu');
      // no error, coverage
    });

    it('refreshHistoryList() calls _refreshList() with argument', async () => {
      element.selected = 0;
      await nextFrame();
      const spy = sinon.spy(element, '_refreshList');
      element.refreshHistoryList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'history-menu');
    });

    it('Refresh history button calls _refreshList()', () => {
      const spy = sinon.spy(element, '_refreshList');
      const node = element.shadowRoot.querySelector('[data-action="refresh-history"]');
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'history-menu');
    });

    it('refreshSavedList() calls _refreshList() with argument', () => {
      const spy = sinon.spy(element, '_refreshList');
      element.refreshSavedList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'saved-menu');
    });

    it('Refresh history button calls _refreshList()', async () => {
      element.selected = 1;
      await nextFrame();
      const spy = sinon.spy(element, '_refreshList');
      const node = element.shadowRoot.querySelector('[data-action="refresh-saved"]');
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'saved-menu');
    });

    it('refreshProjectsList() calls _refreshList() with argument', () => {
      const spy = sinon.spy(element, '_refreshList');
      element.refreshProjectsList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'projects-menu');
    });

    it('Refresh projects button calls _refreshList()', async () => {
      element.selected = 2;
      await nextFrame();
      const spy = sinon.spy(element, '_refreshList');
      const node = element.shadowRoot.querySelector('[data-action="refresh-projects"]');
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'projects-menu');
    });

    it('refreshApisList() calls _refreshList() with argument', () => {
      const spy = sinon.spy(element, '_refreshList');
      element.refreshApisList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'rest-api-menu');
    });

    it('Refresh apis button calls _refreshList()', async () => {
      element.selected = 3;
      await nextFrame();
      const spy = sinon.spy(element, '_refreshList');
      const node = element.shadowRoot.querySelector('[data-action="refresh-rest-apis"]');
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'rest-api-menu');
    });
  });

  describe('_popupMenu()', () => {
    let element;
    beforeEach(async () => {
      element = await popupsFixture();
    });

    it('Dispatches "popup-menu" event', () => {
      const spy = sinon.spy();
      element.addEventListener('popup-menu', spy);
      element._popupMenu('test');
      assert.isTrue(spy.called);
    });

    it('Event is not dispatched when no allow-popup', () => {
      element.allowPopup = false;
      const spy = sinon.spy();
      element.addEventListener('popup-menu', spy);
      element._popupMenu('test');
      assert.isFalse(spy.called);
    });

    it('Detail has type', () => {
      const spy = sinon.spy();
      element.addEventListener('popup-menu', spy);
      element._popupMenu('test');
      assert.equal(spy.args[0][0].detail.type, 'test');
    });

    it('Event bubbles', () => {
      const spy = sinon.spy();
      element.addEventListener('popup-menu', spy);
      element._popupMenu('test');
      assert.isTrue(spy.args[0][0].bubbles);
    });

    it('Event is cancelable', () => {
      const spy = sinon.spy();
      element.addEventListener('popup-menu', spy);
      element._popupMenu('test');
      assert.isTrue(spy.args[0][0].cancelable);
    });

    it('Event is composed', () => {
      const spy = sinon.spy();
      element.addEventListener('popup-menu', spy);
      element._popupMenu('test');
      const composed = spy.args[0][0].composed;
      if (composed !== undefined) {
        // edge test...,
        assert.isTrue(composed);
      }
    });
  });

  describe('Auto change selection', () => {
    let element;
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('Calls _updateSelectionIfNeeded with an argument when no value', () => {
      const spy = sinon.spy(element, '_updateSelectionIfNeeded');
      element._historyEnabledChanegd(false, true);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 0);
    });

    it('Sets selection to 0 when re-enabling history', () => {
      element.historyEnabled = false;
      element.selected = 1;
      element._historyEnabledChanegd(true, false);
      assert.equal(element.selected, 0);
    });
  });

  describe('_findTab()', () => {
    let element;
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('Returns paper-tab from path', () => {
      const node = element.shadowRoot.querySelector('anypoint-tab');
      assert.ok(node);
      const e = {
        path: [document.createElement('span'), node]
      };
      const result = element._findTab(e);
      assert.isTrue(node === result);
    });

    it('Returns paper-tab from composedPath', () => {
      const node = element.shadowRoot.querySelector('anypoint-tab');
      assert.ok(node);
      const e = {
        composedPath: () => [document.createElement('span'), node]
      };
      const result = element._findTab(e);
      assert.isTrue(node === result);
    });

    it('Return undefined when nod is not found', () => {
      const e = {
        composedPath: () => [document.createElement('span')]
      };
      const result = element._findTab(e);
      assert.isUndefined(result);
    });
  });

  describe('_dragoverHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await draggableFixture();
      element.dragOpenTimeout = 1;
    });

    function dispatchEvent(types, type) {
      if (!types) {
        types = ['arc/request-object'];
      }
      if (!type) {
        type = 'saved';
      }
      const selector = `anypoint-tab[data-type="${type}"]`;
      const node = element.shadowRoot.querySelector(selector);
      const e = new Event('dragover', { cancelable: true, bubbles: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      node.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragoverHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      const spy = sinon.spy(element, '_findTab');
      dispatchEvent(['other']);
      assert.isFalse(spy.called);
    });

    it('Cancels the the event when supported', () => {
      const e = dispatchEvent(null);
      assert.isTrue(e.defaultPrevented);
    });

    it('Ignores the event when not supported', () => {
      const e = dispatchEvent(null, 'history');
      assert.isFalse(e.defaultPrevented);
    });

    it('Calls _findTab()', () => {
      const spy = sinon.spy(element, '_findTab');
      dispatchEvent();
      assert.isTrue(spy.called);
    });

    it('Calls _cancelDragTimeout()', () => {
      const spy = sinon.spy(element, '_cancelDragTimeout');
      dispatchEvent();
      assert.isTrue(spy.called);
    });

    it('Ignores the event is callback is already set', () => {
      element.__dragTypeCallback = 'saved';
      const spy = sinon.spy(element, '_cancelDragTimeout');
      dispatchEvent();
      assert.isFalse(spy.called);
    });

    it('Cancels the timer when drag type changes', () => {
      element.__dragTypeCallback = 'saved';
      const spy = sinon.spy(element, '_cancelDragTimeout');
      dispatchEvent(null, 'projects');
      assert.isTrue(spy.called);
    });

    it('Sets __dragTypeCallback', () => {
      dispatchEvent();
      assert.equal(element.__dragTypeCallback, 'saved');
    });

    it('Sets __dragOverTimeout', () => {
      dispatchEvent();
      assert.typeOf(element.__dragOverTimeout, 'number');
    });

    it('Skips action when saved type and selected', () => {
      element.selected = 1;
      dispatchEvent();
      assert.isUndefined(element.__dragOverTimeout);
    });

    it('Skips action when project type and selected', () => {
      element.selected = 2;
      dispatchEvent(null, 'projects');
      assert.isUndefined(element.__dragOverTimeout);
    });
  });

  describe('_dragleaveHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await draggableFixture();
    });

    function dispatch(element, types) {
      if (!types) {
        types = ['arc/request-object'];
      }
      const selector = 'anypoint-tab[data-type="saved"]';
      const node = element.shadowRoot.querySelector(selector);
      const e = new Event('dragleave', { cancelable: true, bubbles: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      node.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragleaveHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      const e = dispatch(element, ['other']);
      assert.isFalse(e.defaultPrevented);
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Calls _cancelDragTimeout()', () => {
      const spy = sinon.spy(element, '_cancelDragTimeout');
      dispatch(element);
      assert.isTrue(spy.called);
    });
  });

  describe('_cancelDragTimeout()', () => {
    let element;
    beforeEach(async () => {
      element = await draggableFixture();
    });

    it('Clears timeout when set', () => {
      element.__dragOverTimeout = 1;
      element._cancelDragTimeout();
      assert.isUndefined(element.__dragOverTimeout);
    });

    it('Clears __dragTypeCallback', () => {
      element.__dragOverTimeout = 1;
      element.__dragTypeCallback = 'saved';
      element._cancelDragTimeout();
      assert.isUndefined(element.__dragTypeCallback);
    });

    it('Only clreads __dragTypeCallback', () => {
      element.__dragTypeCallback = 'saved';
      element._cancelDragTimeout();
      assert.isUndefined(element.__dragTypeCallback);
    });
  });

  describe('_openMenuDragOver()', () => {
    let element;
    beforeEach(async () => {
      element = await draggableFixture();
    });

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element.__dragTypeCallback = 'saved';
      element._openMenuDragOver();
      assert.equal(element.__dragTypeCallback, 'saved');
    });

    it('Calls _cancelDragTimeout()', () => {
      const spy = sinon.spy(element, '_cancelDragTimeout');
      element.__dragTypeCallback = 'history';
      element._openMenuDragOver();
      assert.isTrue(spy.called);
    });

    it('Selectes saved tab', () => {
      element.__dragTypeCallback = 'saved';
      element._openMenuDragOver();
      assert.equal(element.selected, 1);
    });

    it('Selectes projects tab', () => {
      element.__dragTypeCallback = 'projects';
      element._openMenuDragOver();
      assert.equal(element.selected, 2);
    });

    it('Ignores other types', () => {
      element._openMenuDragOver();
      assert.equal(element.selected, 0);
    });
  });
});
