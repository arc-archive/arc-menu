import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@advanced-rest-client/http-method-selector/http-method-selector-mini.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@polymer/paper-toast/paper-toast.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../history-menu.js';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'draggableEnabled',
      'compatibility',
      'listType',
      'dropValue'
    ]);
    this._componentName = 'history-menu';
    this.demoStates = ['Material', 'Anypoint'];
    this.listType = 'default';

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._listTypeHandler = this._listTypeHandler.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.refreshList = this.refreshList.bind(this);
    this.firstchanged = this.firstchanged.bind(this);
    this.firstDeleted = this.firstDeleted.bind(this);
    this.addNewItem = this.addNewItem.bind(this);
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dragleaveHandler = this._dragleaveHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    switch (state) {
      case 0:
        this.compatibility = false;
        break;
      case 1:
        this.compatibility = true;
        break;
    }
  }

  _listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  async generateData() {
    await DataGenerator.insertHistoryRequestData({
      requestsSize: 100
    });
    document.getElementById('genToast').opened = true;
    const e = new CustomEvent('data-imported', {
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  async deleteData() {
    await DataGenerator.destroyHistoryData();
    document.getElementById('delToast').opened = true;
    const e = new CustomEvent('datastore-destroyed', {
      detail: {
        datastore: 'all'
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  refreshList() {
    document.querySelector('history-menu').refresh();
  }

  firstchanged() {
    let item = document.querySelector('history-menu').requests[0];
    item = Object.assign({}, item);
    item.updated = Date.now();
    const e = new CustomEvent('request-object-changed', {
      detail: {
        request: item,
        type: 'history'
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  firstDeleted() {
    const item = document.querySelector('history-menu').requests[0];
    const e = new CustomEvent('request-object-deleted', {
      detail: {
        oldRev: item._rev,
        id: item._id,
        type: 'history'
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  addNewItem() {
    const item = DataGenerator.generateHistoryObject();
    item.updated = Date.now();
    const e = new CustomEvent('request-object-changed', {
      detail: {
        request: item,
        type: 'history'
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  _dragoverHandler(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('drag-over');
  }

  _dragleaveHandler(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  _dragEnterHandler(e) {
    e.currentTarget.classList.add('drag-over');
  }

  _dropHandler(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('arc/request-object');
    // format data
    const request = JSON.parse(data);
    this.dropValue = JSON.stringify(request, null, 2);
    console.log(request);
    e.currentTarget.classList.remove('drag-over');
  }

  addRequestForm() {
    const nodes = document.querySelectorAll('.form http-method-selector-mini, .form anypoint-input');
    const request = {
      type: 'history',
      method: nodes[0].method
    };
    for (let i = 1; i < nodes.length; i++) {
      const { name, value } = nodes[i];
      request[name] = value;
    }
    if (!request.created) {
      request.created = Date.now();
    } else {
      const d = new Date(request.created);
      request.created = d.getTime();
    }
    const e = new CustomEvent('request-object-changed', {
      detail: {
        request,
        type: 'history'
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      draggableEnabled,
      compatibility,
      listType,
      dropValue
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the history menu element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <history-menu
            ?draggableEnabled="${draggableEnabled}"
            ?compatibility="${compatibility}"
            .listType="${listType}"
            slot="content"></history-menu>


          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="draggableEnabled"
            @change="${this._toggleMainOption}"
            >Draggable</anypoint-checkbox
          >

          <label slot="options" id="listTypeLabel">List type</label>
          <anypoint-radio-group
            slot="options"
            selectable="anypoint-radio-button"
            aria-labelledby="listTypeLabel"
          >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              checked
              name="default"
              >Default</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="comfortable"
              >Comfortable</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="compact"
              >Compact</anypoint-radio-button
            >
          </anypoint-radio-group>
        </arc-interactive-demo>

        ${draggableEnabled ? html`<section
          class="drop-target"
          @dragover="${this._dragoverHandler}"
          @dragleave="${this._dragleaveHandler}"
          @dragenter="${this._dragEnterHandler}"
          @drop="${this._dropHandler}">
          Drop request here
          ${dropValue ? html`<output>${dropValue}</output>` : ''}
        </section>` : ''}

        <div class="data-options">
          <h3>Data options</h3>

          <anypoint-button @click="${this.generateData}">Generate 100 requests</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
          <anypoint-button @click="${this.refreshList}">Refresh list</anypoint-button>
          <anypoint-button @click="${this.firstchanged}">Inform first item changed</anypoint-button>
          <anypoint-button @click="${this.firstDeleted}">Inform first item deleted</anypoint-button>
          <anypoint-button @click="${this.addNewItem}">Add new history item</anypoint-button>
        </div>

        <section class="form">
          <h3>Add request</h3>
          <div>
            <http-method-selector-mini
              name="method"
              method="GET"></http-method-selector-mini>
            <anypoint-input
              name="url"
              value="https://api.domain.com">
              <label slot="label">URL</label>
            </anypoint-input>
          </div>
          <div>
            <anypoint-input
              type="datetime-local"
              name="created">
              <label slot="label">Request time</label>
            </anypoint-input>
          </div>
          <div>
            <anypoint-input
              name="_id"
              value="test-id">
              <label slot="label">History id</label>
            </anypoint-input>
          </div>
          <anypoint-button @click="${this.addRequestForm}">Add</anypoint-button>
        </section>
      </section>

      <paper-toast id="genToast" text="The request data has been generated"></paper-toast>
      <paper-toast id="delToast" text="The request data has been removed"></paper-toast>
      <paper-toast id="navToast" text="Navigation ocurred"></paper-toast>
    `;
  }

  _introductionTemplate() {
    return html`
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          Advanced REST Client history mennu is a part of application menu.
          It is styled for material design lists with compatibility with
          Anypoint platform.
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html`
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>History menu comes with 2 predefied styles:</p>
        <ul>
          <li><b>Material</b> - Normal state</li>
          <li>
            <b>Compatibility</b> - To provide compatibility with Anypoint design
          </li>
        </ul>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC history menu</h2>
      ${this._demoTemplate()}
      ${this._introductionTemplate()}
      ${this._usageTemplate()}

      <paper-toast id="brightnessAction" text="Turing lights on"></paper-toast>
      <paper-toast id="alarmAction" text="Setting the alarm"></paper-toast>
      <paper-toast id="clearAction" text="Clearing all actions"></paper-toast>
    `;
  }
}

window.addEventListener('navigate', function() {
  document.getElementById('navToast').opened = true;
});

const instance = new DemoPage();
instance.render();
window._demo = instance;
