import { LitElement, html, css } from 'lit-element';
import { ArcFileDropMixin } from '@advanced-rest-client/arc-file-drop-mixin/arc-file-drop-mixin.js';
import { AnypointMenuMixin } from '@anypoint-web-components/anypoint-menu-mixin/anypoint-menu-mixin.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@polymer/paper-progress/paper-progress.js';
import '@advanced-rest-client/arc-models/rest-api-model.js';

export class RestApiMenuWrapper extends AnypointMenuMixin(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}

/**
 * A quick access menu for REST API projects
 *
 * A list of REST APIs in the ARC main menu.
 * The element uses direct implementation of the PouchDB to make a query to the
 * datastore.
 * It also listens to `datastore-destroyed` custom event update state of the list
 * items when datastore was destroyed.
 *
 * It listens for `selected-rest-api-changed` custom event as an alternative
 * to setting `selectedApi` property directly on the element.
 *
 * ### Example
 *
 * ```html
 * <rest-api-menu selectedapi="${route.api}"></rest-api-menu>
 * ```
 *
 * ### Datastore access
 *
 * This element uses events API to access datastore data. This is provided by the
 * `arc-models/rest-api-model` element. See documentation for this element if you
 * need to implement own data exchange logic.
 *
 * Datastore element is not in the shadow DOM of this element and is should be
 * included in the application DOM.
 *
 * ```html
 * <rest-api-menu selectedapi="${route.api}"></rest-api-menu>
 * <rest-api-model></rest-api-model>
 * ```
 *
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/api.html
 * @appliesMixin ArcFileDropMixin
 */
export class RestApiMenu extends ArcFileDropMixin(LitElement) {
  static get styles() {
    return css`
    :host {
      display: block;
      background-color: var(--rest-api-menu-background-color, inherit);
      position: relative;
      overflow: auto;
    }

    anypoint-item {
      cursor: pointer;
    }

    anypoint-item.selected {
      background-color: var(--rest-api-menu-selected-item-background-color, rgba(255, 152, 0, 0.24));
    }

    .name {
      flex: 1;
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
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .drop-target {
      display: none;
      z-index: 100;
    }

    :host([dragging]) .drop-target {
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      flex-direction: column;
      display: flex;
      align-items: center;
      background-color: var(--drop-file-importer-background-color, #fff);
      border: 4px var(--drop-file-importer-header-background-color, var(--primary-color)) solid;
    }

    :host([listtype="comfortable"]) anypoint-item {
      min-height: var(--request-list-item-comfortable-min-height, 40px);
    }

    :host([listtype="compact"]) anypoint-item {
      min-height: var(--request-list-item-comfortable-compact-height, 36px);
    }
    `;
  }

  static get properties() {
    return {
      /**
       * Saved items restored from the datastore.
       * @type {Array<Object>}
       */
      items: { type: Array },
      /**
       * True when the element is querying the database for the data.
       */
      querying: { type: Boolean },
      // Currently selected project ID
      selectedApi: { type: String },
      // Page token for datastore pagination
      nextPageToken: { type: String },
      /**
       * When set the element won't query for APIs data when connected to the DOM.
       * In this case manually call `makeQuery()`
       */
      noAutoQuery: { type: Boolean },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Changes information density of list items.
       * By default it uses material's peper item with two lines (72px heigth)
       * Possible values are:
       *
       * - `default` or empty - regular list view
       * - `comfortable` - enables MD single line list item vie (52px heigth)
       * - `compact` - enables list that has 40px heigth (touch recommended)
       */
      listType: { type: String, reflect: true }
    };
  }
  /**
   * Computed value. `true` if the `items` property has values.
   * @return {Boolean}
   */
  get hasItems() {
    const { items } = this;
    return !!(items && items.length);
  }
  /**
   * Computed value. True if query ended and there's no results.
   * @return {Boolean}
   */
  get dataUnavailable() {
    const { hasItems, querying } = this;
    return !hasItems && !querying;
  }

  get modelTemplate() {
    return html`
      <rest-api-model></rest-api-model>
    `;
  }

  get apiModel() {
    if (!this.__apiModel) {
      this.__apiModel = this.shadowRoot.querySelector('rest-api-model');
    }
    return this.__apiModel;
  }

  constructor() {
    super();
    this._onDatabaseDestroy = this._onDatabaseDestroy.bind(this);
    this._dataImportHandler = this._dataImportHandler.bind(this);
    this._selecteApiHandler = this._selecteApiHandler.bind(this);
    this._indexUpdated = this._indexUpdated.bind(this);
    this._indexDeleted = this._indexDeleted.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('data-imported', this._dataImportHandler);
    window.addEventListener('datastore-destroyed', this._onDatabaseDestroy);
    window.addEventListener('selected-rest-api-changed', this._selecteApiHandler);
    window.addEventListener('api-index-changed', this._indexUpdated);
    window.addEventListener('api-deleted', this._indexDeleted);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    if (this.__queryTimeout) {
      clearTimeout(this.__queryTimeout);
      this.__queryTimeout = undefined;
    }
    window.removeEventListener('data-imported', this._dataImportHandler);
    window.removeEventListener('datastore-destroyed', this._onDatabaseDestroy);
    window.removeEventListener('selected-rest-api-changed', this._selecteApiHandler);
    window.removeEventListener('api-index-changed', this._indexUpdated);
    window.removeEventListener('api-deleted', this._indexDeleted);
    this.__apiModel = null;
  }

  firstUpdated() {
    if (!this.querying && !this.items) {
      this.makeQuery();
    }
  }
  /**
   * Handler for `data-imported` cutom event.
   * Refreshes data state.
   */
  _dataImportHandler() {
    this.reset();
    this.refresh();
  }
  /**
   * Resets the state of the variables.
   */
  reset() {
    if (this.nextPageToken) {
      this.nextPageToken = undefined;
    }
    if (this.__queryTimeout) {
      clearTimeout(this.__queryTimeout);
      this.__queryTimeout = undefined;
    }
    this.querying = false;
    this.items = [];
  }
  /**
   * Refreshes the data from the datastore.
   * It resets the query options, clears items and makes a query to the datastore.
   */
  refresh() {
    this.reset();
    this.makeQuery();
  }
  // Handler for the `datastore-destroyed` custom event
  _onDatabaseDestroy(e) {
    let datastore = e.detail.datastore;
    if (!datastore || !datastore.length) {
      return;
    }
    if (typeof datastore === 'string') {
      datastore = [datastore];
    }
    if (datastore.indexOf('api-index') === -1 && datastore[0] !== 'all') {
      return;
    }
    this.refresh();
  }
  /**
   * The function to call when new query for data is needed.
   * Use this intead of `loadPage()` as this function uses debouncer to
   * prevent multiple calls at once.
   */
  makeQuery() {
    if (this.__makingQuery) {
      return;
    }
    this.__makingQuery = true;
    this.__queryTimeout = setTimeout(() => {
      this.__queryTimeout = undefined;
      this.__makingQuery = false;
      this.loadPage();
    }, 20);
  }

  _getApiListOptions() {
    const detail = {};
    if (this.nextPageToken) {
      detail.nextPageToken = this.nextPageToken;
    }
    return detail;
  }
  /**
   * Performs the query and processes the result.
   * This function immediately queries the data model for data.
   * It does this in a loop until all data are read.
   *
   * @return {Promise}
   */
  async loadPage() {
    const options = this._getApiListOptions();
    const model = this.apiModel;
    this.querying = true;
    try {
      const result = await model.listIndex(options);
      this.nextPageToken = result.nextPageToken;
      const items = result.items;
      if (!items || !items.length) {
        this.querying = false;
        return;
      }
      if (!this.items) {
        items.sort(this._sortData);
        this.items = items;
      } else {
        const concat = this.items.concat(items);
        concat.sort(this._sortData);
        this.items = concat;
      }
      await this.makeQuery();
    } catch(e) {
      // ...
    }
    this.querying = false;
  }
  /**
   * Sorts projects list by `order` and the `title` properties.
   *
   * @param {Object} a
   * @param {Object} b
   * @return {Number}
   */
  _sortData(a, b) {
    if (a.order < b.order) {
      return -1;
    }
    if (a.order > b.order) {
      return 1;
    }
    return (a.title || '').localeCompare(b.title);
  }
  // Handler for the `click` event on the list item.
  _openAPI(e) {
    const index = Number(e.currentTarget.dataset.index);
    const item = this.items[index];
    const id = item._id;
    const version = item.latest;
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: {
        base: 'api-console',
        id,
        version
      }
    }));
  }
  /**
   * Handler for the `selected-rest-api-changed` event.
   * It expects the detail object to have `value` property with selection id.
   * @param {CustomEvent} e
   */
  _selecteApiHandler(e) {
    const id = e.detail.value;
    if (id && id !== this.selectedApi) {
      this.selectedApi = id;
    } else if (!id) {
      this.selectedApi = '';
    }
  }
  /**
   * Index item has been changed and should be updated / added.
   * Only non-cancelable event is considered.
   * @param {CustomEvent} e
   */
  _indexUpdated(e) {
    if (e.cancelable) {
      return;
    }
    const item = e.detail.apiInfo;
    const items = this.items;
    if (!items) {
      this.items = [item];
      return;
    }
    const index = this.items.findIndex((obj) => obj._id === item._id);
    if (index === -1) {
      items.push(item);
      items.sort(this._sortData);
    } else {
      items[index] = item;
    }
    this.items = [...items];
  }
  /**
   * Handler for API delete event.
   * Only non-cancelable event is considered.
   * @param {CustomEvent} e
   */
  _indexDeleted(e) {
    if (e.cancelable) {
      return;
    }
    const items = this.items;
    if (!items || !items.length) {
      return;
    }
    const id = e.detail.id;
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) {
      return;
    }
    items.splice(index, 1);
    this.items = [...items];
  }

  _selectionChanged(e) {
    this.selectedApi = e.detail.value;
  }

  _dropTargetTemplate() {
    return html`<section class="drop-target">
      <p class="drop-message">Drop file here</p>
    </section>`;
  }

  _unavailableTemplate() {
    return html`<div class="empty-message">
      <h3 class="empty-title">Drop API project here</h3>
      <p class="empty-info">There is no API stored with the application</p>
    </div>`;
  }

  _listTemplate() {
    const items = this.items || [];
    const { compatibility } = this;
    return items.map((item, index) => html`
      <anypoint-item
        data-index="${index}"
        data-id="${item._id}"
        @click="${this._openAPI}"
        role="menuitem"
        ?compatibility="${compatibility}">
        <span class="name">${item.title}</span>
      </anypoint-item>`);
  }

  render() {
    const { dataUnavailable, hasItems, querying, selectedApi } = this;
    return html`
    ${this.modelTemplate}
    <paper-progress ?hidden="${!querying}" indeterminate></paper-progress>
    ${dataUnavailable ? this._unavailableTemplate() : ''}
    ${this._dropTargetTemplate()}

    <rest-api-menu-wrapper
      class="list"
      selectable="anypoint-item"
      attrforselected="data-id"
      .selected="${selectedApi}"
      @selected-changed="${this._selectionChanged}">
      ${hasItems ? this._listTemplate() : ''}
    </rest-api-menu-wrapper>`;
  }
}
