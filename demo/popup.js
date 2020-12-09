import { ArcNavigationEventTypes } from '@advanced-rest-client/arc-events';
import '@advanced-rest-client/arc-models/request-model.js';
import '@advanced-rest-client/arc-models/url-indexer.js';
import '@advanced-rest-client/arc-models/project-model.js';
import '@advanced-rest-client/arc-models/rest-api-model.js';
import '../saved-menu.js';
import '../history-menu.js';
import '../rest-api-menu.js';
import '../projects-menu.js';

/** @typedef {import('@advanced-rest-client/arc-events').ARCProjectNavigationEvent} ARCProjectNavigationEvent */
/** @typedef {import('@advanced-rest-client/arc-events').ARCRequestNavigationEvent} ARCRequestNavigationEvent */
/** @typedef {import('@advanced-rest-client/arc-events').ARCRestApiNavigationEvent} ARCRestApiNavigationEvent */
/** @typedef {import('@advanced-rest-client/arc-events').ARCNavigationEvent} ARCNavigationEvent */

class MenuPopup {
  initialize() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const allowed = ['history-menu', 'saved-menu', 'projects-menu', 'rest-api-menu'];
    if (!allowed.includes(type)) {
      this.renderUnknown(type);
      return;
    }
    this.type = type;
    this.renderMenu(type);

    window.addEventListener('beforeunload', this.beforeUnloadHandler.bind(this));

    window.addEventListener(ArcNavigationEventTypes.navigateProject, this.navigateProjectHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigateRequest, this.navigateRequestHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigateRestApi, this.navigateRestApiHandler.bind(this));
    window.addEventListener(ArcNavigationEventTypes.navigate, this.navigateHandler.bind(this));
  }

  /**
   * @param {string} type 
   */
  renderUnknown(type) {
    const p = document.createElement('p');
    p.innerText = `Unknown menu type: ${type}`;
    document.body.appendChild(p);
  }

  /**
   * @param {string} type 
   */
  renderMenu(type) {
    const menu = document.createElement(type);
    // @ts-ignore
    menu.draggableEnabled = true;
    document.body.appendChild(menu);
  }

  beforeUnloadHandler() {
    window.opener.postMessage({
      payload: 'popup-closing',
      type: this.type,
    });
  }

  /**
   * @param  {string} type 
   * @param  {any} args 
   */
  informNavigate(type, args) {
    window.opener.postMessage({
      payload: 'popup-navigate',
      type,
      ...args,
    });
  }

  /**
   * @param {ARCProjectNavigationEvent} e 
   */
  navigateProjectHandler(e) {
    this.informNavigate('project', { id: e.id, action: e.action });
  }

  /**
   * @param {ARCRequestNavigationEvent} e 
   */
  navigateRequestHandler(e) {
    this.informNavigate('request', { requestId: e.requestId, requestType: e.requestType, action: e.action });
  }

  /**
   * @param {ARCRestApiNavigationEvent} e 
   */
  navigateRestApiHandler(e) {
    this.informNavigate('api', { version: e.version, api: e.api, action: e.action });
  }

  /**
   * @param {ARCNavigationEvent} e 
   */
  navigateHandler(e) {
    // @ts-ignore
    this.informNavigate('navigate', { route: e.route, opts: e.opts });
  }
}

const instance = new MenuPopup();
instance.initialize();
