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
    }
};