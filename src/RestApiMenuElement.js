import { LitElement, html } from 'lit-element';
import { ListStyles, RestApiListMixin, RestApiStyles, internals } from '@advanced-rest-client/requests-list';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * A list of REST APIs in the ARC main menu.
 */
export class RestApiMenuElement extends RestApiListMixin(LitElement) {
  static get styles() {
    return [ListStyles, RestApiStyles];
  }

  /**
   * @returns {TemplateResult}
   */
  render() {
    return html`
    ${this[internals.dropTargetTemplate]()}
    ${this[internals.busyTemplate]()}
    ${this[internals.unavailableTemplate]()}
    ${this[internals.listTemplate]()}
    `;
  }
}
