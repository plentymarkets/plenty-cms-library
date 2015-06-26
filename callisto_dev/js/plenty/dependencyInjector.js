var dependencies = null;

/**
 * Read dependencies for current layout from dependencies.json file
 * Create <script> for each dependency
 * @param {string} layout   {"Content" | "Checkout" | "MyAccount"} plenty PageDesign to get the dependencies for
 * @param {string} position {"head" | "body"} position to inject the <script>
 * @param {string} [rootPath = /layout/callisto_dev/js/] Path to dependencies.json
 */
function requireScripts(layout, position, rootPath) {

    rootPath = rootPath || "/layout/callisto_dev/js/";
    rootPath =  window.location.origin + rootPath;

    // read dependencies.json if not done yet
    if( !dependencies ) {
        var req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open('GET', rootPath + 'plenty/dependencies.json', false);
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == "200") {
                // store file contents in global variable
                dependencies = JSON.parse(req.responseText);

                injectScripts();
            }
        };
        req.send(null);
    } else {
        // use data from global variable -> dependencies.json already read before
        injectScripts();
    }

    function injectScripts() {
        // concat global dependencies and layout specific dependencies
        var libs = dependencies.PageDesignGlobal[position].concat(dependencies[layout][position]);

        for (var i = 0; i < libs.length; i++) {
            document.write('<script src="' + rootPath + libs[i] + '"><\/script>');
        }
    }
}