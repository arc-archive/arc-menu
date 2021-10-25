import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import { RestApiListMixin } from '@advanced-rest-client/requests-list';

export declare interface RestApiMenuElement extends RestApiListMixin, LitElement {
}

/**
 * A list of REST APIs in the ARC main menu.
 * @deprecated Use `@advanced-rest-client/app` instead.
 */
export declare class RestApiMenuElement {
  static readonly styles: CSSResult[];

  render(): TemplateResult;
}
