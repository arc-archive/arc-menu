/**
@license
Copyright 2020 The Advanced REST client authors <arc@mulesoft.com>
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
import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import {AnypointTab} from '@anypoint-web-components/anypoint-tabs';

export declare const historyValue: unique symbol;
export declare const historyChanged: unique symbol;
export declare const hideHistoryValue: unique symbol;
export declare const hideHistoryChanged: unique symbol;
export declare const hideSavedValue: unique symbol;
export declare const hideSavedChanged: unique symbol;
export declare const hideProjectsValue: unique symbol;
export declare const hideProjectsChanged: unique symbol;
export declare const hideApisValue: unique symbol;
export declare const hideApisChanged: unique symbol;
export declare const openHistoryHandler: unique symbol;
export declare const openSavedHandler: unique symbol;
export declare const openApisHandler: unique symbol;
export declare const openExchangeHandler: unique symbol;
export declare const refreshList: unique symbol;
export declare const selectFirstAvailable: unique symbol;
export declare const updateSelectionIfNeeded: unique symbol;
export declare const dragoverHandler: unique symbol;
export declare const dragleaveHandler: unique symbol;
export declare const dragTypeCallbackValue: unique symbol;
export declare const dragOverTimeoutValue: unique symbol;
export declare const cancelDragTimeout: unique symbol;
export declare const openMenuDragOver: unique symbol;
export declare const tabsHandler: unique symbol;
export declare const menuTemplate: unique symbol;
export declare const tabsTemplate: unique symbol;
export declare const historyTemplate: unique symbol;
export declare const savedTemplate: unique symbol;
export declare const projectsTemplate: unique symbol;
export declare const apisTemplate: unique symbol;

/**
 * Finds anypoint-tab element in event path.
 * @param e Event with `path` or `composedPath()`
 */
export declare function findTab(e: Event): AnypointTab|undefined;

export declare class ArcMenuElement extends LitElement {
  static readonly styles: CSSResult;

  /**
   * Currently selected menu tab
   * @attribute
   */
  selected: number;
  /**
   * Changes information density of list items.
   * By default it uses material's list item with two lines (72px height)
   * Possible values are:
   *
   * - `default` or empty - regular list view
   * - `comfortable` - enables MD single line list item vie (52px height)
   * - `compact` - enables list that has 40px height (touch recommended)
   * @attribute
   */
  listType: string;
  /**
   * Enables compatibility with Anypoint platform
   * @attribute
   */
  compatibility: boolean;
  /**
   * If set the history menu is rendered. This comes from the application
   * settings and is different from `noHistory` which is intended to
   * temporarily remove the history from the view (for menu popup option)
   * @attribute
   */
  history: boolean;
  /**
   * When set it hides history from the view
   * @attribute
   */
  hideHistory: boolean;
  /**
   * When set it hides saved list from the view
   * @attribute
   */
  hideSaved: boolean;
  /**
   * When set it hides projects from the view
   * @attribute
   */
  hideProjects: boolean;
  /**
   * When set it hides APIs list from the view
   * @attribute
   */
  hideApis: boolean;
  /**
   * Renders popup menu buttons when this property is set.
   * @attribute
   */
  popup: boolean;
  /**
   * Adds draggable property to the request list item element.
   * The `dataTransfer` object has `arc/request-object` mime type with
   * serialized JSON with request model.
   * @attribute
   */
  dataTransfer: boolean;
  /**
   * A timeout after which the project item is opened when dragging a
   * request over.
   * @attribute
   */
  dragOpenTimeout: number;


  constructor();

  [openHistoryHandler](): void;

  [openSavedHandler](): void;

  [openApisHandler](): void;

  [openExchangeHandler](): void;

  [refreshList](type: string): void;

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
  [selectFirstAvailable](): Promise<void>;

  /**
   * Calls `[selectFirstAvailable]()` if `panelId` is current selection.
   */
  [updateSelectionIfNeeded](panelId: number): void;

  /**
   * Updates selection when history panel is removed
   * 
   */
  [hideHistoryChanged](val: boolean): void;

  /**
   * Updates selection when saved panel is removed
   * 
   */
  [hideSavedChanged](val: boolean): void;

  /**
   * Updates selection when saved panel is removed
   * 
   */
  [hideProjectsChanged](val: boolean): void;

  /**
   * Updates selection when saved panel is removed
   * 
   */
  [hideApisChanged](val: boolean): void;

  /**
   * Updates selection when history is disabled/enabled
   */
  [historyChanged](val: boolean, old: boolean): void;

  /**
   * Handler for `dragover` event on anypoint tabs.
   * Opens the tab if the dragged element can be dropped in corresponding menu.
   */
  [dragoverHandler](e: DragEvent): void;

  /**
   * Handler for `dragleave` event on project node.
   */
  [dragleaveHandler](e: DragEvent): void;

  /**
   * Cancels the timer set in the dragover event
   */
  [cancelDragTimeout](): void;

  [openMenuDragOver](): void;

  [tabsHandler](e: CustomEvent): void;

  /**
   * @returns Template for the tabs
   */
  [tabsTemplate](): TemplateResult;

  /**
   * @returns Template for the history menu
   */
  [historyTemplate](): TemplateResult;

  /**
   * @returns Template for the saved menu
   */
  [savedTemplate](): TemplateResult;

  /**
   * @returns Template for the projects menu
   */
  [projectsTemplate](): TemplateResult;

  /**
   * @returns Template for the REST APIs menu
   */
  [apisTemplate](): TemplateResult;

  [menuTemplate](): TemplateResult|string;

  render(): TemplateResult;
}
