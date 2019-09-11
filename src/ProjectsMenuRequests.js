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
import styles from '@advanced-rest-client/requests-list-mixin/requests-list-styles.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@polymer/paper-progress/paper-progress.js';
import '@api-components/http-method-label/http-method-label.js';
import '@polymer/iron-icon/iron-icon.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import { AnypointMenuMixin } from '@anypoint-web-components/anypoint-menu-mixin/anypoint-menu-mixin.js';

export class ProjectsMenuRequestsWrapper extends AnypointMenuMixin(LitElement) {
  render() {
    return html`<slot></slot>`;
  }
}

/**
 * A list of requests related to a project in the ARC main menu.
 *
 * The element requires the `arc-models/project-model` element to be present
 * in the DOM to update requests order.
 *
 * ### Example
 *
 * ```
 * <projects-menu-requests
 *  projectid="some-id"
 *  selectedrequest="id-of-selected"></projects-menu-requests>
 * ```
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/projects.html
 * @appliesMixin RequestsListMixin
 */
export class ProjectsMenuRequests extends RequestsListMixin(ArcMenuBase) {
  static get styles() {
    return [
      styles,
      css`:host {
        display: block;
        background-color: var(--projects-menu-requests-background-color, inherit);
        position: relative;

        font-size: var(--arc-font-body1-font-size);
        font-weight: var(--arc-font-body1-font-weight);
        line-height: var(--arc-font-body1-line-height);
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      anypoint-icon-item.dragging {
        z-index: 1;
        background-color: var(--projects-menu-requests-item-dragging-background-color, #fff);
      }

      .name {
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

      .empty-message {
        text-align: center;
      }

      .empty-info {
        font-style: italic;
        margin: 1em 16px;
      }

      .drop-pointer {
        position: absolute;
        left: 4px;
        color: #757575;
        width: 20px;
        height: 24px;
        font-size: 20px;
      }

      .drop-pointer::before {
        content: "⇨";
      }

      anypoint-icon-item {
        position: relative;
      }`
    ];
  }

  static get properties() {
    return {
      // True if the element currently is querying the datastore for the data
      querying: { type: Boolean },
      /**
       * Computed value. True if query ended and there's no results.
       */
      dataUnavailable: { type: Boolean },
      /**
       * Current project ID
       */
      projectId: { type: String }
    };
  }

  get dataUnavailable() {
    const { hasRequests, querying } = this;
    return !hasRequests && !querying;
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

  get projectId() {
    return this._projectId;
  }

  set projectId(value) {
    const old = this._projectId;
    if (old === value) {
      return;
    }
    this._projectId = value;
    if (this._isAttached) {
      this.loadRequests();
    }
  }

  constructor() {
    super();
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dragleaveHandler = this._dragleaveHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.type = 'project';
    this._isAttached = true;
    if (this.draggableEnabled) {
      this._addDndEvents();
    }
    if (this.projectId) {
      this.loadRequests();
    }
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this._isAttached = false;
    this._removeDndEvents();
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

  loadRequests() {
    if (this.__loadDebouncer) {
      return;
    }
    this.__loadDebouncer = true;
    setTimeout(() => {
      this.__loadDebouncer = false;
      this._queryData();
    });
  }
  /**
   * Queries for the data when state or `projectId` changes
   */
  async _queryData() {
    const { projectId } = this;
    if (!projectId) {
      this.requests = undefined;
      return;
    }
    this.querying = true;
    try {
      this.requests = await this.readProjectRequests(projectId);
    } catch (e) {
      // ...
    }
    this.querying = false;
  }

  /**
   * Called when the user clicks on an item in the UI
   * @param {ClickEvent} e
   */
  _openHandler(e) {
    const index = Number(e.currentTarget.dataset.index);
    const request = this.requests[index];
    const id = request._id;
    this._openRequest(id);
  }
  /**
   * Removes drop pointer from shadow root.
   */
  _removeDropPointer() {
    if (!this.__dropPointer) {
      return;
    }
    this.shadowRoot.removeChild(this.__dropPointer);
    this.__dropPointer = undefined;
  }
  /**
   * Removes drop pointer to shadow root.
   * @param {Element} ref A list item to be used as a reference point.
   */
  _createDropPointer(ref) {
    const rect = ref.getClientRects()[0];
    const div = document.createElement('div');
    div.className = 'drop-pointer';
    const ownRect = this.getClientRects()[0];
    let topPosition = rect.y - ownRect.y;
    // if (below) {
    //   topPosition += rect.height;
    // }
    topPosition -= 10; // padding
    div.style.top = topPosition + 'px';
    this.__dropPointer = div;
    this.shadowRoot.appendChild(div);
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
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.dataTransfer.dropEffect = this._computeProjectDropEffect(e);
    e.preventDefault();
    const path = e.path || e.composedPath();
    const item = path.find((node) => node.nodeName === 'ANYPOINT-ICON-ITEM');
    if (!item) {
      return;
    }
    const rect = item.getClientRects()[0];
    const aboveHalf = (rect.y + rect.height/2) > e.y;
    const ref = aboveHalf ? item : item.nextElementSibling;
    if (!ref || this.__dropPointerReference === ref) {
      return;
    }
    this._removeDropPointer();
    this.__dropPointerReference = ref;
    this._createDropPointer(ref);
  }
  /**
   * Handler for `dragleave` event on this element.
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
    this._removeDropPointer();
    this.__dropPointerReference = undefined;
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
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1) {
      return;
    }
    e.preventDefault();
    this._removeDropPointer();
    const dropRef = this.__dropPointerReference;
    this.__dropPointerReference = undefined;
    const data = e.dataTransfer.getData('arc/request-object');
    if (!data) {
      return;
    }
    const request = JSON.parse(data);
    if (!request.projects) {
      request.projects = [];
    }
    let order;
    if (dropRef) {
      order = Number(dropRef.dataset.index);
    } else {
      order = 0;
    }
    let forceRequestUpdate;
    const effect = this._computeProjectDropEffect(e);
    if (effect === 'move') {
      forceRequestUpdate = this._handleProjectMoveDrop(e, request);
    }
    this._insertRequestAt(order, request, forceRequestUpdate);
  }
  /**
   * Updates project and request objects and inserts the request at a position.
   * @param {Number} index The position in requests order
   * @param {Object} request Request to update
   * @param {Boolean} forceRequestUpdate Forces update on request object even
   * when position hasn't change.
   * @return {Promise}
   */
  async _insertRequestAt(index, request, forceRequestUpdate) {
    return await this._appendProjectRequest(this.project, request, {
      index,
      forceRequestUpdate
    });
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
    const request = this.requests[index];
    const data = JSON.stringify(request);
    e.dataTransfer.setData('arc/request-object', data);
    e.dataTransfer.setData('arc/saved-request', request._id);
    e.dataTransfer.setData('arc-source/project-menu', this.projectId);
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  }

  _dropTargetTemplate() {
    return html`<div class="drop-message">
      <iron-icon icon="arc:save-alt" class="drop-icon"></iron-icon>
      <p>Drop request here</p>
    </div>`;
  }

  _unavailableTemplate() {
    return html`<div class="empty-message">
      <p class="empty-info">This project has no data.</p>
    </div>`;
  }

  _listTemplate() {
    const items = this.requests || [];
    const { draggableEnabled, _hasTwoLines, compatibility } = this;
    return items.map((item, index) => html`
      <anypoint-icon-item
        data-index="${index}"
        data-id="${item._id}"
        @click="${this._openHandler}"
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
          <div class="name">${item.name}</div>
          <div secondary>${item.url}</div>
        </anypoint-item-body>
      </anypoint-icon-item>`);
  }

  render() {
    const { dataUnavailable } = this;
    return html`
    ${this.modelTemplate}
    ${dataUnavailable ?
      this._unavailableTemplate() :
      html`<projects-menu-requests-wrapper
        class="list"
        selectable="anypoint-icon-item"
        @selected-changed="${this._selectionChanged}">
        ${this._listTemplate()}
      </projects-menu-requests-wrapper>`}
      `;
  }
}
