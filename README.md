![plentymarkets Logo](http://www.plentymarkets.eu/layout/pm/images/logo/plentymarkets-logo.jpg)

# plentymarkets CMS library

Improve the user experience of your plentymarkets store by simply adding some dynamic functions to your store layout.
Just add some markup in your templates to bind different functionalities.

This library was built in combination with the [**Callisto Light**](http://standardtemplate.plenty-showcase.de/) store template,
but can be easily adapted to other templates by using the provided JavaScript API.

## Table of contents

- [Installation](#installation)
    - [Requirements](#requirements)
    - [Compiled library](#compiled-library)
    - [Custom builds](#custom-builds)
- [Usage](#usage)
    - [Usage in store templates](#using-the-library-in-your-store-templates)
    - [Using the JavaScript API](#using-the-javascript-api)
    - [Customizing and Theming](#customizing-and-theming)
    - [Internationalization and Translation](#internationalization-and-translation)
- [Copyright and License](#copyright-and-license)

## Installation

### Requirements
- **jQuery**: The library requires jQuery. By default, jQuery is included in all plentymarkets online stores.
- **Twitter Bootstrap**: This library provides some UI functions based on [Twitter Bootstrap](http://getbootstrap.com/)
- **Modernizr**: Some directives are using [Modernizr](http://modernizr.com/) to detect touch devices.
- **Owl Carousel 1.x.x**: This [jQuery-Plugin](http://owlgraphic.com/owlcarousel/) is used for slider directives.
- **Lazy Load Plugin**: A jQuery plugin for loading images dynamically. [Project Page](http://www.appelsiini.net/projects/lazyload)


### Compiled library

Upload `/dist/plentymarketsCMStools-X.X.X.min.js` to your store's webspace and include it in your templates:

```html
<script type="text/javascript src="/YOUR_LAYOUT_FOLDER/plentymarketsCMStools-X.X.X.min.js"></script>
```

### Custom builds

Use [Grunt](http://gruntjs.com/) to compile your custom build. The following grunt tasks are provided by default:

- **grunt debug** (default): Compile all factories, services and directives without minifying the result. Does not run any tests and doesn't' create a documentation.
- **grunt doc**: Generates a documentation using [YUIDoc](http://yui.github.io/yuidoc/).
- **grunt build**: Run karma tests, compile and uglify all components and generate/ refresh the documentation.


## Usage

This library is used by the plentymarkets [**Callisto Light**](http://standardtemplate.plenty-showcase.de/) store template.

### Using the library in your store templates

#### Binding directives

Directives can be used to add several functions to your markup. The library provides a simple syntax to access directives from a single *data*-attribute:

`EVENT:DIRECTIVE.METHOD( PARAMS* )`

- EVENT: any event to trigger the method on, e.g. 'click', 'focus', 'change'. To trigger a directive when document is ready, use 'ready' or leave empty.
- DIRECTIVE: The name of the directive, e.g. 'UI', 'Basket', 'Tab'
- METHOD: A public method of the referenced directive.
- PARAMS: You can pass several parameters to a directive. It is possible to pass Strings, numbers, boolean values or this-reference containing the bound HTML-element.

It is also possible to chain multiple bindings separated by `;`

```html
<span data-plenty="click:UI.toggleClass('newClass', this)">Toggle class</span>
<span data-plenty="UI.initToTop(this)">To top</span>
<input data-plenty="change:Basket.setItemQuantity( 123, this ); focus:UI.removeClass( 'has-error', this )" type="text" />
```

### Using the JavaScript API

#### Components hierarchy and dependency injection

The library is composed of several layers to separate logical methods from UI-dependent functions:

`HTML / Markup` &lt;---&gt; `directives` &lt;---&gt; `services` &lt;---&gt; `factories`

Every component can inject other components at the same or higher levels inside this hierarchy. On the other hand it is not possible
to inject lower-level componets. According to this, a directive can inject other directives, services and factories but a factory can only inject other factories but no services or directives.

#### Creating custom components
All components are built the same way using `PlentyFramework.directive()`, `PlentyFramework.service()` or `PlentyFramework.factory()`.
Each of these methods expects the following parameters:
- a component name: This name can be used to inject this components into other.
- the components definition: a function wrapping all methods of this component.
- a list of dependencies: An array containing names of other components to inject. Injected components will be passed as parameters to the components wrapper function.

```js
PlentyFramework.directive( 'MyDirective', function( aService, aFactory ) {
    return {
        doAnything: function() {
            console.log('Hello!)';
        }
    }
}, ['SomeServiceName', 'FactoryToInject'] );
```

#### Registering global variables

Global variables can be used to pass server-side variables to the client-side framework:
```html
<script>
	PlentyFramework.setGlobal( 'URL_HOME', {% Link_Home() %} );
</script>
````
Use `PlentyFramework.getGlobal( variable_name )` to get the value of a registered global variable.
```js
	// in your service, factory or directive
	console.log( PlentyFramework.getGlobal( 'URL_HOME' ) );
```

### Customizing and Theming

This library was built in addition to the [**Callisto Light**](http://standardtemplate.plenty-showcase.de/) store template
and uses [Twitter Bootstrap](http://getbootstrap.com/) for UI functions and styling.

The behaviour and layout of all affected elements are defined in `src/partials`. For rendering .html-templates this library
uses the [Mustache Syntax](https://github.com/janl/mustache.js/).

#### Customizing the behaviour of partials

Each partial provides a simple JavaScript interface describing its basic behaviour.

**Example:** `src/partials/waitscreen/waitscreen.js`
```js
PlentyFramework.partials.WaitScreen = {

        show: function( element ) {
        	// define, how your waitScreen should appear
            element.addClass('in');
        },

        hide: function( element ) {
            element.removeClass('in');
        }

    };
```
You can edit these functions to make your loading screen act as you like.

#### Changing the layout of partials

All generated html structures (e.g. Modals or Error-Messages) are sourced in separate .html-files and can be edited
without affecting the functionality. You can use the [Mustache Syntax](https://github.com/janl/mustache.js/) to bind
variables to the templates and the {{#translate}} function to make strings multilingual.

### Internationalization and Translation

Language dependent strings are sourced in .json-files and can be loaded separately. To support several languages you can
add more language files containing your translations of the defined strings.

#### Loading a language file

Language files should be loaded immediately after loading the the JavaScript library.

**Example:**
```html
<script src="plentymarketsCMStools-X.X.X.min.js"></script>
<script>
	{% if $Lang == "de" %}
	PlentyFramework.loadLanguageFile('/lang/de_DE.json');
	{% else $Lang == "en" %}
	PlentyFramework.loadLanguageFile('/lang/en_EN.json');
	{% endif %}
</script>
```
**Hint:** The path referencing your language file has to be relative to the plentymarketsCMStools.js script path.
```
.
+-- path
|   +-- to
|       +-- plentymarketsCMStools.js
|       +-- lang
|           +-- de_DE.json
|           +-- en_EN.json
+-- another
    +-- path
        +-- es_ES.json
```
in this case you can use: `PlentyFramework.loadLanguageFile('/lang/de_DE.json')` or `PlentyFramework.loadLanguageFile('/../../another/path/es_ES.json')`

#### Using multilingual Strings in JavaScript

You can use `PlentyFramework.translate()` to receive the translation of a String from the currently loaded language file.
If the language file not contains a translation it returns the original String.
`PlentyFramework.translate()` also renders the provided String with the [Mustache Syntax](https://github.com/janl/mustache.js/)
so you can bind variables to your string.

**Examples:**

`translations.json`
```json
{
	"Close": "Exit",
	"Hello {{name}}": "Hi {{name}}!"
}
```

`script.js`
```js
PlentyFramework.translate("Close"); // returns "Exit"
PlentyFramework.translate("Hello {{name}}", {name: 'World'}); // returns "Hi World!"
PlentyFramework.translate("Something"); // returns "Something" (as fallback value)
```

#### Using multilingual Strings in HTML-Templates

In addition to the basic Mustache Syntax the plentymarketsCMStools provide its `translate()` method to all templates:
```html
<button>{{#translate}}Close{{/translate}}</button>
```
This will be rendered to:
```html
<button>Exit</button>
```

## Copyright and license
Copyright 2015 [plentymarkets GmbH](https://www.plentymarkets.com/).
Released under [AGPL v3 license](https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE).
