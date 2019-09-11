import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@advanced-rest-client/http-method-selector/http-method-selector-mini.js';
import '@polymer/paper-toast/paper-toast.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../projects-menu.js';
import '../history-menu.js';
import '../saved-menu.js';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'draggableEnabled',
      'compatibility',
      'listType',
      'dropValue'
    ]);
    this._componentName = 'projects-menu';
    this.demoStates = ['Material', 'Anypoint'];
    this.listType = 'default';

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._listTypeHandler = this._listTypeHandler.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.refreshList = this.refreshList.bind(this);
    this.generateHistory = this.generateHistory.bind(this);
    this.deleteHistory = this.deleteHistory.bind(this);
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dragleaveHandler = this._dragleaveHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
    this._workspaceOpenHandler = this._workspaceOpenHandler.bind(this);
    window.addEventListener('workspace-open-project-requests', this._workspaceOpenHandler);
    window.addEventListener('process-error', this._processErrorHandler.bind(this));
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
    await DataGenerator.insertSavedRequestData({
      requestsSize: 100,
      projectsSize: 15
    });
    document.getElementById('genToast').opened = true;
    const e = new CustomEvent('data-imported', {
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  async generateHistory() {
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
    await DataGenerator.destroySavedRequestData();
    document.getElementById('delToast').opened = true;
    const e = new CustomEvent('datastore-destroyed', {
      detail: {
        datastore: ['legacy-projects', 'saved']
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  async deleteHistory() {
    await DataGenerator.destroyHistoryData();
    document.getElementById('delToast').opened = true;
    const e = new CustomEvent('datastore-destroyed', {
      detail: {
        datastore: ['history']
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  refreshList() {
    document.querySelector('projects-menu').refresh();
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
    let data;
    if (e.dataTransfer.types.indexOf('arc/request-object') !== -1) {
      data = e.dataTransfer.getData('arc/request-object');
    } else if (e.dataTransfer.types.indexOf('arc/project-object') !== -1) {
      data = e.dataTransfer.getData('arc/project-object');
    }
    // format data
    if (data) {
      data = JSON.parse(data);
      console.log(data);
      data = JSON.stringify(data, null, 2);
    } else {
      data = '';
    }
    this.dropValue = data;
    e.currentTarget.classList.remove('drag-over');
  }

  _workspaceOpenHandler(e) {
    const toast = document.getElementById('wksToast');
    const { replace, project } = e.detail;
    let msg;
    if (replace) {
      msg = 'Replacing';
    } else {
      msg = 'Adding';
    }
    msg += ' "' + project.name + '" project requests';
    toast.text = msg;
    toast.opened = true;
  }

  _processErrorHandler(e) {
    console.error(e.detail.cause);
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
          This demo lets you preview the projects menu element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <div class="menus-wrapper" slot="content">
            ${draggableEnabled ? html`
            <div class="menu-item">
              <h4>History</h4>
              <history-menu
                .listType="${listType}"
                ?compatibility="${compatibility}"
                draggableenabled></history-menu>
            </div>
            <div class="menu-item">
              <h4>Saved</h4>
              <saved-menu
                .listType="${listType}"
                ?compatibility="${compatibility}"
                draggableenabled></saved-menu>
            </div>` : ''}

            <div class="menu-item">
              ${draggableEnabled ? html`<h4>Projects</h4>` : ''}
              <projects-menu
                ?draggableEnabled="${draggableEnabled}"
                ?compatibility="${compatibility}"
                .listType="${listType}"
                slot="content"></projects-menu>
            </div>
          </div>

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
          <anypoint-button @click="${this.generateHistory}">Generate history items</anypoint-button>
          <anypoint-button @click="${this.deleteHistory}">Clear history</anypoint-button>
        </div>
      </section>

      <paper-toast id="genToast" text="The request data has been generated"></paper-toast>
      <paper-toast id="delToast" text="The request data has been removed"></paper-toast>
      <paper-toast id="navToast" text="Navigation ocurred"></paper-toast>
      <paper-toast id="wksToast" text="" duration="7000"></paper-toast>
    `;
  }

  _introductionTemplate() {
    return html`
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          Advanced REST Client projects mennu is a part of application menu.
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
        <p>Projects menu comes with 2 predefied styles:</p>
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
      <h2>ARC projects menu</h2>
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
