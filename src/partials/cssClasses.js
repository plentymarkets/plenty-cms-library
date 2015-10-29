PlentyFramework.cssClasses = {

    active:     'active',
    disabled:   'disabled',
    visited:    'visited',
    visible:    'visible',
    in:         'in',
    on:         'on',
    off:        'off',
    open:       'open',
    animating:  'animating',
    concat:  function(str) {
        var args = str.split(" ");
        var string = "";
        var cssClass;
        for (var i = 0, len = args.length; i < len; i++) {
            cssClass = PlentyFramework.cssClasses[args[i]];
            if (cssClass) {
                string += (i+1 == len) ? cssClass : (cssClass + " ");
            } else {
                console.error(args[i] + " is not a valid CSS class.");
                continue;
            }

        }
        return string;
    }

};





/// PlentyFramework.cssClasses.active === PlentyFramework.cssClasses['active'];