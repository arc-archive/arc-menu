[![Build Status](https://travis-ci.org/advanced-rest-client/arc-menu.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/arc-menu)  

# arc-menu

Side navigation for Advanced REST Client.

### Example
```
<arc-menu></arc-menu>
```

### Styling
`<arc-menu>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--arc-menu` | Mixin applied to the element | `{}`
`--arc-menu-item-background-color` | Background color of each menu item | `transparent`
`--arc-menu-selected-background-color` | Background color of selected menu item | `--accent-color`
`--arc-menu-selected-color` | Color of selected menu item | `#fff`
`--arc-menu-bottom-actions` | Mixin applied to the bottom pane with additional actions. | `{}`
`--arc-menu-bottom-actions-button` | Mixin applied to the buttons in bottom action pane. | `{}`
`--arc-menu-bottom-actions-button-hover` | Mixin applied to the buttons in bottom action pane when hovering. | `{}`
`--arc-menu-tabs-color` | Color of the papaer tabs | ``
`--arc-menu-tabs-color-unselected` | Color of the papaer tabs when not selected | ``



### Events
| Name | Description | Params |
| --- | --- | --- |
| navigate | Fired when the user performed a navigation action.  It uses ARC's standard navigation event: https://github.com/advanced-rest-client/arc-electron/wiki/Navigation-events---dev-guide | __none__ |
