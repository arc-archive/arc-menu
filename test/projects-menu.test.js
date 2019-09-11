import { fixture, assert, nextFrame, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../projects-menu.js';

describe('<projects-menu>', function() {
  async function basicFixture() {
    return await fixture(`<projects-menu draggableEnabled noautoprojects></projects-menu>`);
  }

  async function listDefaultFixture() {
    return await fixture(`<projects-menu listtype="default" noautoprojects></projects-menu>`);
  }

  async function listCompactFixture() {
    return await fixture(`<projects-menu listtype="compact" noautoprojects></projects-menu>`);
  }

  async function listComfortableFixture() {
    return await fixture(`<projects-menu listtype="comfortable" noautoprojects></projects-menu>`);
  }

  describe('List types computations', () => {
    const iconWidthProperty = '--anypoint-item-icon-width';
    const iconWidths = ['56px', '48px', '36px'];

    it(`Icon width is not set for inital list style`, async () => {
      const element = await basicFixture();
      const style = getComputedStyle(element).getPropertyValue(iconWidthProperty);
      assert.equal(style.trim(), '');
    });

    it(`Icon width is ${iconWidths[0]} for "default" list style`, async () => {
      const element = await listDefaultFixture();
      const style = getComputedStyle(element).getPropertyValue(iconWidthProperty);
      assert.equal(style.trim(), iconWidths[0]);
    });

    it(`Icon width is ${iconWidths[1]} for "Comfortable" list style`, async () => {
      const element = await listComfortableFixture();
      const style = getComputedStyle(element).getPropertyValue(iconWidthProperty);
      assert.equal(style.trim(), iconWidths[1]);
    });

    it(`Icon width is ${iconWidths[2]} for "Comfortable" list style`, async () => {
      const element = await listCompactFixture();
      const style = getComputedStyle(element).getPropertyValue(iconWidthProperty);
      assert.equal(style.trim(), iconWidths[2]);
    });
  });

  describe('_computeA11yCommand()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns a string with the key', () => {
      const result = element._computeA11yCommand('s');
      assert.typeOf(result, 'string');
      assert.match(result, /[ctrl|meta]\+s/);
    });

    it('Returns mac+letter for mac platform', () => {
      const result = element._computeA11yCommand('s', 'Mac');
      assert.typeOf(result, 'string');
      assert.match(result, /meta\+s/);
    });

    it('Returns ctrl+letter for other platforms', () => {
      const result = element._computeA11yCommand('s', 'Other');
      assert.typeOf(result, 'string');
      assert.match(result, /ctrl\+s/);
    });
  });

  describe('_cancelEvent()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls preventDefault()', () => {
      let called;
      const e = {
        preventDefault: () => called = true,
        stopPropagation: () => {},
        stopImmediatePropagation: () => {}
      };
      element._cancelEvent(e);
      assert.isTrue(called);
    });

    it('Calls preventDefault()', () => {
      let called;
      const e = {
        preventDefault: () => {},
        stopPropagation: () => called = true,
        stopImmediatePropagation: () => {}
      };
      element._cancelEvent(e);
      assert.isTrue(called);
    });

    it('Calls stopImmediatePropagation()', () => {
      let called;
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        stopImmediatePropagation: () => called = true
      };
      element._cancelEvent(e);
      assert.isTrue(called);
    });
  });

  describe('_dispatchOpenRequests()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches workspace-open-project-requests event', () => {
      const project = DataGenerator.createProjectObject();
      const spy = sinon.spy();
      element.addEventListener('workspace-open-project-requests', spy);
      element._dispatchOpenRequests(project, false);
      assert.isTrue(spy.called);
    });

    it('Returns the event', () => {
      const project = DataGenerator.createProjectObject();
      const e = element._dispatchOpenRequests(project, false);
      assert.typeOf(e, 'customevent');
      assert.equal(e.type, 'workspace-open-project-requests');
    });

    it('Event has project data', () => {
      const project = DataGenerator.createProjectObject();
      const e = element._dispatchOpenRequests(project, false);
      assert.deepEqual(e.detail.project, project);
    });

    it('Event has replace flage', () => {
      const project = DataGenerator.createProjectObject();
      const e = element._dispatchOpenRequests(project, false);
      assert.isFalse(e.detail.replace);
    });
  });

  describe('_openProject()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.projects = DataGenerator.generateProjects({
        projectsSize: 2
      });
      await nextFrame();
    });

    it('menu option is deselected', async () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[0];
      MockInteractions.tap(item);
      await aTimeout();
      const menu = element.shadowRoot.querySelector('anypoint-listbox');
      assert.isUndefined(menu.selected);
    });

    it('Calls _dispatch() with "navigate"', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[0];
      const spy = sinon.spy(element, '_dispatch');
      MockInteractions.tap(item);
      assert.equal(spy.args[0][0], 'navigate');
    });

    it('Calls _dispatch() with detail argument', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[0];
      const spy = sinon.spy(element, '_dispatch');
      MockInteractions.tap(item);
      assert.equal(spy.args[0][1].base, 'project', 'Base is set');
      assert.equal(spy.args[0][1].type, 'details', 'Type is set');
      assert.typeOf(spy.args[0][1].id, 'string', 'Id is set');
    });
  });

  describe('_openAllRequests()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.projects = DataGenerator.generateProjects({
        projectsSize: 2
      });
      await nextFrame();
    });

    it('menu option is deselected', async () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[1];
      MockInteractions.tap(item);
      await aTimeout();
      const menu = element.shadowRoot.querySelector('anypoint-listbox');
      assert.isUndefined(menu.selected);
    });

    it('Calls _dispatchOpenRequests() when menu item click', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[1];
      const spy = sinon.spy(element, '_dispatchOpenRequests');
      MockInteractions.tap(item);
      assert.isTrue(spy.called);
    });

    it('project argument is set', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[1];
      const spy = sinon.spy(element, '_dispatchOpenRequests');
      MockInteractions.tap(item);
      assert.typeOf(spy.args[0][0], 'object');
    });

    it('replace argument is set', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[1];
      const spy = sinon.spy(element, '_dispatchOpenRequests');
      MockInteractions.tap(item);
      assert.isFalse(spy.args[0][1]);
    });

    it('Dispatches workspace-open-project-request event', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[1];
      const spy = sinon.spy();
      element.addEventListener('workspace-open-project-requests', spy);
      MockInteractions.tap(item);
      assert.isTrue(spy.called);
    });
  });

  describe('_replaceAllRequests()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.projects = DataGenerator.generateProjects({
        projectsSize: 2
      });
      await nextFrame();
    });

    it('menu option is deselected', async () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[2];
      MockInteractions.tap(item);
      await aTimeout();
      const menu = element.shadowRoot.querySelector('anypoint-listbox');
      assert.isUndefined(menu.selected);
    });

    it('Calls _dispatchOpenRequests() when menu item click', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[2];
      const spy = sinon.spy(element, '_dispatchOpenRequests');
      MockInteractions.tap(item);
      assert.isTrue(spy.called);
    });

    it('project argument is set', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[2];
      const spy = sinon.spy(element, '_dispatchOpenRequests');
      MockInteractions.tap(item);
      assert.typeOf(spy.args[0][0], 'object');
    });

    it('replace argument is set', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[2];
      const spy = sinon.spy(element, '_dispatchOpenRequests');
      MockInteractions.tap(item);
      assert.isTrue(spy.args[0][1]);
    });

    it('Dispatches workspace-open-project-request event', () => {
      const item = element.shadowRoot.querySelectorAll('anypoint-listbox anypoint-item')[2];
      const spy = sinon.spy();
      element.addEventListener('workspace-open-project-requests', spy);
      MockInteractions.tap(item);
      assert.isTrue(spy.called);
    });
  });

  describe('_toggleOpen()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.projects = DataGenerator.generateProjects({
        projectsSize: 2
      });
      await nextFrame();
    });

    it('adds and removes project id from _openedProjects', async () => {
      const node = element.shadowRoot.querySelector('anypoint-icon-item[data-index="1"]');
      MockInteractions.tap(node);
      assert.deepEqual(element._openedProjects, [node.dataset.id]);
      await nextFrame();
      MockInteractions.tap(node);
      assert.deepEqual(element._openedProjects, []);
    });

    it('opens project requests list', async () => {
      const node = element.shadowRoot.querySelector('anypoint-icon-item[data-index="1"]');
      MockInteractions.tap(node);
      await nextFrame();
      assert.deepEqual(node.nextElementSibling.localName, 'projects-menu-requests');
    });
  });

  describe('_dispatch()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    const eName = 'test-event';
    const eDetail = 'test-detail';

    it('Dispatches an event', () => {
      const spy = sinon.spy();
      element.addEventListener(eName, spy);
      element._dispatch(eName);
      assert.isTrue(spy.called);
    });

    it('Returns the event', () => {
      const e = element._dispatch(eName);
      assert.typeOf(e, 'customevent');
    });

    it('Event is cancelable', () => {
      const e = element._dispatch(eName);
      assert.isTrue(e.cancelable);
    });

    it('Event is composed', () => {
      const e = element._dispatch(eName);
      if (typeof e.composed !== 'undefined') {
        assert.isTrue(e.composed);
      }
    });

    it('Event bubbles', () => {
      const e = element._dispatch(eName);
      assert.isTrue(e.bubbles);
    });

    it('Event has detail', () => {
      const e = element._dispatch(eName, eDetail);
      assert.equal(e.detail, eDetail);
    });
  });

  describe('_dispatchProcessError()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls _dispatch()', () => {
      const spy = sinon.spy(element, '_dispatch');
      element._dispatchProcessError(new Error('test'));
      assert.equal(spy.args[0][0], 'process-error');
      assert.deepEqual(spy.args[0][1].message, 'test');
    });

    it('Uses default message', () => {
      const spy = sinon.spy(element, '_dispatch');
      element._dispatchProcessError('Not an error');
      assert.deepEqual(spy.args[0][1].message, 'Unknown error');
    });

    it('Returns the event', () => {
      const e = element._dispatchProcessError(new Error('test'));
      assert.typeOf(e, 'customevent');
      assert.equal(e.type, 'process-error');
    });
  });

  describe('_dragoverHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.projects = DataGenerator.generateProjects();
      element.dragOpenTimeout = 1;
      await nextFrame();
    });

    function dispatchEvent(types, node) {
      if (!types) {
        types = ['arc/request-object'];
      }
      node = node || element.shadowRoot.querySelector('.project-item');
      const e = new Event('dragover', { cancelable: true, bubbles: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      node.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragoverHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      const node = element.shadowRoot.querySelector('.project-item');
      dispatchEvent(['other']);
      assert.isFalse(node.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatchEvent();
      assert.isTrue(e.defaultPrevented);
    });

    it('Calls _computeProjectDropEffect()', () => {
      const spy = sinon.spy(element, '_computeProjectDropEffect');
      dispatchEvent();
      assert.isTrue(spy.called);
    });

    it('Does nothing when __dragOverIndex is set', () => {
      element.__dragOverIndex = 1;
      dispatchEvent();
      assert.isUndefined(element.__dragOverTimeout);
    });

    it('Sets __dragOverIndex', () => {
      dispatchEvent();
      assert.equal(element.__dragOverIndex, 0);
    });

    it('Sets __dragOverTimeout', () => {
      dispatchEvent();
      assert.typeOf(element.__dragOverTimeout, 'number');
    });

    it('Sets drop-target on the target', () => {
      const node = element.shadowRoot.querySelector('.project-item');
      dispatchEvent();
      assert.isTrue(node.classList.contains('drop-target'));
    });

    it('Sets drop-target on the target only once', () => {
      const node = element.shadowRoot.querySelector('.project-item');
      node.classList.add('drop-target');
      dispatchEvent();
      assert.isTrue(node.classList.contains('drop-target'));
    });

    it('Calls _openProjectDragOver() after timeout', (done) => {
      dispatchEvent();
      const spy = sinon.spy(element, '_openProjectDragOver');
      setTimeout(() => {
        assert.isTrue(spy.called);
        done();
      }, 10);
    });
  });

  describe('_dragleaveHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.projects = DataGenerator.generateProjects();
      await nextFrame();
    });

    function dispatch(element, types) {
      if (!types) {
        types = ['arc/request-object'];
      }
      const e = new Event('dragleave', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      const node = element.shadowRoot.querySelector('.project-item');
      node.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragleaveHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      const node = element.shadowRoot.querySelector('.project-item');
      dispatch(element, ['other']);
      assert.isFalse(node.classList.contains('drop-target'));
    });

    it('Ignores event when arc/saved-request is set', () => {
      const node = element.shadowRoot.querySelector('.project-item');
      dispatch(element, ['arc/saved-request']);
      assert.isFalse(node.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Removes drop-target class on the element', () => {
      const node = element.shadowRoot.querySelector('.project-item');
      node.classList.add('drop-target');
      dispatch(element);
      assert.isFalse(node.classList.contains('drop-target'));
    });

    it('Removes class name only once', () => {
      const node = element.shadowRoot.querySelector('.project-item');
      dispatch(element);
      assert.isFalse(node.classList.contains('drop-target'));
    });

    it('Clears __dragOverIndex', () => {
      element.__dragOverIndex = 1;
      dispatch(element);
      assert.isUndefined(element.__dragOverIndex);
    });

    it('Calls _cancelDragTimeout()', () => {
      const spy = sinon.spy(element, '_cancelDragTimeout');
      dispatch(element);
      assert.isTrue(spy.called);
    });
  });

  describe('_dropHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.projects = DataGenerator.generateProjects();
      element._appendProjectRequest = () => {};
      await nextFrame();
    });

    function dispatch(element, types, content) {
      if (!types) {
        types = ['arc/request-object'];
      }
      if (content === undefined) {
        content = '{"_id":"test-id", "_rev":"test-rev"}';
      }
      const e = new Event('drop', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, content);
      });
      const node = element.shadowRoot.querySelector('.project-item');
      node.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dropHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      dispatch(element, ['other']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Removes drop-target class on the element', () => {
      const node = element.shadowRoot.querySelector('.project-item');
      node.classList.add('drop-target');
      dispatch(element);
      assert.isFalse(node.classList.contains('drop-target'));
    });

    it('Removes class name only once', () => {
      const node = element.shadowRoot.querySelector('.project-item');
      dispatch(element);
      assert.isFalse(node.classList.contains('drop-target'));
    });

    it('Calls _appendProjectRequest() with request', () => {
      const spy = sinon.spy(element, '_appendProjectRequest');
      dispatch(element);
      assert.deepEqual(spy.args[0][0], element.projects[0]);
      assert.deepEqual(spy.args[0][1], {
        _id: 'test-id',
        _rev: 'test-rev'
      });
    });

    it('Ignores when no request object data', () => {
      const spy = sinon.spy(element, '_appendProjectRequest');
      dispatch(element, null, '');
      assert.isFalse(spy.called);
    });
  });

  describe('_cancelDragTimeout()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Clears timeout when set', () => {
      element.__dragOverTimeout = 1;
      element._cancelDragTimeout();
      assert.isUndefined(element.__dragOverTimeout);
    });

    it('Does nothing when no timer', () => {
      element.__dragOverTimeout = undefined;
      element._cancelDragTimeout();
      // This is for coverage
    });
  });

  describe('_openProjectDragOver()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.projects = DataGenerator.generateProjects();
      element.__dragOverIndex = 1;
      await nextFrame();
    });

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._openProjectDragOver();
      // no error
    });

    it('Clears __dragOverTimeout', () => {
      element.__dragOverTimeout = 1;
      element._openProjectDragOver();
      assert.isUndefined(element.__dragOverTimeout);
    });

    it('adds project id to opened list', () => {
      element._openProjectDragOver();
      assert.deepEqual(element._openedProjects, [element.projects[1]._id]);
    });
  });

  describe('_dragStart()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.projects = DataGenerator.generateProjects();
      await nextFrame();
    });

    function dispatch(element) {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const e = new Event('dragstart');
      e.dataTransfer = new DataTransfer();
      node.dispatchEvent(e);
      return e;
    }

    it('Sets arc/project-object transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc/project-object');
      assert.typeOf(data, 'string');
    });

    it('Sets arc-source/project-menu transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc-source/project-menu');
      assert.equal(data, element.projects[0]._id);
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });
  });
});
