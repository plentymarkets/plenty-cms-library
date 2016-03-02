var ScriptLoader = {
    scripts: null,

    /**
     * Read required scripts for current layout from 'scripts.json' and create <script> for each loaded file
     * @param config.layout     The layout to load the scripts for ('PageDesignContent', 'PageDesignCheckout', ...)
     * @param config.position   The position where to load the scripts in ('head', 'body')
     * @param config.rootPath   The base path to search files in
     * @param config.sourceMap  The path to the json file to read the required scripts from
     */
    load: function( config )
    {

        // define config defaults
        config.layout    = config.layout || 'PageDesignGlobal';
        config.position  = config.position || 'head';
        config.rootPath  = absolutePath( config.rootPath || '/' );
        config.sourceMap = absolutePath( config.sourceMap || config.rootPath + 'scripts.json' ) + addPostfix( config.debug );

        // read scripts.json if not done yet
        if ( !this.scripts )
        {

            var req = new XMLHttpRequest();
            // req.overrideMimeType("application/json");
            req.open( 'GET', config.sourceMap, false );
            req.onreadystatechange = function()
            {
                if ( req.readyState == 4 && req.status == "200" )
                {
                    // store file contents in global variable
                    ScriptLoader.scripts = JSON.parse( req.responseText );

                    loadScripts();
                }
            };
            req.send( null );
        }
        else
        {
            // use data from global variable -> scripts.json already read before
            loadScripts();
        }

        function loadScripts()
        {
            // concat global dependencies and layout specific dependencies
            var libs = ScriptLoader.scripts.PageDesignGlobal[config.position]
                .concat( ScriptLoader.scripts[config.layout][config.position] );

            for ( var i = 0; i < libs.length; i++ )
            {
                document.write( '<script src="' + config.rootPath + libs[i] + addPostfix( config.debug, libs[i] ) + '" type="text/javascript"><\/script>' );
            }
        }

        function absolutePath( relativePath )
        {
            // FIX: window.location.origin not defined in IE
            if ( !window.location.origin )
            {
                window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            }
            return window.location.origin + relativePath;
        }

        /**
         * Adds a timestamp as postfix to prevent caching in debug mode.
         *
         * @param isDebug - do we wanna debug?
         * @param filename - file to load
         * @returns {*}
         */
        function addPostfix( isDebug, filename )
        {
            if ( !isDebug )
            {
                return "";
            }
            else
            {
                var millis = new Date().getTime();

                // looking for existing prefixes.
                if ( !filename || filename.indexOf( "?" ) === -1 )
                {
                    return "?" + millis;
                }
                else
                {
                    return "&" + millis;
                }
            }
        }
    }

};