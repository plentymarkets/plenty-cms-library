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