var customMatcher = {

    toBeFunction: function() {
        return {
            compare: function( actual ) {
                var result = {};
                result.pass = typeof actual == 'function';
                result.message = 'Expected ' + actual + ' to be a function';
                return result;
            }
        };
    },

    toContain: function(util, customEqualityTesters) {
        return {
            compare: function( actual, expected ) {
                var result = {};
                result.pass = false;
                for( var i = 0; i < actual.length; i++ )
                {
                    if( util.equals(actual[i], expected, customEqualityTesters) ) {
                        result.pass = true;
                        break;
                    }
                }

                if( result.pass ) {
                    result.message = 'Expected ' + actual + ' to contain "' + expected + '". ';
                } else {
                    result.message = 'Expected ' + actual + ' to contain "' + expected + '", but was not found. ';
                }

                return result;
            }
        };
    }
};