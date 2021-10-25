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
import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { SavedListMixin } from '@advanced-rest-client/requests-list';

/**
 * Advanced REST Client's history menu element.
 * @deprecated Use `@advanced-rest-client/app` instead.
 */
export class SavedMenuElement {
  static readonly styles: CSSResult;

  render(): TemplateResult;
}

export declare interface SavedMenuElement extends SavedListMixin, LitElement {
}
