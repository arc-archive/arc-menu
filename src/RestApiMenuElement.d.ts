import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import { RestApiListMixin } from '@advanced-rest-client/requests-list';

export declare interface RestApiMenuElement extends RestApiListMixin, LitElement {
}

/**
 * A list of REST APIs in the ARC main menu.
 */
export declare class RestApiMenuElement {
  static readonly styles: CSSResult[];

  render(): TemplateResult;
}
