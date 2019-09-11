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
import { ProjectsListConsumerMixin } from
  '@advanced-rest-client/projects-list-consumer-mixin/projects-list-consumer-mixin.js';
import { AnypointMenuMixin } from '@anypoint-web-components/anypoint-menu-mixin/anypoint-menu-mixin.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@polymer/iron-icon/iron-icon.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '../projects-menu-requests.js';

export class ProjectsMenuWrapper extends AnypointMenuMixin(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}
/**
 * A list of projects in the ARC main menu.
 *
 * The element uses direct implementation of the PouchDB to make a query to the
 * datastore. It also listens to events fired by the `arc-model` elements to
 * update state of the saved items.
 *
 * ### Example
 *
 * ```html
 * <projects-menu
 *  selectedproject="project-id"
 *  selectedrequest="id-of-selected-request"></projects-menu>
 * ```
 *
 * @customElement
 * @memberof UiElements
 * @appliesMixin ProjectsListConsumerMixin
 * @demo demo/projects.html
 */
export class ProjectsMenu extends ProjectsListConsumerMixin(ArcMenuBase) {
  static get styles() {
    return css`
    :host {
      display: block;
      background-color: var(--projects-menu-background-color, inherit);
      position: relative;
      overflow: auto;
      flex: 1;
      flex-basis: 0.000000001px;
      display: flex;
      flex-direction: column;
    }

    anypoint-icon-item {
      font-weight: 400;
      cursor: pointer;
      align-items: center;
    }

    .project-name {
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

    .empty-message {
      flex: 1;
      flex-basis: 0.000000001px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .project-icon {
      color: var(--projects-menu-project-icon-color, rgba(0, 0, 0, 0.64));
      margin-right: 4px;
    }

    [hidden] {
      display: none !important;
    }

    .menu-wrapper {
      padding: 0;
    }

    :host([listtype="comfortable"]) anypoint-icon-item {
      min-height: 40px;
    }

    :host([listtype="comfortable"]) [slot="item-icon"] {
      height: 20px;
      width: 20px;
    }

    :host([listtype="comfortable"]) .menu-icon {
      width: 32px;
      height: 32px;
      padding: 4px;
    }

    :host([listtype="comfortable"]) .menu-wrapper {
      width: 32px;
      height: 32px;
      padding: 0;
    }

    :host([listtype="compact"]) anypoint-icon-item {
      min-height: 36px;
    }

    :host([listtype="compact"]) [slot="item-icon"] {
      height: 16px;
      width: 16px;
    }

    :host([listtype="compact"]) .menu-icon {
      width: 28px;
      height: 28px;
      padding: 4px;
    }

    :host([listtype="comfortable"]) .menu-wrapper {
      width: 28px;
      height: 28px;
      padding: 0;
    }

    .menu-item {
      cursor: pointer;
      font-size: var(--arc-list-item-font-size);
    }

    .drop-target {
      background-color: var(--projects-menu-drop-background-color, var(--primary-color));
    }`;
  }

  static get properties() {
    return {
      /**
       * A timeout after which the project item is opened when dragging a
       * request over.
       *
       * @default 700
       */
      dragOpenTimeout: { type: Number },

      _openedProjects: { type: Array }
    };
  }

  get listType() {
    return this._listType;
  }

  set listType(value) {
    const old = this._listType;
    if (old === value) {
      return;
    }
    this._listType = value;
    this.requestUpdate('listType', old);
    this._updateListStyles(value);
  }

  get modelTemplate() {
    return html`
      <request-model></request-model>
      <project-model></project-model>
      <url-indexer></url-indexer>
    `;
  }

  get requestModel() {
    if (!this.__rmodel) {
      this.__rmodel = this.shadowRoot.querySelector('request-model');
    }
    return this.__rmodel;
  }

  get projectModel() {
    if (!this.__pmodel) {
      this.__pmodel = this.shadowRoot.querySelector('project-model');
    }
    return this.__pmodel;
  }

  constructor() {
    super();
    this.dragOpenTimeout = 700;
    this._openedProjects = [];
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.__rmodel = null;
    this.__pmodel = null;
  }

  refresh() {
    this.projects = undefined;
    this.refreshProjects();
  }

  _cancelEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  _deselectMenuOption(list) {
    setTimeout(() => {
      list.selected = undefined;
    });
  }
  /**
   * Handler for the click event "details" menu item.
   * Dispatches "navigate" event
   * @param {ClickEvent} e
   */
  _openProject(e) {
    const index = Number(e.currentTarget.dataset.index);
    const project = this.projects[index];
    const id = project._id;
    this._dispatch('navigate', {
      base: 'project',
      type: 'details',
      id
    });
    const list = e.currentTarget.parentNode;
    this._deselectMenuOption(list);
  }
  /**
   * Handler for the click event "open all" menu item.
   * @param {ClickEvent} e
   */
  _openAllRequests(e) {
    const index = Number(e.currentTarget.dataset.index);
    const project = this.projects[index];
    this._dispatchOpenRequests(project, false);
    const list = e.currentTarget.parentNode;
    this._deselectMenuOption(list);
  }
  /**
   * Handler for the click event "replace all" menu item.
   * @param {ClickEvent} e
   */
  _replaceAllRequests(e) {
    const index = Number(e.currentTarget.dataset.index);
    const project = this.projects[index];
    this._dispatchOpenRequests(project, true);
    const list = e.currentTarget.parentNode;
    this._deselectMenuOption(list);
  }
  /**
   * Dispatches `workspace-open-project-requests` event end returns it.
   * @param {Object} project Project object
   * @param {?Boolean} replace When true the requests are to be replaced in the workspace.
   * @return {CustomEvent}
   */
  _dispatchOpenRequests(project, replace) {
    return this._dispatch('workspace-open-project-requests', {
      project,
      replace
    });
  }
  /**
   * Dispatches bubbling and composed custom event.
   * By default the event is cancelable until `cancelable` property is set to false.
   * @param {String} type Event type
   * @param {?any} detail A detail to set
   * @param {?Boolean} cancelable True if the event is cancelable (default value).
   * @return {CustomEvent}
   */
  _dispatch(type, detail, cancelable) {
    if (typeof cancelable !== 'boolean') {
      cancelable = true;
    }
    const e = new CustomEvent(type, {
      bubbles: true,
      composed: true,
      cancelable,
      detail
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Handler for `dragover` event on this element.
   * @param {DragEvent} e
   */
  _dragoverHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = this._computeProjectDropEffect(e);
    if (this.__dragOverIndex !== undefined) {
      return;
    }
    const index = Number(e.currentTarget.dataset.index);
    this.__dragOverIndex = index;
    this.__dragOverTimeout = setTimeout(() => this._openProjectDragOver(), this.dragOpenTimeout);
    if (!e.currentTarget.classList.contains('drop-target')) {
      e.currentTarget.classList.add('drop-target');
    }
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
    this.__dragOverIndex = undefined;
    this._cancelDragTimeout();
    if (e.currentTarget.classList.contains('drop-target')) {
      e.currentTarget.classList.remove('drop-target');
    }
  }
  /**
   * Handler for `drag` event on this element. If the dagged item is compatible
   * it adds request to the project
   * @param {DragEvent} e
   */
  _dropHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.preventDefault();
    this._cancelDragTimeout();
    if (e.currentTarget.classList.contains('drop-target')) {
      e.currentTarget.classList.remove('drop-target');
    }
    const data = e.dataTransfer.getData('arc/request-object');
    if (!data) {
      return;
    }
    const request = JSON.parse(data);
    const index = Number(e.currentTarget.dataset.index);
    const project = this.projects[index];
    let forceRequestUpdate = false;
    const effect = this._computeProjectDropEffect(e);
    if (effect === 'move') {
      forceRequestUpdate = this._handleProjectMoveDrop(e, request);
    }
    this._appendProjectRequest(project, request, {
      forceRequestUpdate
    });
  }
  /**
   * Cancels the timer set in the dragover event
   */
  _cancelDragTimeout() {
    if (this.__dragOverTimeout) {
      clearTimeout(this.__dragOverTimeout);
      this.__dragOverTimeout = undefined;
    }
  }
  /**
   * Opens the project from the draggable event.
   */
  _openProjectDragOver() {
    if (!this.draggableEnabled) {
      return;
    }
    this.__dragOverTimeout = undefined;
    const index = this.__dragOverIndex;
    this.__dragOverIndex = undefined;
    const id = this.projects[index]._id;
    const opened = this._openedProjects;
    const arrIndex = opened.indexOf(id);
    if (arrIndex === -1) {
      opened.push(id);
      this._openedProjects = [...opened];
    }
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
    e.stopPropagation();
    const index = Number(e.currentTarget.dataset.index);
    const project = this.projects[index];
    const data = JSON.stringify(project);
    e.dataTransfer.setData('arc/project-object', data);
    e.dataTransfer.setData('arc-source/project-menu', project._id);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  }

  _toggleOpen(e) {
    const index = Number(e.currentTarget.dataset.index);
    const project = this.projects[index];
    const id = project._id;
    const opened = this._openedProjects;
    const arrIndex = opened.indexOf(id);
    if (arrIndex === -1) {
      opened.push(id);
    } else {
      opened.splice(arrIndex, 1);
    }
    this._openedProjects = [...opened];
  }

  /**
   * Updates icon size CSS variable and notifies resize on the list when
   * list type changes.
   * @param {?String} type
   */
  _updateListStyles(type) {
    let size;
    switch (type) {
      case 'comfortable': size = 48; break;
      case 'compact': size = 36; break;
      default: size = 56; break;
    }
    const value = `${size}px`;
    this.style.setProperty('--anypoint-item-icon-width', value);
    const nodes = this.shadowRoot.querySelectorAll('projects-menu-requests');
    for (let i = 0, len = nodes.length; i < len; i++) {
      nodes[i].style.setProperty('--anypoint-item-icon-width', value);
    }
  }

  _unavailableTemplate() {
    const cmd = this._computeA11yCommand('s');
    return html`<div class="empty-message">
      <p class="empty-info">
        Use <span class="code">${cmd}</span> to save a request in a project.
        It will appear in this place.
      </p>
    </div>`;
  }

  _projectMenuTemplate(index, compatibility) {
    return html`
    <anypoint-menu-button
      dynamicalign
      closeOnActivate
      class="menu-wrapper"
      horizontalalign="right"
      ?compatibility="${compatibility}"
      @click="${this._cancelEvent}"
    >
      <anypoint-icon-button
        class="menu-icon"
        aria-label="Activate to open context menu"
        slot="dropdown-trigger"
        ?compatibility="${compatibility}">
        <iron-icon icon="arc:more-vert"></iron-icon>
      </anypoint-icon-button>
      <anypoint-listbox
        slot="dropdown-content"
        ?compatibility="${compatibility}">
        <anypoint-item
          data-index="${index}"
          class="menu-item"
          title="Open project details"
          @click="${this._openProject}"
          tabindex="-1">
            Open details
        </anypoint-item>
        <anypoint-item
          data-index="${index}"
          class="menu-item"
          title="Open all requests in the workspace"
          @click="${this._openAllRequests}"
          tabindex="-1">
          Open all in workspace
        </anypoint-item>
        <anypoint-item
          data-index="${index}"
          class="menu-item"
          title="Replace current workspace with project request"
          @click="${this._replaceAllRequests}"
          tabindex="-1">
            Replace all in workspace
        </anypoint-item>
      </anypoint-listbox>
    </anypoint-menu-button>`;
  }

  _requestsTemplate(item, draggableEnabled, compatibility, listType) {
    return html`<projects-menu-requests
      .project="${item}"
      .projectId="${item._id}"
      .listType="${listType}"
      .draggableEnabled="${draggableEnabled}"
      ?compatibility="${compatibility}"
      ></projects-menu-requests>`;
  }

  _listTemplate() {
    const items = this.projects || [];
    const { draggableEnabled, compatibility, _openedProjects, listType } = this;
    return items.map((item, index) => html`
      <anypoint-icon-item
        data-index="${index}"
        data-id="${item._id}"
        @click="${this._toggleOpen}"
        class="project-item"
        draggable="${draggableEnabled ? 'true' : 'false'}"
        @dragover="${this._dragoverHandler}"
        @dragleave="${this._dragleaveHandler}"
        @drop="${this._dropHandler}"
        @dragstart="${this._dragStart}"
        tabindex="-1"
        role="menuitem"
        ?compatibility="${compatibility}">
        <iron-icon icon="arc:collections-bookmark" class="project-icon" slot="item-icon"></iron-icon>
        <anypoint-item-body
          ?compatibility="${compatibility}">
          <div class="project-name">${item.name}</div>
        </anypoint-item-body>
        ${this._projectMenuTemplate(index, compatibility)}
      </anypoint-icon-item>

      ${_openedProjects.indexOf(item._id) !== -1 ?
        this._requestsTemplate(item, draggableEnabled, compatibility, listType) :
        ''}`);
  }

  render() {
    const { hasProjects } = this;
    return html`
    ${this.modelTemplate}
    ${!hasProjects ? this._unavailableTemplate() : ''}

    <projects-menu-wrapper
      class="list"
      selectable="anypoint-icon-item"
      attrforselected="data-id"
      @selected-changed="${this._selectionChanged}">
      ${hasProjects ? this._listTemplate() : ''}
    </projects-menu-wrapper>`;
  }
}
