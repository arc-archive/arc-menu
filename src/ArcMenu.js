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
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '../saved-menu.js';
import '../history-menu.js';
import '../rest-api-menu.js';
import '../projects-menu.js';

export class ArcMenu extends LitElement {
  static get styles() {
    return css`
    :host {
      display: block;
      height: var(--arc-menu-height, 100vh);
      background-color: var(--arc-menu-background-color, inherit);
    }

    .menu {
      display: flex;
      flex-direction: column;
      height: inherit;
      overflow: hidden;
    }

    history-menu,
    saved-menu,
    rest-api-menu,
    projects-menu {
      flex: 1;
      height: calc(100% - 96px);
    }

    .menu-actions {
      padding: 4px 0;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .spacer {
      flex: 1;
    }

    [hidden] {
      display: none !important;
    }

    anypoint-tab {
      color: var(--arc-menu-tabs-color);
    }

    .warning-message {
      display: flex;
      flex-direction: row;
      background-color: var(--arc-menu-warning-gb-color, #FFB74D);
      color: var(--arc-menu-warning-color, black);
      font-size: 16px;
      border-radius: 3px;
      padding-right: 12px;
    }

    .warning-message h3 {
      font-size: 1.25rem;
      font-weight: 200;
    }

    .warning-message .info-icon {
      margin-left: 24px;
      margin-right: 12px;
      margin-top: 24px;
      color: var(--arc-menu-warning-icon-color, #ffffff);
    }

    .warning-toggle {
      color: var(--arc-menu-warning-toggle-color, #FF5722);
    }

    .ticket-button {
      background-color: var(--arc-menu-warning-button-gb-color, #fff);
      margin-top: 12px;
    }

    anypoint-tab {
      margin-left: 0;
      margin-right: 0;
      padding: 0.7em 0.4em;
    }
    `;
  }

  static get properties() {
    return {
      // Currently selected menu tab
      selected: { type: Number },
      /**
       * Changes information density of list items.
       * By default it uses material's peper item with two lines (72px heigth)
       * Possible values are:
       *
       * - `default` or empty - regular list view
       * - `comfortable` - enables MD single line list item vie (52px heigth)
       * - `compact` - enables list that has 40px heigth (touch recommended)
       */
      listType: { type: String },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * If set the history menu is rendered. This cames from application
       * settings and is different from `noHistory` which is intended to
       * temporaily remove the history from the view (for menu popup option)
       */
      historyEnabled: { type: Boolean },
      /**
       * When set it hiddes history from the view
       */
      hideHistory: { type: Boolean },
      /**
       * When set it hiddes saved list from the view
       */
      hideSaved: { type: Boolean },
      /**
       * When set it hiddes projects from the view
       */
      hideProjects: { type: Boolean },
      /**
       * When set it hiddes APIs list from the view
       */
      hideApis: { type: Boolean },
      /**
       * Renders popup menu buttons when this property is set.
       */
      allowPopup: { type: Boolean },
      /**
       * Adds draggable property to the request list item element.
       * The `dataTransfer` object has `arc/request-object` mime type with
       * serialized JSON with request model.
       */
      draggableEnabled: { type: Boolean },
      /**
       * A timeout after which the project item is opened when dragging a
       * request over.
       */
      dragOpenTimeout: { type: Number }
    };
  }

  get historyEnabled() {
    return this._historyEnabled;
  }

  set historyEnabled(value) {
    const old = this._historyEnabled;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._historyEnabled = value;
    this.requestUpdate('historyEnabled', old);
    this._historyEnabledChanegd(value, old);
  }

  get hideHistory() {
    return this._hideHistory;
  }

  set hideHistory(value) {
    const old = this._hideHistory;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._hideHistory = value;
    this.requestUpdate('hideHistory', old);
    this._hideHistoryChanegd(value);
  }

  get hideSaved() {
    return this._hideSaved;
  }

  set hideSaved(value) {
    const old = this._hideSaved;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._hideSaved = value;
    this.requestUpdate('hideSaved', old);
    this._hideSavedChanegd(value);
  }

  get hideProjects() {
    return this._hideProjects;
  }

  set hideProjects(value) {
    const old = this._hideProjects;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._hideProjects = value;
    this.requestUpdate('hideProjects', old);
    this._hideProjectsChanegd(value);
  }

  get hideApis() {
    return this._hideApis;
  }

  set hideApis(value) {
    const old = this._hideApis;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._hideApis = value;
    this.requestUpdate('hideApis', old);
    this._hideApisChanegd(value);
  }

  constructor() {
    super();
    this.selected = 0;
    this.dragOpenTimeout = 700;
  }

  _navigateScreen(base) {
    this.dispatchEvent(new CustomEvent('navigate', {
      composed: true,
      bubbles: true,
      cancelable: true,
      detail: {
        base
      }
    }));
  }

  _openHistoryList() {
    this._navigateScreen('history');
  }

  _openSavedList() {
    this._navigateScreen('saved');
  }

  _openApisList() {
    this._navigateScreen('rest-projects');
  }

  _exporeApis() {
    this._navigateScreen('exchange-search');
  }

  _refreshList(type) {
    const node = this.shadowRoot.querySelector(type);
    if (node && node.refresh) {
      node.refresh();
    }
  }

  /**
   * Forces to refresh history list
   */
  refreshHistoryList() {
    this._refreshList('history-menu');
  }
  /**
   * Forces to refresh saved list
   */
  refreshSavedList() {
    this._refreshList('saved-menu');
  }
  /**
   * Forces to refresh projects list
   */
  refreshProjectsList() {
    this._refreshList('projects-menu');
  }
  /**
   * Forces to refresh apis list
   */
  refreshApisList() {
    this._refreshList('rest-api-menu');
  }

  /**
   * Dispatches `popup-menu` custom event
   * @param {String} type Panel name
   */
  _popupMenu(type) {
    if (!this.allowPopup) {
      return;
    }
    this.dispatchEvent(new CustomEvent('popup-menu', {
      composed: true,
      bubbles: true,
      cancelable: true,
      detail: {
        type
      }
    }));
  }
  /**
   * Requests to popup history menu.
   */
  popupHistory() {
    this._popupMenu('history-menu');
  }
  /**
   * Requests to popup saved menu.
   */
  popupSaved() {
    this._popupMenu('saved-menu');
  }
  /**
   * Requests to popup projects menu.
   */
  popupProjects() {
    this._popupMenu('projects-menu');
  }
  /**
   * Requests to popup apis menu.
   */
  popupApis() {
    this._popupMenu('rest-api-menu');
  }

  /**
   * Selects first panel that is not hidden
   */
  async _selectFirstAvailable() {
    const { historyEnabled } = this;
    const padding = historyEnabled ? 0 : -1;
    let value;
    this.selected = undefined;
    if (!this.hideHistory && historyEnabled) {
      value = 0;
    } else if (!this.hideSaved) {
      value = 1 + padding;
    } else if (!this.hideProjects) {
      value = 2 + padding;
    } else if (!this.hideApis) {
      value = 3 + padding;
    }
    await this.updateComplete;
    this.selected = value;
  }

  /**
   * Calls `_selectFirstAvailable()` if `panelId` is current selection.
   * @param {Number} panelId
   */
  _updateSelectionIfNeeded(panelId) {
    if (panelId === this.selected) {
      this._selectFirstAvailable();
    }
  }
  /**
   * Updates selection when history panel is removed
   * @param {Boolean} val
   */
  _hideHistoryChanegd(val) {
    if (val) {
      this._updateSelectionIfNeeded(0);
    }
  }
  /**
   * Updates selection when saved panel is removed
   * @param {Boolean} val
   */
  _hideSavedChanegd(val) {
    if (val) {
      this._updateSelectionIfNeeded(1);
    }
  }
  /**
   * Updates selection when saved panel is removed
   * @param {Boolean} val
   */
  _hideProjectsChanegd(val) {
    if (val) {
      this._updateSelectionIfNeeded(2);
    }
  }
  /**
   * Updates selection when saved panel is removed
   * @param {Boolean} val
   */
  _hideApisChanegd(val) {
    if (val) {
      this._updateSelectionIfNeeded(3);
    }
  }
  /**
   * Updates selection when history is disabled/enabled
   * @param {Boolean} val
   * @param {?Boolean} old
   */
  _historyEnabledChanegd(val, old) {
    if (!val && old !== undefined) {
      this._updateSelectionIfNeeded(0);
    } else if (val && this.selected !== 0) {
      this.selected = 0;
    }
  }
  /**
   * Finds paper-tab element in event path.
   * @param {Event} e Event with `path` or `composedPath()`
   * @return {Element|undefined}
   */
  _findTab(e) {
    const path = e.path || e.composedPath();
    for (let i = 0, len = path.length; i < len; i++) {
      const target = path[i];
      if (target.localName === 'anypoint-tab') {
        return target;
      }
    }
  }
  /**
   * Handler for `dragover` event on paper tabs.
   * Opens the tab if the dragged element can be dropped in corresponding menu.
   * @param {DragEvent} e
   */
  _dragoverHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    const tab = this._findTab(e);
    if (!tab) {
      return;
    }
    const type = tab.dataset.type;
    if (['saved', 'projects'].indexOf(type) === -1) {
      return;
    }
    e.preventDefault();
    if (this.__dragTypeCallback === type) {
      return;
    }
    this._cancelDragTimeout();
    const selected = this.selected;
    if (type === 'saved' && selected === 1) {
      return;
    }
    if (type === 'projects' && selected === 2) {
      return;
    }
    this.__dragTypeCallback = type;
    this.__dragOverTimeout = setTimeout(() => this._openMenuDragOver(), this.dragOpenTimeout);
  }
  /**
   * Handler for `dragleave` event on project node.
   * @param {DragEvent} e
   */
  _dragleaveHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.preventDefault();
    this._cancelDragTimeout();
  }
  /**
   * Cancels the timer set in the dragover event
   */
  _cancelDragTimeout() {
    if (this.__dragOverTimeout) {
      clearTimeout(this.__dragOverTimeout);
      this.__dragOverTimeout = undefined;
    }
    this.__dragTypeCallback = undefined;
  }

  _openMenuDragOver() {
    if (!this.draggableEnabled) {
      return;
    }
    const type = this.__dragTypeCallback;
    this._cancelDragTimeout();
    let selection;
    switch (type) {
      case 'saved': selection = 1; break;
      case 'projects': selection = 2; break;
    }
    if (selection === undefined) {
      return;
    }
    this.selected = selection;
  }

  _tabsHandler(e) {
    this.selected = e.detail.value;
  }

  _tabsTemplate() {
    const { selected, historyEnabled, hideHistory, hideSaved, hideProjects, hideApis, compatibility } = this;
    return html`
    <anypoint-tabs
      .selected="${selected}"
      id="tabs"
      @dragover="${this._dragoverHandler}"
      @dragleave="${this._dragleaveHandler}"
      @selected-changed="${this._tabsHandler}"
      ?compatibility="${compatibility}">
      ${historyEnabled ? html`<anypoint-tab data-type="history" ?hidden="${hideHistory}">History</anypoint-tab>` : ''}
      <anypoint-tab data-type="saved" ?hidden="${hideSaved}">Saved</anypoint-tab>
      <anypoint-tab data-type="projects" ?hidden="${hideProjects}">Projects</anypoint-tab>
      <anypoint-tab data-type="rest-apis" ?hidden="${hideApis}">APIs</anypoint-tab>
    </anypoint-tabs>`;
  }

  _historyTemplate() {
    const { allowPopup, listType, draggableEnabled, compatibility } = this;
    return html`<div class="menu-actions">
      <anypoint-button
        @click="${this._openHistoryList}"
        data-action="open-history"
        title="Opens history in full screen"
        ?compatibility="${compatibility}"
      >All history</anypoint-button>
      <anypoint-button
        @click="${this.refreshHistoryList}"
        data-action="refresh-history"
        title="Forces refresh data from datastore"
        ?compatibility="${compatibility}"
      >Refresh</anypoint-button>
      <span class="spacer"></span>
      ${allowPopup ? html`<anypoint-icon-button
        @click="${this.popupHistory}"
        data-action="popup-history"
        aria-label="Popup history menu"
        title="Opens history menu in new window"
        ?compatibility="${compatibility}"
      >
        <iron-icon icon="arc:open-in-new" alt="Popup history menu"></iron-icon>
      </anypoint-icon-button>` : ''}
    </div>
    <history-menu
      .listType="${listType}"
      ?draggableenabled="${draggableEnabled}"
      ?compatibility="${compatibility}"></history-menu>`;
  }

  _savedTemplate() {
    const { allowPopup, listType, draggableEnabled, compatibility } = this;
    return html`<div class="menu-actions">
      <anypoint-button
        @click="${this._openSavedList}"
        data-action="open-saved"
        title="Opens saved requests list in full screen"
      >All saved</anypoint-button>
      <anypoint-button
        @click="${this.refreshSavedList}"
        data-action="refresh-saved"
        title="Refresh data from the datastore"
      >Refresh</anypoint-button>
      <span class="spacer"></span>
      ${allowPopup ? html`<anypoint-icon-button
        @click="${this.popupSaved}"
        data-action="popup-saved"
        aria-saved="Popup saved menu"
        title="Opens saved requests menu in new window"
      >
        <iron-icon icon="arc:open-in-new" alt="Popup saved menu"></iron-icon>
      </anypoint-icon-button>` : '' }
    </div>
    <saved-menu
      .listType="${listType}"
      ?draggableenabled="${draggableEnabled}"
      ?compatibility="${compatibility}"></saved-menu>`;
  }

  _projectsTemplate() {
    const { allowPopup, listType, draggableEnabled, compatibility } = this;
    return html`<div class="menu-actions">
      <paper-button
        @click="${this.refreshProjectsList}"
        data-action="refresh-projects"
        title="Forces refresh data from datastore">Refresh</paper-button>
      <span class="spacer"></span>
      ${allowPopup ? html`<anypoint-icon-button
        @click="${this.popupProjects}"
        data-action="popup-projects"
        aria-label="Popup projects menu"
        title="Opens projects menu in new window"
      >
        <iron-icon icon="arc:open-in-new" alt="Popup projects menu"></iron-icon>
      </anypoint-icon-button>` : ''}
    </div>
    <projects-menu
      .listType="${listType}"
      ?draggableenabled="${draggableEnabled}"
      ?compatibility="${compatibility}"></projects-menu>`;
  }

  _apisTemplate() {
    const { allowPopup, listType, draggableEnabled, compatibility } = this;
    return html`<div class="menu-actions">
      <anypoint-button
        @click="${this._openApisList}"
        data-action="open-rest-apis"
        title="Opens saved requests list in full screen">All APIs</anypoint-button>
      <anypoint-button
        @click="${this.refreshApisList}"
        data-action="refresh-rest-apis"
        title="Forces refresh data from datastore">Refresh</anypoint-button>
      <anypoint-button
        @click="${this._exporeApis}"
        data-action="explore-rest-apis"
        title="Opens APIs expore screen">Explore</anypoint-button>
      <span class="spacer"></span>
      ${allowPopup ? html`<anypoint-icon-button
        @click="${this.popupApis}"
        data-action="popup-rest-apis"
        icon="arc:open-in-new"
        aria-label="Popup APIs menu"
        title="Opens APIs menu in new window"
      >
        <iron-icon icon="arc:open-in-new" alt="Popup APIs menu"></iron-icon>
      </anypoint-icon-button>` : ''}
    </div>
    <rest-api-menu
      .listType="${listType}"
      ?draggableenabled="${draggableEnabled}"
      ?compatibility="${compatibility}"></rest-api-menu>`;
  }

  _menuTemplate() {
    const { selected, historyEnabled, hideHistory, hideSaved, hideProjects, hideApis } = this;
    const effective = historyEnabled ? selected : selected + 1;
    if (!effective && historyEnabled && !hideHistory) {
      return this._historyTemplate();
    }
    if (effective === 1 && !hideSaved) {
      return this._savedTemplate();
    }
    if (effective === 2 && !hideProjects) {
      return this._projectsTemplate();
    }
    if (effective === 3 && !hideApis) {
      return this._apisTemplate();
    }
  }

  render() {
    return html`<div class="menu">
      <div class="tabs">
        ${this._tabsTemplate()}
      </div>
      ${this._menuTemplate()}
    </div>
    `;
  }
  /**
   * Fired when the user performed a navigation action.
   *
   * It uses ARC's standard navigation event:
   * https://github.com/advanced-rest-client/arc-electron/wiki/Navigation-events---dev-guide
   *
   * @event navigate
   */

  /**
   * Dispatched when  the user requested to popup a panel.
   * @event popup-menu
   * @param {String} type
   */
  /**
   * Dispatched when requested to open an URL.
   * If this event is not handled then it uses `window.open()` instead.
   * To handle the event cancel it by calling `e.preventDefault()`.
   *
   * @event open-external-url
   * @param {String} url The URL to open.
   */
}
