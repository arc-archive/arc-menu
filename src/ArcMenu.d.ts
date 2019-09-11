/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   src/ArcMenu.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {LitElement, html, css} from 'lit-element';

export {ArcMenu};

declare class ArcMenu extends LitElement {
  historyEnabled: any;
  hideHistory: any;
  hideSaved: any;
  hideProjects: any;
  hideApis: any;
  constructor();
  render(): any;
  _navigateScreen(base: any): void;
  _openHistoryList(): void;
  _openSavedList(): void;
  _openApisList(): void;
  _exporeApis(): void;
  _refreshList(type: any): void;

  /**
   * Forces to refresh history list
   */
  refreshHistoryList(): void;

  /**
   * Forces to refresh saved list
   */
  refreshSavedList(): void;

  /**
   * Forces to refresh projects list
   */
  refreshProjectsList(): void;

  /**
   * Forces to refresh apis list
   */
  refreshApisList(): void;

  /**
   * Dispatches `popup-menu` custom event
   *
   * @param type Panel name
   */
  _popupMenu(type: String|null): void;

  /**
   * Requests to popup history menu.
   */
  popupHistory(): void;

  /**
   * Requests to popup saved menu.
   */
  popupSaved(): void;

  /**
   * Requests to popup projects menu.
   */
  popupProjects(): void;

  /**
   * Requests to popup apis menu.
   */
  popupApis(): void;

  /**
   * Selects first panel that is not hidden
   */
  _selectFirstAvailable(): any;

  /**
   * Calls `_selectFirstAvailable()` if `panelId` is current selection.
   */
  _updateSelectionIfNeeded(panelId: Number|null): void;

  /**
   * Updates selection when history panel is removed
   */
  _hideHistoryChanegd(val: Boolean|null): void;

  /**
   * Updates selection when saved panel is removed
   */
  _hideSavedChanegd(val: Boolean|null): void;

  /**
   * Updates selection when saved panel is removed
   */
  _hideProjectsChanegd(val: Boolean|null): void;

  /**
   * Updates selection when saved panel is removed
   */
  _hideApisChanegd(val: Boolean|null): void;

  /**
   * Updates selection when history is disabled/enabled
   */
  _historyEnabledChanegd(val: Boolean|null, old: Boolean|null): void;

  /**
   * Finds paper-tab element in event path.
   *
   * @param e Event with `path` or `composedPath()`
   */
  _findTab(e: Event|null): Element|null|undefined;

  /**
   * Handler for `dragover` event on paper tabs.
   * Opens the tab if the dragged element can be dropped in corresponding menu.
   */
  _dragoverHandler(e: DragEvent|null): void;

  /**
   * Handler for `dragleave` event on project node.
   */
  _dragleaveHandler(e: DragEvent|null): void;

  /**
   * Cancels the timer set in the dragover event
   */
  _cancelDragTimeout(): void;
  _openMenuDragOver(): void;
  _tabsHandler(e: any): void;
  _tabsTemplate(): any;
  _historyTemplate(): any;
  _savedTemplate(): any;
  _projectsTemplate(): any;
  _apisTemplate(): any;
  _menuTemplate(): any;
}