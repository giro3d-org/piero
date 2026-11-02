---
template: module
type: builtin
description: Adds a preferences panel to change global settings such as theme.
---

## Usage

This module adds a Preferences panel to the application that allows users to save their own
settings, such as the color theme.

> [!warning]
> Changing the color theme sets the Bootstrap's `data-bs-theme` attribute on the `<body>` element of the page. This is designed for
> fullscreen Piero applications. If you are embedding Piero in a DOM element in your page, then you
> should change the theme yourself on the root element of Piero and not use this module.

