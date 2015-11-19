(function defineMustache(global,factory){if(typeof exports==="object"&&exports&&typeof exports.nodeName!=="string"){factory(exports)}else if(typeof define==="function"&&define.amd){define(["exports"],factory)}else{global.Mustache={};factory(Mustache)}})(this,function mustacheFactory(mustache){var objectToString=Object.prototype.toString;var isArray=Array.isArray||function isArrayPolyfill(object){return objectToString.call(object)==="[object Array]"};function isFunction(object){return typeof object==="function"}function typeStr(obj){return isArray(obj)?"array":typeof obj}function escapeRegExp(string){return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function hasProperty(obj,propName){return obj!=null&&typeof obj==="object"&&propName in obj}var regExpTest=RegExp.prototype.test;function testRegExp(re,string){return regExpTest.call(re,string)}var nonSpaceRe=/\S/;function isWhitespace(string){return!testRegExp(nonSpaceRe,string)}var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};function escapeHtml(string){return String(string).replace(/[&<>"'\/]/g,function fromEntityMap(s){return entityMap[s]})}var whiteRe=/\s*/;var spaceRe=/\s+/;var equalsRe=/\s*=/;var curlyRe=/\s*\}/;var tagRe=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(template,tags){if(!template)return[];var sections=[];var tokens=[];var spaces=[];var hasTag=false;var nonSpace=false;function stripSpace(){if(hasTag&&!nonSpace){while(spaces.length)delete tokens[spaces.pop()]}else{spaces=[]}hasTag=false;nonSpace=false}var openingTagRe,closingTagRe,closingCurlyRe;function compileTags(tagsToCompile){if(typeof tagsToCompile==="string")tagsToCompile=tagsToCompile.split(spaceRe,2);if(!isArray(tagsToCompile)||tagsToCompile.length!==2)throw new Error("Invalid tags: "+tagsToCompile);openingTagRe=new RegExp(escapeRegExp(tagsToCompile[0])+"\\s*");closingTagRe=new RegExp("\\s*"+escapeRegExp(tagsToCompile[1]));closingCurlyRe=new RegExp("\\s*"+escapeRegExp("}"+tagsToCompile[1]))}compileTags(tags||mustache.tags);var scanner=new Scanner(template);var start,type,value,chr,token,openSection;while(!scanner.eos()){start=scanner.pos;value=scanner.scanUntil(openingTagRe);if(value){for(var i=0,valueLength=value.length;i<valueLength;++i){chr=value.charAt(i);if(isWhitespace(chr)){spaces.push(tokens.length)}else{nonSpace=true}tokens.push(["text",chr,start,start+1]);start+=1;if(chr==="\n")stripSpace()}}if(!scanner.scan(openingTagRe))break;hasTag=true;type=scanner.scan(tagRe)||"name";scanner.scan(whiteRe);if(type==="="){value=scanner.scanUntil(equalsRe);scanner.scan(equalsRe);scanner.scanUntil(closingTagRe)}else if(type==="{"){value=scanner.scanUntil(closingCurlyRe);scanner.scan(curlyRe);scanner.scanUntil(closingTagRe);type="&"}else{value=scanner.scanUntil(closingTagRe)}if(!scanner.scan(closingTagRe))throw new Error("Unclosed tag at "+scanner.pos);token=[type,value,start,scanner.pos];tokens.push(token);if(type==="#"||type==="^"){sections.push(token)}else if(type==="/"){openSection=sections.pop();if(!openSection)throw new Error('Unopened section "'+value+'" at '+start);if(openSection[1]!==value)throw new Error('Unclosed section "'+openSection[1]+'" at '+start)}else if(type==="name"||type==="{"||type==="&"){nonSpace=true}else if(type==="="){compileTags(value)}}openSection=sections.pop();if(openSection)throw new Error('Unclosed section "'+openSection[1]+'" at '+scanner.pos);return nestTokens(squashTokens(tokens))}function squashTokens(tokens){var squashedTokens=[];var token,lastToken;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];if(token){if(token[0]==="text"&&lastToken&&lastToken[0]==="text"){lastToken[1]+=token[1];lastToken[3]=token[3]}else{squashedTokens.push(token);lastToken=token}}}return squashedTokens}function nestTokens(tokens){var nestedTokens=[];var collector=nestedTokens;var sections=[];var token,section;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];switch(token[0]){case"#":case"^":collector.push(token);sections.push(token);collector=token[4]=[];break;case"/":section=sections.pop();section[5]=token[2];collector=sections.length>0?sections[sections.length-1][4]:nestedTokens;break;default:collector.push(token)}}return nestedTokens}function Scanner(string){this.string=string;this.tail=string;this.pos=0}Scanner.prototype.eos=function eos(){return this.tail===""};Scanner.prototype.scan=function scan(re){var match=this.tail.match(re);if(!match||match.index!==0)return"";var string=match[0];this.tail=this.tail.substring(string.length);this.pos+=string.length;return string};Scanner.prototype.scanUntil=function scanUntil(re){var index=this.tail.search(re),match;switch(index){case-1:match=this.tail;this.tail="";break;case 0:match="";break;default:match=this.tail.substring(0,index);this.tail=this.tail.substring(index)}this.pos+=match.length;return match};function Context(view,parentContext){this.view=view;this.cache={".":this.view};this.parent=parentContext}Context.prototype.push=function push(view){return new Context(view,this)};Context.prototype.lookup=function lookup(name){var cache=this.cache;var value;if(cache.hasOwnProperty(name)){value=cache[name]}else{var context=this,names,index,lookupHit=false;while(context){if(name.indexOf(".")>0){value=context.view;names=name.split(".");index=0;while(value!=null&&index<names.length){if(index===names.length-1)lookupHit=hasProperty(value,names[index]);value=value[names[index++]]}}else{value=context.view[name];lookupHit=hasProperty(context.view,name)}if(lookupHit)break;context=context.parent}cache[name]=value}if(isFunction(value))value=value.call(this.view);return value};function Writer(){this.cache={}}Writer.prototype.clearCache=function clearCache(){this.cache={}};Writer.prototype.parse=function parse(template,tags){var cache=this.cache;var tokens=cache[template];if(tokens==null)tokens=cache[template]=parseTemplate(template,tags);return tokens};Writer.prototype.render=function render(template,view,partials){var tokens=this.parse(template);var context=view instanceof Context?view:new Context(view);return this.renderTokens(tokens,context,partials,template)};Writer.prototype.renderTokens=function renderTokens(tokens,context,partials,originalTemplate){var buffer="";var token,symbol,value;for(var i=0,numTokens=tokens.length;i<numTokens;++i){value=undefined;token=tokens[i];symbol=token[0];if(symbol==="#")value=this.renderSection(token,context,partials,originalTemplate);else if(symbol==="^")value=this.renderInverted(token,context,partials,originalTemplate);else if(symbol===">")value=this.renderPartial(token,context,partials,originalTemplate);else if(symbol==="&")value=this.unescapedValue(token,context);else if(symbol==="name")value=this.escapedValue(token,context);else if(symbol==="text")value=this.rawValue(token);if(value!==undefined)buffer+=value}return buffer};Writer.prototype.renderSection=function renderSection(token,context,partials,originalTemplate){var self=this;var buffer="";var value=context.lookup(token[1]);function subRender(template){return self.render(template,context,partials)}if(!value)return;if(isArray(value)){for(var j=0,valueLength=value.length;j<valueLength;++j){buffer+=this.renderTokens(token[4],context.push(value[j]),partials,originalTemplate)}}else if(typeof value==="object"||typeof value==="string"||typeof value==="number"){buffer+=this.renderTokens(token[4],context.push(value),partials,originalTemplate)}else if(isFunction(value)){if(typeof originalTemplate!=="string")throw new Error("Cannot use higher-order sections without the original template");value=value.call(context.view,originalTemplate.slice(token[3],token[5]),subRender);if(value!=null)buffer+=value}else{buffer+=this.renderTokens(token[4],context,partials,originalTemplate)}return buffer};Writer.prototype.renderInverted=function renderInverted(token,context,partials,originalTemplate){var value=context.lookup(token[1]);if(!value||isArray(value)&&value.length===0)return this.renderTokens(token[4],context,partials,originalTemplate)};Writer.prototype.renderPartial=function renderPartial(token,context,partials){if(!partials)return;var value=isFunction(partials)?partials(token[1]):partials[token[1]];if(value!=null)return this.renderTokens(this.parse(value),context,partials,value)};Writer.prototype.unescapedValue=function unescapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return value};Writer.prototype.escapedValue=function escapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return mustache.escape(value)};Writer.prototype.rawValue=function rawValue(token){return token[1]};mustache.name="mustache.js";mustache.version="2.1.3";mustache.tags=["{{","}}"];var defaultWriter=new Writer;mustache.clearCache=function clearCache(){return defaultWriter.clearCache()};mustache.parse=function parse(template,tags){return defaultWriter.parse(template,tags)};mustache.render=function render(template,view,partials){if(typeof template!=="string"){throw new TypeError('Invalid template! Template should be a "string" '+'but "'+typeStr(template)+'" was given as the first '+"argument for mustache#render(template, view, partials)")}return defaultWriter.render(template,view,partials)};mustache.to_html=function to_html(template,view,partials,send){var result=mustache.render(template,view,partials);if(isFunction(send)){send(result)}else{return result}};mustache.escape=escapeHtml;mustache.Scanner=Scanner;mustache.Context=Context;mustache.Writer=Writer});

Object.equals = function( a, b ) {
    if( a === b ) return true;
    if( !(a instanceof Object) || !(b instanceof Object) ) return false;
    if( a.constructor !== b.constructor ) return false;

    for( var key in a ) {
        if( !a.hasOwnProperty(key) ) continue;
        if( !b.hasOwnProperty(key) ) return false;
        if( a[key] === b[key] ) continue;
        if( typeof( a[key] ) !== "object" ) return false;
        if( !Object.equals(a[key], b[key]) ) return false;
    }

    for( var key in b ) {
        if( b.hasOwnProperty(key) && !a.hasOwnProperty(key) ) return false;
    }

    return true;

};
var TemplateCache = {};

TemplateCache["error/errorMessage.html"] = "<div class=\"plentyErrorBoxContent\" data-plenty-error-code=\"{{code}}\">\n" +
   "    <span class=\"PlentyErrorCode\">Code {{code}}:</span>\n" +
   "    <span class=\"PlentyErrorMsg\">{{{message}}}</span>\n" +
   "</div>\n" +
   "";

TemplateCache["error/errorPopup.html"] = "<div class=\"plentyErrorBox\" id=\"CheckoutErrorPane\">\n" +
   "    <button class=\"close\" type=\"button\"><span aria-hidden=\"true\">×</span>\n" +
   "        <span class=\"sr-only\">{{#translate}}Close{{/translate}}</span>\n" +
   "    </button>\n" +
   "    <div class=\"plentyErrorBoxInner\">\n" +
   "    </div>\n" +
   "</div>\n" +
   "";

TemplateCache["modal/modal.html"] = "<div class=\"modal fade\">\n" +
   "    <div class=\"modal-dialog\">\n" +
   "        <div class=\"modal-content\">\n" +
   "\n" +
   "            {{#title}}\n" +
   "            <div class=\"modal-header\">\n" +
   "                <button class=\"close\" type=\"button\" data-dismiss=\"modal\" aria-label=\"{{#translate}}Close{{/translate}}\">\n" +
   "                    <span aria-hidden=\"true\">&times;</span>\n" +
   "                </button>\n" +
   "                <h4 class=\"modal-title\">{{{title}}}</h4>\n" +
   "            </div>\n" +
   "            {{/title}}\n" +
   "\n" +
   "            <div class=\"modal-body\">{{{content}}}</div>\n" +
   "\n" +
   "            <div class=\"modal-footer\">\n" +
   "\n" +
   "                {{#labelDismiss}}\n" +
   "                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">\n" +
   "                    <span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>{{labelDismiss}}\n" +
   "                </button>\n" +
   "                {{/labelDismiss}}\n" +
   "\n" +
   "                <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" data-plenty-modal=\"confirm\">\n" +
   "                    <span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>{{labelConfirm}}\n" +
   "                </button>\n" +
   "            </div>\n" +
   "        </div>\n" +
   "    </div>\n" +
   "</div>";

TemplateCache["waitscreen/waitscreen.html"] = "<div id=\"PlentyWaitScreen\" class=\"overlay overlay-wait\"></div>";

/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module PlentyFramework
 */
(function( $ )
{

    /**
     * Collection of uncompiled registered factories & services.
     * See {{#crossLink "PlentyFramework/compile:method"}}.compile(){{/crossLink}}
     * @attribute components
     * @static
     * @type {{factories: {}, services: {}}}
     */
    var components = {
        factories : {},
        services  : {},
        directives: {}
    };

    /**
     * Framework providing client functions for plentymarkets Webshops.
     * @class PlentyFramework
     * @constructor
     */
    PlentyFramework = function()
    {
    };

    var instance                = null;
    PlentyFramework.getInstance = function()
    {
        instance = instance || new PlentyFramework();
        return instance;
    };

    /**
     * Customizable controls for partials will be injected here.
     * (e.g. Modal)
     * @attribute
     * @static
     * @type {object}
     */
    PlentyFramework.partials = {};

    /**
     * Collection of registered global variables
     * @attribute
     * @static
     * @type {object}
     */
    PlentyFramework.globals = {};

    /**
     * Set a global variable.
     * @function setGlobal
     * @static
     * @param {string}  identifier  A unique identifier to reference this variable
     * @param {*}       value       The value to set
     * @return {*}                  The value
     */
    PlentyFramework.setGlobal = function( identifier, value )
    {
        if ( PlentyFramework.globals.hasOwnProperty( identifier ) )
        {
            console.error( 'Global variable "' + identifier + '" already exists and cannot be overridden.' );
            return null;
        }

        PlentyFramework.globals[identifier] = value;

        return PlentyFramework.globals[identifier];
    };

    /**
     * Get the value of a global variable or undefined if not exists
     * @function getGlobal
     * @static
     * @param  identifier  The identifier of the requested variable
     * @return {*}         The value of the variable
     */
    PlentyFramework.getGlobal = function( identifier )
    {
        return PlentyFramework.globals[identifier];
    };

    /**
     * Collection of registered directives
     * @type {Array}
     * @static
     */
    PlentyFramework.directives = {};

    /**
     * Register directive. Directives can be bound to dynamically added nodes by calling pm.bindPlentyFunctions();
     * @function directive
     * @static
     * @param   {string}    selector        jQuery selector of the DOM-elements to bind the directive to
     * @param   {function}  callback        Function to add directives behaviour
     * @param   {Array}     dependencies    List of required services. Services will be passed to callback function
     * @param   {boolean}   allowDuplicates Defines if a directive can be bound to the same element multiple times
     * @return  {object}                    The created directive
     */
    PlentyFramework.directive = function( directiveName, directiveFunctions, dependencies )
    {
        // Catch type mismatching for 'directiveName'
        if ( typeof directiveName !== 'string' )
        {
            console.error( "Type mismatch: Expect first parameter to be a 'string', '" + typeof directiveName + "' given." );
            return;
        }

        // Catch type mismatching for 'serviceFunctions'
        if ( typeof directiveFunctions !== 'function' )
        {
            console.error( "Type mismatch: Expect second parameter to be a 'function', '" + typeof directiveFunctions + "' given." );
            return;
        }

        dependencies = dependencies || [];

        components.directives[directiveName] = {
            name        : directiveName,
            dependencies: dependencies,
            compile     : function()
            {
                var params                                = PlentyFramework.resolveServices( dependencies );
                PlentyFramework.directives[directiveName] = directiveFunctions.apply( null, params );
            }
        };
    };

    /**
     * Bind registered directives.
     * @function bindDirectives
     * @param {string} [directiveSelector] restrict binding to elements matching this selector
     */
    PlentyFramework.prototype.bindDirectives = function( rootElement )
    {

        rootElement = rootElement || 'body';

        $( rootElement ).find( '[data-plenty]' ).each( function( i, element )
        {

            var directives = parseDirectives( $( element ).attr( 'data-plenty' ), $( element ) );

            if( directives.length <= 0 ) {
                // continue
                return;
            }

            for(var i = 0; i < directives.length; i++ )
            {
                var directive = directives[i];
                if ( !!PlentyFramework.directives[directive.class] && PlentyFramework.directives.hasOwnProperty( directive.class ) )
                {

                    var callback = PlentyFramework.directives[directive.class][directive.method];
                    if ( !!callback && typeof callback == "function" )
                    {

                        if ( directive.event == "ready" )
                        {
                            directive = injectEvent( directive, undefined );
                            callback.apply( null, directive.params );
                        }
                        else
                        {
                            $( element ).on( directive.event, function( e )
                            {
                                directive = injectEvent( directive, e );
                                return callback.apply( null, directive.params );
                            } );
                        }

                    }
                    else
                    {
                        console.error( "Method not found: " + directives.method + " in " + directives.class );
                    }

                }
                else
                {
                    console.error( "Directive not found: " + directives.class );
                }
            }
        } );

        $(document).trigger('initPartials', rootElement );
    };

    function injectEvent( directive, event )
    {
        for( var i = 0; i < directive.params.length; i++ )
        {
            if( !!directive.params[i].toLowerCase && (directive.params[i].toLowerCase() == 'e' || directive.params[i].toLowerCase() == 'event') )
            {
                directive.params[i] = event;
            }
        }

        return directive;
    }

    function parseDirectives( input, thisValue )
    {
        var directivePattern = /^(([\w]+):)?([\w]+)\.([\w]+)(\((.*)\))?$/;
        var expressions = input.split(';');
        var directives = [];

        for( var i = 0; i < expressions.length; i++ )
        {
            var expression = expressions[i];

            if( !expression ) {
                continue;
            }

            if ( !directivePattern.test( expression ) )
            {
                console.warn( "Invalid directive: " + expression );
                continue;
            }

            var match = expression.match( directivePattern );

            if ( !match[3] || match[3].length <= 0 )
            {
                console.error( "Cannot parse '" + expression + "': Class name not set." );
                continue;
            }

            if ( !match[4] || match[4].length <= 0 )
            {
                console.error( "Cannot parse '" + expression + "': Method not set." );
                continue;
            }

            var directive = {
                event : match[2] || 'ready',
                class : match[3],
                method: match[4],
                params: []
            };

            if ( !!match[6] && match[6].length > 0 )
            {
                var params = match[6].match( /([\w'"-]+)/g );
                for ( var j = 0; j < params.length; j++ )
                {
                    if ( !isNaN( parseFloat( params[j] ) ) )
                    {
                        directive.params.push( parseFloat( params[j] ) );
                    }
                    else if ( params[j].toLowerCase() == 'true' )
                    {
                        directive.params.push( true );
                    }
                    else if ( params[j].toLowerCase() == 'false' )
                    {
                        directive.params.push( false );
                    }
                    else if ( params[j].toLowerCase() == 'this' )
                    {
                        directive.params.push( thisValue );
                    }
                    else
                    {
                        directive.params.push( params[j].replace( /^['"]|['"]$/g, '' ) );
                    }
                }
            }

            directives.push( directive );

        }
        return directives;
    }

    /**
     * Register a new service
     * @function service
     * @static
     * @param {string}      serviceName        Unique identifier of the service to get/ create
     * @param {function}    serviceFunctions   Callback containing all public functions of this service.
     * @param {Array}       [dependencies]     Identifiers of required services to inject in serviceFunctions
     * @return {object}                        The object described in serviceFunctions(). Can be received via
     *     PlentyFramework.[serviceName]
     */
    PlentyFramework.service = function( serviceName, serviceFunctions, dependencies )
    {

        // Catch type mismatching for 'serviceName'
        if ( typeof serviceName !== 'string' )
        {
            console.error( "Type mismatch: Expect first parameter to be a 'string', '" + typeof serviceName + "' given." );
            return;
        }

        // Catch type mismatching for 'serviceFunctions'
        if ( typeof serviceFunctions !== 'function' )
        {
            console.error( "Type mismatch: Expect second parameter to be a 'function', '" + typeof serviceFunctions + "' given." );
            return;
        }

        dependencies = dependencies || [];

        components.services[serviceName] = {
            name        : serviceName,
            dependencies: dependencies,
            compile     : function()
            {
                var params                             = PlentyFramework.resolveFactories( dependencies );
                PlentyFramework.prototype[serviceName] = serviceFunctions.apply( null, params );
            }
        };

    };

    /**
     * Returns an array containing required factories given by string identifier
     * @function resolveServices
     * @static
     * @private
     * @param  {Array} dependencies    Names of required factories
     * @return {Array}                 Objects to apply to callback function
     */
    PlentyFramework.resolveServices = function( dependencies )
    {
        var compiledServices = [];

        $.each( dependencies, function( j, dependency )
        {

            // factory not found: try to compile dependent factory first
            if ( !PlentyFramework.prototype.hasOwnProperty( dependency ) )
            {
                if ( components.services.hasOwnProperty( dependency ) )
                {
                    components.services[dependency].compile();
                }
                else
                {
                    console.error( 'Cannot inject Service "' + dependency + '": Service not found.' );
                    return false;
                }
            }
            var service = PlentyFramework.prototype[dependency];
            compiledServices.push( service );
        } );

        return compiledServices;
    };

    /**
     * Collection of compiled factories
     * @attribute factories
     * @static
     * @type {object}
     */
    PlentyFramework.factories = {};

    /**
     * Register a new factory
     * @function factory
     * @static
     * @param {string}      factoryName         A unique name of the new factory
     * @param {function}    factoryFunctions    The function describing the factory
     * @param {Array}       dependencies        List of required factories to inject
     */
    PlentyFramework.factory = function( factoryName, factoryFunctions, dependencies )
    {

        // Catch type mismatching for 'serviceName'
        if ( typeof factoryName !== 'string' )
        {
            console.error( "Type mismatch: Expect first parameter to be a 'string', '" + typeof factoryName + "' given." );
            return;
        }

        // Catch type mismatching for 'serviceFunctions'
        if ( typeof factoryFunctions !== 'function' )
        {
            console.error( "Type mismatch: Expect second parameter to be a 'function', '" + typeof factoryFunctions + "' given." );
            return;
        }

        dependencies                      = dependencies || [];
        components.factories[factoryName] = {
            name        : factoryName,
            dependencies: dependencies,
            compile     : function()
            {
                var params                             = PlentyFramework.resolveFactories( dependencies );
                PlentyFramework.factories[factoryName] = factoryFunctions.apply( null, params );
            }
        };

    };

    /**
     * Returns an array containing required factories given by string identifier
     * @function resolveFactories
     * @static
     * @private
     * @param  {Array}   dependencies  Names of required factories
     * @return {Array}                 Objects to apply to callback function
     */
    PlentyFramework.resolveFactories = function( dependencies )
    {
        var compiledFactories = [];

        $.each( dependencies, function( j, dependency )
        {

            // factory not found: try to compile dependent factory first
            if ( !PlentyFramework.factories.hasOwnProperty( dependency ) )
            {
                if ( components.factories.hasOwnProperty( dependency ) )
                {
                    components.factories[dependency].compile();
                }
                else
                {
                    console.error( 'Cannot inject Factory "' + dependency + '": Factory not found.' );
                    return false;
                }
            }
            var factory = PlentyFramework.factories[dependency];
            compiledFactories.push( factory );
        } );

        return compiledFactories;
    };

    /**
     * Renders html template. Will provide given data to templates scope.
     * Uses <a href="https://github.com/janl/mustache.js/" target="_blank">Mustache syntax</a> for data-binding.
     * @function compileTemplate
     * @static
     * @param {String} template relative path to partials template to load. Base path = '/src/partials/'
     * @param {Object} data     data to privide to templates scope.
     * @returns {String}        The rendered html string
     */
    PlentyFramework.compileTemplate = function( template, data )
    {
        data           = data || {};
        data.translate = function()
        {
            return function( text, render )
            {
                return render( PlentyFramework.translate( text ) );
            };
        };
        return Mustache.render( TemplateCache[template], data );
    };

    /**
     * The path on the server where the script is located in.
     * @attribute
     * @static
     * @type {String}
     */
    PlentyFramework.scriptPath = '';

    /**
     * Collection of locale strings will be injected here after reading language file.
     * @attribute
     * @static
     * @type {Object}
     */
    PlentyFramework.Strings = {};

    /**
     * Load language file containing translations of locale strings.
     * @function loadLanguageFile
     * @static
     * @param fileName  relative path to language file.
     */
    PlentyFramework.loadLanguageFile = function( fileName )
    {
        $.get( PlentyFramework.scriptPath + fileName ).done( function( response )
        {
            PlentyFramework.Strings = response;
        } );
    };

    /**
     * Try to get locale translation of given string.
     * Render translated string using <a href="https://github.com/janl/mustache.js/" target="_blank">Mustache syntax</a>
     * if additional parameters are given.
     * @function translate
     * @static
     * @param {String} string   The string to translate
     * @param {Object} [params] additional data for rendering
     * @returns {String}        The translation of the given string if found. Otherwise returns the original string.
     */
    PlentyFramework.translate = function( string, params )
    {
        var localeString;
        if ( PlentyFramework.Strings.hasOwnProperty( string ) )
        {
            localeString = PlentyFramework.Strings[string];
        }
        else
        {
            localeString = string;
            console.warn( 'No translation found for "' + localeString + '".' );
        }

        if ( !!params )
        {
            localeString = Mustache.render( localeString, params );
        }

        return localeString;

    };

    /**
     * Compile registered factories & services
     * @function compile
     * @static
     */
    PlentyFramework.compile = function()
    {

        for ( var factory in components.factories )
        {
            if ( !PlentyFramework.factories.hasOwnProperty( factory ) )
            {
                components.factories[factory].compile();
            }
        }

        for ( var service in components.services )
        {
            if ( !PlentyFramework.prototype.hasOwnProperty( service ) )
            {
                components.services[service].compile();
            }
        }

        for ( var directive in components.directives )
        {
            if ( !PlentyFramework.directives.hasOwnProperty( directive ) )
            {
                components.directives[directive].compile();
            }
        }

        var scripts = document.getElementsByTagName( 'SCRIPT' );
        if ( scripts.length > 0 )
        {
            PlentyFramework.scriptPath = scripts[scripts.length - 1].src.match( /(.*)\/(.*)\.js(\?\S*)?$/ )[1];
        }

    };

}( jQuery ));




PlentyFramework.cssClasses = {

    active: "active"

};
(function($, pm) {

    pm.partials.Error = {

        /**
         * Will be called, after the error popup was created and injected in DOM.
         * @param {HTMLElement} popup   The injected element of the popup
         */
        init: function( popup ) {
            $(popup).find('.close').click(function() {
                popup.hide();
                popup.find('.plentyErrorBoxInner').html('');
            });
        },

        /**
         * Will be called for each thrown error. Has to be injected in DOM manually.
         * @param {HTMLElement} popup   The error popup element
         * @param {HTMLElement} error   The error message element
         */
        addError: function( popup, error ) {
            var errorCode = $(error).attr('data-plenty-error-code');

            if( $(popup).find('[data-plenty-error-code="'+errorCode+'"]').length <= 0 ) {
                $(popup ).find('.plentyErrorBoxInner').append( error );
            }
        },

        /**
         * Will be called, after initialization and injection of all errors
         * @param {HTMLElement} popup The error popup element
         */
        show: function( popup ) {
            $(popup).show();
        }

    }

})(jQuery, PlentyFramework);
(function($, pm) {

    pm.partials.Modal = {

        /**
         * Will be called after a new modal was created and injected into DOM
         * @param {HTMLElement} element The injected modal element
         * @param {Modal} modal         The instance of the current modal
         */
        init: function ( element, modal ) {
            element.on( 'hidden.bs.modal', function () {
                modal.hide();
                element.remove();
            });

            if ( modal.timeout > 0 ) {
                element.on( 'hide.bs.modal', modal.stopTimeout );
                element.find( '.modal-content' ).hover( function() {
                    modal.pauseTimeout();
                }, function () {
                    if ( element.is( '.in' ) ) {
                        modal.continueTimeout();
                    }
                });
            }
        },

        /**
         * Will be called if a Modal requests to show.
         * @param {HTMLElement} element The injected modal element
         */
        show: function ( element ) {
            element.modal( 'show' );
        },

        /**
         * Will be called if a Modal requests to hide.
         * @param {HTMLElement} element The injected modal element
         */
        hide: function ( element ) {
            element.modal( 'hide' );
        },

        /**
         * Detect if a given HTML string contains a modal
         * @param {HTMLElement} html the element to search a modal in.
         * @returns {boolean}   true if a modal was found
         */
        isModal: function ( html ) {
            return $( html ).filter( '.modal' ).length + $( html ).find( '.modal' ).length > 0;
        },

        /**
         * Filter a modal from a given HTML string
         * @param {HTMLElement}     html the element to get a modal from.
         * @returns {HTMLElement}   the filtered modal element
         */
        getModal: function ( html ) {
            var modal = $( html );
            if ( modal.length > 1 ) {
                modal = $( html ).filter( '.modal' ) || $( html ).find( '.modal' );
            }

            return modal;
        }
    };

}(jQuery, PlentyFramework));
(function($) {

    $(document).on('initPartials', function(e, root) {

        $(root).find('[data-toggle="tooltip"]' ).tooltip({
            container: 'body'
        });

    });

})(jQuery);
(function($, pm) {

    pm.partials.WaitScreen = {

        /**
         * Will be called if the wait screen should be shown
         * @param {HTMLElement} element The wait screen element
         */
        show: function( element ) {
            element.addClass('in');
        },

        /**
         * Will be called if the wait screen should be hidden
         * @param {HTMLElement} element The wait screen element
         */
        hide: function( element ) {
            element.removeClass('in');
        }

    };

})(jQuery, PlentyFramework);
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Factories
 */
(function($, pm) {

    /**
     * Handles requests to ReST API. Provides a {{#crossLink "APIFactory/handleError:method"}}default error-handling{{/crossLink}}.
     * Request parameters will be parsed to json internally<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "UIFactory"}}UIFactory{{/crossLink}}</li>
     * </ul>
     * @class APIFactory
     * @static
     */
	pm.factory('APIFactory', function(UI) {

		return {
            get: _get,
            post: _post,
            put: _put,
            delete: _delete,
            idle: _idle
		};

        /**
         * Is called by default if a request failed.<br>
         * Can be prevented by setting the requests last parameter to false.
         *
         * @function handleError
         * @private
         *
         * @param {object} jqXHR   <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function handleError( jqXHR ) {
            try {
                var responseText = $.parseJSON(jqXHR.responseText);
                UI.printErrors(responseText.error.error_stack);
            } catch(e) {
                UI.throwError( jqXHR.status, jqXHR.statusText );
            }
        }


        /**
         * Sends a GET request to ReST-API
         *
         * @function get
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    params                  The data to append to requests body. Will be converted to JSON internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @param   {boolean}   [runInBackground=false] show wait screen while request is in progress.
         * @return  {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _get( url, params, ignoreErrors, runInBackground, sync ) {

            if( !runInBackground ) UI.showWaitScreen();

            return $.ajax(
                url,
                {
                    type:       'GET',
                    data:       params,
                    dataType:   'json',
                    async:      !sync,
                    error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
                }
            ).always( function() {
                    if( !runInBackground ) UI.hideWaitScreen();
                });

        }

        /**
         * Sends a POST request to ReST-API
         *
         * @function post
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    data                    The data to append to requests body. Will be converted to JSON internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @param   {boolean}   [runInBackground=false] show wait screen while request is in progress.
         * @return  {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _post( url, data, ignoreErrors, runInBackground ) {

            var params = {
                type:       'POST',
                dataType:   'json',
                error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
            };

            if( !!data && data.isFile ) {
                    params.cache        = data.cache;
                    params.processData  = data.processData;
                    params.data         = data.data;
                    params.contentType  = false;
            } else {
                    params.data         = JSON.stringify(data);
                    params.contentType  = 'application/json';
            }

            if( !runInBackground ) UI.showWaitScreen();

            return $.ajax(
                url, params
            ).always( function() {
                    if( !runInBackground ) UI.hideWaitScreen();
                });
        }

        /**
         * Sends a PUT request to ReST-API
         *
         * @function put
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    data                    The data to append to requests body. Will be converted to JSON internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @param   {boolean}   [runInBackground=false] show wait screen while request is in progress.
         * @return  {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _put( url, data, ignoreErrors, runInBackground ) {

            if( !runInBackground ) UI.showWaitScreen();

            return $.ajax(
                url,
                {
                    type:       'PUT',
                    data:       JSON.stringify(data),
                    dataType:   'json',
                    contentType:'application/json',
                    error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
                }
            ).always( function() {
                    if( !runInBackground ) UI.hideWaitScreen();
                });

        }

        /**
         * Sends a DELETE request to ReST-API
         *
         * @function delete
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    data                    The data to append to requests body. Will be converted to JSON internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @param   {boolean}   [runInBackground=false] show wait screen while request is in progress.
         * @returns {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _delete( url, data, ignoreErrors, runInBackground ) {

            if( !runInBackground ) UI.showWaitScreen();

            return $.ajax(
                url,
                {
                    type:       'DELETE',
                    data:       JSON.stringify(data),
                    dataType:   'json',
                    contentType:'application/json',
                    error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
                }
            ).always( function() {
                    if( !runInBackground ) UI.hideWaitScreen();
                });

        }

        /**
         * Get a idle request doing nothing for chaining methods
         * @returns {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _idle() {
            return $.Deferred().resolve();
        }

    }, ['UIFactory']);
}(jQuery, PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Factories
 */
(function(pm) {

    /**
     * Provide methods for receiving layout containers, layout parameters
     * or category content from API<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     * </ul>
     * @class CMSFactory
     * @static
     */
	pm.factory('CMSFactory', function(API) {

		return {
            getContainer: getContainer,
            getParams: getParams,
            getCategoryContent: getCategoryContent
		};

        /**
         * Prepare the request to receive HTML-Content from CMS
         * @function getContainer
         * @param   {string}    containerName The Layoutcontainer to receive.
         * @param   {object}    params Additional GET-parameters.
         * @returns {object}    The prepared request. Call <code>.from( layoutGroup )</code> to specify the location in the CMS
         *                      (e.g. 'Checkout')
         * @example
         *          CMSFactory.getContainer( 'CheckoutTotals' ).from( 'Checkout' )
         *              .done(function( response ) {
         *                  // container content
         *                  var html = response.data[0]
         *              });
         */
        function getContainer( containerName, params ) {

            function from( layoutGroup ) {
                return API.get( '/rest/' + layoutGroup.toLowerCase() + '/container_' + containerName.toLowerCase() + '/', params );
            }

            return {
                from: from
            }

        }

        /**
         * Prepare the request to receive Layout parameters for a template
         * @function getParams
         * @param   {string} containerName The Layoutcontainer to receive the parameteres of.
         * @param   {object} params   Additional GET-parameters.
         * @returns {object}               The prepared request. Call <code>.from( layoutGroup )</code> to specify the location in the CMS
         *                                 (e.g. 'ItemView')
         * @example
         *          CMSFactory.getParams( 'BasketItemsList' ).from( 'ItemView' )
         *              .done(function( response ) {
         *                  // BasketItems
         *                  var items = response.data;
         *              });
         */
        function getParams( containerName, params ) {

            function from( layoutGroup ) {
                return API.get( '/rest/' + layoutGroup.toLowerCase() + '/' + containerName.toLowerCase() + '/',  params );
            }

            return {
                from: from
            }
        }

        /**
         * Get the content of a category specified by its ID
         * @function getCategoryContent
         * @param   {number} categoryID    The ID of the category to get the content from
         * @returns {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function getCategoryContent( categoryID ) {

            return API.get( '/rest/categoryview/categorycontentbody/?categoryID=' + categoryID );
        }

	}, ['APIFactory']);
}(PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Factories
 */
(function(pm) {

    /**
     * Holds checkout data for global access and provides methods
     * for reloading content dynamically-<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CMSFactory"}}CMSFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "UIFactory"}}UIFactory{{/crossLink}}</li>
     * </ul>
     * @class CheckoutFactory
     * @static
     */
	pm.factory('CheckoutFactory', function(API, CMS, UI) {

        // data received from ReST API
        var checkoutData;

        // instance wrapped checkout object for global access
        var checkout;

		return {
            getCheckout: getCheckout,
            setCheckout: setCheckout,
            loadCheckout: loadCheckout,
            reloadContainer: reloadContainer,
            reloadCatContent: reloadCatContent,
            reloadItemContainer: reloadItemContainer
		};


        function Checkout() {
            return checkoutData;
        }

        /**
         * Returns instance of wrapped checkout object
         * @function getCheckout
         * @returns {Checkout} Instance of checkout object
         */
        function getCheckout( copy ) {
            if(!checkout || !checkoutData) {
                loadCheckout(true);
            }

            if( !!copy ) {
                return $.extend(true, {}, checkoutData);
            }
            return checkout;
        }
        /**
         * Receive global checkout data from ReST-API
         * @function loadCheckout
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function loadCheckout(sync) {

            return API.get('/rest/checkout/', null, false, true, sync)
                .done(function(response) {
                    if( !!response ) {
                        checkoutData = response.data;
                        checkout = new Checkout();
                    }
                    else UI.throwError(0, 'Could not receive checkout data [GET "/rest/checkout/" receives null value]');
                });
        }

        /**
         * Update checkout data on server
         * @function setCheckout
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function setCheckout() {


            return API.put('/rest/checkout', checkout)
                .done(function(response) {
                    if( !!response ) {
                        checkoutData = response.data;
                        checkout = new Checkout();
                    }
                    else UI.throwError(0, 'Could not receive checkout data [GET "/rest/checkout/" receives null value]');
                });

        }

        /**
         * Get layout container from server and replace received HTML
         * in containers marked with <b>data-plenty-checkout-template="..."</b>
         * @function reloadContainer
         * @param  {string} container Name of the template to load from server
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function reloadContainer( container ) {

            return CMS.getContainer( "checkout"+container ).from( 'checkout' )
                .done(function (response) {
                    $('[data-plenty-checkout-template="' + container + '"]')
                        .each(function (i, elem) {
                            $(elem).html(response.data[0]);
                            pm.getInstance().bindDirectives();
                        });
                });
        }

        /**
         * Get category content from server and replace received HTML
         * in containers marked with <b>data-plenty-checkout-catcontent="..."</b>
         * @function reloadCatContent
         * @param	{number} catId	ID of the category to load content (description 1) from server
         * @return  {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         * @deprecated
         */
        function reloadCatContent( catId ) {

            return CMS.getCategoryContent(catId)
                .done(function(response) {
                    $('[data-plenty-checkout-catcontent="'+catId+'"]')
                        .each(function(i, elem) {
                            $(elem).html(response.data[0]);
                            pm.getInstance().bindDirectives();
                        });
                });

        }

        /**
         * Get layout container from server and replace received HTML
         * in containers marked with <b>data-plenty-itemview-template="..."</b>
         * @function reloadItemContainer
         * @param	{string} container	Name of the (item view) template to load from server
         * @return  {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function reloadItemContainer( container ) {

            return CMS.getContainer( 'itemview' + container ).from( 'itemview' )
                .done(function(response) {
                    $('[data-plenty-itemview-template="'+container+'"]')
                        .each(function(i, elem) {
                            $(elem).html(response.data[0]);
                            pm.getInstance().bindDirectives();
                        });
                });

        }
				
	}, ['APIFactory', 'CMSFactory', 'UIFactory']);
}(PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Factories
 */
(function($, pm) {

    /**
     * Provides methods for creating and displaying modal popups.
     * @class ModalFactory
     * @static
     */
	pm.factory('ModalFactory', function() {

		return {
            prepare: prepare,
            isModal: isModal
		};

        /**
         * Detect if given html contains a valid modal
         * @function isModal
         * @param {string} html
         * @returns {boolean}
         */
        function isModal( html ) {
            return PlentyFramework.partials.Modal.isModal( html );
        }

        /**
         * Create a new Instance of {{#crossLink "ModalFactory.Modal"}}Modal{{/crossLink}}
         * @function prepare
         * @returns {Modal}
         */
        function prepare() {
            return new Modal();
        }

        /**
         * Holds configuration of a modal and provides methods for displaying and hiding the modal
         * @class Modal
         * @for ModalFactory
         * @returns {Modal}
         * @constructor
         */
        function Modal() {

            var modal = this;
            /**
             * The title of the modal
             * @attribute title
             * @type {string}
             * @private
             * @default ""
             */
            modal.title      = '';

            /**
             * The content of the modal
             * @attribute content
             * @type {string}
             * @private
             * @default ""
             */
            modal.content    = '';

            /**
             * The content of the dismiss-button
             * @attribute labelDismiss
             * @type {string}
             * @private
             * @default "Abbrechen"
             */
            modal.labelDismiss = pm.translate("Cancel");

            /**
             * the label of the confirmation button
             * @attribute labelConfirm
             * @type {string}
             * @private
             * @default "Bestätigen"
             */
            modal.labelConfirm = pm.translate("Confirm");

            /**
             * Callback when modal is confirmed by clicking confirmation button.
             * Modal will not be dismissed if callback returns false.
             * @attribute onConfirm
             * @type {function}
             * @private
             * @default function() {}
             */
            modal.onConfirm  = function() {};

            /**
             * Callback when modal is dismissed by closing the modal
             * @attribute onDismiss
             * @type {function}
             * @private
             * @default function() {}
             */
            modal.onDismiss  = function() {};

            /**
             * jQuery selector of the container element to display the modal in.
             * @attribute container
             * @type {string}
             * @private
             * @default "body"
             */
            modal.container  = 'body';

            /**
             * Timeout to close the modal automatically. Set &lt;0 to disable.
             * @attribute timeout
             * @type {number}
             * @private
             * @default -1
             */
            modal.timeout = -1;

            modal.hide = hide;
            modal.startTimeout = startTimeout;
            modal.stopTimeout = stopTimeout;
            modal.pauseTimeout = pauseTimeout;
            modal.continueTimeout = continueTimeout;

            var bsModal;
            var timeout, interval;
            var timeRemaining, timeStart;
            var paused = false;

            return {
                setTitle: setTitle,
                setContent: setContent,
                setContainer: setContainer,
                setLabelConfirm: setLabelConfirm,
                setLabelDismiss: setLabelDismiss,
                onConfirm: onConfirm,
                onDismiss: onDismiss,
                setTimeout: setTimeout,
                show: show,
                hide: hide
            };

            /**
             * Set the {{#crossLink "ModalFactory.Modal/title:attribute}}title{{/crossLink}} of the modal
             * @function setTitle
             * @param   {string}    title The title
             * @returns {Modal}     Modal object for chaining methods
             */
            function setTitle( title ) {
                modal.title = title;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/content:attribute}}content{{/crossLink}} of the modal
             * @function setContent
             * @param   {string}    content The content
             * @returns {Modal}     Modal object for chaining methods
             */
            function setContent( content ) {
                modal.content = content;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/labelConfirm:attribute}}label of the confirmation button{{/crossLink}} of the modal
             * @function setLabelConfirm
             * @param   {string}    label The label
             * @returns {Modal}     Modal object for chaining methods
             */
            function setLabelConfirm( label ) {
                modal.labelConfirm = label;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/labelDismiss:attribute}}label if the dismiss button{{/crossLink}} of the modal
             * @function setLabelDismiss
             * @param   {string}    label The label
             * @returns {Modal}     Modal object for chaining methods
             */
            function setLabelDismiss( label ) {
                modal.labelDismiss = label;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/onConfirm:attribute}}confirmation callback{{/crossLink}} of the modal
             * @function onConfirm
             * @param   {function}  callback The callback if modal is confirmed
             * @returns {Modal}     Modal object for chaining methods
             */
            function onConfirm( callback ) {
                modal.onConfirm = callback;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/onDismiss:attribute}}dismiss callback{{/crossLink}} of the modal
             * @function onDismiss
             * @param   {function}  callback The callback if modal is dismissed
             * @returns {Modal}     Modal object for chaining methods
             */
            function onDismiss( callback ) {
                modal.onDismiss = callback;
                return this;
            }



            /**
             * Set the {{#crossLink "ModalFactory.Modal/container:attribute}}container{{/crossLink}} of the modal
             * @function setContainer
             * @param   {string}    container The jQuery selector of the container to display the modal in
             * @returns {Modal}     Modal object for chaining methods
             */
            function setContainer( container ) {
                modal.container = container;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/timeout:attribute}}timeout{{/crossLink}} of the modal
             * @function setTimeout
             * @param   {number}    timeout The timeout to close the modal automatically. Set &lt;0 to disable
             * @returns {Modal}     Modal object for chaining methods
             */
            function setTimeout( timeout ) {
                modal.timeout = timeout;
                return this;
            }

            /**
             * Inject modal data in default template if not template is given
             * and display the modal inside the configured container.<br>
             * Start timer to hide the modal automatically if timeout is set.
             * @function show
             */
            function show() {
                if( isModal( modal.content ) ) {
                    bsModal = PlentyFramework.partials.Modal.getModal( modal.content );
                } else {
                    bsModal = $( PlentyFramework.compileTemplate('modal/modal.html', modal) );
                }

                $(modal.container).append( bsModal );

                // append additional scripts executable
                var scripts = $(modal.content).filter('script');
                if( scripts.length > 0 ) {
                    scripts.each(function( i, script ) {
                        var element = document.createElement('script');
                        element.type = 'text/javascript';
                        element.innerHTML = $(script).text();
                        $( modal.container ).append( element );
                    });
                }

                // bind callback functions
                PlentyFramework.partials.Modal.init( bsModal, modal );
                bsModal.find('[data-plenty-modal="confirm"]').click( function() {
                    var close = modal.onConfirm();
                    if( close ) hide(true);
                });

                PlentyFramework.partials.Modal.show( bsModal );

                if( modal.timeout > 0 ) {
                    startTimeout();
                }

            }

            /**
             * Hide the modal.
             * @function hide
             * @param {boolean} confirmed Flag indicating of modal is closed by confirmation button or dismissed
             */
            function hide( confirmed ) {
                PlentyFramework.partials.Modal.hide( bsModal );

                if( !confirmed ) {
                    modal.onDismiss();
                }
            }

            /**
             * Start the configured timeout initially
             * @function startTimeout
             * @private
             */
            function startTimeout() {
                timeRemaining = modal.timeout;
                timeStart = (new Date()).getTime();

                timeout = window.setTimeout(function () {
                    window.clearInterval(interval);
                    hide();
                }, modal.timeout);

                bsModal.find('[data-plenty-modal="timer"]').text(timeRemaining / 1000);
                interval = window.setInterval(function () {
                    if (!paused) {
                        var secondsRemaining = timeRemaining - (new Date()).getTime() + timeStart;
                        secondsRemaining = Math.round(secondsRemaining / 1000);
                        bsModal.find('[data-plenty-modal="timer"]').text(secondsRemaining);
                    }
                }, 1000)
            }

            /**
             * Pause the timeout (e.g. on hover)
             * @function pauseTimeout
             * @private
             */
            function pauseTimeout() {
                paused = true;
                timeRemaining -= (new Date()).getTime() - timeStart;
                window.clearTimeout(timeout);
            }

            /**
             * Continue paused timeout
             * @function continueTimeout
             * @private
             */
            function continueTimeout() {
                paused = false;
                timeStart = (new Date()).getTime();
                timeout = window.setTimeout(function () {
                    hide();
                    window.clearInterval(interval);
                }, timeRemaining);
            }

            /**
             * Stop timeout. Stopped timeouts cannot be continued.
             * @function stopTimeout
             * @private
             */
            function stopTimeout() {
                window.clearTimeout( timeout );
                window.clearInterval( interval );
            }

        }




	});
}(jQuery, PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Factories
 */
(function($, pm) {

    /**
     * Displaying error messages and handling wait screen
     * @class UIFactory
     * @static
     */
    pm.factory('UIFactory', function() {
        /**
         * Increased/ decreased when showing/ hiding wait screen to avoid stacking
         * multiple instances of overlays.
         * @attribute waitScreenCount
         * @private
         * @type {number}
         * @default 0
         */
        var waitScreenCount = 0;
        var waitScreen;
        var errorPopup = null;

        return {
            throwError: throwError,
            printErrors: printErrors,
            showWaitScreen: showWaitScreen,
            hideWaitScreen: hideWaitScreen
        };

        /**
         * Display a single error message.
         * @function throwError
         * @param {number} code A code identifying this error
         * @param {string} msg  The error message to display
         */
        function throwError(code, msg) {
            printErrors([{code: code, message: msg}]);
        }

        /**
         * Wrap error messages in error popup, if popup doesn't already contain this error
         * If popup is already visible, append new errors to popup's inner HTML
         * otherwise create new popup
         * @function printErrors
         * @param {Array} errorMessages A list of errors to display
         */
        function printErrors(errorMessages) {

            // create error-popup if not exist
            if( !errorPopup || $('body').has(errorPopup ).length <= 0 ) {
                errorPopup = $( pm.compileTemplate('error/errorPopup.html') );
                $('body').append( errorPopup );
                pm.partials.Error.init( errorPopup );
            }

            $.each(errorMessages, function(key, error) {
                // add additional error, if not exist.
                pm.partials.Error.addError( errorPopup, $(pm.compileTemplate('error/errorMessage.html', error)) );
            });

            pm.partials.Error.show( errorPopup );

            hideWaitScreen(true);
        }


        /**
         * Show wait screen if not visible and increase
         * {{#crossLink "UIFactory/waitScreenCount:attribute"}}waitScreenCount{{/crossLink}}
         * @function showWaitScreen
         */
        function showWaitScreen() {
            waitScreenCount = waitScreenCount || 0;

            // create wait-overlay if not exist
            if( !waitScreen || $('body').has(waitScreen ).length <= 0 ) {
                waitScreen = $( pm.compileTemplate('waitscreen/waitscreen.html') );
                $('body').append(waitScreen);
            }

            pm.partials.WaitScreen.show( waitScreen );

            // increase instance counter to avoid showing multiple overlays
            waitScreenCount++;
            return waitScreenCount;
        }

        /**
         * Decrease {{#crossLink "UIFactory/waitScreenCount:attribute"}}waitScreenCount{{/crossLink}}
         * and hide wait screen if waitScreenCount is 0
         * @function hideWaitScreen
         * @param {boolean} forceClose set true to hide wait screen independent from the value of waitScreenCount.
         */
        function hideWaitScreen( forceClose ) {

            // decrease overlay count
            waitScreenCount--;

            // hide if all instances of overlays has been closed
            // or if closing is forced by user
            if( waitScreenCount <= 0 || !!forceClose ) {
                waitScreenCount = 0;
                pm.partials.WaitScreen.hide( waitScreen );
            }
            return waitScreenCount;
        }

    });
}(jQuery, PlentyFramework));
/**
 * Factories provide static functions and can be injected into
 * {{#crossLinkModule "Services"}}services{{/crossLinkModule}}.<br>
 * Factories also can inject other factories. Compared to services,
 * factories are not visible in instances of {{#crossLinkModule "PlentyFramework"}}PlentyFramework{{/crossLinkModule}}.
 *
 * @module Factories
 * @main Factories
 */
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function ($, pm) {

    /**
     * Providing methods for logging in and out and registering new customers.<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CheckoutFactory"}}CheckoutFactory{{/crossLink}}</li>
     * </ul>
     * @class AuthenticationService
     * @static
     */
    pm.service('AuthenticationService', function (API, Checkout) {

        return {
            resetPassword: resetPassword,
            customerLogin: customerLogin,
            setInvoiceAddress: setInvoiceAddress,
            registerCustomer: registerCustomer
        };

        /**
         * Reading E-Mail from form marked with <b>data-plenty-checkout="lostPasswordForm"</b>
         * and sends request to provide a new password to the entered E-Mail-Address.
         *
         * @function resetPasswort
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function resetPassword() {

            var form = $('[data-plenty-checkout="lostPasswordForm"]');

            if( form.validateForm() ) {

                var values = form.getFormValues();

                var params = {
                    Email: values.Email
                };

                return API.post("/rest/checkout/lostpassword/", params)
                    .done(function( response ) {
                        if ( response.data.IsMailSend == true ) {
                            $('[data-plenty-checkout="lostPasswordTextContainer"]').hide();
                            $('[data-plenty-checkout="lostPasswordSuccessMessage"]').show();
                        }
                    });

            }
        }

        /**
         * Try to login in with credentials read from given &ltform> - element.
         * On success redirect to forms 'action' attribute.
         *
         * @function customerLogin
         * @param {object} form The jQuery-wrapped form-element to read the credentials from
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function customerLogin( form ) {
            if( form.validateForm() ) {
                var values = form.getFormValues();

                var params = {
                    Email: values.loginMail,
                    Password: values.loginPassword
                };

                return API.post("/rest/checkout/login/", params)
                    .done(function () {
                        // successful login -> go to form's target referenced by action-attribute
                        window.location.assign( form.attr('action') );

                    });
            }
        }

        /**
         * Setting the invoice address of a newly registered customer or a guest.
         *
         * @function setInvoiceAddress
         * @param {object} invoiceAddress containing address-data sent to server
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function setInvoiceAddress( invoiceAddress ) {

            return API.post("/rest/checkout/customerinvoiceaddress/", invoiceAddress)
                .done(function (response) {
                    Checkout.getCheckout().CustomerInvoiceAddress = response.data;
                });
        }

        /**
         * Prepare address-data to register new customer. Read the address-data from a &lt;form> marked with
         * <b>data-plenty-checkout-form="customerRegistration"</b><br>
         * On success, redirect to forms target referenced by action-attribute
         *
         * @function registerCustomer
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function registerCustomer() {
            var form = $('[data-plenty-checkout-form="customerRegistration"]');

            if( form.validateForm() ) {
                var values = form.getFormValues();

                // create new invoice address
                var invoiceAddress = {
                    LoginType: 2,
                    FormOfAddressID: values.FormOfAddressID,
                    Company: values.Company,
                    FirstName: values.FirstName,
                    LastName: values.LastName,
                    Street: values.Street,
                    HouseNo: values.HouseNo,
                    AddressAdditional: values.AddressAdditional,
                    ZIP: values.ZIP,
                    City: values.City,
                    CountryID: values.CountryID,
                    VATNumber: values.VATNumber,
                    Email: values.Email,
                    EmailRepeat: values.EmailRepeat,
                    BirthDay: values.BirthDay,
                    BirthMonth: values.BirthMonth,
                    BirthYear: values.BirthYear,
                    Password: values.Password,
                    PasswordRepeat: values.PasswordRepeat,
                    PhoneNumber: values.PhoneNumber,
                    MobileNumber: values.MobileNumber,
                    FaxNumber: values.FaxNumber,
                    Postnummer: values.Postnummer
                };

                return setInvoiceAddress(invoiceAddress)
                    .done(function () {
                        window.location.assign( form.attr('action') );
                    });
            }
        }
    }, ['APIFactory', 'CheckoutFactory']);

}(jQuery, PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function($, pm) {

    /**
     * Providing methods for adding, editing or removing basket items and coupon codes<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "UIFactory"}}UIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CMSFactory"}}CMSFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CheckoutFactory"}}CheckoutFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "ModalFactory"}}ModalFactory{{/crossLink}}</li>
     * </ul>
     * @class BasketService
     * @static
     */
	pm.service('BasketService', function( API, UI, CMS, Checkout, Modal ) {

		return {
			addItem: addBasketItem,
            removeItem: removeBasketItem,
            getItem: getBasketItem,
            setItemQuantity: setItemQuantity,
            editItemAttributes: editItemAttributes,
            editOrderParams: editOrderParams,
            addCoupon: addCoupon,
            removeCoupon: removeCoupon
		};

        /**
         * Add item to basket. Will fail and show a popup if item has order params
         * @function addBasketItem
         * @param   {Array}     article         Array containing the item to add
         * @param   {boolean}   [isUpdate=false]      Indicating if item's OrderParams are updated
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function addBasketItem( article ) {

            if( !!article ) {

                API.get( '/rest/checkout/container_' + 'CheckoutOrderParamsList'.toLowerCase() + '/',
                    {   itemID : article[0].BasketItemItemID,
                        quantity : article[0].BasketItemQuantity }).done(function (resp) {
                            // checking for order params!
                            if (resp.data[0].indexOf("form-group") > 0) {
                                Modal.prepare()
                                    .setContent(resp.data[0])
                                    .setTitle( pm.translate("Select order parameters") )
                                    .setLabelConfirm( pm.translate("Save") )
                                    .onConfirm(function() {
                                        // save order params
                                        addArticle( saveOrderParams(article) );

                                        // close modal after saving order params
                                        return true;
                                    })
                                    .show();
                            } else {
                                addArticle(article);
                            }
                    });
            }
        }

        /**
         * Read OrderParams from &lt;form> marked with <b>data-plenty-checkout-form="OrderParamsForm"</b> and inject
         * read values in 'addBasketList'. Update item by calling <code>addBasketItem()</code> again
         * @function saveOrderParams
         * @private
         * @param {Array} articleWithParams Containing the current item to add. Read OrderParams will be injected
         */
        function saveOrderParams( articleWithParams ) {
            //TODO use $("[data-plenty-checkout-form='OrderParamsForm']").serializeArray() to get order params
            var orderParamsForm = $('[data-plenty-checkout-form="OrderParamsForm"]');
            var wrappedThis = {};
            var attrType = "";

            //Groups
            orderParamsForm.find('[name^="ParamGroup"]').each(function(){
                var match = this.name.match(/^ParamGroup\[(\d+)]\[(\d+)]$/);
                articleWithParams = addOrderParamValue(articleWithParams, match[1], $(this).val(), $(this).val());
            });

            //Values
            orderParamsForm.find('[name^="ParamValue"]').each(function(){
                wrappedThis = $(this);
                attrType = wrappedThis.attr('type');

                if( ((attrType == 'checkbox' && wrappedThis.is(':checked')) ||
                    (attrType == 'radio' && wrappedThis.is(':checked')) ||
                    (attrType != 'radio' && attrType != 'checkbox')) &&
                    attrType != 'file')
                {
                    var match = this.name.match(/^ParamValue\[(\d+)]\[(\d+)]$/);

                    articleWithParams = addOrderParamValue(articleWithParams, match[1], match[2], wrappedThis.val());

                } else if (attrType == 'file') {
                    articleWithParams = orderParamFileUpload(this, articleWithParams);
                }
            });

            return articleWithParams;
        }

        function addArticle( article ) {
            API.post( '/rest/checkout/basketitemslist/', article, true)
                .done(function() {
                    // Item has no OrderParams -> Refresh Checkout & BasketPreview
                    Checkout.loadCheckout()
                        .done(function() {
                            refreshBasketPreview();
                            // Show confirmation popup
                            CMS.getContainer('ItemViewItemToBasketConfirmationOverlay', { ArticleID : article[0].BasketItemItemID }).from('ItemView')
                                .done(function(response) {
                                    Modal.prepare()
                                        .setContent(response.data[0])
                                        .setTimeout(5000)
                                        .show();
                                });
                        });
                }).fail(function(jqXHR) {
                    // some other error occured
                    UI.printErrors(JSON.parse(jqXHR.responseText).error.error_stack);
                });
        }

        function updateArticle( article ) {
            API.put( '/rest/checkout/basketitemslist/', article )
                .done(function() {
                    // Item has no OrderParams -> Refresh Checkout & BasketPreview
                    Checkout.reloadCatContent( pm.getGlobal( 'basketCatID' ) );
                    Checkout.loadCheckout()
                        .done(function() {
                            refreshBasketPreview();
                        });
                })
        }

        function orderParamFileUpload(input, articleWithParams ) {
            var key = input.id;
            var orderParamUploadFiles = {};
            var orderParamFileIdStack = [];
            var formData;
            var fileData;
            var params = {
                type: 'POST',
                data: {},
                isFile: true,
                cache: false,
                dataType: 'json',
                processData: false,
                contentType: false
            };

            orderParamUploadFiles[key] = $(input)[0].files;

            if (orderParamFileIdStack.indexOf(key) == -1) {
                orderParamFileIdStack.push(key);
            }

            for(var i= 0, length = orderParamFileIdStack.length; i < length; ++i) {
                formData = new FormData();
                fileData = orderParamUploadFiles[orderParamFileIdStack[i]];
                formData.append("0", fileData[0], fileData[0].name);

                params.data = formData;

                API.post("/rest/checkout/orderparamfile/", params);
            }

            var match = input.name.match(/^ParamValueFile\[(\d+)]\[(\d+)]$/);

            return addOrderParamValue(articleWithParams, match[1], match[2], $(input).val());
        }

        /**
         * Inject an OrderParam.
         * @function addOrderParamValue
         * @private
         * @param {Array} basketList The target to inject the value in.
         * @param {number} position Position where to inject the value
         * @param {number} paramId The ID of the OrderParam to inject
         * @param {string|number} paramValue the value of the OrderParam to inject
         * @returns {Array} Containing the item and the injected OrderParam
         */
        function addOrderParamValue(basketList, position, paramId, paramValue) {
            if (position > 0 && basketList[position] == undefined)
            {
                basketList[position] = $.extend(true, {}, basketList[0]);
                basketList[position].BasketItemOrderParamsList = [];
            }

            if(basketList[position] != undefined)
            {
                basketList[position].BasketItemQuantity = 1;
                if(basketList[position].BasketItemOrderParamsList == undefined)
                {
                    basketList[position].BasketItemOrderParamsList = [];
                }
                if(paramValue){
                    basketList[position].BasketItemOrderParamsList.push({
                        BasketItemOrderParamID : paramId,
                        BasketItemOrderParamValue : paramValue
                    });
                }
            }

            return basketList;
        }

        function editItemAttributes( BasketItemID ) {
            var modal = $('[data-plenty-basket-item="' + BasketItemID + '"' );
            modal.modal('show');
            modal.find('[data-plenty-modal="confirm"]').on('click', function() {
                var basketItem = getBasketItem(BasketItemID);
                var attributesList = [];
                modal.find('select').each(function(i, attributeSelect) {
                    var match = attributeSelect.name.match(/^ArticleAttribute\[\d+]\[\d+]\[(\d+)]$/);
                    if(match && match[1])
                    {
                        attributesList.push({
                            BasketItemAttributeID 		: match[1],
                            BasketItemAttributeValueID	: $(attributeSelect).val()
                        });
                    }

                    if(attributesList.length != 0)
                    {
                        basketItem.BasketItemAttributesList = attributesList;
                    }

                });
                //update basketItem and refresh previewLists
                updateArticle([basketItem]);

            });
        }

        function editOrderParams( BasketItemID ) {

            var basketItem = getBasketItem( BasketItemID );
            // FIX: unset old order params
            basketItem.BasketItemOrderParamsList = [];

            API.get( '/rest/checkout/container_' + 'CheckoutOrderParamsList'.toLowerCase() + '/', {
                    itemID : basketItem.BasketItemItemID,
                    quantity : basketItem.BasketItemQuantity,
                    basketItemID: BasketItemID
                }).done(function (resp) {
                    // checking for order params!
                    Modal.prepare()
                        .setContent( resp.data[0] )
                        .setTitle( pm.translate("Edit order parameters") )
                        .setLabelConfirm( pm.translate("Save") )
                        .onConfirm(function() {
                            // save order params
                            updateArticle( saveOrderParams([basketItem]) );

                            // close modal after saving order params
                            return true;
                        })
                        .show();
                });
        }

        function getBasketItem( BasketItemID ) {
            var basketItems = Checkout.getCheckout().BasketItemsList;
            for( var i = 0; i < basketItems.length; i++ ) {
                if( basketItems[i].BasketItemID == BasketItemID ) {
                    return basketItems[i];
                }
            }

            return null;
        }

        /**
         * Remove item from basket. Will show a confirmation popup at first.
         * @function removeBasketItem
         * @param {number}  BasketItemID The ID of the basket item to remove
         * @param {boolean} [forceDelete=false]  Set true to remove the basket item without showing a confirmation popup
         * @return Promise
         */
        function removeBasketItem( BasketItemID, forceDelete ) {

            var deferred = $.Deferred();

            // get item name
            var itemName = getBasketItem(BasketItemID).BasketItemNameMap[1];

            // calling the delete request
            function doDelete() {
                API.delete('/rest/checkout/basketitemslist/?basketItemIdsList[0]='+BasketItemID)
                    .done(function() {
                        Checkout.loadCheckout().done(function() {
                            $('[data-basket-item-id="'+BasketItemID+'"]').remove();

                            if( !Checkout.getCheckout().BasketItemsList || Checkout.getCheckout().BasketItemsList.length <= 0 ) {
                                Checkout.reloadCatContent( pm.getGlobal( 'basketCatID' ) );
                            } else {
                                Checkout.reloadContainer('Totals');
                            }

                            refreshBasketPreview();

                            deferred.resolve();
                        });
                    });
            }

            if( !forceDelete ) {
                // show confirmation popup
                Modal.prepare()
                    .setTitle( pm.translate('Please confirm') )
                    .setContent('<p>' + pm.translate( "Do you really want to remove \"{{item}}\" from your basket?", {item: itemName}) + '</p>')
                    .onDismiss(function () {
                        //$('[data-basket-item-id="' + BasketItemID + '"]').find('[data-plenty="quantityInput"]').val(originalItemQuantity);
                        deferred.reject();
                    })
                    .onConfirm(function () {
                        doDelete();
                    })
                    .setLabelConfirm( pm.translate("Delete") )
                    .show();
            } else {
                doDelete();
            }

            return deferred;
        }

        /**
         * Set a new quantity for the given BasketItem. If quantity is set to 0,
         * remove the item.
         * @function setItemQuantity
         * @param {number} BasketItemID The ID of the basket item to change the quantity of
         * @param {number} BasketItemQuantity  The new quantity to set or 0 to remove the item
         */
        function setItemQuantity( BasketItemID, BasketItemQuantity ) {
            // delete item if quantity is 0
            if( BasketItemQuantity <= 0 ) {
                return removeBasketItem( BasketItemID );
            }

            var deferred = $.Deferred();
            var params = Checkout.getCheckout().BasketItemsList;
            var basketItem;
            var basketItemIndex;

            for ( var i = 0; i < params.length; i++ ) {
                if ( params[i].BasketItemID == BasketItemID ) {
                    basketItemIndex = i;
                    basketItem = params[i];
                    break;

                }
            }

            if( !!basketItem && basketItem.BasketItemQuantity != BasketItemQuantity ) {
                params[basketItemIndex].BasketItemQuantity = parseInt( BasketItemQuantity );

                API.post("/rest/checkout/basketitemslist/", params)
                    .done(function () {
                        Checkout.setCheckout().done(function () {
                            Checkout.reloadContainer('Totals');

                            var basketItemsPriceTotal = 0;
                            var params2 = Checkout.getCheckout().BasketItemsList;
                            for (var i = 0; i < params2.length; i++) {
                                if (params2[i].BasketItemID == BasketItemID) {
                                    basketItemsPriceTotal = params2[i].BasketItemPriceTotal;
                                }
                            }
                            $('[data-basket-item-id="' + BasketItemID + '"]').find('[data-plenty-checkout="basket-item-price-total"]').html(basketItemsPriceTotal);
                            refreshBasketPreview();
                            deferred.resolve();
                        });
                    });
            }

            return deferred;
        }

        /**
         * Reload BasketPreview-Template and update basket totals
         * @function refreshBasketPreview
         * @private
         */
        function refreshBasketPreview() {

            Checkout.reloadItemContainer('BasketPreviewList')
                .done(function() {

                    $('[data-plenty-basket-empty]').each(function(i, elem) {
                        var toggleClass = $(elem).attr('data-plenty-basket-empty');
                        if( Checkout.getCheckout().BasketItemsList.length <= 0 ) {
                            $(elem).addClass( toggleClass );
                        } else {
                            $(elem).removeClass( toggleClass );
                        }
                    });

                });

            //update quantity
            var itemQuantityTotal = 0;
            $.each( Checkout.getCheckout().BasketItemsList, function(i, basketItem) {
                itemQuantityTotal += basketItem.BasketItemQuantity;
            });

            $('[data-plenty-basket-preview="itemQuantityTotal"]').text( itemQuantityTotal );
            $('[data-plenty-basket-preview="totalsItemSum"]').text( Checkout.getCheckout().Totals.TotalsItemSum );
        }

        /**
         * Read the coupon code from an &lt;input> element marked with <b>data-plenty-checkout-form="couponCode"</b>
         * and try to add this coupon.
         * @function addCoupon
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function addCoupon() {
            var params = {
                CouponActiveCouponCode: $('[data-plenty-checkout-form="couponCode"]').val()
            };

            return API.post("/rest/checkout/coupon/", params)
                .done(function() {
                    Checkout.setCheckout()
                        .done(function() {

                            updateContainer();
                        });
                });
        }

        /**
         * Remove the currently added coupon
         * @function removeCoupon
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function removeCoupon() {
            var params = {
                CouponActiveCouponCode: Checkout.getCheckout().Coupon.CouponActiveCouponCode
            };

            return API.delete("/rest/checkout/coupon/", params)
                .done(function() {
                    Checkout.setCheckout()
                        .done(function() {
                            delete Checkout.getCheckout().Coupon;

                            updateContainer();
                        });
                });
        }

        // update container
        function updateContainer() {
            Checkout.reloadContainer('Coupon');
            // reload totals, if we are at basket
            if ( $('[data-plenty-checkout-template="Totals"]').length > 0 ) {
                Checkout.reloadContainer('Totals');
            }
        }

	}, ['APIFactory', 'UIFactory', 'CMSFactory', 'CheckoutFactory', 'ModalFactory']);
}(jQuery, PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function($, pm) {

    /**
     * Providing methods for checkout process like setting shipping & payment information and placing the order.<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CMSFactory"}}CMSFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CheckoutFactory"}}CheckoutFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "ModalFactory"}}ModalFactory{{/crossLink}}</li>
     * </ul>
     * @class CheckoutService
     * @static
     */
	pm.service('CheckoutService', function(API, CMS, Checkout, Modal) {

        var checkoutState;

		return {
            init: init,
            setCustomerSignAndInfo: setCustomerSignAndInfo,
            registerGuest: registerGuest,
            setShippingProfile: setShippingProfile,
            saveShippingAddress: saveShippingAddress,
            loadAddressSuggestion: loadAddressSuggestion,
            preparePayment: preparePayment,
            setMethodOfPayment: setMethodOfPayment,
            editBankDetails: editBankDetails,
            editCreditCard: editCreditCard,
            placeOrder: placeOrder
		};

        /**
         * Load checkout data initially on page load
         * @function init
         */
        function init() {
            Checkout.loadCheckout(true);
            checkoutState = Checkout.getCheckout(true);
        }


        /**
         * Read customer sign and order information text from &lt;form> marked with <b>data-plenty-checkout-form="details"</b>
         * and update checkout.
         * @function setCustomerSignAndInfo
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function setCustomerSignAndInfo() {
            var form = $('[data-plenty-checkout-form="details"]');
            var values = form.getFormValues();

            // initialize CustomerSign & InfoText to avoid updating empty values
            if (!Checkout.getCheckout().CheckoutCustomerSign) Checkout.getCheckout().CheckoutCustomerSign = "";
            if (!Checkout.getCheckout().CheckoutOrderInfoText) Checkout.getCheckout().CheckoutOrderInfoText = "";

            if ( ( Checkout.getCheckout().CheckoutCustomerSign !== values.CustomerSign && $(form).find('[name="CustomerSign"]').length > 0 )
                || ( Checkout.getCheckout().CheckoutOrderInfoText !== values.OrderInfoText && $(form).find('[name="OrderInfoText"]').length > 0 ) ) {

                Checkout.getCheckout().CheckoutCustomerSign = values.CustomerSign;
                Checkout.getCheckout().CheckoutOrderInfoText = values.OrderInfoText;

                return Checkout.setCheckout();

            } else {
                // No changes detected -> Do nothing
                return API.idle();
            }
        }

        /**
         * Read address data from &lt;form> marked with <b>data-plenty-checkout-form="shippingAddress"</b>.
         * Create new shipping address or update the shipping address ID.
         * @function saveShippingAddress
         * @param {boolean} [validateForm = false] validate form before processing requests
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function saveShippingAddress( validateForm ) {
            var form = $('[data-plenty-checkout-form="shippingAddress"]');

            if( !validateForm && !form.validateForm() ) {
                return false;
            }

            var values = form.getFormValues();
            var shippingAddressID = $('[name="shippingAddressID"]:checked').val();

            // TODO: move bootstrap specific function
            $('#shippingAdressSelect').modal('hide');

            if ( shippingAddressID < 0) {
                // save separate
                var shippingAddress = values;

                if( !addressesAreEqual( shippingAddress, Checkout.getCheckout().CustomerShippingAddress) ) {

                    // new shipping address
                    return API.post("/rest/checkout/customershippingaddress/", shippingAddress)
                        .done(function (response) {

                            Checkout.getCheckout().CheckoutCustomerShippingAddressID = response.data.ID;
                            delete Checkout.getCheckout().CheckoutMethodOfPaymentID;
                            delete Checkout.getCheckout().CheckoutShippingProfileID;

                            Checkout.setCheckout().done(function () {
                                if (Checkout.getCheckout().CustomerInvoiceAddress.LoginType == 2) {
                                    Checkout.reloadContainer('CustomerShippingAddress');
                                }
                            });
                        });
                } else {
                    // no changes detected
                    return API.idle();
                }

            } else {
                if( shippingAddressID != Checkout.getCheckout().CheckoutCustomerShippingAddressID ) {
                    // change shipping address id
                    Checkout.getCheckout().CheckoutCustomerShippingAddressID = shippingAddressID;
                    delete Checkout.getCheckout().CheckoutMethodOfPaymentID;
                    delete Checkout.getCheckout().CheckoutShippingProfileID;

                    return Checkout.setCheckout().done(function () {
                        if (Checkout.getCheckout().CustomerInvoiceAddress.LoginType == 2) {
                            Checkout.reloadContainer('CustomerShippingAddress');
                        }
                    });
                } else {
                    return API.idle();
                }
            }
        }

        /**
         * Prepare address-data to register a guest. Reads the address-data from a &lt;form> marked with
         * <b>data-plenty-checkout-form="guestRegistration"</b>
         * @function registerGuest
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function registerGuest() {
            var form = $('[data-plenty-checkout-form="guestRegistration"]');

            var invoiceAddress = form.getFormValues();
            invoiceAddress.LoginType = 1;


            if( !addressesAreEqual( invoiceAddress, Checkout.getCheckout().CustomerInvoiceAddress ) ) {

                return API.post("/rest/checkout/customerinvoiceaddress/", invoiceAddress)
                    .done(function (response) {
                        saveShippingAddress().done(function(){
                            Checkout.getCheckout().CustomerInvoiceAddress = response.data;
                        });
                    });

            } else {

                return saveShippingAddress();

            }
        }

        /**
         * Check if values of addresses are equal
         * @function addressesAreEqual
         * @private
         * @param {object} address1
         * @param {object} address2
         * @returns {boolean}
         */
        function addressesAreEqual( address1, address2 ) {
            for ( var key in address1 ) {
                if ( address1[key]+'' !== address2[key]+'' && key !== 'EmailRepeat' ) {
                    return false;
                }
            }
            return true;
        }

        /**
         * Set the shipping profile used for this order and update checkout. Selected shipping profile will be
         * read from &lt;form> marked with <b>data-plenty-checkout-form="shippingProfileSelect"</b>
         * @function setShippingProfile
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function setShippingProfile() {

            var values = $('[data-plenty-checkout-form="shippingProfileSelect"]').getFormValues();

            Checkout.getCheckout().CheckoutShippingProfileID = values.ShippingProfileID;
            delete Checkout.getCheckout().CheckoutCustomerShippingAddressID;
            delete Checkout.getCheckout().CheckoutMethodOfPaymentID;

            return Checkout.setCheckout()
                .done(function() {
                    Checkout.reloadContainer('MethodsOfPaymentList');
                });

        }

        /**
         * Prepare method of payment to check if external checkout is used or addition content should be displayed
         * @function preparePayment
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function preparePayment() {
            if( Object.equals(checkoutState, Checkout.getCheckout(true)) ) {
                return API.idle();
            } else {
                checkoutState = Checkout.getCheckout(true);
                return API.post( "/rest/checkout/preparepayment/", null )
                    .done( function ( response ) {
                        if ( response.data.CheckoutMethodOfPaymentRedirectURL != '' ) {

                            document.location.assign( response.data.CheckoutMethodOfPaymentRedirectURL );

                        } else if ( !!response.data.CheckoutMethodOfPaymentAdditionalContent ) {

                            var isBankDetails = $( response.data.CheckoutMethodOfPaymentAdditionalContent ).find( '[data-plenty-checkout-form="bankDetails"]' ).length > 0;
                            Modal.prepare()
                                .setContent( response.data.CheckoutMethodOfPaymentAdditionalContent )
                                .onConfirm( function () {
                                    if ( isBankDetails ) {
                                        return saveBankDetails();
                                    } else {
                                        return saveCreditCard();
                                    }
                                } )
                                .show();
                        }
                    } );
            }
        }

        /**
         * Set the method of payment used for this order.
         * @function setMethodOfPayment
         * @param {number|undefined} paymentID  ID of the method of payment to use. Read from &lt;form> marked with
         *                                      <b>data-plenty-checkout-form="methodOfPayment"</b> if unset.
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function setMethodOfPayment( paymentID ) {

            paymentID = paymentID || $('[data-plenty-checkout-form="methodOfPayment"]').getFormValues().MethodOfPaymentID;

            Checkout.getCheckout().CheckoutMethodOfPaymentID = paymentID;
            delete Checkout.getCheckout().CheckoutCustomerShippingAddressID;
            delete Checkout.getCheckout().CheckoutShippingProfileID;

            return Checkout.setCheckout()
                .done(function() {
                    Checkout.reloadContainer('ShippingProfilesList');
                });
        }

        /**
         * Display the popup to enter or edit customers bank details
         * @function editBankDetails
         */
        function editBankDetails() {

            CMS.getContainer('CheckoutPaymentInformationBankDetails').from('Checkout')
                .done(function(response) {
                    Modal.prepare()
                        .setContent(response.data[0])
                        .onDismiss(function() {
                            $('input[name="MethodOfPaymentID"]').each(function(i, radio) {
                                if( $(radio).val() == Checkout.getCheckout().CheckoutMethodOfPaymentID ) {
                                    $(radio).attr('checked', 'checked');
                                } else {
                                    $(radio).removeAttr('checked');
                                }
                            });
                        }).onConfirm(function() {
                            return saveBankDetails();
                        })
                        .show();
                });

        }

        /**
         * Read entered bank details from <b>data-plenty-checkout-form="bankDetails"</b> and update checkout.
         * @function saveBankDetails
         * @private
         * @return {boolean} the result of form validation
         */
        function saveBankDetails() {
            var form = $('[data-plenty-checkout-form="bankDetails"]');

            if( form.validateForm() ) {
                var values = form.getFormValues().checkout.customerBankDetails;

                var bankDetails = {
                    CustomerBankName:       values.bankName,
                    CustomerBLZ:            values.blz,
                    CustomerAccountNumber:  values.accountNo,
                    CustomerAccountOwner:   values.accountOwner,
                    CustomerIBAN:           values.iban,
                    CustomerBIC:            values.bic
                };

                API.post("/rest/checkout/paymentinformationbankdetails/", bankDetails)
                    .done(function () {
                        Checkout.loadCheckout().done(function () {
                            setMethodOfPayment(3);
                            Checkout.reloadContainer('MethodsOfPaymentList');
                        });
                    });
                return true;
            } else {
                return false;
            }
        }

        /**
         * Display a popup containing credit card form
         * @function editCreditCard
         */
        function editCreditCard() {

            CMS.getContainer('CheckoutPaymentInformationCreditCard').from('Checkout')
                .done(function(response) {
                    Modal.prepare()
                        .setContent(response.data[0])
                        .onDismiss(function() {
                            $('input[name="MethodOfPaymentID"]').each(function(i, radio) {
                                if( $(radio).val() == Checkout.getCheckout().CheckoutMethodOfPaymentID ) {
                                    $(radio).attr('checked', 'checked');
                                } else {
                                    $(radio).removeAttr('checked');
                                }
                            });
                        }).onConfirm(function() {
                            return saveCreditCard();
                        })
                        .show();
                });
        }

        /**
         * Read values from &lt;form> marked with <b>data-plenty-checkout-form="creditCard"</b> and update checkout.
         * @function saveCreditCard
         * @private
         * @return {boolean} the result of form validation
         */
        function saveCreditCard() {
            var form = $('[data-plenty-checkout-form="creditCard"]');

            if( form.validateForm() ) {

                var values = form.getFormValues().checkout.paymentInformationCC;

                var creditCard = {
                    Owner:      values.owner,
                    Cvv2:       values.cvv2,
                    Number:     values.number,
                    Year:       values.year,
                    Month:      values.month,
                    Provider:   values.provider
                };

                API.post('/rest/checkout/paymentinformationcreditcard/', creditCard)
                    .done(function() {
                        Checkout.loadCheckout();
                    });
                return true;
            } else {
                return false;
            }
        }

        /**
         * Display a popup containing address suggestions
         * @param {string} type
         */
        function loadAddressSuggestion(type) {

            //check login type
            if (Checkout.getCheckout().CustomerInvoiceAddress.LoginType == 2) {
                var values = $('[data-plenty-checkout-form="shippingAddress"]').getFormValues();
            }
            else {
                var values = $('[data-plenty-checkout-form="guestRegistration"]').getFormValues();
            }

            var params = {
                street:         values.Street,
                houseNo:        values.HouseNo,
                ZIP:            values.ZIP,
                city:           values.City,
                postnummer:     values.Postnummer,
                suggestionType: 'postfinder'
            };

            CMS.getContainer('CheckoutAddressSuggestionResultsList', params).from('Checkout')
                .done(function (response) {
                    Modal.prepare()
                        .setContent(response.data[0])
                        .show();
                });
        }

        /**
         * Place the order prepared before and finish the checkout process.<br>
         * Validate required checkboxes in <b>data-plenty-checkout-form="placeOrder"</b>
         * @function placeOrder
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function placeOrder() {
            var form = $('[data-plenty-checkout-form="placeOrder"]');
            if ( form.validateForm() ) {

                var values = form.getFormValues();

                // if not shown in layout set default 1 for mandatory fields
                var params = {
                    TermsAndConditionsCheck:    values.termsAndConditionsCheck || 0,
                    WithdrawalCheck:            values.withdrawalCheck || 0,
                    PrivacyPolicyCheck:         values.privacyPolicyCheck || 0,
                    AgeRestrictionCheck:        values.ageRestrictionCheck || 0,
                    NewsletterCheck:            values.newsletterCheck || 0,
                    KlarnaTermsAndConditionsCheck: values.klarnaTermsAndConditionsCheck || 0,
                    PayoneDirectDebitMandateCheck: values.payoneDirectDebitMandateCheck || 0,
                    PayoneInvoiceCheck:            values.payoneInvoiceCheck || 0
                };

                return API.post("/rest/checkout/placeorder/", params)
                    .done(function(response) {
                        if(response.data.MethodOfPaymentRedirectURL != '') {

                            window.location.assign( response.data.MethodOfPaymentRedirectURL );

                        } else if(response.data.MethodOfPaymentAdditionalContent != '') {

                            Modal.prepare()
                                .setContent( response.data.MethodOfPaymentAdditionalContent )
                                .setLabelDismiss( '' )
                                .onDismiss(function() {
                                    window.location.assign( form.attr('action') );
                                }).onConfirm(function() {
                                    window.location.assign( form.attr('action') );
                                }).show();

                        } else {

                            window.location.assign( form.attr('action') );

                        }
                    });
            }
        }


	}, ['APIFactory', 'CMSFactory', 'CheckoutFactory', 'ModalFactory']);
}(jQuery, PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function($, pm){

    /**
     * Listens to window's size and trigger 'sizeChange' event if the Bootstrap interval changes.
     * @class MediaSizeService
     * @static
     * @example
     *      $(window).on('sizeChange', function(newValue, oldValue) {
     *          console.log('The interval changed from ' + oldValue + ' to ' + newValue.');
     *      });
     */
    pm.service('MediaSizeService', function() {

        var bsInterval;

        // recalculation of the current interval on window resize
        $(window).resize( calculateMediaSize );

        // initially calculation of the interval
        $(document).ready( calculateMediaSize );

        return {
            interval: getInterval
        };

        /**
         * Get the currently used Bootstrap interval
         * @function getInterval
         * @return {"xs"|"sm"|"md"|"lg"}
         */
        function getInterval() {
            if( !!bsInterval ) calculateMediaSize();

            return bsInterval;
        }

        /**
         * Calculate the currently used Bootstrap interval
         * @function calculateMediaSize
         * @private
         */
        function calculateMediaSize() {
            var size;
            if( !!window.matchMedia ) { // FIX IE support
                if( window.matchMedia('(min-width:1200px)').matches ) size = 'lg';
                else if( window.matchMedia('(min-width:992px)').matches ) size = 'md';
                else if( window.matchMedia('(min-width:768px)').matches ) size = 'sm';
                else size = 'xs';
            } else {
                if( $(window).width() >= 1200 ) size = 'lg';
                else if( $(window).width() >= 992 ) size = 'md';
                else if( $(window).width() >= 768 ) size = 'sm';
                else size = 'xs';
            }
            if( size != bsInterval ) {
                var oldValue = bsInterval;
                bsInterval = size;
                $(window).trigger('sizeChange', [bsInterval, oldValue]);
            }
        }


    });

}(jQuery, PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function($, pm){

    /**
     * Handling navigation while checkout processes
     * @class NavigatorService
     * @static
     *
     */
    pm.service('NavigatorService', function(CMS, Checkout) {
        var navigation  = [];		// contains navigation list elements
        var container   = [];		// content containers
        var current     = -1;		// index of currently shown content container
        var buttonPrev  = {};		// navigation buttons
        var buttonNext  = {};
        var interceptors = {
                beforeChange: [],
                afterChange: []
            };
        var checkoutStates = [];

        return {
            init: init,
            getCurrentContainer: getCurrentContainer,
            goTo: goTo,
            beforeChange: beforeChange,
            afterChange: afterChange,
            continueChange: continueChange,
            next: next,
            previous: previous,
            goToID: goToID,
            fillNavigation: fillNavigation
        };

        /**
         * Initialize checkout navigation. Shows first container.
         * @function init
         * @example
         * ```html
         *  <button data-plenty-checkout="prev">zurück</button>
         *  <ul data-plenty-checkout="navigation">
         *      <li>Checkout Step 1</li>
         *      <li>Checkout Step 2</li>
         *      <li>...</li>
         *  </ul>
         *  <button data-plenty-checkout="next">weiter</button>
         *
         *  <div data-plenty-checkout="container">
         *      <div data-plenty-checkout-id="step_1">
         *          Checkout Step 1 Content
         *      </div>
         *      <div data-plenty-checkout-id="step_2">
         *          Checkout Step 2 Content
         *      </div>
         *      <div> ... </div>
         *  </div>
         * ```
         */
        function init() {

            // get elements from DOM
            navigation 	= 	$('[data-plenty-checkout="navigation"] > li');
            container 	= 	$('[data-plenty-checkout="container"] > div');
            buttonNext 	=	$('[data-plenty-checkout="next"]');
            buttonPrev 	=	$('[data-plenty-checkout="prev"]');

            if( navigation.length == container.length && container.length > 0 ) {
                var checkout = Checkout.getCheckout();

                container.hide();

                // initialize navigation
                navigation.each(function(i, elem) {
                    $(elem).addClass('disabled');
                    // handle navigation click events
                    $(elem).click(function() {
                        if( !$(this).is('.disabled') ) {
                            goTo( i );
                        }
                    });
                });

                buttonNext.attr("disabled", "disabled");
                buttonNext.click(function() {
                    next();
                });

                buttonPrev.attr("disabled", "disabled");
                buttonPrev.click(function() {
                    previous();
                });

                window.addEventListener('hashchange', function() {
                    if( window.location.hash.length > 0 ) {
                        goToID(window.location.hash);
                    } else {
                        goTo(0);
                    }
                }, false);

                // initialize GUI
                // check url param for jumping to tab
                $.urlParam = function(name) {
                    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                    if ( results == null ) {
                        return null;
                    }
                    else {
                        return results[1] || 0;
                    }
                };

                var param = $.urlParam('gototab');
                // jump to hash from url param 'gototab'
                if ( window.location.hash.length == 0 && !! param && $('[data-plenty-checkout-id="'+param+'"]').length > 0 ) {
                    window.location.hash = param;
                }
                // jump to hash
                else if( !goToID(window.location.hash) && current >= 0 ) {
                    goTo(current);
                } else {
                    goTo(0);
                }


                fillNavigation();
                $(window).on('sizeChange', fillNavigation);
                $(window).resize(function() {
                    if(pm.getInstance().MediaSizeService.interval() == 'xs') {
                        fillNavigation();
                    }
                });

            }
        }

        /**
         * Get the currently active checkout container.
         * @function getCurrentContainer
         * @return {{id: string, index: number}}
         */
        function getCurrentContainer() {
            if (current >= 0) {
                return {
                    id: $(container[current]).attr('data-plenty-checkout-id'),
                    index: current
                };
            } else {
                return null;
            }
        }

        /**
         * Register an interceptor called before each tab change.
         * Tabchange will break if any interceptor returns false.
         * @param {function} interceptor The interceptor callback to register
         * @chainable
         * @returns {NavigatorService}
         * @example
         *      plenty.NavigatorService.beforeChange( function(targetContainer) {
         *          if( targetContainer.id === 'details' ) {
         *              // stop tabchange if user tries to access checkout container with id "details"
         *              return false;
         *          }
         *          return true;
         *      });
         */
        function beforeChange( interceptor ) {
            interceptors.beforeChange.push( interceptor );
            return pm.getInstance().NavigatorService;
        }

        /**
         * Register an interceptor called after each tab change.
         * @param {function} interceptor The interceptor callback to register
         * @chainable
         * @returns {NavigatorService}
         */
        function afterChange( interceptor ) {
            interceptors.afterChange.push( interceptor );
            return pm.getInstance().NavigatorService;
        }

        /**
         * Call registered interceptors. Break if any interceptor returns false.
         * Do not call beforeChange-interceptors on initially tabchange
         * @function resolveInterceptors
         * @private
         * @param {"beforeChange"|"afterChange"} identifier Describe which interceptors should be called
         * @param {number} index the index of the target container
         * @returns {boolean} Conjunction of all interceptor return values
         */
        function resolveInterceptors( identifier, index ) {
            var continueTabChange = true;

            if( current >= 0 || identifier === 'afterChange' ) {

                var currentContainer = getCurrentContainer();
                var targetContainer = {
                    index: index,
                    id: $(container[index]).attr('data-plenty-checkout-id')
                };

                $.each(interceptors[identifier], function (i, interceptor) {
                    if (interceptor(currentContainer, targetContainer) === false) {
                        continueTabChange = false;
                        return false;
                    }
                });
            }

            return continueTabChange;
        }

        /**
         * Show checkout tab given by index
         * @function goTo
         * @param {number} index Index of target tab, starting at 0
         * @param {boolean} [ignoreInterceptors=false] Set true to not call registered interceptors and force changing tab
         */
        function goTo(index, ignoreInterceptors) {



            var contentChanged = current !== index;

            if( contentChanged && !ignoreInterceptors ) {
                if( !resolveInterceptors( "beforeChange", index ) ) {
                    return;
                }
            }

            current = index;

            if( !Object.equals(checkoutStates[current], Checkout.getCheckout(true) ) && contentChanged && !!$(container[ current ]).attr( 'data-plenty-checkout-content' ) ) {
                checkoutStates[current] = Checkout.getCheckout(true);
                // reload tab content
                CMS.getCategoryContent( $(container[ current ]).attr( 'data-plenty-checkout-content' ) )
                    .done(function( response ) {
                        $(container[current]).html( response.data[0] );
                        // continue tab change
                        proceedTabChange(contentChanged);
                        pm.getInstance().bindDirectives();
                    });
            } else {
                // continue tab change without reloading tab content
                proceedTabChange(contentChanged);
                pm.getInstance().bindDirectives();
            }

        }

        function proceedTabChange( contentChanged ) {

            // hide content containers
            $(container).hide();

            // refresh navigation elements
            $(navigation).each(function (i, elem) {
                $(elem).removeClass('disabled active');

                $(elem).find('[role="tab"]').attr('aria-selected', 'false');

                if (i < current) {
                    // set current element as active
                    $(elem).addClass('visited');
                }
                else {
                    if (i == current) {
                        $(elem).addClass('active visited');
                        $(elem).find('[role="tab"]').attr('aria-selected', 'true');
                    }
                    else {
                        if (i > current && !$(elem).is('.visited')) {
                            // disable elements behind active
                            $(elem).addClass('disabled');
                        }
                    }
                }
            });
            fillNavigation();

            // hide "previous"-button if first content container is shown
            if (current <= 0) {
                $(buttonPrev).attr("disabled", "disabled");
            } else {
                $(buttonPrev).removeAttr("disabled");
            }

            // hide "next"-button if last content container is shown
            if (current + 1 == navigation.length) {
                $(buttonNext).attr("disabled", "disabled");
            }
            else {
                $(buttonNext).removeAttr("disabled");
            }

            // show current content container
            $(container[current]).show();

            // set location hash
            if (current > 0) {
                window.location.hash = $(container[current]).attr('data-plenty-checkout-id');
            } else {
                if (window.location.hash.length > 0) {
                    window.location.hash = '';
                }
            }

            if( contentChanged ) {
                resolveInterceptors("afterChange", current);
            }
        }



        /**
         * Continue interrupted tabchange. Shorthand for: <code>goTo(targetContainer.index, true)</code>
         * @function continueChange
         * @param targetContainer The tab-object received from an interceptor
         */
        function continueChange(targetContainer) {
            goTo(targetContainer.index, true);
        }

        /**
         * Show next checkout tab if available. Shorthand for
         * <code>
         *     if (current < navigation.length - 1) {
         *        goTo(current + 1);
         *     }
         * </code>
         * @function next
         */
        function next() {
            if (current < navigation.length - 1) {
                goTo(current + 1);
            }
        }

        /**
         * Show previous checkout tab if available
         * @function next
         */
        function previous() {
            if (current > 0) {
                goTo(current - 1);
            }
        }

        /**
         * Show checkout tab given by ID
         * @function goToID
         * @param  {string} containerID ID of tab to show. Target tab must be marked with <b>data-plenty-checkout-id="#..."</b>
         */
        function goToID(containerID) {
            if (containerID == 'next') {
                next();
                return true;
            }
            else if (containerID == 'prev') {
                previous();
                return true;
            }
            else {
                containerID = containerID.replace('#', '');
                $(container).each(function (i, elem) {
                    if ($(elem).attr('data-plenty-checkout-id') == containerID) {
                        goTo(i);
                        return true;
                    }
                });
            }

            return false;
        }

        /**
         * Calculate navigation's width to match its parent element
         * by increasing its items padding.
         * @function fillNavigation
         */
        function fillNavigation() {
            // break if manager has not been initialized
            var navigationCount = navigation.length;
            if( navigationCount <= 0 ) return;

            // reset inline styles
            $(navigation).removeAttr('style');
            $(navigation).children('span').removeAttr('style');
            $(buttonNext).removeAttr('style');
            $(buttonPrev).removeAttr('style');


            var buttonWidth = ($(buttonPrev).outerWidth() < $(buttonNext).outerWidth()) ? $(buttonNext).outerWidth(true)+1 : $(buttonPrev).outerWidth(true)+1;
            $(buttonNext).css({ width: buttonWidth+'px' });
            $(buttonPrev).css({ width: buttonWidth+'px' });

            // calculate width to fill
            var width = $(navigation).parent().parent().outerWidth(true) - ( 2 * buttonWidth);
            width -= parseInt($(navigation).parent().css('marginLeft')) + parseInt($(navigation).parent().css('marginRight'));

            var padding = width;
            var tabWidth = [];

            $(navigation).each(function(i, elem) {
                padding -= parseInt( $(elem).css('marginLeft') );
                padding -= parseInt( $(elem).css('marginRight') );

                tabWidth[i] = $(elem).children('span').width();
                padding -= tabWidth[i];

                padding -= parseInt( $(elem).children('span').css('marginLeft') );
                padding -= parseInt( $(elem).children('span').css('marginRight') );
            });

            var paddingEachItem = parseInt( padding / navigationCount );

            var paddingLeft, paddingRight;
            if ( paddingEachItem % 2 == 1 ) {
                paddingLeft = ( paddingEachItem / 2 ) + 0.5;
                paddingRight = ( paddingEachItem / 2 ) - 0.5;
            }
            else {
                paddingLeft = paddingEachItem / 2;
                paddingRight = paddingEachItem / 2;
            }

            var paddingLastItem = parseInt( padding - ( ( navigationCount - 1 ) * ( paddingLeft + paddingRight ) ) );
            var paddingLastLeft, paddingLastRight;
            if ( paddingLastItem % 2 == 1 ) {
                paddingLastLeft = ( paddingLastItem / 2 ) + 0.5;
                paddingLastRight = ( paddingLastItem / 2) - 0.5;
            }
            else {
                paddingLastLeft = paddingLastItem / 2;
                paddingLastRight = paddingLastItem / 2;
            }

            var diff = width;
            $(navigation).each(function(i, elem) {
                if ( i < navigationCount - 1) {
                    $(elem).children('span').css({'paddingLeft': paddingLeft + 'px', 'paddingRight': paddingRight + 'px'}); //.parent().css({ width: ( tabWidth[i] + paddingLeft + paddingRight + parseInt( $(elem).children('span').css('marginLeft') ) + parseInt( $(elem).children('span').css('marginRight') ) )+'px' });
                }
                else {
                    $(elem).children('span').css({'paddingLeft': paddingLastLeft + 'px', 'paddingRight': paddingLastRight + 'px'}); //.parent().css({ width: ( tabWidth[i] + paddingLastLeft + paddingLastRight + parseInt( $(elem).children('span').css('marginLeft') ) + parseInt( $(elem).children('span').css('marginRight') ) )+'px' });
                }
            });

            //$(navigation).parent().css('marginRight', 0);
        }

    }, ['CMSFactory', 'CheckoutFactory']);

}(jQuery, PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function($, pm) {

    /**
     * Provide templates for social share providers to inject them dynamically.
     * @class SocialShareService
     * @static
     */
    pm.service('SocialShareService', function() {

        //TODO: move to global variables
        if ( typeof(socialLangLocale) == 'undefined' ) socialLangLocale = 'en_US';
        if ( typeof(socialLang) == 'undefined' ) socialLang = 'en';

        return {
            getSocialService: getService
        };

        /**
         * Get the template for social media provider
         * @function getService
         * @param {string} identifier name of the social media provider to get the template for
         * @returns {string} the template to inject in DOM
         */
        function getService( identifier ) {
            var services = {
                'facebook-like' 	:	 '<iframe src="//www.facebook.com/plugins/like.php'
                +'?locale='+socialLangLocale
                +'&amp;href=' + encodeURIComponent(getURI())
                +'&amp;width=130'
                +'&amp;layout=button_count'
                +'&amp;action=like'
                +'&amp;show_faces=false'
                +'&amp;share=false'
                +'&amp;height=21'
                +'&amp;colorscheme=light" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:130px; height:21px;" allowTransparency="true"></iframe>',

                'facebook-recommend'	:	'<iframe src="//www.facebook.com/plugins/like.php'
                +'?locale='+socialLangLocale
                +'&amp;href=' + encodeURIComponent(getURI())
                +'&amp;width=130'
                +'&amp;layout=button_count'
                +'&amp;action=recommend'
                +'&amp;show_faces=false'
                +'&amp;share=false'
                +'&amp;height=21'
                +'&amp;colorscheme=light" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:130px; height:21px;" allowTransparency="true"></iframe>',

                'twitter'				: '<iframe src="//platform.twitter.com/widgets/tweet_button.html'
                +'?url=' + encodeURIComponent(getURI())
                +'&amp;text=' + getTweetText()
                +'&amp;count=horizontal'
                +'&amp;dnt=true" allowtransparency="true" frameborder="0" scrolling="no"  style="width:130px; height:21px;"></iframe>',

                'google-plus'			: '<div '
                +'class="g-plusone" '
                +'data-size="medium" '
                +'data-href="' + getURI() + '"></div>'
                +'<script type="text/javascript">window.___gcfg = {lang: "'+socialLang+'"}; (function() { var po = document.createElement("script"); po.type = "text/javascript"; po.async = true; po.src = "https://apis.google.com/js/platform.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(po, s); })(); </script>',
            };

            return services[identifier];
        }

        /**
         * get the canonical URL if defined
         * @function getURL
         * @private
         * @return {string} The Canonical URL if defined or the current URI
         */
        function getURI() {
            var uri = document.location.href;
            var canonical = $("link[rel=canonical]").attr("href");

            if (canonical && canonical.length > 0) {
                if (canonical.indexOf("http") < 0) {
                    canonical = document.location.protocol + "//" + document.location.host + canonical;
                }
                uri = canonical;
            }

            return uri;
        }

        /**
         * returns content of &lt;meta name="" content=""> tags or '' if empty/non existant
         * @function getMeta
         * @private
         * @param {string} name The meta name to get the value of;
         */
        function getMeta(name) {
            var metaContent = $('meta[name="' + name + '"]').attr('content');
            return metaContent || '';
        }

        /**
         * create tweet text from content of &lt;meta name="DC.title"> and &lt;meta name="DC.creator">
         * fallback to content of &lt;title> tag
         * @function getTweetText
         * @private
         */
        function getTweetText() {
            var title = getMeta('DC.title');
            var creator = getMeta('DC.creator');

            if (title.length > 0 && creator.length > 0) {
                title += ' - ' + creator;
            } else {
                title = $('title').text();
            }

            return encodeURIComponent(title);
        }

    });

}(jQuery, PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function ($, pm) {

    /**
     * Provide methods for client-side form validation.
     * @class ValidationService
     * @static
     */
    pm.service( 'ValidationService', function() {

        return {
            validate: validate
        };

        /**
         * Check if element is a form element (input, select, textarea) or search for child form elements
         * @function getFormControl
         * @private
         * @param  {object} element the element to get the form element from
         * @return {object} a valid form element (input, select, textarea)
         */
        function getFormControl( element ) {
            element = $(element);
            if( element.is('input') || element.is('select') || element.is('textarea') ) {
                return element;
            } else {
                if( element.find('input').length > 0 ) {
                    return element.find('input');
                }

                else if ( element.find('select').length > 0 ) {
                    return element.find('select');
                }

                else if ( element.find('textarea').length > 0 ) {
                    return element.find('textarea');
                }

                else {
                    return null;
                }
            }

        }

        /**
         * Check given element has any value
         * @function validateText
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateText( formControl ) {
            // check if formControl is no checkbox or radio
            if ( formControl.is('input') || formControl.is('select') || formControl.is('textarea') ) {
                // check if length of trimmed value is greater then zero
                return $.trim( formControl.val() ).length > 0;

            } else {
                console.error('Validation Error: Cannot validate Text for <' + formControl.prop("tagName") + '>');
                return false;
            }
        }

        /**
         * Check given element's value is a valid email-address
         * @function validateMail
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateMail( formControl ) {
            var mailRegExp = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            if ( validateText(formControl) ) {
                return mailRegExp.test( $.trim( formControl.val() ) );
            } else {
                return false;
            }
        }

        /**
         * Check given element's value is a valid number
         * @function validateNumber
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateNumber( formControl ) {
            if ( validateText(formControl) ) {
                return $.isNumeric( $.trim( formControl.val() ) );
            } else {
                return false;
            }
        }

        /**
         * Check given element's value is equal to a references value
         * @function validateValue
         * @private
         * @param {object} formControl the form element to validate
         * @param {string} reference the required value
         * @return {boolean}
         */
        function validateValue( formControl, reference ) {
            if( $(reference).length > 0 ) {
                return $.trim( formControl.val() ) == $.trim( $(reference).val() );
            } else {
                return $.trim( formControl.val() ) == reference;
            }
        }

        function visibility( formControl ) {
            return formControl.is(':visible');
        }

        function isEnabled( formControl ) {
            return formControl.is(':enabled');
        }

        /**
         * Validate a form. Triggers event 'validationFailed' if any element has an invalid value
         * @function validate
         * @param   {object}    form The form element to validate
         * @returns {boolean}
         * @example
         *  ```html
         *      <!-- add "error-class" to invalid elements -->
         *      <form data-plenty-checkform="error-class">
         *          <!-- check if value is "text" -->
         *          <input type="text" data-plenty-validate="text">
         *
         *          <!-- check if value is a valid email-address -->
         *          <input type="text" data-plenty-validate="mail">
         *
         *          <!-- check if value is a valid number -->
         *          <input type="text" data-plenty-validate="number">
         *
         *          <!-- check if value is "foo" -->
         *          <input type="text" data-plenty-validate="value" data-plenty-validation-value="foo">
         *
         *          <!-- check if values are identical -->
         *          <input type="text" id="input1">
         *          <input type="text" data-plenty-validate="value" data-plenty-validation-value="#input1">
         *
         *          <!-- validate radio buttons -->
         *          <input type="radio" name="radioGroup" data-plenty-validate>
         *          <input type="radio" name="radioGroup" data-plenty-validate>
         *          <input type="radio" name="radioGroup" data-plenty-validate>
         *
         *          <!-- validate checkboxes -->
         *          <input type="checkbox" name="checkboxGroup" data-plenty-validate="{min: 1, max: 2}">
         *          <input type="checkbox" name="checkboxGroup" data-plenty-validate="{min: 1, max: 2}">
         *          <input type="checkbox" name="checkboxGroup" data-plenty-validate="{min: 1, max: 2}">
         *
         *          <!-- add error class to parent container -->
         *          <div data-plenty-validate="text">
         *              <label>An Input</label>
         *              <input type="text">
         *          </div>
         *
         *       </form>
         *    ```
         *
         * @example
         *      $(form).on('validationFailed', function(missingFields) {
         *          // handle missing fields
         *      });
         */
        function validate( form, errorClass ) {
            var formControl, formControls, validationKey, currentHasError, group, checked, checkedMin, checkedMax, attrValidate, validationKeys, formControlAttrType;
            var $form = $(form);
            errorClass = errorClass || 'has-error';
            var missingFields = [];
            var hasError = false;

            // check every required input inside form
            $form.find('[data-plenty-validate], input.Required').each(function(i, elem) {
                attrValidate = $(elem).attr('data-plenty-validate');
                formControls = getFormControl(elem)
                // validate text inputs
                validationKeys = !!attrValidate ? attrValidate : 'text';
                validationKeys = validationKeys.split(',');

                for(var i = 0, length = formControls.length; i < length; i++) {
                    formControl = $(formControls[i]);
                    formControlAttrType = formControl.attr('type');

                    if (!visibility(formControl) || !isEnabled(formControl)) {
                        return;
                    }

                    validationKey = validationKeys[i].trim() || validationKeys[0].trim();
                    currentHasError = false;

                    // formControl is textfield (text, mail, password) or textarea
                    if ((formControl.is('input')
                        && formControlAttrType != 'radio'
                        && formControlAttrType != 'checkbox')
                        || formControl.is('textarea')) {
                        switch (validationKey) {

                            case 'text':
                                currentHasError = !validateText(formControl);
                                break;

                            case 'mail':
                                currentHasError = !validateMail(formControl);
                                break;

                            case 'number':
                                currentHasError = !validateNumber(formControl);
                                break;

                            case 'value':
                                currentHasError = !validateValue(formControl, $(elem).attr('data-plenty-validation-value'));
                                break;

                            case 'none':
                                // do not validate
                                break;

                            default:
                                console.error('Form validation error: unknown validate property: "' + attrValidate + '"');
                                break;
                        }
                    } else if (formControl.is('input')
                        && (formControlAttrType == 'radio'
                        || formControlAttrType == 'checkbox')) {
                        // validate radio buttons
                        group = formControl.attr('name');
                        checked = $form.find('input[name="' + group + '"]:checked').length;

                        if (formControlAttrType == 'radio') {
                            checkedMin = 1;
                            checkedMax = 1;
                        } else {
                            eval("var minMax = " + attrValidate);
                            checkedMin = !!minMax ? minMax.min : 1;
                            checkedMax = !!minMax ? minMax.max : 1;
                        }

                        currentHasError = ( checked < checkedMin || checked > checkedMax );

                    } else if (formControl.is('select')) {
                        // validate selects
                        currentHasError = ( formControl.val() == '' || formControl.val() == '-1' );
                    } else {
                        console.error('Form validation error: ' + $(elem).prop("tagName") + ' does not contain an form element');
                        return;
                    }

                    if (currentHasError) {
                        hasError = true;
                        missingFields.push(formControl);

                        if(formControls.length > 1 ) {
                            formControl.addClass(errorClass);
                            $form.find('label[for="'+formControl.attr('id')+'"]').addClass(errorClass);
                        } else {
                            $(elem).addClass(errorClass);
                        }
                    }
                }

            });

            // scroll to element on 'validationFailed'
            $form.on('validationFailed', function() {
                var distanceTop = 50;
                var errorOffset = $form.find('.has-error').first().offset().top;
                var scrollTarget = $('html, body');

                // if form is inside of modal, scroll modal instead of body
                if( $form.parents('.modal').length > 0 ) {
                    scrollTarget = $form.parents('.modal');
                } else if( $form.is('.modal') ) {
                    scrollTarget = $form;
                }

                // only scroll if error is outside of viewport
                if( errorOffset - distanceTop < window.pageYOffset || errorOffset > (window.pageYOffset + window.innerHeight) ) {
                    scrollTarget.animate({
                        scrollTop: errorOffset - distanceTop
                    });
                }
            });

            if ( hasError ) {
                // remove error class on focus
                $form.find('.has-error').each(function(i, elem) {
                    formControl = $(getFormControl(elem));
                    formControl.on('focus click', function() {
                        formControl.removeClass( errorClass );
                        $form.find('label[for="'+formControl.attr('id')+'"]').removeClass(errorClass);
                        $(elem).removeClass( errorClass );
                    });
                });

                $form.trigger('validationFailed', [missingFields]);
            }

            var callback = $form.attr('data-plenty-callback');

            if( !hasError && !!callback && callback != "submit" && typeof window[callback] == "function") {

                var fields = {};
                $form.find('input, textarea, select').each(function (){
                    if( $(this).attr('type') == 'checkbox' ) {
                        fields[$(this).attr('name')] = $(this).is(':checked');
                    } else {
                        fields[$(this).attr('name')] = $(this).val();
                    }
                });

                window[callback](fields);
                return false;
            } else {
                return !hasError;
            }
        }
    });

    /**
     * jQuery-Plugin to calling {{#crossLink "ValidationService/validate"}}ValidationService.validate{{/crossLink}}
     * on jQuery wrapped elements.
     * @return {boolean}
     */
    $.fn.validateForm = function() {
        return pm.getInstance().ValidationService.validate( this );
    };

    /**
     * jQuery-Plugin to get the values of contained form elements.
     * @return {object}
     */
    $.fn.getFormValues = function() {

        var form = this;
        var values = {};
        function inject( position, value ) {
            var match = position.match(/^([^\[]+)(.*)/);

            if( !!match[2] ) {
                var exp = /\[([^\]]+)]/g;
                var child;
                var children = [];
                children[0] = match[1];
                while( (child = exp.exec(match[2])) !== null ) {
                    children.push( child[1] );
                }

                for( var i = children.length-1; i >= 0; i-- ) {
                    var val = {};
                    val[children[i]] = value;
                    value = val;
                }
                values = $.extend(true, values, value);
            } else {
                values[match[1]] = value;
            }
        }

        form.find('input, select, textarea').each(function(i, elem) {
            if( !!$(elem).attr('name') ) {
                if ($(elem).attr('type') == "checkbox") {
                    // get checkbox group
                    var groupValues = [];
                    $(form).find('[name="' + $(elem).attr('name') + '"]:checked').each(function (j, checkbox) {
                        groupValues.push($(checkbox).val());
                    });
                    inject($(elem).attr('name'), groupValues);
                } else if ($(elem).attr('type') == 'radio') {
                    if ($(elem).is(':checked')) inject($(elem).attr('name'), $(elem).val());
                } else {
                    inject($(elem).attr('name'), $(elem).val());
                }
            }

        });
        return values;
    }
}(jQuery, PlentyFramework));
/**
 * Services provide functions to be called from the instanced PlentyFramework.<br>
 * Services can inject Factories and can be injected into Directives. The are also
 * available from the global instance of PlentyFramework
 * @module Services
 * @main Services
 * @example
 *      PlentyFramework.service('ServiceName', serviceFunctions() {
 *          return {
 *              functionInService: function() {}
 *           }
 *      });
 *      //...
 *      plenty.ServiceName.functionInService/();
 */
(function( $, pm )
{
    pm.directive( 'Basket', function( BasketService )
    {

        return {
            addBasketItem     : addBasketItem,
            changeItemQuantity: changeItemQuantity,
            setItemQuantity   : setItemQuantity
        };

        function addBasketItem( e, button )
        {
            e.preventDefault();
            //init
            var basketItemsList = {};
            var parentForm      = $( button ).parents( 'form' );

            basketItemsList.BasketItemItemID   = parentForm.find( '[name="ArticleID"]' ).val();
            basketItemsList.BasketItemPriceID  = parentForm.find( '[name="SYS_P_ID"]' ).val();
            basketItemsList.BasketItemQuantity = parentForm.find( '[name="ArticleQuantity"]' ).val();
            basketItemsList.BasketItemBranchID = parentForm.find( '[name="source_category"]' ).val();

            //attributes
            var attributeInputsList = parentForm.find( '[name^="ArticleAttribute"]' );
            var attributesList      = [];

            $.each( attributeInputsList, function( idx, elem )
            {
                var match = elem.name.match( /^ArticleAttribute\[\d+]\[\d+]\[(\d+)]$/ );
                if ( match && match[1] )
                {
                    attributesList.push( {
                        BasketItemAttributeID     : match[1],
                        BasketItemAttributeValueID: $( elem ).val()
                    } );
                }
            } );

            if ( attributesList.length != 0 )
            {
                basketItemsList.BasketItemAttributesList = attributesList;
            }

            //add basketItem and refresh previewLists
            BasketService.addItem( [basketItemsList] );

        }

        function changeItemQuantity( elem, increment )
        {
            var $elem         = $( elem );
            var quantityInput = $elem.parent().find( 'input' );
            var maxLength     = parseInt( quantityInput.attr( 'maxlength' ) ) || 5;
            var value         = parseInt( quantityInput.val() ) + increment;

            if ( (value + '').length <= maxLength && value > 1 )
            {
                quantityInput.val( value );

                var isBasketView = elem.parents( '[data-basket-item-id]' ).length > 0;
                if ( isBasketView )
                {
                    var timeout = elem.data( 'timeout' );

                    if ( !!timeout )
                    {
                        window.clearTimeout( timeout );
                    }

                    timeout = window.setTimeout( function()
                    {
                        quantityInput.trigger( 'change' );
                    }, 1000 );

                    elem.data( 'timeout', timeout );
                }
            }
        }

        function setItemQuantity( basketItemID, input )
        {
            BasketService.setItemQuantity(
                basketItemID,
                parseInt( $( input ).val() )
            ).fail(function() {
                // reset input's value on cancel
                var basketItem = BasketService.getItem( basketItemID );
                $( input ).val( basketItem.BasketItemQuantity );
            });
        }

    }, ['BasketService'] );
}( jQuery, PlentyFramework ));
/**
 * Add fancy ui modifications - the visual stuff - here.
 * Respond functionality like 'event':UI.myFunctionality(currentElement)
 *
 * Example:
 *      <button type="button" data-plenty="click:UI.addTooltip(this)">go to top</button>
 *
 */
(function( $, pm )
{
    pm.directive( 'UI', function( MediaSizeService, SocialShareService )
    {
        // elements to calculate height.
        var equalHeightElementList = [];

        // resize elements on window size change.
        $( window ).on( 'sizeChange', function()
        {
            for ( var i = equalHeightElementList.length - 1; i >= 0; i-- )
            {
                equalHeight( equalHeightElementList[i], '', true );
            }
        } );

        return {
            addContentPageSlider: addContentPageSlider,
            equalHeight         : equalHeight,
            initToTop           : initToTop,
            initLazyload        : initLazyload,
            slideToggle         : slideToggle,
            toggleHideShow      : toggleHideShow,
            toggleSocialShare   : toggleSocialShare,
            toggleCssClass      : toggleCssClass,
            openTab             : openTab,
            openRemoteTab       : openRemoteTab,
            setRemoteTab        : setRemoteTab
        };

        /**
         * Adds content page slider (owlCarousel)
         *
         * usage:
         * <div class="contentpageSlider" data-plenty="contentpageSlider">
         *     <div class="slide">
         *         ...
         *     </div>
         *     <div class="slide">
         *         ...
         *     </div>
         *     ...
         * </div>
         *
         * Legacy directive selector: data-plenty="contentpageSlider"
         *
         * @param elem
         */
        function addContentPageSlider( elem )
        {
            $( elem ).owlCarousel( {
                navigation     : true,
                navigationText : false,
                slideSpeed     : 1000,
                paginationSpeed: 1000,
                singleItem     : true,
                autoPlay       : 6000,
                stopOnHover    : true,
                afterMove      : function( current )
                {
                    $( current ).find( 'img[data-plenty-rel="lazyload"]' ).trigger( 'appear' );
                }
            } );
        }

        /**
         * Equal Box height
         * Calculates equal box height for chosen elements.
         *
         * Legacy directive selector: data-plenty-equal
         *
         * @param elem
         * @param elementExists - default false
         */
        function equalHeight( elem, mediaSizes, elementExists )
        {
            var $elem            = $( elem );
            var maxHeight        = 0;
            var $equalTarget     = {};
            var $equalTargetList = $elem.find('[data-plenty-rel="equal-target"]').length > 0 ? $elem.find('[data-plenty-rel="equal-target"]') : $elem.children();
            var mediaSizeList    = mediaSizes.replace( /\s/g, '' ).split( ',' );

            // if element wasn't pushed before.
            if ( elementExists !== true )
            {
                equalHeightElementList.push( elem );
            }

            for ( var i = $equalTargetList.length; i >= 0; i-- )
            {
                $equalTarget = $( $equalTargetList[i] );
                $equalTarget.css( 'height', '' );

                if ( $equalTarget.outerHeight( true ) > maxHeight )
                {
                    maxHeight = $equalTarget.outerHeight( true );
                }
            }

            if ( !mediaSizeList || $.inArray( MediaSizeService.interval(), mediaSizeList ) >= 0 )
            {
                $equalTargetList.height( maxHeight );
            }
        }

        /**
         * Scroll page to top.
         * Just add without events.
         *
         * Legacy directive selector: data-plenty="toTop"
         *
         * @param elem
         */
        function initToTop( elem )
        {
            var $elem = $( elem );

            $elem.click( function()
            {
                $( 'html, body' ).animate( {
                    scrollTop: 0
                }, 400 );
                return false;
            } );

            $( window ).on( "scroll resize", function()
            {
                if ( $( document ).scrollTop() > 100 )
                {
                    $elem.addClass( 'visible' );
                }
                else
                {
                    $elem.removeClass( 'visible' );
                }
            } );
        }

        /**
         * lazy load on ready.
         *
         * Legacy directive selector: img[data-plenty-lazyload]
         *
         * @param elem
         */
        function initLazyload( elem, effect )
        {
            var $elem = $( elem );

            $elem.lazyload( {
                effect: effect
            } );
            $elem.on( "loaded", function()
            {
                $elem.css( 'display', 'inline-block' );
            } );
        }

        /**
         * Toggle show and hide animation.
         *
         * Legacy directive selector: data-plenty="openCloseToggle"
         *
         * @param elem
         */
        function toggleHideShow( elem )
        {
            var $elem       = $( elem );
            var $elemParent = $elem.parent();

            $elemParent.addClass( 'animating' );
            $elem.siblings( 'ul' ).slideToggle( 200, function()
            {
                if ( $elemParent.is( '.open' ) )
                {
                    $elemParent.removeClass( 'open' );
                }
                else
                {
                    $elemParent.addClass( 'open' );
                }
                $elem.removeAttr( 'style' );
                $elemParent.removeClass( 'animating' );
            } );
        }

        /**
         * Toggle target content on click.
         * Bind to checked-/ unchecked-property of radio buttons
         *
         * Legacy directive selector: data-plenty-slidetoggle
         *
         * @param elem
         */
        function slideToggle( elem )
        {
            var $elem          = $( elem );
            var $targetElement = $( $elem.attr( 'data-plenty-target' ) );

            if ( $elem.is( 'input[type="radio"]' ) )
            {
                // is radio button
                var $radio           = $( 'input[type="radio"][name="' + ( $elem.attr( 'name' ) ) + '"]' );
                var visibleOnChecked = $elem.is( '[data-plenty-slidetoggle="checked"]' );
                $radio.change( function()
                {
                    $targetElement.parents( '[data-plenty-equal-target]' ).css( 'height', 'auto' );

                    if ( $( this ).is( ':checked' ) && $( this )[0] === $( elem )[0] )
                    {
                        // checked
                        if ( visibleOnChecked == true )
                        {
                            $targetElement.slideDown( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                        else
                        {
                            $targetElement.slideUp( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                    }
                    else
                    {
                        // unchecked (since other radio button has been checked)
                        if ( visibleOnChecked == true )
                        {
                            $targetElement.slideUp( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                        else
                        {
                            $targetElement.slideDown( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                    }
                } );
            }
            else
            {
                // is not radio button
                $elem.click( function()
                {
                    $targetElement.parents( '[data-plenty-equal-target]' ).css( 'height', 'auto' );

                    $elem.addClass( 'animating' );
                    $( $targetElement ).slideToggle( 400, function()
                    {
                        $elem.removeClass( 'animating' );
                        $elem.toggleClass( 'active' );
                        pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                    } );
                } );
            }
        }

        /**
         * TODO check comment
         * Social Share Activation
         * Activate and load share-buttons manually by clicking a separate button
         * Usage / data-attributes:
         * <div data-plenty-social="twitter">
         *    <span data-plenty="switch"></span>        Will be used to activate the service set in
         * data-plenty-social=""
         *    <span data-plenty="placeholder"></span>   Will be replaced with loaded share button
         * </div>
         *
         * possible values for data-plenty-social:
         * "facebook-like"            : Load Facebooks "Like"-Button
         * "facebook-recommend"        : Load Facebooks "Recommend"-Button
         * "twitter"                : Load Twitter Button
         * "google-plus"            : Load google "+1"-Button
         *
         * Additional Tooltips
         * You can extend the parent element with a (bootstrap) tooltip by adding data-toggle="tooltip" and
         * title="TOOLTIP CONTENT" Tooltip will be destroyed after activating a social service
         * (!) Requires bootstrap.js
         *
         * Legacy directive selector: data-plenty-social
         *
         * @param elem
         */
        function toggleSocialShare( elem )
        {
            var $elem   = $( elem );
            var $toggle = $elem.find( '[data-plenty="switch"]' );

            // append container to put / delete service.html
            $elem.append( '<div class="social-container"></div>' );

            // add "off" class to switch, if neither "off" or "on" is set
            // replaced hasClass() with is() benchmark: http://jsperf.com/hasclasstest
            if ( !$toggle.is( 'off, on' ) )
            {
                $toggle.addClass( 'off' );
            }

            // toggle switch
            $toggle.on( 'click', function()
            {
                if ( $toggle.hasClass( 'off' ) )
                {
                    if ( $elem.attr( "data-toggle" ) == "tooltip" )
                    {
                        $elem.tooltip( 'destroy' )
                    }
                    $toggle.removeClass( 'off' ).addClass( 'on' );
                    // hide dummy button
                    $elem.find( '[data-plenty="placeholder"]' ).hide();
                    // load HTML defined in 'api'
                    $elem.find( '.social-container' ).append( SocialShareService.getSocialService( $elem.attr( 'data-plenty-social' ) ) );
                }
                // do not disable social medias after activation
            } );
        }

        /**
         * Tab Handling
         *
         * Show tab with jQuery-selector 'TAB_SELECTOR'
         * <a data-plenty-opentab="TAB_SELECTOR">
         * (!) Requires bootstrap.js
         *
         * Legacy directive selector: a[data-plenty-opentab]
         *
         * @param elem
         */
        function openTab( elem )
        {
            var tabSelector = $( elem ).attr( 'data-plenty-opentab' );
            tabSelector     = ( tabSelector == 'href' ) ? $( this ).attr( 'href' ) : tabSelector;
            $( tabSelector ).tab( 'show' );
        }

        /**
         * Show remote tab with jQuery-selector 'TAB_1' in target container (below)
         * <span data-plenty-openremotetab="TAB_1">
         *
         * Legacy directive selector: data-plenty-openremotetab
         *
         * @param elem
         */
        function openRemoteTab( elem )
        {
            var tabSelector = $( elem ).attr( 'data-plenty-openremotetab' );
            $( tabSelector ).trigger( 'tabchange' );
        }

        /**
         * Remote tabs
         * tab content can be placed anywhere in body
         *
         * Content of remote tab
         * <div data-plenty-labelledby="TAB_1" data-plenty-remotetabs-id="REMOTE_TAB_GROUP">
         *     <!-- Content of TAB_1 -->
         * </div>
         *
         * Remote tab navigation
         * [...]
         * <div data-plenty="remoteTabs" data-plenty-remotetabs-id="REMOTE_TAB_GROUP">
         *     <ul>
         *         <li class="active">
         *             <a data-plenty-tab-id="TAB_1">
         *                 <!-- Title of TAB_1 -->
         *             </a>
         *         </li>
         *         <li>
         *             <a data-plenty-tab-id="TAB_2">
         *                 <!-- Titel of TAB_2 -->
         *             </a>
         *         </li>
         *     </ul>
         * </div>
         *
         * Legacy directive selector: data-plenty="remoteTabs"
         *
         * @param elem
         */
        function setRemoteTab( elem )
        {
            var tabId = $( elem ).attr( 'data-plenty-remotetabs-id' );

            // find tabs grouped by remotetabs-id
            $( '[data-plenty="remoteTabs"][data-plenty-remotetabs-id="' + tabId + '"]' ).each( function( i, tabs )
            {

                // bind each remote-tab
                $( tabs ).find( 'a' ).each( function( i, singleTab )
                {

                    var singleTabId = $( singleTab ).attr( 'data-plenty-tab-id' );

                    // listen to 'tabchange' event
                    $( singleTab ).on( 'tabchange', function()
                    {
                        // toggle class 'active'
                        $( singleTab ).closest( '[data-plenty="remoteTabs"]' ).children( '.active' ).removeClass( 'active' );
                        $( singleTab ).closest( 'li' ).addClass( 'active' );

                        // hide inactive tabs & show active tab
                        var tabpanelsInactive     = $( '[data-plenty-remotetabs-id="' + tabId + '"][data-plenty-tabpanel-labelledby]' ).not( '[data-plenty-tabpanel-labelledby="' + singleTabId + '"]' );
                        var tabpanelActive        = $( '[data-plenty-remotetabs-id="' + tabId + '"][data-plenty-tabpanel-labelledby="' + singleTabId + '"]' );
                        var zIndexTabpanelParents = 0;
                        if ( $( tabs ).attr( 'data-plenty-remotetabs-adapt' ) == 'tabpanel-parent' )
                        {
                            zIndexTabpanelParents = 2147483646;
                            $( '[data-plenty-remotetabs-id="' + tabId + '"][data-plenty-tabpanel-labelledby]' ).parent().each( function()
                            {
                                var zIndexCurrent = parseInt( $( this ).css( 'zIndex' ) );
                                if ( typeof zIndexCurrent == 'number' && zIndexCurrent < zIndexTabpanelParents )
                                {
                                    zIndexTabpanelParents = zIndexCurrent;
                                }
                            } );
                        }

                        // adjust z-index if neccessary
                        $( tabpanelsInactive ).hide().removeClass( 'in' );
                        $( tabpanelActive ).show().addClass( 'in' );
                        if ( zIndexTabpanelParents != 0 )
                        {
                            $( tabpanelsInactive ).parent().css( 'zIndex', zIndexTabpanelParents );
                            $( tabpanelActive ).parent().css( 'zIndex', zIndexTabpanelParents + 1 );
                        }
                    } );
                } );
            } );

            // trigger 'tabchange' event
            $( elem ).find( 'a' ).click( function()
            {
                $( this ).trigger( 'tabchange' );
            } );
        }

        /**
         * Toggle Class
         * toggle style-classes on click
         * Usage / data-attribute:
         * <div data-plenty-toggle="{target: 'body', class: 'toggledClass', media: 'xs sm'}"></div>
         * target    :    jQuery selector to toggle the class at.
         * class        :  class(es) to toggle at target element
         * media        :  only toggle class on given media sizes (optional)
         *
         * (!) using data-plenty-toggle on <a>-elements will prevent redirecting to href=""
         *
         * Legacy directive selector: data-plenty-toggle
         *
         * @param elem
         */
        function toggleCssClass( elem )
        {
            if ( $( elem ).attr( 'data-plenty-toggle' ).search( ';' ) < 0 )
            {
                eval( 'var data = ' + $( elem ).attr( 'data-plenty-toggle' ) );
                if ( data.target && data.class )
                {
                    $( elem ).click( function()
                    {
                        var isMedia = false;
                        if ( data.media )
                        {
                            if ( data.media.indexOf( ' ' ) != -1 )
                            {
                                var mediaArr = data.media.split( ' ' );
                                for ( i = 0; i < mediaArr.length; i++ )
                                {
                                    if ( MediaSizeService.interval() == mediaArr[i] )
                                    {
                                        isMedia = true;
                                    }
                                }
                            }
                            else
                            {
                                if ( MediaSizeService.interval() == data.media )
                                {
                                    isMedia = true;
                                }
                            }
                        }
                        if ( !data.media || isMedia == true )
                        {
                            $( data.target ).toggleClass( data.class );
                            if ( $( elem ).is( 'a' ) )
                            {
                                return false;
                            }
                        }
                    } );
                }
            }
        }

    }, ['MediaSizeService', 'SocialShareService'] );
}( jQuery, PlentyFramework ));
(function($, pm) {
	pm.directive('Validator', function( ValidationService ) {

        return {
            validate: validate
        };

        function validate( form, errorClass )
        {
            return ValidationService.validate( form, errorClass );
        }

	}, ['ValidationService']);
} (jQuery, PlentyFramework));
/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

PlentyFramework.compile();

// Create global instance of PlentyFramework for usage in Webshop-Layouts
var plenty = PlentyFramework.getInstance();

/*
 * initially bind all registered directives
 *
 * will not be tested. reasons:
 * http://stackoverflow.com/questions/29153733/how-to-unit-test-a-document-ready-function-using-jasmine
  */
jQuery(document).ready(function() {
    plenty.bindDirectives();
});