/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import { HistoryListMixin } from '@advanced-rest-client/history-list-mixin/history-list-mixin.js';
import { RequestsListMixin } from '@advanced-rest-client/requests-list-mixin/requests-list-mixin.js';
import styles from '@advanced-rest-client/requests-list-mixin/requests-list-styles.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@polymer/paper-progress/paper-progress.js';
import '@api-components/http-method-label/http-method-label.js';
import { AnypointMenuMixin } from '@anypoint-web-components/anypoint-menu-mixin/anypoint-menu-mixin.js';

export class HistoryMenuWrapper extends AnypointMenuMixin(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}
/**
 * A list of history requests in the ARC main menu.
 *
 * The element uses direct implementation of the PouchDB to make a query to the
 * datastore. It also listens to events fired by the `arc-model` elements to
 * update state of the history requests.
 *
 * ### Example
 * ```
 * <history-menu></history-menu>
 * ```
 *
 * ### Sizing the element
 *
 * The element uses `<iron-list>` to render the data in the view. The list is set
 * to be flex vertically. It means that the element has to be sized directly by the
 * hosting application or otherwise it size will be 0px.
 *
 * It can be done using flex layout and making the element to be `flex: 1`.
 *
 * ## Required dependencies
 *
 * The element works with `@advanced-rest-client/arc-models/request-model.js`
 * component. It should be included into the DOM.
 *
 * ### Styling
 * `<history-menu>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--history-menu-background-color` | Background color of the menu | `inherit`
 * `--history-menu-selected-post-method-color` | Font color of selected item POST method label | `#fff`
 * `--history-menu-focused-post-method-color` | Font color of focused item POST method label | `rgb(33, 150, 243)`
 * `--history-menu-selected-method-label-background-color` | Bg color of the POST method when focused | `#fff`
 * `--history-menu-selected-item-background-color` | Background color of the selected list item | `#FF9800`
 * `--history-menu-selected-item-color` | Color of the selected list item | `#fff`
 * `--history-menu-history-group-header-font-weigth` | Group header border color | `bold`
 * `--history-menu-history-group-header-border-color` | Group header border color | `#ddd`
 * `--history-menu-history-group-header-color` | Font color of the group header` | `rgba(0, 0, 0, 0.54)`
 * `--arc-menu-empty-info-color` | Color applied to the empty info section | ``
 * `--arc-menu-empty-info-title-color` | Color applied to the title in the empty info section | ``
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/history.html
 * @appliesMixin RequestsListMixin
 * @appliesMixin HistoryListMixin
 */
export class HistoryMenu extends HistoryListMixin(RequestsListMixin(LitElement)) {
  static get styles() {
    return [
      styles,
      css`:host {
        display: block;
        background-color: var(--history-menu-background-color, inherit);
        position: relative;
        display: flex;
        flex-direction: column;
      }

      .list {
        overflow: auto;
      }

      .url {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: 14px;
      }

      paper-progress {
        width: calc(100% - 32px);
        margin: 0 16px;
        position: absolute;
      }

      .empty-info {
        font-size: var(--arc-font-body1-font-size);
        font-weight: var(--arc-font-body1-font-weight);
        line-height: var(--arc-font-body1-line-height);
        font-style: italic;
        margin: 1em 16px;
        color: var(--arc-menu-empty-info-color);
      }

      .empty-title {
        white-space: var(--arc-font-nowrap-white-space);
        overflow: var(--arc-font-nowrap-overflow);
        text-overflow: var(--arc-font-nowrap-text-overflow);
        font-size: var(--arc-font-title-font-size);
        font-weight: var(--arc-font-title-font-weight);
        line-height: var(--arc-font-title-line-height);
        white-space: normal;
        color: var(--arc-menu-empty-info-title-color);
      }

      .empty-message {
        flex: 1;
        flex-basis: 0.000000001px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .empty-state-image {
        width: 180px;
        height: 120px;
      }

      [hidden] {
        display: none !important;
      }

      .selected {
        color: var(--primary-color);
      }`
    ];
  }

  _unavailableTemplate() {
    return html`<div class="empty-message">
      <h3 class="empty-title">Send a request and recall it from here</h3>
      <p class="empty-info">Once you made a request it will appear in this place.</p>
    </div>`;
  }

  _listTemplate() {
    const items = this.requests || [];
    const { draggableEnabled, _hasTwoLines, compatibility } = this;
    return items.map((item, index) => html`
      ${item.hasHeader ? html`<div class="history-group-header">${item.header}</div>` : ''}
      <anypoint-icon-item
        data-index="${index}"
        data-id="${item._id}"
        @click="${this._openHistory}"
        class="request-list-item"
        draggable="${draggableEnabled ? 'true' : 'false'}"
        @dragstart="${this._dragStart}"
        tabindex="-1"
        title="${item.url}"
        role="menuitem"
        ?compatibility="${compatibility}">
        <http-method-label
          method="${item.method}"
          slot="item-icon"></http-method-label>
        <anypoint-item-body
          ?twoline="${_hasTwoLines}"
          ?compatibility="${compatibility}">
          <div class="url">${item.url}</div>
          <div secondary="">${item.timeLabel}</div>
        </anypoint-item-body>
      </anypoint-icon-item>`);
  }

  render() {
    const { dataUnavailable, hasRequests, querying, selectedItem } = this;
    return html`
    ${this.modelTemplate}
    <paper-progress ?hidden="${!querying}" indeterminate></paper-progress>
    ${dataUnavailable ? this._unavailableTemplate() : ''}
    <history-menu-wrapper
      class="list"
      selectable="anypoint-icon-item"
      attrforselected="data-id"
      .selected="${selectedItem}"
      @selected-changed="${this._selectionChanged}">
      ${hasRequests ? this._listTemplate() : ''}
    </history-menu-wrapper>`;
  }

  static get properties() {
    return {
      // Database ID of the selected item.
      selectedItem: { type: String },
      /**
       * Adds draggable property to the request list item element.
       * The `dataTransfer` object has `arc/request-object` mime type with
       * serialized JSON with request model.
       */
      draggableEnabled: { type: Boolean },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean }
    };
  }

  get _list() {
    if (!this.__list) {
      this.__list = this.shadowRoot.querySelector('.list');
    }
    return this.__list;
  }

  constructor() {
    super();
    this._scrollHandler = this._scrollHandler.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.type = 'history';
    this._addScrollEvent();
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this._list.removeEventListener('scroll', this._scrollHandler);
  }

  firstUpdated() {
    this._addScrollEvent();
  }

  _addScrollEvent() {
    const list = this._list;
    if (!list) {
      return;
    }
    list.addEventListener('scroll', this._scrollHandler);
  }
  /**
   * Called every time the element changed it's scroll position. It will call the `makeQuery`
   * function when there's less than 120px left to scroll. (also it must be opened and must not
   * already querying).
   */
  _scrollHandler() {
    if (this.querying) {
      return;
    }
    const elm = this._list;
    const delta = elm.scrollHeight - (elm.scrollTop + elm.offsetHeight);
    if (delta < 120) {
      this.loadNext();
    }
  }
  /**
   * Handler for the `click` event on the item.
   * @param {ClickEvent} e
   */
  _openHistory(e) {
    const index = Number(e.currentTarget.dataset.index);
    const request = this.requests[index];
    const id = request._id;
    this._openRequest(id);
  }
  /**
   * Handler for the `dragstart` event added to the list item when `draggableEnabled`
   * is set to true.
   * This function sets request data on the `dataTransfer` object with `arc/request-object`
   * mime type. The request data is a serialized JSON with request model.
   * @param {Event} e
   */
  _dragStart(e) {
    if (!this.draggableEnabled) {
      return;
    }
    const index = Number(e.currentTarget.dataset.index);
    const request = this.requests[index];
    const data = JSON.stringify(request);
    e.dataTransfer.setData('arc/request-object', data);
    e.dataTransfer.setData('arc/history-request', request._id);
    e.dataTransfer.setData('arc-source/history-menu', request._id);
    e.dataTransfer.effectAllowed = 'copy';
  }

  _selectionChanged(e) {
    this.selectedItem = e.detail.value;
  }
}
