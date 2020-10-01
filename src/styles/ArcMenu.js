import { css } from 'lit-element';

export default css`
:host {
  display: block;
  height: var(--arc-menu-height, 100vh);
  background-color: var(--arc-menu-background-color, inherit);
}

.menu {
  display: flex;
  flex-direction: column;
  height: inherit;
  overflow: hidden;
}

.menu-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

history-menu,
saved-menu,
rest-api-menu,
projects-menu {
  overflow: auto;
  display: block;
}

.menu-actions {
  padding: 4px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.right-action {
  margin-left: auto;
}

.spacer {
  flex: 1;
}

[hidden],
.hidden {
  display: none !important;
}

anypoint-tab {
  color: var(--arc-menu-tabs-color);
}

.warning-toggle {
  color: var(--arc-menu-warning-toggle-color, #FF5722);
}

.ticket-button {
  background-color: var(--arc-menu-warning-button-gb-color, #fff);
  margin-top: 12px;
}

anypoint-tab {
  margin-left: 0;
  margin-right: 0;
  padding: 0.7em 0.4em;
}

.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.list-search {
  margin: 0;
  width: 100%;
}
`;
