import { ArcNavigationEventTypes } from '@advanced-rest-client/arc-events';
import { fixture, assert, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../arc-menu.js';
import {
  openHistoryHandler,
  openSavedHandler,
  openApisHandler,
  openExchangeHandler,
  refreshList,
  updateSelectionIfNeeded,
  historyChanged,
  findTab,
  dragoverHandler,
  cancelDragTimeout,
  dragTypeCallbackValue,
  dragOverTimeoutValue,
  openMenuDragOver,
} from '../src/ArcMenuElement.js';

/** @typedef {import('..').ArcMenuElement} ArcMenuElement */

describe('ArcMenuElement', () => {
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function historyFixture() {
    return fixture(`<arc-menu history></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function savedFixture() {
    return fixture(`<arc-menu selected="0"></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function projectsFixture() {
    return fixture(`<arc-menu selected="1"></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function apisFixture() {
    return fixture(`<arc-menu selected="2"></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function noHistoryFixture() {
    return fixture(`<arc-menu history hideHistory></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function noSavedFixture() {
    return fixture(`<arc-menu history hideSaved></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function noProjectsFixture() {
    return fixture(`<arc-menu history hideProjects></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function noApisFixture() {
    return fixture(`<arc-menu history hideApis></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function popupsFixture() {
    return fixture(`<arc-menu history popup></arc-menu>`);
  }
  /**
   * @returns {Promise<ArcMenuElement>}
   */
  async function draggableFixture() {
    return fixture(`<arc-menu history dataTransfer></arc-menu>`);
  }

  describe('basics', () => {
    it('opens default menu', async () => {
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

  describe('history hidden', () => {
    let element = /** @type ArcMenuElement */ (null);
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

  describe('saved hidden', () => {
    let element = /** @type ArcMenuElement */ (null);
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

  describe('projects hidden', () => {
    let element = /** @type ArcMenuElement */ (null);
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

  describe('apis hidden', () => {
    let element = /** @type ArcMenuElement */ (null);
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

  describe('Panels navigation', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('[openHistoryHandler]() opens history screen', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      element[openHistoryHandler]();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'history');
    });

    it('open history button dispatches the event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="open-history"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'history');
    });

    it('[openSavedHandler]() opens saved screen', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      element[openSavedHandler]();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'saved');
    });

    it('open saved button dispatches the event', async () => {
      element.selected = 1;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="open-saved"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'saved');
    });

    it('[openApisHandler]() opens rest apis screen', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      element[openApisHandler]();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'rest-projects');
    });

    it('open APIs button dispatches the event', async () => {
      element.selected = 3;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="open-rest-apis"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'rest-projects');
    });

    it('[openExchangeHandler]() opens exchange screen', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      element[openExchangeHandler]();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'exchange-search');
    });

    it('dispatches the event when explore button is clicked', async () => {
      element.selected = 3;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigate, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="explore-rest-apis"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].route, 'exchange-search');
    });
  });

  describe('refreshing panels', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('[refreshList]() calls refresh() on a panel', () => {
      const panel = element.shadowRoot.querySelector('history-menu');
      const spy = sinon.spy(panel, 'refresh');
      element[refreshList]('history-menu');
      assert.isTrue(spy.called);
    });

    it('does nothing when panel do not exist', () => {
      element[refreshList]('other-menu');
      // no error, coverage
    });

    it('refreshHistoryList() calls [refreshList]() with argument', async () => {
      element.selected = 0;
      await nextFrame();
      const spy = sinon.spy(element, refreshList);
      element.refreshHistoryList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'history-menu');
    });

    it('Refresh history button calls [refreshList]()', () => {
      const spy = sinon.spy(element, refreshList);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="refresh-history"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'history-menu');
    });

    it('refreshSavedList() calls [refreshList]() with argument', () => {
      const spy = sinon.spy(element, refreshList);
      element.refreshSavedList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'saved-menu');
    });

    it('Refresh history button calls [refreshList]()', async () => {
      element.selected = 1;
      await nextFrame();
      const spy = sinon.spy(element, refreshList);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="refresh-saved"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'saved-menu');
    });

    it('refreshProjectsList() calls [refreshList]() with argument', () => {
      const spy = sinon.spy(element, refreshList);
      element.refreshProjectsList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'projects-menu');
    });

    it('Refresh projects button calls [refreshList]()', async () => {
      element.selected = 2;
      await nextFrame();
      const spy = sinon.spy(element, refreshList);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="refresh-projects"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'projects-menu');
    });

    it('refreshApisList() calls [refreshList]() with argument', () => {
      const spy = sinon.spy(element, refreshList);
      element.refreshApisList();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'rest-api-menu');
    });

    it('Refresh apis button calls [refreshList]()', async () => {
      element.selected = 3;
      await nextFrame();
      const spy = sinon.spy(element, refreshList);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="refresh-rest-apis"]'));
      node.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'rest-api-menu');
    });
  });

  describe('menu popup', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await popupsFixture();
    });

    it('dispatches history popup event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupHistory();
      assert.isTrue(spy.called);
    });

    it('dispatches the event from history panel', async () => {
      element.selected = 0;
      await element.requestUpdate();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="popup-history"]'));
      node.click();
      assert.isTrue(spy.called);
    });

    it('dispatches saved popup event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupSaved();
      assert.isTrue(spy.called);
    });

    it('dispatches the event from saved panel', async () => {
      element.selected = 1;
      await element.requestUpdate();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="popup-saved"]'));
      node.click();
      assert.isTrue(spy.called);
    });

    it('dispatches projects popup event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupProjects();
      assert.isTrue(spy.called);
    });

    it('dispatches the event from projects panel', async () => {
      element.selected = 2;
      await element.requestUpdate();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="popup-projects"]'));
      node.click();
      assert.isTrue(spy.called);
    });

    it('dispatches rest apis popup event', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      element.popupApis();
      assert.isTrue(spy.called);
    });

    it('dispatches the event from rest apis panel', async () => {
      element.selected = 3;
      await element.requestUpdate();
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.popupMenu, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="popup-rest-apis"]'));
      node.click();
      assert.isTrue(spy.called);
    });
  });

  describe('auto change selection', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('calls [updateSelectionIfNeeded]() with an argument when no value', () => {
      const spy = sinon.spy(element, updateSelectionIfNeeded);
      element[historyChanged](false, true);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 0);
    });

    it('sets selection to 0 when re-enabling history', () => {
      element.history = false;
      element.selected = 1;
      element[historyChanged](true, false);
      assert.equal(element.selected, 0);
    });
  });

  describe('findTab()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await historyFixture();
    });

    it('returns anypoint-tab from path', () => {
      const node = element.shadowRoot.querySelector('anypoint-tab');
      assert.ok(node);
      const e = {
        composedPath: () => [document.createElement('span'), node],
      };
      // @ts-ignore
      const result = findTab(e);
      assert.isTrue(node === result);
    });

    it('Return undefined when nod is not found', () => {
      const e = {
        composedPath: () => [document.createElement('span')]
      };
      // @ts-ignore
      const result = findTab(e);
      assert.isUndefined(result);
    });
  });

  describe('[dragoverHandler]()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await draggableFixture();
      element.dragOpenTimeout = 1;
    });

    function dispatchEvent(types=['arc/request'], type='saved') {
      const selector = `anypoint-tab[data-type="${type}"]`;
      const node = element.shadowRoot.querySelector(selector);
      const dataTransfer = new DataTransfer();
      const e = new DragEvent('dragover', {
        dataTransfer,
        bubbles: true,
        cancelable: true,
      });
      types.forEach((t) => {
        dataTransfer.setData(t, 'test');
      });
      node.dispatchEvent(e);
      return e;
    }

    it('ignores event when dataTransfer is not set', () => {
      const e = dispatchEvent();
      element.dataTransfer = false;
      element[dragoverHandler](e);
      // no error
    });

    it('ignores event when arc/request is not set', () => {
      const e = dispatchEvent(['some/mime']);
      assert.isFalse(e.defaultPrevented);
    });

    it('cancels the the event when supported', () => {
      const e = dispatchEvent();
      assert.isTrue(e.defaultPrevented);
    });

    it('ignores the event when not supported', async () => {
      element.selected = 1;
      await element.requestUpdate();
      const e = dispatchEvent(undefined, 'history');
      assert.isFalse(e.defaultPrevented);
    });

    it('cancels drag timeout', () => {
      const spy = sinon.spy(element, cancelDragTimeout);
      dispatchEvent();
      assert.isTrue(spy.called);
    });

    it('ignores the event when timeout is already set', () => {
      element[dragTypeCallbackValue] = 'saved';
      const spy = sinon.spy(element, cancelDragTimeout);
      dispatchEvent();
      assert.isFalse(spy.called);
    });

    it('cancels the timer when drag type changes', () => {
      element[dragTypeCallbackValue] = 'saved';
      const spy = sinon.spy(element, cancelDragTimeout);
      dispatchEvent(undefined, 'projects');
      assert.isTrue(spy.called);
    });

    it('Sets [dragTypeCallbackValue]', () => {
      dispatchEvent();
      assert.equal(element[dragTypeCallbackValue], 'saved');
    });

    it('Sets [dragOverTimeoutValue]', () => {
      dispatchEvent();
      assert.typeOf(element[dragOverTimeoutValue], 'number');
    });

    it('skips action when saved type and selected', async () => {
      element.selected = 1;
      await element.requestUpdate();
      dispatchEvent();
      assert.isUndefined(element[dragOverTimeoutValue]);
    });

    it('skips action when project type and selected', async () => {
      element.selected = 2;
      await element.requestUpdate();
      dispatchEvent(undefined, 'projects');
      assert.isUndefined(element[dragOverTimeoutValue]);
    });
  });

  describe('[dragleaveHandler]()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await draggableFixture();
    });

    function dispatch(target, types=['arc/request']) {
      const selector = 'anypoint-tab[data-type="saved"]';
      const node = target.shadowRoot.querySelector(selector);
      const dataTransfer = new DataTransfer();
      const e = new DragEvent('dragleave', {
        dataTransfer,
        bubbles: true,
        cancelable: true,
      });
      types.forEach((t) => {
        dataTransfer.setData(t, 'test');
      });
      node.dispatchEvent(e);
      return e;
    }

    it('ignores event when dataTransfer is not set', () => {
      element.dataTransfer = false;
      const e = dispatch(element);
      assert.isFalse(e.defaultPrevented);
    });

    it('ignores event when arc/request is not set', () => {
      const e = dispatch(element, ['other']);
      assert.isFalse(e.defaultPrevented);
    });

    it('cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('calls [cancelDragTimeout]()', () => {
      const spy = sinon.spy(element, cancelDragTimeout);
      dispatch(element);
      assert.isTrue(spy.called);
    });
  });

  describe('[cancelDragTimeout]()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await draggableFixture();
    });

    it('clears timeout when set', () => {
      element[dragOverTimeoutValue] = 1;
      element[cancelDragTimeout]();
      assert.isUndefined(element[dragOverTimeoutValue]);
    });

    it('clears [dragTypeCallbackValue]', () => {
      element[dragOverTimeoutValue] = 1;
      element[dragTypeCallbackValue] = 'saved';
      element[cancelDragTimeout]();
      assert.isUndefined(element[dragTypeCallbackValue]);
    });

    it('only clears [dragTypeCallbackValue]', () => {
      element[dragTypeCallbackValue] = 'saved';
      element[cancelDragTimeout]();
      assert.isUndefined(element[dragTypeCallbackValue]);
    });
  });

  describe('[openMenuDragOver]()', () => {
    let element = /** @type ArcMenuElement */ (null);
    beforeEach(async () => {
      element = await draggableFixture();
    });

    it('ignores event when dataTransfer is not set', () => {
      element.dataTransfer = false;
      element[dragTypeCallbackValue] = 'saved';
      element[openMenuDragOver]();
      assert.equal(element[dragTypeCallbackValue], 'saved');
    });

    it('calls [cancelDragTimeout]()', () => {
      const spy = sinon.spy(element, cancelDragTimeout);
      element[dragTypeCallbackValue] = 'history';
      element[openMenuDragOver]();
      assert.isTrue(spy.called);
    });

    it('selects saved tab', () => {
      element[dragTypeCallbackValue] = 'saved';
      element[openMenuDragOver]();
      assert.equal(element.selected, 1);
    });

    it('selects projects tab', () => {
      element[dragTypeCallbackValue] = 'projects';
      element[openMenuDragOver]();
      assert.equal(element.selected, 2);
    });

    it('ignores other types', () => {
      element[openMenuDragOver]();
      assert.equal(element.selected, 0);
    });
  });
});
