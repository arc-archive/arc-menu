# arc-menu

[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/arc-menu.svg)](https://www.npmjs.com/package/@advanced-rest-client/arc-menu)

[![Build Status](https://travis-ci.com/advanced-rest-client/arc-menu.svg)](https://travis-ci.com/advanced-rest-client/arc-menu)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/arc-menu)

Advanced REST Client main navigation. This component contains all navigation elements for ARC.

## Usage

### Installation

```sh
npm install --save @advanced-rest-client/arc-menu
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/arc-menu/arc-menu.js';

class SampleElement extends LitElement {
  get styles() {
    return css`
      arc-menu {
        height: 500px;
      }
    `;
  }

  render() {
    return html`
    <arc-menu draggableenabled></arc-menu>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### List sizing

The menu items load more results (performs pagination) on list scroll. Because of that the list has to have a fixed height. Either use flex layout or set a height value on element styles.

### Drag and drop

API components related to a request object support drag and drop. Set `draggableenabled` property to enable the support.

The `DataTransfer` property of the drag event contains `effectAllowed` set to `copy` for all by default and `copyMove` for saved requests when ctrl/meta key is pressed. Only targets that allow the same effect will accept the request/project item.

## Development

```sh
git clone https://github.com/advanced-rest-client/arc-menu
cd arc-menu
npm install
```

### Running the tests

```sh
npm test
```
