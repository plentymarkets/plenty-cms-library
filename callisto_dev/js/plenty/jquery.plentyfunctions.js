
// Collection of custom element bindings.
// Can be bound to (dynamically added) nodes with $(SELECTOR).bindPlentyFunctions()
var PlentyFunctions = [];
PlentyFunction = function(selector, callback, allowDuplicates) {
	plentyFunction = {
		id:			PlentyFunctions.length,
		selector:	selector,
		callback:	callback,
		allowDuplicates: !!allowDuplicates,
		elements:	[]
	};
	PlentyFunctions.push(plentyFunction);
	
	return plentyFunction;
};
	
(function($) {
	
	// Search for defined elements and bind attached functions 
	$.fn.bindPlentyFunctions = function( functionName ) {
		var self = this;
		
		$.each( PlentyFunctions, function(i, plentyFunction)  {
			
			var elements = [];
			// filter elements already binded
			$(plentyFunction.selector).each(function(j, obj) {
				//if( !$(this).context.plentyFunctions ) $(this).context.plentyFunctions = [];
				if( $.inArray( $(obj)[0], plentyFunction.elements ) < 0 ) {
					elements.push( $(obj) );
				}
			});
			
			if( !functionName || functionName === plentyFunction.selector || $.inArray(plentyFunction.selector, functionName ) >= 0 ) {
				plentyFunction.callback( elements );
			}
						
			$(elements).each(function(j, obj) {
				// store function ID to avoid duplicate bindings
				if( !plentyFunction.allowDuplicates ) {
					plentyFunction.elements.push( $(obj)[0] );
					//$(this).context.plentyFunctions.push(plentyFunction.id);
				}
			});
		});
	};
	
	// Initially binding of PlentyFunctions
	$(document).ready(function() {
		$('body').bindPlentyFunctions();	
	});
	
}(jQuery));