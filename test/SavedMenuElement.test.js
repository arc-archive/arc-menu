import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import { internals } from '@advanced-rest-client/requests-list';
import '@advanced-rest-client/arc-models/request-model.js';
import '../saved-menu.js';

/** @typedef {import('..').SavedMenuElement} SavedMenuElement */

describe('SavedMenuElement', () => {
  const generator = new DataGenerator();

  /**
   * @returns {Promise<SavedMenuElement>}
   */
  async function noAutoFixture() {
    const node = await fixture(html`
    <div>
      <request-model></request-model>
      <saved-menu noAuto></saved-menu>
    </div>
    `);
    return /** @type SavedMenuElement */ node.querySelector('saved-menu');
  }

  describe('data rendering', () => {
    before(async () => {
      await generator.insertSavedRequestData();
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type SavedMenuElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('renders empty screen when no data', () => {
      const node = element.shadowRoot.querySelector('.list-empty');
      assert.ok(node);
    });

    it('does not render empty screen with data', async () => {
      await element[internals.loadPage]();
      await nextFrame();
      const node = element.shadowRoot.querySelector('.list-empty');
      assert.notOk(node);
    });

    it('does not render progress bar when not loading', async () => {
      const node = element.shadowRoot.querySelector('progress');
      assert.notOk(node);
    });

    it('render progress bar when loading', async () => {
      const p = element[internals.loadPage]();
      assert.isTrue(element.querying);
      await element.requestUpdate();
      const node = element.shadowRoot.querySelector('progress');
      assert.ok(node);
      await p;
    });

    it('renders list items', async () => {
      await element[internals.loadPage]();
      await element.requestUpdate();
      const nodes = element.shadowRoot.querySelectorAll('anypoint-icon-item');
      assert.lengthOf(nodes, 25);
    });
  });

  
  describe.skip('a11y', () => {
    before(async () => {
      await generator.insertSavedRequestData();
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await noAutoFixture();
      await element[internals.loadPage]();
      await nextFrame();
    });

    it('is accessible with list items', async () => {
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });
});
