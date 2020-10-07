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
/* eslint-disable no-plusplus */
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import { ArcNavigationEvents } from '@advanced-rest-client/arc-events';
import '../saved-menu.js';
import '../history-menu.js';
import '../rest-api-menu.js';
import '../projects-menu.js';
import menuStyles from './styles/ArcMenu.js';

/** @typedef {import('@anypoint-web-components/anypoint-tabs').AnypointTab} AnypointTab */
/** @typedef {import('@anypoint-web-components/anypoint-tabs').AnypointTabs} AnypointTabs */
/** @typedef {import('@anypoint-web-components/anypoint-input').AnypointInput} AnypointInput */
/** @typedef {import('./HistoryMenuElement').HistoryMenuElement} HistoryMenuElement */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const historyValue = Symbol('historyValue');
export const historyChanged = Symbol('historyChanged');
export const hideHistoryValue = Symbol('hideHistoryValue');
export const hideHistoryChanged = Symbol('hideHistoryChanged');
export const hideSavedValue = Symbol('hideSavedValue');
export const hideSavedChanged = Symbol('hideSavedChanged');
export const hideProjectsValue = Symbol('hideProjectsValue');
export const hideProjectsChanged = Symbol('hideProjectsChanged');
export const hideApisValue = Symbol('hideApisValue');
export const hideApisChanged = Symbol('hideApisChanged');
export const openHistoryHandler = Symbol('openHistoryHandler');
export const openSavedHandler = Symbol('openSavedHandler');
export const openApisHandler = Symbol('openApisHandler');
export const openExchangeHandler = Symbol('openExchangeHandler');
export const refreshList = Symbol('refreshList');
export const selectFirstAvailable = Symbol('selectFirstAvailable');
export const updateSelectionIfNeeded = Symbol('updateSelectionIfNeeded');
export const dragoverHandler = Symbol('dragoverHandler');
export const dragleaveHandler = Symbol('dragleaveHandler');
export const dragTypeCallbackValue = Symbol('dragTypeCallbackValue');
export const dragOverTimeoutValue = Symbol('dragOverTimeoutValue');
export const cancelDragTimeout = Symbol('cancelDragTimeout');
export const openMenuDragOver = Symbol('openMenuDragOver');
export const tabsHandler = Symbol('tabsHandler');
export const tabsTemplate = Symbol('tabsTemplate');
export const historyTemplate = Symbol('historyTemplate');
export const historyActionsTemplate = Symbol('historyActionsTemplate');
export const savedTemplate = Symbol('savedTemplate');
export const savedActionsTemplate = Symbol('savedActionsTemplate');
export const projectsTemplate = Symbol('projectsTemplate');
export const apisTemplate = Symbol('apisTemplate');
export const popupButtonTemplate = Symbol('popupButtonTemplate');
export const searchButtonTemplate = Symbol('searchButtonTemplate');
export const searchInputTemplate = Symbol('searchButtonTemplate');
export const refreshButtonTemplate = Symbol('refreshButtonTemplate');
export const refreshHandler = Symbol('refreshHandler');
export const popupHandler = Symbol('popupHandler');
export const openedValue = Symbol('openedValue');
export const effectiveSelected = Symbol('effectiveSelected');
export const searchOpenedValue = Symbol('searchOpenedValue');
export const searchToggleHandler = Symbol('searchToggleHandler');
export const searchHandler = Symbol('searchHandler');

/**
 * Finds anypoint-tab element in event path.
 * @param {Event} e Event with `path` or `composedPath()`
 * @return {AnypointTab|undefined}
 */
export function findTab(e) {
  const path = e.composedPath();
  for (let i = 0, len = path.length; i < len; i++) {
    const target = /** @type HTMLElement */ (path[i]);
    if (target.localName === 'anypoint-tab') {
      return /** @type AnypointTab */ (target);
    }
  }
  return undefined;
}

/**
 * A list of types of the menu elements.
 */
export const MenuTypes = {
  history: 'history',
  saved: 'saved',
  projects: 'projects',
  apiDocs: 'apiDocs',
};

export const popupAriaLabels = {
  [MenuTypes.history]: 'Popup history menu',
  [MenuTypes.saved]: 'Popup saved menu',
  [MenuTypes.projects]: 'Popup projects menu',
  [MenuTypes.apiDocs]: 'Popup API docs menu',
};
export const popupButtonTitles = {
  [MenuTypes.history]: 'Opens history menu in a new window',
  [MenuTypes.saved]: 'Opens saved menu in a new window',
  [MenuTypes.projects]: 'Opens projects menu in a new window',
  [MenuTypes.apiDocs]: 'Opens API docs menu in a new window',
};


export class ArcMenuElement extends LitElement {
  static get styles() {
    return menuStyles;
  }

  static get properties() {
    return {
      /**
       * Currently selected menu tab
       */
      selected: { type: Number, reflect: true },
      /**
       * Changes information density of list items.
       * By default it uses material's list item with two lines (72px height)
       * Possible values are:
       *
       * - `default` or empty - regular list view
       * - `comfortable` - enables MD single line list item vie (52px height)
       * - `compact` - enables list that has 40px height (touch recommended)
       */
      listType: { type: String, reflect: true },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean, reflect: true },
      /**
       * If set the history menu is rendered. This comes from the application
       * settings and is different from `noHistory` which is intended to
       * temporarily remove the history from the view (for menu popup option)
       */
      history: { type: Boolean, reflect: true },
      /**
       * When set it hides history from the view
       */
      hideHistory: { type: Boolean, reflect: true },
      /**
       * When set it hides saved list from the view
       */
      hideSaved: { type: Boolean, reflect: true },
      /**
       * When set it hides projects from the view
       */
      hideProjects: { type: Boolean, reflect: true },
      /**
       * When set it hides APIs list from the view
       */
      hideApis: { type: Boolean, reflect: true },
      /**
       * Renders popup menu buttons when this property is set.
       */
      popup: { type: Boolean, reflect: true },
      /**
       * Adds draggable property to the request list item element.
       * The `dataTransfer` object has `arc/request-object` mime type with
       * serialized JSON with request model.
       */
      dataTransfer: { type: Boolean, reflect: true },
      /**
       * A timeout after which the project item is opened when dragging a
       * request over.
       */
      dragOpenTimeout: { type: Number }
    };
  }

  get history() {
    return this[historyValue];
  }

  set history(value) {
    const old = this[historyValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[historyValue] = value;
    this.requestUpdate('history', old);
    this[historyChanged](value, old);
  }

  get hideHistory() {
    return this[hideHistoryValue];
  }

  set hideHistory(value) {
    const old = this[hideHistoryValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[hideHistoryValue] = value;
    this.requestUpdate('hideHistory', old);
    this[hideHistoryChanged](value);
  }

  get hideSaved() {
    return this[hideSavedValue];
  }

  set hideSaved(value) {
    const old = this[hideSavedValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[hideSavedValue] = value;
    this.requestUpdate('hideSaved', old);
    this[hideSavedChanged](value);
  }

  get hideProjects() {
    return this[hideProjectsValue];
  }

  set hideProjects(value) {
    const old = this[hideProjectsValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[hideProjectsValue] = value;
    this.requestUpdate('hideProjects', old);
    this[hideProjectsChanged](value);
  }

  get hideApis() {
    return this[hideApisValue];
  }

  set hideApis(value) {
    const old = this[hideApisValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[hideApisValue] = value;
    this.requestUpdate('hideApis', old);
    this[hideApisChanged](value);
  }

  /**
   * @return {number} The value of selected item, accounting for history item that toggles
   */
  get [effectiveSelected]() {
    const { selected, history } = this;
    return history ? selected : selected + 1;
  }

  constructor() {
    super();
    this.selected = 0;
    this.dragOpenTimeout = 700;
    this.popup = false;
    this.compatibility = false;
    this.history = false;
    this.hideHistory = false;
    this.hideSaved = false;
    this.hideProjects = false;
    this.hideApis = false;
    this.dataTransfer = false;
    this.listType = undefined;
    /**
     * Holds a list of once opened menus.
     * When an editor is once opened it does not disappear from the DOM
     * but is rather hidden. This list allows to differentiate the state.
     * 
     * Note, don't put all menus in the into the DOM at startup as this 
     * would make a lot of queries and DOM mutations when it's not needed.
     * 
     * @type {string[]}
     */
    this[openedValue] = ['history'];
    /**
     * A list of menu names that has currently search bar opened.
     * @type {string[]}
     */
    this[searchOpenedValue] = [];
  }

  [openHistoryHandler]() {
    ArcNavigationEvents.navigate(this, 'history');
  }

  [openSavedHandler]() {
    ArcNavigationEvents.navigate(this, 'saved');
  }

  [openApisHandler]() {
    ArcNavigationEvents.navigate(this, 'rest-projects');
  }

  [openExchangeHandler]() {
    ArcNavigationEvents.navigate(this, 'exchange-search');
  }

  /**
   * Refreshes a list by it's type
   * @param {string} type
   */
  [refreshList](type) {
    const node = this.shadowRoot.querySelector(type);
    // @ts-ignore
    if (node && node.refresh) {
      // @ts-ignore
      node.refresh();
    }
  }

  /**
   * Forces to refresh history list
   */
  refreshHistory() {
    this[refreshList]('history-menu');
  }

  /**
   * Forces to refresh saved list
   */
  refreshSaved() {
    this[refreshList]('saved-menu');
  }

  /**
   * Forces to refresh projects list
   */
  refreshProjects() {
    this[refreshList]('projects-menu');
  }

  /**
   * Forces to refresh apis list
   */
  refreshApiDocs() {
    this[refreshList]('rest-api-menu');
  }

  /**
   * Requests to popup history menu.
   */
  popupHistory() {
    if (!this.popup) {
      return;
    }
    ArcNavigationEvents.popupMenu(this, 'history-menu');
  }

  /**
   * Requests to popup saved menu.
   */
  popupSaved() {
    if (!this.popup) {
      return;
    }
    ArcNavigationEvents.popupMenu(this, 'saved-menu');
  }

  /**
   * Requests to popup projects menu.
   */
  popupProjects() {
    if (!this.popup) {
      return;
    }
    ArcNavigationEvents.popupMenu(this, 'projects-menu');
  }

  /**
   * Requests to popup apis menu.
   */
  popupApiDocs() {
    if (!this.popup) {
      return;
    }
    ArcNavigationEvents.popupMenu(this, 'rest-api-menu');
  }

  /**
   * Selects first panel that is not hidden
   */
  async [selectFirstAvailable]() {
    const { history } = this;
    const padding = history ? 0 : -1;
    let value;
    this.selected = undefined;
    if (!this.hideHistory && history) {
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
   * Calls `[selectFirstAvailable]()` if `panelId` is current selection.
   * @param {number} panelId
   */
  [updateSelectionIfNeeded](panelId) {
    if (panelId === this.selected) {
      this[selectFirstAvailable]();
    }
  }

  /**
   * Updates selection when history panel is removed
   * @param {Boolean} val
   */
  [hideHistoryChanged](val) {
    if (val) {
      this[updateSelectionIfNeeded](0);
    }
  }

  /**
   * Updates selection when saved panel is removed
   * @param {Boolean} val
   */
  [hideSavedChanged](val) {
    if (val) {
      this[updateSelectionIfNeeded](1);
    }
  }

  /**
   * Updates selection when saved panel is removed
   * @param {Boolean} val
   */
  [hideProjectsChanged](val) {
    if (val) {
      this[updateSelectionIfNeeded](2);
    }
  }

  /**
   * Updates selection when saved panel is removed
   * @param {Boolean} val
   */
  [hideApisChanged](val) {
    if (val) {
      this[updateSelectionIfNeeded](3);
    }
  }

  /**
   * Updates selection when history is disabled/enabled
   * @param {boolean} val
   * @param {boolean=} old
   */
  [historyChanged](val, old) {
    if (!val && old !== undefined) {
      this[updateSelectionIfNeeded](0);
    } else if (val && this.selected !== 0) {
      this.selected = 0;
    }
  }

  /**
   * Handler for `dragover` event on anypoint tabs.
   * Opens the tab if the dragged element can be dropped in corresponding menu.
   * @param {DragEvent} e
   */
  [dragoverHandler](e) {
    if (!this.dataTransfer) {
      return;
    }
    const types = [...e.dataTransfer.types];
    if (!types.includes('arc/request')) {
      return;
    }
    const tab = findTab(e);
    if (!tab) {
      return;
    }
    const { type } = tab.dataset;
    if (['saved', 'projects'].indexOf(type) === -1) {
      return;
    }
    e.preventDefault();
    if (this[dragTypeCallbackValue] === type) {
      return;
    }
    this[cancelDragTimeout]();
    const { selected } = this;
    if (type === 'saved' && selected === 1) {
      return;
    }
    if (type === 'projects' && selected === 2) {
      return;
    }
    this[dragTypeCallbackValue] = type;
    this[dragOverTimeoutValue] = setTimeout(() => this[openMenuDragOver](), this.dragOpenTimeout);
  }

  /**
   * Handler for `dragleave` event on project node.
   * @param {DragEvent} e
   */
  [dragleaveHandler](e) {
    if (!this.dataTransfer) {
      return;
    }
    const types = [...e.dataTransfer.types];
    if (!types.includes('arc/request')) {
      return;
    }
    e.preventDefault();
    this[cancelDragTimeout]();
  }

  /**
   * Cancels the timer set in the dragover event
   */
  [cancelDragTimeout]() {
    if (this[dragOverTimeoutValue]) {
      clearTimeout(this[dragOverTimeoutValue]);
      this[dragOverTimeoutValue] = undefined;
    }
    this[dragTypeCallbackValue] = undefined;
  }

  [openMenuDragOver]() {
    if (!this.dataTransfer) {
      return;
    }
    const type = this[dragTypeCallbackValue];
    this[cancelDragTimeout]();
    let selection;
    switch (type) {
      case 'saved': selection = 1; break;
      case 'projects': selection = 2; break;
      default:
    }
    if (selection === undefined) {
      return;
    }
    this.selected = selection;
  }

  /**
   * A handler for the popup menu button click
   * @param {PointerEvent} e
   */
  [popupHandler](e) {
    const button = /** @type HTMLElement */ (e.currentTarget);
    const { type } = button.dataset;
    const fnName = `popup${type[0].toUpperCase()}${type.substr(1)}`;
    this[fnName]();
  }

  /**
   * A handler for the refresh menu button click
   * @param {PointerEvent} e
   */
  [refreshHandler](e) {
    const button = /** @type HTMLElement */ (e.currentTarget);
    const { type } = button.dataset;
    const fnName = `refresh${type[0].toUpperCase()}${type.substr(1)}`;
    this[fnName]();
  }

  /**
   * @param {CustomEvent} e
   */
  [tabsHandler](e) {
    const tabs = /** @type AnypointTabs */ (e.currentTarget);
    this.selected = e.detail.value;
    if (!tabs.selectedItem) {
      return;
    }
    const { type } = tabs.selectedItem.dataset;
    if (!this[openedValue].includes(type)) {
      this[openedValue].push(type);
    }
  }

  /**
   * @param {CustomEvent} e
   */
  [searchToggleHandler](e) {
    const button = /** @type HTMLElement */ (e.currentTarget);
    const { type } = button.dataset;
    const opened = this[searchOpenedValue];
    if (!opened.includes(type)) {
      opened.push(type);
    } else {
      const index = opened.indexOf(type);
      opened.splice(index, 1);
    }
    this.requestUpdate();
  }

  /**
   * Handler for the search box keydown event
   * @param {CustomEvent} e 
   */
  [searchHandler](e) {
    const input = /** @type AnypointInput */ (e.target);
    const { value, dataset } = input;
    const { type } = dataset;
    const node = /** @type HistoryMenuElement */ (this.shadowRoot.querySelector(`${type}-menu`));
    if (value) {
      node.query(input.value);
    } else {
      node.query('');
      const opened = this[searchOpenedValue];
      const index = opened.indexOf(type);
      opened.splice(index, 1);
      this.requestUpdate();
    } 
  }

  /**
   * @returns {TemplateResult} Template for the tabs
   */
  [tabsTemplate]() {
    const { selected, history, hideHistory, hideSaved, hideProjects, hideApis, compatibility } = this;
    return html`
    <anypoint-tabs
      .selected="${selected}"
      id="tabs"
      @dragover="${this[dragoverHandler]}"
      @dragleave="${this[dragleaveHandler]}"
      @selected-changed="${this[tabsHandler]}"
      ?compatibility="${compatibility}"
    >
      ${history ? html`<anypoint-tab
        data-type="${MenuTypes.history}"
        ?hidden="${hideHistory}"
        ?compatibility="${compatibility}"
      >History</anypoint-tab>` : ''}
      <anypoint-tab
        ?compatibility="${compatibility}"
        data-type="${MenuTypes.saved}"
        ?hidden="${hideSaved}"
      >Saved</anypoint-tab>
      <anypoint-tab
        ?compatibility="${compatibility}"
        data-type="${MenuTypes.projects}"
        ?hidden="${hideProjects}"
      >Projects</anypoint-tab>
      <anypoint-tab
        ?compatibility="${compatibility}"
        data-type="${MenuTypes.apiDocs}"
        ?hidden="${hideApis}"
      >APIs</anypoint-tab>
    </anypoint-tabs>`;
  }

  /**
   * @returns {TemplateResult|string} Template for the history menu
   */
  [historyTemplate]() {
    if (this.hideHistory || !this.history) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedValue]);
    const effective = this[effectiveSelected];
    const wasOpened = allOpened.includes(MenuTypes.history);
    const menuOpened = !effective;
    if (!menuOpened && !wasOpened) {
      return '';
    }
    const { listType, dataTransfer, compatibility } = this;
    const classes = {
      hidden: !menuOpened,
      'menu-content': true,
    };
    const searchOpened = this[searchOpenedValue].includes(MenuTypes.history);
    return html`
    <div class="${classMap(classes)}">
      <div class="menu-actions">
        ${searchOpened ? this[searchInputTemplate](MenuTypes.history) : this[historyActionsTemplate]() }
      </div>
      <history-menu
        .listType="${listType}"
        ?draggableEnabled="${dataTransfer}"
        ?compatibility="${compatibility}"
      ></history-menu>
    </div>`;
  }

  /**
   * @returns {TemplateResult} A template for the history menu actions
   */
  [historyActionsTemplate]() {
    const { compatibility } = this;
    return html`
    <anypoint-button
      @click="${this[openHistoryHandler]}"
      data-action="open-history"
      title="Opens history in the main content area"
      ?compatibility="${compatibility}"
    >All</anypoint-button>
    ${this[searchButtonTemplate]('history', true)}
    ${this[refreshButtonTemplate]('history')}
    ${this[popupButtonTemplate]('history')}
    `
  }

  /**
   * @param {string} type Menu type that has this input.
   * @return {TemplateResult} A template for the search input.
   */
  [searchInputTemplate](type) {
    const { compatibility } = this;
    return html`
    <anypoint-input 
      class="list-search" 
      type="search" 
      data-type="${type}" 
      ?compatibility="${compatibility}" 
      noLabelFloat
      @search="${this[searchHandler]}"
    >
      <label slot="label">Search</label>
    </anypoint-input>
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the saved menu
   */
  [savedTemplate]() {
    if (this.hideSaved) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedValue]);
    const effective = this[effectiveSelected];
    const wasOpened = allOpened.includes(MenuTypes.saved);
    const menuOpened = effective === 1;
    if (!menuOpened && !wasOpened) {
      return '';
    }
    const { listType, dataTransfer, compatibility } = this;
    const classes = {
      hidden: !menuOpened,
      'menu-content': true,
    };
    const searchOpened = this[searchOpenedValue].includes(MenuTypes.saved);
    return html`
    <div class="${classMap(classes)}">
      <div class="menu-actions">
        ${searchOpened ? this[searchInputTemplate](MenuTypes.saved) : this[savedActionsTemplate]() }
      </div>
      <saved-menu
        .listType="${listType}"
        ?draggableEnabled="${dataTransfer}"
        ?compatibility="${compatibility}"
      ></saved-menu>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} A template for the saved menu actions
   */
  [savedActionsTemplate]() {
    const { compatibility } = this;
    return html`
    <anypoint-button
      @click="${this[openSavedHandler]}"
      data-action="open-saved"
      title="Opens saved requests list in full screen"
      ?compatibility="${compatibility}"
    >All</anypoint-button>
    ${this[searchButtonTemplate]('saved', true)}
    ${this[refreshButtonTemplate]('saved')}
    ${this[popupButtonTemplate]('saved')}
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the projects menu
   */
  [projectsTemplate]() {
    if (this.hideProjects) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedValue]);
    const effective = this[effectiveSelected];
    const wasOpened = allOpened.includes(MenuTypes.projects);
    const menuOpened = effective === 2;
    if (!menuOpened && !wasOpened) {
      return '';
    }
    const { listType, dataTransfer, compatibility } = this;
    const classes = {
      hidden: !menuOpened,
      'menu-content': true,
    };
    return html`
    <div class="${classMap(classes)}">
      <div class="menu-actions">
        ${this[refreshButtonTemplate]('projects', true)}
        ${this[popupButtonTemplate]('projects')}
      </div>
      <projects-menu
        .listType="${listType}"
        ?draggableEnabled="${dataTransfer}"
        ?compatibility="${compatibility}"
      ></projects-menu>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} Template for the REST APIs menu
   */
  [apisTemplate]() {
    if (this.hideApis) {
      return '';
    }
    const allOpened = /** @type string[] */ (this[openedValue]);
    const effective = this[effectiveSelected];
    const wasOpened = allOpened.includes(MenuTypes.apiDocs);
    const menuOpened = effective === 3;
    if (!menuOpened && !wasOpened) {
      return '';
    }
    const { listType, compatibility } = this;
    const classes = {
      hidden: !menuOpened,
      'menu-content': true,
    };
    return html`
    <div class="${classMap(classes)}">
      <div class="menu-actions">
        <anypoint-button
          @click="${this[openApisHandler]}"
          data-action="open-rest-apis"
          title="Opens saved requests list in full screen"
          ?compatibility="${compatibility}"
        >All APIs</anypoint-button>
        <anypoint-button
          @click="${this[openExchangeHandler]}"
          data-action="explore-rest-apis"
          title="Opens APIs explorer screen"
          ?compatibility="${compatibility}"
        >Explore</anypoint-button>
        ${this[refreshButtonTemplate]('apiDocs', true)}
        ${this[popupButtonTemplate]('apiDocs')}
      </div>
      <rest-api-menu
        .listType="${listType}"
        ?compatibility="${compatibility}"
      ></rest-api-menu>
    </div>
    `;
  }

  /**
   * @param {keyof MenuTypes} type The menu type
   * @returns {TemplateResult|string} A template for the "popup menu" button
   */
  [popupButtonTemplate](type) {
    const { popup, compatibility } = this;
    if (!popup) {
      return '';
    }
    const label = popupAriaLabels[type];
    const title = popupButtonTitles[type];
    return html`
    <anypoint-icon-button
      @click="${this[popupHandler]}"
      data-action="popup-${type}"
      data-type="${type}"
      aria-label="${label}"
      title="${title}"
      ?compatibility="${compatibility}"
    >
      <arc-icon icon="openInNew"></arc-icon>
    </anypoint-icon-button>`;
  }

  /**
   * @param {keyof MenuTypes} type The menu type
   * @param {boolean=} alignRight Whether to add `right-action` class
   * @returns {TemplateResult} A template for the "search menu" button
   */
  [searchButtonTemplate](type, alignRight=false) {
    const { compatibility } = this;
    const classes = {
      'right-action': alignRight,
    };
    return html`
    <anypoint-icon-button
      @click="${this[searchToggleHandler]}"
      data-action="search-${type}"
      data-type="${type}"
      aria-label="Activate to search the menu"
      title="Search the menu"
      ?compatibility="${compatibility}"
      class="${classMap(classes)}"
    >
      <arc-icon icon="search"></arc-icon>
    </anypoint-icon-button>`;
  }

  /**
   * @param {keyof MenuTypes} type The menu type
   * @param {boolean=} alignRight Whether to add `right-action` class
   * @returns {TemplateResult} A template for the "refresh menu" button
   */
  [refreshButtonTemplate](type, alignRight=false) {
    const { compatibility } = this;
    const classes = {
      'right-action': alignRight,
    };
    return html`
    <anypoint-icon-button
      @click="${this[refreshHandler]}"
      data-action="refresh-${type}"
      data-type="${type}"
      aria-label="Activate to refresh the menu"
      title="Refresh the menu"
      ?compatibility="${compatibility}"
      class="${classMap(classes)}"
    >
      <arc-icon icon="refresh"></arc-icon>
    </anypoint-icon-button>`;
  }

  render() {
    return html`
    <div class="menu">
      <div class="tabs">
        ${this[tabsTemplate]()}
      </div>
      ${this[historyTemplate]()}
      ${this[savedTemplate]()}
      ${this[projectsTemplate]()}
      ${this[apisTemplate]()}
    </div>
    `;
  }
}
