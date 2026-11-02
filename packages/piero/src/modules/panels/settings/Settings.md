---
template: module
type: builtin
description: Adds a panel to change user ettings such as dark/light color mode.
---

## Usage

This module adds a settings panel to the application that allows users to save their own
settings, such as the color theme.

### Switching between dark and light color modes

Piero uses the [Bootstrap framework](https://getbootstrap.com/docs/5.3/getting-started/introduction/). Changing the color mode is done through the [`data-bs-theme`](https://getbootstrap.com/docs/5.3/customize/color-modes/) attribute.

This attribute will be set on the DOM element that contains the Piero instance (the root element
that was passed when creating the app with `createPieroApp()`.)

> [!tip]
> You can set the `data-bs-theme` attribute yourself directly on the DOM element before calling `createPieroApp()`, for example :
>
> ```js
> element.setAttribute('data-bs-theme', 'dark');
> ```
>
> This is useful if you don't intend to let users change the color mode or if you want to use a different UI to do so.
