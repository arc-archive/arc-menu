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
import { ArcMenuBase } from './ArcMenuBase.js';
import { RequestsListMixin } from '@advanced-rest-client/requests-list-mixin/requests-list-mixin.js';
import { SavedListMixin } from '@advanced-rest-client/saved-list-mixin/saved-list-mixin.js';
import styles from '@advanced-rest-client/requests-list-mixin/requests-list-styles.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@polymer/paper-progress/paper-progress.js';
import '@api-components/http-method-label/http-method-label.js';
import '@polymer/iron-icon/iron-icon.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import { AnypointMenuMixin } from '@anypoint-web-components/anypoint-menu-mixin/anypoint-menu-mixin.js';

export class SavedMenuWrapper extends AnypointMenuMixin(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}

/**
 * A list of saved requests in the ARC main menu.
 *
 * The element uses direct implementation of the PouchDB to make a query to the
 * datastore. It also listens to events fired by the `arc-models/request-model`
 * element to update state of the saved requests.
 *
 * ### Example
 *
 * ```
 * <saved-menu></saved-menu>
 * <request-model></request-model>
 * ```
 *
 * ### Events
 *
 * The element listens for the following events.
 *
 * #### request-object-changed
 *
 * The details object has to contain the following properties:
 * - `request` (`Object`) - Updated request object. Note, if `_id` of the
 * object changed this should be a copy of the object. Otherwise it won't
 * be possible to recognise old object on the list.
 *
 * Note: `requests` list does not contain full request object. Don't use this
 * objects to update request object.
 *
 * #### request-object-deleted
 *
 * The details object has to contain the following properties:
 * - `id` (`String`) - The `_id` property of removed item.
 *
 * ### Sizing the element
 *
 * The element uses `<iron-list>` to render the data in the view. The list is set
 * to be flex vertically. It means that the element has to be sized directly by the
 * hosting application or otherwise it size will be 0px.
 *
 * It can be done using flex layout and making the element to be `flex: 1`.
 *
 * ## Changes in version 2
 *
 * - PouchDB is no longer included into the element. Each platform can have
 * different implementation of the library so this element will not make
 * assumtions about the platform.
 * - The element does not support "opened" attribute. Once inserted into the
 * DOM it queries datastore.
 *
 * ### Styling
 * `<saved-menu>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--saved-menu` | Mixin applied to the element | `{}`
 * `--saved-menu-background-color` | Background color of the menu | `#f7f7f7`
 * `--saved-menu-focused-post-method-color` | Font color of focused item POST method label | `rgb(33, 150, 243)`
 * `--saved-menu-list` | Mixin applied to the list element. | `{}`
 * `--saved-menu-list-item` | Mixin applied to each list item | `{}`
 * `--saved-menu-name-label` | Mixin applied to the name label | `{}`
 * `--arc-menu-empty-info-color` | Color applied to the empty info section | ``
 * `--arc-menu-empty-info-title-color` | Color applied to the title in the empty info section | ``
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/saved.html
 * @appliesMixin RequestsListMixin
 * @appliesMixin SavedListMixin
 */
export class SavedMenu extends SavedListMixin(RequestsListMixin(ArcMenuBase)) {
  static get styles() {
    return [
      styles,
      css`:host {
        display: block;
        background-color: var(--saved-menu-background-color, inherit);
        position: relative;
        display: flex;
        flex-direction: column;
      }

      .list {
        overflow: auto;
      }

      .name {
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
      }

      .drop-message {
        display: none;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(255, 255, 255, 0.84);
        z-index: 10;
        justify-content: center;
        align-items: center;
        color: var(--primary-color);
        border: 2px var(--primary-color) dashed;
        font-size: 18px;
      }

      .drop-icon {
        width: 72px;
        height: 72px;
      }

      :host(.drop-target) .drop-message {
        display: flex;
        flex-direction: column;
      }`
    ];
  }

  _dropTargetTemplate() {
    return html`<div class="drop-message">
      <iron-icon icon="arc:save-alt" class="drop-icon"></iron-icon>
      <p>Drop request here</p>
    </div>`;
  }

  _unavailableTemplate() {
    const cmd = this._computeA11yCommand('s');
    return html`<div class="empty-message">
      <h3 class="empty-title">
        Save a request and recall it from here
      </h3>
      <p class="empty-info">
        Use <span class="code">${cmd}</span> to save a request.
        It will appear in this place.
      </p>
    </div>`;
  }

  _listTemplate() {
    const items = this.requests || [];
    const { draggableEnabled, _hasTwoLines, compatibility } = this;
    return items.map((item, index) => html`
      <anypoint-icon-item
        data-index="${index}"
        data-id="${item._id}"
        @click="${this._openSaved}"
        class="request-list-item"
        draggable="${draggableEnabled ? 'true' : 'false'}"
        @dragstart="${this._dragStart}"
        tabindex="-1"
        title="${item.url}"
        role="menuitem"
        ?compatibility="${compatibility}">
        <http-method-label
          method="${item.method}"
          title="${item.method}"
          slot="item-icon"></http-method-label>
        <anypoint-item-body
          ?twoline="${_hasTwoLines}"
          ?compatibility="${compatibility}">
          <div class="name select-text">${item.name}</div>
          <div secondary class="select-text">${item.url}</div>
        </anypoint-item-body>
      </anypoint-icon-item>`);
  }

  render() {
    const { dataUnavailable, hasRequests, querying, selectedItem } = this;
    return html`
    ${this.modelTemplate}
    <paper-progress ?hidden="${!querying}" indeterminate></paper-progress>
    ${dataUnavailable ? this._unavailableTemplate() : ''}
    ${this._dropTargetTemplate()}

    <saved-menu-wrapper
      class="list"
      selectable="anypoint-icon-item"
      attrforselected="data-id"
      .selected="${selectedItem}"
      @selected-changed="${this._selectionChanged}">
      ${hasRequests ? this._listTemplate() : ''}
    </saved-menu-wrapper>`;
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

  get draggableEnabled() {
    return this._draggableEnabled;
  }

  set draggableEnabled(value) {
    const old = this._draggableEnabled;
    if (old === value) {
      return;
    }
    this._draggableEnabled = value;
    this._draggableChanged(value);
  }

  constructor() {
    super();
    this._scrollHandler = this._scrollHandler.bind(this);
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dragleaveHandler = this._dragleaveHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.type = 'saved';
    this._addScrollEvent();
    if (this.draggableEnabled) {
      this._addDndEvents();
    }
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this._list.removeEventListener('scroll', this._scrollHandler);
    this._removeDndEvents();
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

  _draggableChanged(value) {
    if (value) {
      this._addDndEvents();
    } else {
      this._removeDndEvents();
    }
  }

  _addDndEvents() {
    if (this.__dndAdded) {
      return;
    }
    this.__dndAdded = true;
    this.addEventListener('dragover', this._dragoverHandler);
    this.addEventListener('dragleave', this._dragleaveHandler);
    this.addEventListener('drop', this._dropHandler);
  }

  _removeDndEvents() {
    if (!this.__dndAdded) {
      return;
    }
    this.__dndAdded = false;
    this.removeEventListener('dragover', this._dragoverHandler);
    this.removeEventListener('dragleave', this._dragleaveHandler);
    this.removeEventListener('drop', this._dropHandler);
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
   * Handler for the `tap` event on the item.
   * @param {CustomEvent} e
   */
  _openSaved(e) {
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
    e.dataTransfer.setData('arc/saved-request', request._id);
    e.dataTransfer.setData('arc-source/saved-menu', request._id);
    e.dataTransfer.effectAllowed = 'copyMove';
  }
  /**
   * Handler for `dragover` event on this element. If the dagged item is compatible
   * it renders drop message.
   * @param {DragEvent} e
   */
  _dragoverHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1 ||
      e.dataTransfer.types.indexOf('arc/saved-request') !== -1) {
      return;
    }
    e.dataTransfer.dropEffect = 'copy';
    e.preventDefault();
    if (!this.classList.contains('drop-target')) {
      /* eslint-disable-next-line */
      this.classList.add('drop-target');
    }
  }
  /**
   * Handler for `dragleave` event on this element. If the dagged item is compatible
   * it hides drop message.
   * @param {DragEvent} e
   */
  _dragleaveHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1 ||
      e.dataTransfer.types.indexOf('arc/saved-request') !== -1) {
      return;
    }
    e.preventDefault();
    if (this.classList.contains('drop-target')) {
      /* eslint-disable-next-line */
      this.classList.remove('drop-target');
    }
  }
  /**
   * Handler for `drag` event on this element. If the dagged item is compatible
   * it adds request to saved requests.
   * @param {DragEvent} e
   */
  _dropHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1 ||
      e.dataTransfer.types.indexOf('arc/saved-request') !== -1) {
      return;
    }
    e.preventDefault();
    if (this.classList.contains('drop-target')) {
      /* eslint-disable-next-line */
      this.classList.remove('drop-target');
    }
    const data = e.dataTransfer.getData('arc/request-object');
    if (!data) {
      return;
    }
    const request = JSON.parse(data);
    this._appendRequest(request);
  }
  /**
   * Dispatches (by calling `_dispatch() function`) `save-request` event
   * which is handled by request model to create new request.
   * The function do not need to do anything else since request change listeners
   * will insert the request to the list when saved.
   * @param {Object} request The request to store.
   * @return {CustomEvent}
   */
  async _appendRequest(request) {
    request = this._prepareDropRequest(request);
    delete request._rev;
    delete request._id;

    const rModel = this.requestModel;
    return await rModel.saveRequestProject(request);
  }
}
