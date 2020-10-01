import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import sinon from 'sinon';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import '@advanced-rest-client/arc-models/request-model.js';
import '@advanced-rest-client/arc-models/project-model.js';
import { ArcModelEvents, ArcModelEventTypes } from '@advanced-rest-client/arc-models';
import { ArcNavigationEventTypes, ProjectActions } from '@advanced-rest-client/arc-events';
import { internals } from '@advanced-rest-client/requests-list';
import '../projects-menu.js';
import {
  openedProjectsValue,
  addProjectHandler,
  hoveredProjectValue,
  openingProjectTimeout,
  openProject,
} from '../src/ProjectsMenuElement.js';

/** @typedef {import('..').ProjectsMenuElement} ProjectsMenuElement */
/** @typedef {import('@advanced-rest-client/arc-models').ARCProject} ARCProject */
/** @typedef {import('@advanced-rest-client/arc-models').ARCSavedRequest} ARCSavedRequest */

describe('ProjectsMenuElement', () => {
  const generator = new DataGenerator();

  /**
   * @returns {Promise<ProjectsMenuElement>}
   */
  async function basicFixture() {
    const elm = await fixture(html`
    <div>
      <request-model></request-model>
      <project-model></project-model>
      <projects-menu draggableEnabled noAutoProjects></projects-menu>
    </div>`);
    return /** @type ProjectsMenuElement */ (elm.querySelector('projects-menu'));
  }

  async function openMenu(element, index=0) {
    const target = element.shadowRoot.querySelectorAll('.project-item')[index];
    const event = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    await element.requestUpdate();
    const menu = target.querySelector('anypoint-menu-button');
    menu.opened = true;
    await aTimeout(0);
    return menu;
  }

  describe('constructor()', () => {
    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets dragOpenTimeout', () => {
      assert.equal(element.dragOpenTimeout, 700);
    });

    it('sets noAuto', () => {
      assert.equal(element.noAuto, true);
    });

    it('sets [openedProjectsValue]', () => {
      assert.deepEqual(element[openedProjectsValue], []);
    });
  });

  describe('empty data rendering', () => {
    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders empty info', () => {
      const node = element.shadowRoot.querySelector('.list-empty');
      assert.ok(node);
    });

    it('renders add project button', () => {
      const node = element.shadowRoot.querySelector('[data-action="add-project"]');
      assert.ok(node);
    });
  });

  describe('[addProjectHandler]()', () => {
    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    it('adds new project to the store', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.update, spy);
      await element[addProjectHandler]();
      assert.isTrue(spy.called, 'the event was dispatched');
      assert.lengthOf(element.projects, 1, 'has newly created project');
    });
  })

  describe('project item mouse over / out', () => {
    before(async () => {
      await generator.insertProjectsData();
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('sets [hoveredProjectValue] on mouse enter', () => {
      const target = element.shadowRoot.querySelector('.project-item');
      const event = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      assert.equal(element[hoveredProjectValue], 0);
    });

    it('sets hovered class name on mouse enter', async () => {
      const target = element.shadowRoot.querySelector('.project-item');
      const event = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      await element.requestUpdate();
      assert.isTrue(target.classList.contains('hovered'));
    });

    it('renders drop down menu after mouse enter', async () => {
      const target = element.shadowRoot.querySelector('.project-item');
      const event = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      await element.requestUpdate();
      const menu = target.querySelector('anypoint-menu-button');
      assert.ok(menu);
    });

    async function hoverItem(index=0) {
      const target = element.shadowRoot.querySelectorAll('.project-item')[index];
      const event = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      await element.requestUpdate();
      return target;
    }

    async function leaveItem(index=0) {
      const target = element.shadowRoot.querySelectorAll('.project-item')[index];
      const event = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      await element.requestUpdate();
      return target;
    }

    it('removes the menu after mouseleave event', async () => {
      await hoverItem();
      const target = await leaveItem();
      const menu = target.querySelector('anypoint-menu-button');
      assert.notOk(menu);
    });

    it('clears [hoveredProjectValue]', async () => {
      await hoverItem();
      await leaveItem();
      assert.isUndefined(element[hoveredProjectValue]);
    });

    it('ignores when the menu is opened', async () => {
      const target = await hoverItem();
      const menu = target.querySelector('anypoint-menu-button');
      menu.opened = true;
      await aTimeout(0);
      await leaveItem();
      assert.equal(element[hoveredProjectValue], 0);
    });
  });

  describe('menu item context actions', () => {
    before(async () => {
      await generator.insertProjectsData();
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('dispatches open project details', async () => {
      const menu = await openMenu(element);
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateProject, spy);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="open-project"]'));
      item.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].action, ProjectActions.open);
    });

    it('dispatches open project requests in workspace', async () => {
      const menu = await openMenu(element);
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateProject, spy);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="open-all-workspace"]'));
      item.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].action, ProjectActions.addWorkspace);
    });

    it('dispatches open project requests in workspace and replace', async () => {
      const menu = await openMenu(element);
      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateProject, spy);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="replace-all-workspace"]'));
      item.click();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].action, ProjectActions.replaceWorkspace);
    });

    it('dispatches delete event', async () => {
      const menu = await openMenu(element);
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.delete, spy);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="delete-project"]'));
      item.click();
      assert.isTrue(spy.called);
    });
  });

  describe('deleting a project', () => {
    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('deletes empty project', async () => {
      const project = /** @type ARCProject */ (generator.createProjectObject());
      const rec = await ArcModelEvents.Project.update(document.body, project);
      assert.lengthOf(element.projects, 1, 'has created project');

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.delete, spy);
      const menu = await openMenu(element);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="delete-project"]'));
      item.click();

      await spy.args[0][0].detail.result;

      let thrown = false;
      try {
        await ArcModelEvents.Project.read(document.body, rec.id);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });

    it('deletes a project and its requests', async () => {
      const request = /** @type ARCSavedRequest */ (generator.generateSavedItem());
      request._id = `request-${Date.now()}`
      const project = /** @type ARCProject */ (generator.createProjectObject());
      project._id = `project-${Date.now()}`
      project.requests = [request._id];
      request.projects = [project._id];

      await ArcModelEvents.Project.update(document.body, project);
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);
      assert.lengthOf(element.projects, 1, 'has created project');
      assert.lengthOf(element.requests, 1, 'has created request');

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.delete, spy);
      const menu = await openMenu(element);
      const item = /** @type HTMLElement */ (menu.querySelector('[data-action="delete-project"]'));
      item.click();

      await spy.args[0][0].detail.result;

      let thrown = false;
      try {
        await ArcModelEvents.Request.read(document.body, 'saved', rRec.id);
      } catch (e) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });
  });

  describe('[projectDragStartHandler]()', () => {
    before(async () => {
      await generator.insertProjectsData();
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('has data on the data transfer object', () => {
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      const dt = e.dataTransfer;
      assert.equal(dt.getData('arc/id'), element.projects[0]._id, 'has arc/id');
      assert.equal(dt.getData('arc/type'), 'project', 'has arc/type');
      assert.equal(dt.getData('arc/source'), 'projects-menu', 'has arc/source');
      assert.equal(dt.getData('arc/project'), '1', 'has arc/project');
    });

    it('ignores when not enabled', () => {
      element.draggableEnabled = false;
      const e = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      const dt = e.dataTransfer;
      assert.equal(dt.getData('arc/id'), '');
    });
  });

  describe('[projectDragOverHandler]()', () => {
    before(async () => {
      await generator.insertProjectsData();
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('adds drop-target to the target', () => {
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.isTrue(target.classList.contains('drop-target'));
    });

    it('sets [openingProjectTimeout]', () => {
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.typeOf(element[openingProjectTimeout], 'number');
    });

    it('ignores setting [openingProjectTimeout] when already opened', () => {
      element[openedProjectsValue] = [element.projects[0]._id];
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.isUndefined(element[openingProjectTimeout]);
    });

    it('ignores setting [openingProjectTimeout] when timeout is set', () => {
      element[openingProjectTimeout] = 10;
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.equal(element[openingProjectTimeout], 10);
    });

    it('ignores when not enabled', () => {
      element.draggableEnabled = false;
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.isFalse(target.classList.contains('drop-target'));
    });

    it('ignores when not a request', () => {
      const dt = new DataTransfer();
      dt.setData('arc/project', 'some-id');
      const e = new DragEvent('dragover', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);
      assert.isFalse(target.classList.contains('drop-target'));
    });
  });

  describe('[projectDragLeaveHandler]()', () => {
    before(async () => {
      await generator.insertProjectsData();
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('removes drop-target from the target', () => {
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragleave', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.classList.add('drop-target');
      target.dispatchEvent(e);
      assert.isFalse(target.classList.contains('drop-target'));
    });

    it('ignores when not enabled', () => {
      element.draggableEnabled = false;
      const dt = new DataTransfer();
      dt.setData('arc/request', 'some-id');
      const e = new DragEvent('dragleave', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.classList.add('drop-target');
      target.dispatchEvent(e);
      assert.isTrue(target.classList.contains('drop-target'));
    });

    it('ignores when not a request', () => {
      const dt = new DataTransfer();
      dt.setData('arc/project', 'some-id');
      const e = new DragEvent('dragleave', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.classList.add('drop-target');
      target.dispatchEvent(e);
      assert.isTrue(target.classList.contains('drop-target'));
    });
  });

  describe('[projectDropHandler]()', () => {
    before(async () => {
      await generator.insertProjectsData();
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('adds a saved request to the project', async () => {
      const request = /** @type ARCSavedRequest */ (generator.generateSavedItem());
      request._id = `request-${Date.now()}`
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isTrue(spy.called);

      await spy.args[0][0].detail.result;
      const dbRequest = /** @type ARCSavedRequest */ (await ArcModelEvents.Request.read(document.body, 'saved', rRec.id));
      assert.deepEqual(dbRequest.projects, [element.projects[0]._id])
    });

    it('adds a project request to another project', async () => {
      const request = /** @type ARCSavedRequest */ (generator.generateSavedItem());
      request._id = `request-${Date.now()}`
      request.projects = ['another'];
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isTrue(spy.called);

      await spy.args[0][0].detail.result;
      const dbRequest = /** @type ARCSavedRequest */ (await ArcModelEvents.Request.read(document.body, 'saved', rRec.id));
      assert.deepEqual(dbRequest.projects, ['another', element.projects[0]._id])
    });

    // not sure how to mock this...
    it.skip('moves request from one project to another', async () => {
      const request = /** @type ARCSavedRequest */ (generator.generateSavedItem());
      request._id = `request-${Date.now()}`
      request.projects = ['another'];
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      dt.dropEffect = 'copyMove';
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
        ctrlKey: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isTrue(spy.called);

      await spy.args[0][0].detail.result;
      const dbRequest = /** @type ARCSavedRequest */ (await ArcModelEvents.Request.read(document.body, 'saved', rRec.id));
      assert.deepEqual(dbRequest.projects, [element.projects[0]._id])
    });

    it('ignores when not arc request', async () => {
      const request = /** @type ARCSavedRequest */ (generator.generateSavedItem());
      request._id = `request-${Date.now()}`
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();      
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isFalse(spy.called);
    });

    it('ignores when no id on the request', async () => {
      const request = /** @type ARCSavedRequest */ (generator.generateSavedItem());
      request._id = `request-${Date.now()}`
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();      
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isFalse(spy.called);
    });

    it('ignores when no request type', async () => {
      const request = /** @type ARCSavedRequest */ (generator.generateSavedItem());
      request._id = `request-${Date.now()}`
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();      
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.dispatchEvent(e);

      assert.isFalse(spy.called);
    });

    it('removes class from the target', async () => {
      const request = /** @type ARCSavedRequest */ (generator.generateSavedItem());
      request._id = `request-${Date.now()}`
      request.projects = ['another'];
      const rRec = await ArcModelEvents.Request.update(document.body, 'saved', request);

      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Project.addTo, spy);
      const dt = new DataTransfer();
      dt.setData('arc/request', rRec.id);
      dt.setData('arc/id', rRec.id);
      dt.setData('arc/type', 'saved');
      const e = new DragEvent('drop', {
        dataTransfer: dt,
        cancelable: true,
        bubbles: true,
      });
      const target = element.shadowRoot.querySelector('.project-item');
      target.classList.add('drop-target');
      target.dispatchEvent(e);

      await spy.args[0][0].detail.result;
      
      assert.isFalse(target.classList.contains('drop-target'))
    });
  });

  describe('[toggleOpen]()', () => {
    before(async () => {
      await generator.insertSavedRequestData({
        projectsSize: 5,
        forceProject: true,
        requestsSize: 30,
      });
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('reads requests when opening', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.readBulk, spy);

      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.project-item'));
      target.click();

      assert.isTrue(spy.called);

      await spy.args[0][0];
    });

    it('calls [openProject] when opening a project', async () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy(element, openProject);
      element.addEventListener(ArcModelEventTypes.Request.readBulk, spy1);

      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.project-item'));
      target.click();

      await spy1.args[0][0];
      assert.isTrue(spy2.called);
    });

    it('toggles back a project', async () => {
      element[openedProjectsValue] = [element.projects[0]._id];
      
      const target = /** @type HTMLElement */ (element.shadowRoot.querySelector('.project-item'));
      target.click();

      assert.deepEqual(element[openedProjectsValue], []);
    });
  });

  describe('[openProject]()', () => {
    before(async () => {
      await generator.insertSavedRequestData({
        projectsSize: 5,
        forceProject: true,
        requestsSize: 30,
      });
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('reads requests for the project', async () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.Request.readBulk, spy);
      const project = element.projects.find((p) => !!(p.requests && p.requests.length));
      await element[openProject](project._id);
      assert.isTrue(spy.called);
    });

    it('adds project to opened list', async () => {
      const project = element.projects[0];
      await element[openProject](project._id);
      assert.include(element[openedProjectsValue], project._id);
    });

    it('adds requests to the requests list', async () => {
      const project = element.projects.find((p) => !!(p.requests && p.requests.length));
      await element[openProject](project._id);
      assert.lengthOf(element.requests, project.requests.length);
    });
  });

  describe('[openRequestHandler]()', () => {
    before(async () => {
      await generator.insertSavedRequestData({
        projectsSize: 5,
        forceProject: true,
        requestsSize: 30,
      });
    });

    after(async () => {
      await generator.destroySavedRequestData();
    });

    let element = /** @type ProjectsMenuElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element.draggableEnabled = true;
      await element[internals.refreshProjectsList]();
      await element.requestUpdate();
    });

    it('dispatches navigation event when request item clicked ', async () => {
      const project = element.projects.find((p) => !!(p.requests && p.requests.length));
      await element[openProject](project._id);

      const spy = sinon.spy();
      element.addEventListener(ArcNavigationEventTypes.navigateRequest, spy);

      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.request-list-item'));
      node.click();

      assert.isTrue(spy.called);
    });
  });
});
