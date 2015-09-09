![plentymarkets Logo](http://www.plentymarkets.eu/layout/pm/images/logo/plentymarkets-logo.jpg)

# Additional tools

## Table of contents

- [ScriptLoader](#scriptloader)

## ScriptLoader

This snippet allows to define required JavaScript-files for different PageDesigns in a global .json-file.
Adding scripts to your plentymarkets Webshop does not require editing multiple layouts anymore.

### Usage
1. Define paths to required scripts in a .json-file, e.g. `scripts.json`.
```js
{
	"PageDesignGlobal": {		// These files will be loaded in all PageDesigns
		"head": [],				// Files to load in the <head> of the current page
		"body": []				// Files to load at the end of the <body> of the current page
	},
	"PageDesignContent": {		// These files will only be loaded in PageDesignContent
		"head": [],
		"body": []
	},
	"PageDesignCheckout": {
		"head": [],
		"body": []
	},
	"PageDesignMyAccount": {
		"head": [],
		"body": []
	}
}
```

2. Load the `ScriptLoader.js` inside the <head> of your different layouts

3. Call `ScriptLoader.load()` in your different layouts inside your <head> and <body> elements:
```js
ScriptLoader.load({
	// Define the design to load the scripts for, e.g. PageDesignContent
	layout: PageDesign$PageDesign,

	// The scripts to load of the currently selected design ("head" / "body")
	position: 'head',

	// The path to the folder containing all your JavaScript files
	rootPath: '{% GetGlobal('LayoutFolder'); %}',

	// The path to your .json-file. This parameter is not required if your .json-file is stored inside 'rootPath'
	sourceMap:'{% GetGlobal('LayoutFolder'); %}/js/plenty/scripts.json'
});
```