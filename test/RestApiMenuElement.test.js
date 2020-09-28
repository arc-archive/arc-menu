import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import { internals } from '@advanced-rest-client/requests-list';
import '@advanced-rest-client/arc-models/rest-api-model.js';
import '../rest-api-menu.js';

/** @typedef {import('..').RestApiMenuElement} RestApiMenuElement */

describe('RestApiMenuElement', () => {
  const generator = new DataGenerator();

  /**
   * @returns {Promise<RestApiMenuElement>}
   */
  async function noAutoFixture() {
    const node = await fixture(html`
    <div>
      <rest-api-model></rest-api-model>
      <rest-api-menu noAuto></rest-api-menu>
    </div>
    `);
    return /** @type RestApiMenuElement */ node.querySelector('rest-api-menu');
  }

  describe('data rendering', () => {
    before(async () => {
      await generator.insertApiData();
    });

    after(async () => {
      await generator.destroyAllApiData();
    });

    let element = /** @type RestApiMenuElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('renders empty screen when no data', () => {
      const node = element.shadowRoot.querySelector('.empty-message');
      assert.ok(node);
    });

    it('does not render empty screen with data', async () => {
      await element[internals.loadPage]();
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('.empty-message');
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
      const nodes = element.shadowRoot.querySelectorAll('anypoint-item');
      assert.lengthOf(nodes, 25);
    });

    it('renders drop target template', () => {
      const node = element.shadowRoot.querySelector('.drop-target');
      assert.ok(node);
    });
  });

  describe.skip('a11y', () => {
    before(async () => {
      await generator.insertApiData();
    });

    after(async () => {
      await generator.destroyAllApiData();
    });

    let element = /** @type RestApiMenuElement */ (null);
    beforeEach(async () => {
      element = await noAutoFixture();
      await element[internals.loadPage]();
      await element.requestUpdate();
    });

    it('is accessible with list items', async () => {
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });
});
