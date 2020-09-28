import { LitElement, TemplateResult } from 'lit-element';
import { HistoryListMixin } from '@advanced-rest-client/requests-list';
/**
 * Advanced REST Client's history menu element.
 */
export declare class HistoryMenuElement {
  render(): TemplateResult;
}
export declare interface HistoryMenuElement extends HistoryListMixin, LitElement {
}