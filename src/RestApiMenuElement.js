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

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('scroll', this[internals.listScrollHandler]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('scroll', this[internals.listScrollHandler]);
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
