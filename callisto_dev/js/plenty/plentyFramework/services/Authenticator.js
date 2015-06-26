(function(pm){

    pm.service('Authenticator', function() {

        function doSomethingPrivate() {
            return 'result';
        }

        return {
            login: function() {
                console.log( doSomethingPrivate() );
            }
        }

    });

}(PlentyFramework));