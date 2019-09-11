/**
@license
Copyright 2019 The Advanced REST client authors <arc@mulesoft.com>
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
import { LitElement } from 'lit-element';
import { UuidGenerator } from '@advanced-rest-client/uuid-generator/UuidGenerator.js';
/**
 * Base class for ARC menu elements.
 * @type {ArcMenuBase}
 */
export class ArcMenuBase extends LitElement {
  static get properties() {
    return {
      /**
       * Changes information density of list items.
       * By default it uses material's peper item with two lines (72px heigth)
       * Possible values are:
       *
       * - `default` or empty - regular list view
       * - `comfortable` - enables MD single line list item vie (52px heigth)
       * - `compact` - enables list that has 40px heigth (touch recommended)
       */
      listType: { type: String, reflect: true },
      /**
       * Enables the comonent to accept drop action with a request.
       */
      draggableEnabled: { type: Boolean },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
    };
  }
  /**
   * Prepares dropped request object to be stored in the data store.
   * @param {Object} request
   * @return {Object} Copy of the request object
   */
  _prepareDropRequest(request) {
    delete request.timeLabel;
    delete request.dayTime;
    delete request.hasHeader;
    delete request.header;
    if (request.type === 'history') {
      // History object will be coppied to whatever the target is.
      // It needs a new ID and _rev to be removed before save.
      delete request._rev;
      const g = new UuidGenerator();
      request._id = g.generate();
    }
    if (!request.name) {
      request.name = 'Unnamed';
    }
    return Object.assign({}, request);
  }

  /**
   * Adds dropped request to a project.
   * @param {Object} project Project model
   * @param {Object} request Request model
   * @param {?Object} opts Append options:
   * - index {Number} - Insert request in the project at this position. Default 0.
   * - forceRequestUpdate {Boolean} - Forces the request to be updated event when order do not change
   * @return {Promise}
   */
  async _appendProjectRequest(project, request, opts) {
    opts = opts || {};
    request = this._prepareDropRequest(request);
    const id = request._id;
    if (!project.requests) {
      project.requests = [id];
    } else {
      const currentIndex = project.requests.indexOf(id);
      if (currentIndex !== -1) {
        project.requests.splice(currentIndex, 1);
      }
      const index = opts.index || 0;
      project.requests.splice(index, 0, id);
    }
    if (!request.projects) {
      request.projects = [];
    }
    let requestChanged = false;
    if (request.projects.indexOf(project._id) === -1) {
      request.projects.push(project._id);
      requestChanged = true;
    }
    try {
      const pModel = this.projectModel;
      await pModel.saveProject(project);
      if (requestChanged || opts.forceRequestUpdate) {
        const rModel = this.requestModel;
        return await rModel.saveRequestProject(request);
      }
    } catch (e) {
      this._dispatchProcessError(e)
    }
  }

  /**
   * Dispatches `process-error` so the application can notify user about the event.
   * @param {Error} cause Error object
   * @return {CustomEvent} Disaptched custom event
   */
  _dispatchProcessError(cause) {
    const message = cause.message || 'Unknown error';
    return this._dispatch('process-error', {
      message,
      cause
    });
  }

  /**
   * Computes command label depending on a OS.
   * For Mac it will be cmd + `key` and for the rest of the World it
   * will be ctrl + `key`.
   *
   * @param {String} key The key combination as a sufix after the command key
   * @param {?String} platform Current platform name. `navigator.platform` is used by default.
   * @return {String} Full command to display in command label.
   */
  _computeA11yCommand(key, platform) {
    if (!platform) {
      platform = navigator.platform;
    }
    const isMac = platform.indexOf('Mac') !== -1;
    let cmd = '';
    if (isMac) {
      cmd += 'meta+';
    } else {
      cmd += 'ctrl+';
    }
    cmd += key;
    return cmd;
  }

  /**
   * Computes value for `dropEffect` property of the `DragEvent`.
   * @param {DragEvent} e
   * @return {String} Either `copy` or `move`.
   */
  _computeProjectDropEffect(e) {
    let allowed = e.dataTransfer.effectAllowed;
    if (!allowed) {
      // this 2 operations are supported here
      allowed = 'copyMove';
    }
    allowed = allowed.toLowerCase();
    const isHistory = e.dataTransfer.types.indexOf('arc/history-request') !== -1;
    if ((e.ctrlKey || e.metaKey) && !isHistory && allowed.indexOf('move') !== -1) {
      return 'move';
    } else {
      return 'copy';
    }
  }

  /**
   * Handles logic when drop event is `move` in effect.
   * Removes reference to old project (if exists). It uses `arc-source/project-detail`
   * data from event which should hold project ID.
   * @param {DragEvent} e
   * @param {Object} request Request object
   * @return {Boolean} True if the request object changed.
   */
  _handleProjectMoveDrop(e, request) {
    let projectId;
    if (e.dataTransfer.types.indexOf('arc-source/project-menu') !== -1) {
      projectId = e.dataTransfer.getData('arc-source/project-menu');
    } else if (e.dataTransfer.types.indexOf('arc-source/project-detail') !== -1) {
      projectId = e.dataTransfer.getData('arc-source/project-detail');
    }
    if (!projectId) {
      return false;
    }
    const index = request.projects.indexOf(projectId);
    if (index !== -1) {
      request.projects.splice(index, 1);
      return true;
    }
    return false;
  }
}
