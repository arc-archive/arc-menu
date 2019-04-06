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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {afterNextRender} from '../../@polymer/polymer/lib/utils/render-status.js';
import '../../@advanced-rest-client/saved-menu/saved-menu.js';
import '../../@advanced-rest-client/history-menu/history-menu.js';
import '../../@advanced-rest-client/rest-api-menu/rest-api-menu.js';
import '../../@advanced-rest-client/projects-menu/projects-menu.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@polymer/paper-tabs/paper-tabs.js';
import '../../@polymer/paper-tabs/paper-tab.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@polymer/iron-collapse/iron-collapse.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * Side navigation for Advanced REST Client.
 *
 * ### Styling
 * `<arc-menu>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--arc-menu` | Mixin applied to the element | `{}`
 * `--arc-menu-bottom-actions` | Mixin applied to the bottom pane with additional actions. | `{}`
 * `--arc-menu-bottom-actions-button` | Mixin applied to the buttons in bottom action pane. | `{}`
 * `--arc-menu-bottom-actions-button-hover` | Mixin applied to the buttons in bottom action pane when hovering. | `{}`
 * `--arc-menu-tabs-color` | Color of the papaer tabs | ``
 * `--arc-menu-tabs-color-unselected` | Color of the papaer tabs when not selected | ``
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
class ArcMenu extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      height: var(--arc-menu-height, 100vh);
      background-color: var(--arc-menu-background-color, inherit);

      @apply --arc-font-body1;

      --paper-tab-content-unselected: {
        color: var(--arc-menu-tabs-color-unselected);
      };
    }

    .menu {
      @apply --layout-vertical;
      height: inherit;
      overflow: hidden;
    }

    history-menu,
    saved-menu,
    rest-api-menu,
    projects-menu {
      @apply --layout-flex;
      height: calc(100% - 96px);
    }

    .menu-actions {
      padding: 4px 0;
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    .spacer {
      @apply --layout-flex;
    }

    [hidden] {
      display: none !important;
    }

    paper-tab {
      color: var(--arc-menu-tabs-color);
    }

    .warning-message {
      @apply --layout-horizontal;
      background-color: var(--arc-menu-warning-gb-color, #FFB74D);
      color: var(--arc-menu-warning-color, black);
      font-size: 16px;
      border-radius: 3px;
      padding-right: 12px;
    }

    .warning-message h3 {
      @apply --arc-font-title;
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
    </style>
    <div rel="menu" class="menu">
      <div class="tabs">
        <paper-tabs selected="{{selected}}" id="tabs" on-dragover="_dragoverHandler" on-dragleave="_dragleaveHandler">
          <template is="dom-if" if="[[historyEnabled]]">
            <paper-tab data-type="history" hidden\$="[[hideHistory]]">History</paper-tab>
          </template>
          <paper-tab data-type="saved" hidden\$="[[hideSaved]]">Saved</paper-tab>
          <paper-tab data-type="projects" hidden\$="[[hideProjects]]">Projects</paper-tab>
          <paper-tab data-type="rest-apis" hidden\$="[[hideApis]]">APIs</paper-tab>
        </paper-tabs>
      </div>

      <template is="dom-if" if="[[_computeHistoryOpened(selected, historyEnabled, hideHistory)]]">
        <div class="menu-actions">
          <paper-button
            on-click="_openHistoryList"
            data-action="open-history"
            title="Opens history in full screen">All history</paper-button>
          <paper-button
            on-click="refreshHistoryList"
            data-action="refresh-history"
            title="Forces refresh data from datastore">Refresh</paper-button>
          <span class="spacer"></span>
          <template is="dom-if" if="[[allowPopup]]">
            <paper-icon-button
              on-click="popupHistory"
              data-action="popup-history"
              icon="arc:open-in-new"
              alt="Popup history menu"
              title="Opens history menu in new window"></paper-icon-button>
          </template>
        </div>
        <history-menu list-type="[[listType]]" draggable-enabled="[[draggableEnabled]]"></history-menu>
      </template>

      <template is="dom-if" if="[[_computeSavedOpened(selected, hideSaved)]]">
        <div class="menu-actions">
          <paper-button
            on-click="_openSavedList"
            data-action="open-saved"
            title="Opens saved requests list in full screen">All saved</paper-button>
          <paper-button
            on-click="refreshSavedList"
            data-action="refresh-saved"
            title="Forces refresh data from datastore">Refresh</paper-button>
          <span class="spacer"></span>
          <paper-icon-button
            class="warning-toggle"
            on-click="_toggleSavedWarning"
            data-action="toggle-saved-removal-messsage"
            icon="arc:warning"
            title="Toggle warning message"></paper-icon-button>
          <template is="dom-if" if="[[allowPopup]]">
            <paper-icon-button
              on-click="popupSaved"
              data-action="popup-saved"
              icon="arc:open-in-new"
              alt="Popup saved menu"
              title="Opens saved requests menu in new window"></paper-icon-button>
          </template>
        </div>
        <iron-collapse opened="[[_savedWarningOpened]]">
          <aside class="warning-message">
            <div class="info-icon">
              <iron-icon icon="arc:info"></iron-icon>
            </div>
            <section>
              <h3>Say goodbye to "saved"</h3>
              <p>
                Saved requests are being deprecated. We want to focus on what is
                important to you: simplicity and reliability.
              </p>
              <p>
                Soon, we will redesign the way the requests are stored. Primary use case will be to save a request
                <b>in a project</b>. This will help to better organize
                your data and improve your experience when using this application.
              </p>
              <p>
                We value your voice and we would like to know your opinion about planned changes.<br>
                <paper-button class="ticket-button"
                  raised=""
                  on-click="_openSavedRemovalTicket">Join the discussion</paper-button>
              </p>
            </section>
          </aside>
        </iron-collapse>
        <saved-menu list-type="[[listType]]" draggable-enabled="[[draggableEnabled]]"></saved-menu>
      </template>

      <template is="dom-if" if="[[_computeProjectsOpened(selected, hideProjects)]]">
        <div class="menu-actions">
          <paper-button
            on-click="refreshProjectsList"
            data-action="refresh-projects"
            title="Forces refresh data from datastore">Refresh</paper-button>
          <span class="spacer"></span>
          <template is="dom-if" if="[[allowPopup]]">
            <paper-icon-button
              on-click="popupProjects"
              data-action="popup-saved"
              icon="arc:open-in-new"
              alt="Popup saved menu"
              title="Opens projects menu in new window"></paper-icon-button>
          </template>
        </div>
        <projects-menu list-type="[[listType]]" draggable-enabled="[[draggableEnabled]]"></projects-menu>
      </template>

      <template is="dom-if" if="[[_computeApisOpened(selected, hideApis)]]">
        <div class="menu-actions">
          <paper-button
            on-click="_openApisList"
            data-action="open-rest-apis"
            title="Opens saved requests list in full screen">All APIs</paper-button>
          <paper-button
            on-click="refreshApisList"
            data-action="refresh-rest-apis"
            title="Forces refresh data from datastore">Refresh</paper-button>
          <paper-button
            on-click="_exporeApis"
            data-action="explore-rest-apis" title="Opens APIs expore screen">Explore</paper-button>
          <span class="spacer"></span>
          <template is="dom-if" if="[[allowPopup]]">
            <paper-icon-button
              on-click="popupApis"
              data-action="popup-rest-apis"
              icon="arc:open-in-new"
              alt="Popup APIs menu"
              title="Opens APIs menu in new window"></paper-icon-button>
          </template>
        </div>
        <rest-api-menu></rest-api-menu>
      </template>
    </div>`;
  }

  static get properties() {
    return {
      // Currently selected menu tab
      selected: {
        type: Number,
        value: 0,
        observer: '_selectedChanged'
      },

      _savedWarningOpened: Boolean,
      /**
       * Changes information density of list items.
       * By default it uses material's peper item with two lines (72px heigth)
       * Possible values are:
       *
       * - `default` or empty - regular list view
       * - `comfortable` - enables MD single line list item vie (52px heigth)
       * - `compact` - enables list that has 40px heigth (touch recommended)
       */
      listType: String,
      /**
       * If set the history menu is rendered. This cames from application
       * settings and is different from `noHistory` which is intended to
       * temporaily remove the history from the view (for menu popup option)
       */
      historyEnabled: {type: Boolean, observer: '_historyEnabledChanegd'},
      /**
       * When set it hiddes history from the view
       */
      hideHistory: {type: Boolean, observer: '_hideHistoryChanegd'},
      /**
       * When set it hiddes saved list from the view
       */
      hideSaved: {type: Boolean, observer: '_hideSavedChanegd'},
      /**
       * When set it hiddes projects from the view
       */
      hideProjects: {type: Boolean, observer: '_hideProjectsChanegd'},
      /**
       * When set it hiddes APIs list from the view
       */
      hideApis: {type: Boolean, observer: '_hideApisChanegd'},
      /**
       * Renders popup menu buttons when this property is set.
       */
      allowPopup: Boolean,
      /**
       * Adds draggable property to the request list item element.
       * The `dataTransfer` object has `arc/request-object` mime type with
       * serialized JSON with request model.
       */
      draggableEnabled: {type: Boolean, value: false},
      /**
       * A timeout after which the project item is opened when dragging a
       * request over.
       */
      dragOpenTimeout: {type: Number, value: 700}
    };
  }

  static get observers() {
    return [
      '_rerenderTabs(historyEnabled, hideHistory, hideSaved, hideProjects, hideApis)'
    ];
  }

  _selectedChanged(selected) {
    if (selected !== 0 && selected !== 1) {
      return;
    }
    afterNextRender(this, () => {
      const selector = selected === 0 ? 'history-menu' : 'saved-menu';
      const panel = this.shadowRoot.querySelector(selector);
      if (!panel) {
        return;
      }
      panel.notifyResize();
    });
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

  _toggleSavedWarning() {
    this._savedWarningOpened = !this._savedWarningOpened;
  }

  _openSavedRemovalTicket() {
    const url = 'https://github.com/advanced-rest-client/arc-electron/issues/80';
    const e = new CustomEvent('open-external-url', {
      composed: true,
      bubbles: true,
      cancelable: true,
      detail: {
        url
      }
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      window.open(url);
    }
  }
  /**
   * Computes condition value if history menu should be rendered
   * @param {Number} selected Currently selected panel
   * @param {Boolean} historyEnabled
   * @param {Boolean} hideHistory
   * @return {Boolean}
   */
  _computeHistoryOpened(selected, historyEnabled, hideHistory) {
    if (!historyEnabled || hideHistory) {
      return false;
    }
    return !selected;
  }
  /**
   * Computes condition value if saved menu should be rendered
   * @param {Number} selected Currently selected panel
   * @param {Boolean} hideSaved
   * @return {Boolean}
   */
  _computeSavedOpened(selected, hideSaved) {
    if (hideSaved) {
      return false;
    }
    return selected === 1;
  }
  /**
   * Computes condition value if projects menu should be rendered
   * @param {Number} selected Currently selected panel
   * @param {Boolean} hideProjects
   * @return {Boolean}
   */
  _computeProjectsOpened(selected, hideProjects) {
    if (hideProjects) {
      return false;
    }
    return selected === 2;
  }
  /**
   * Computes condition value if saved apis should be rendered
   * @param {Number} selected Currently selected panel
   * @param {Boolean} hideApis
   * @return {Boolean}
   */
  _computeApisOpened(selected, hideApis) {
    if (hideApis) {
      return false;
    }
    return selected === 3;
  }
  /**
   * Calls `notifyResize()` of the tabs to re-render selection.
   */
  _rerenderTabs() {
    this.$.tabs.notifyResize();
  }
  /**
   * Selects first panel that is not hidden
   */
  _selectFirstAvailable() {
    if (!this.hideHistory && this.historyEnabled) {
      this.selected = 0;
    } else if (!this.hideSaved) {
      this.selected = 1;
    } else if (!this.hideProjects) {
      this.selected = 2;
    } else if (!this.hideApis) {
      this.selected = 3;
    }
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
  _findPaperTab(e) {
    const path = e.path || e.composedPath();
    for (let i = 0, len = path.length; i < len; i++) {
      const target = path[i];
      if (target.nodeName === 'PAPER-TAB') {
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
    const tab = this._findPaperTab(e);
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
window.customElements.define('arc-menu', ArcMenu);
