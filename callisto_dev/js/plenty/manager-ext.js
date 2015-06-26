if( typeof Variation !== "undefined" ) {
	Variation.Manager.prototype.setAvailability = function(setAvailability) {
		return function() {
			var valueIdsSelected = [], valueIdsPossible, n, length, key, variationId, availabilityId, availablity;
			
			// get all selected values
			for (n = 0, length = this.history.length; n < length; ++n) {
				valueIdsSelected.push(this.history[n].valueIdSelected);
			}
				
			// convert to sorted string
			valueIdsSelected = valueIdsSelected.sort().toString();
				
			// find corresponding variation
			for (variationId in this.variations) {
				if (!this.variations.hasOwnProperty(variationId)) {
					continue;
				}
					
				// build array of value ids
				valueIdsPossible = [];
				for (key in this.variations[variationId]) {
					if (!this.variations[variationId].hasOwnProperty(key)){
						continue;
					}
					valueIdsPossible.push(key);			
				}
					
				if (valueIdsPossible.sort().toString() === valueIdsSelected) {
					availabilityId = this.availabilities[variationId];
					break;
				}
						
			}
			
			// get selected values for attributes
			var selectedAttributes = [];
			for(attributeId in this.attributes) {
				var currentValue;
				// compare valueId from variation with valueIds of current attribute
				for(valueId in this.variations[variationId]) {
					if( !!this.attributes[attributeId].values[valueId] ) {
						// attribute matches to valueId of selected variation
						currentValue = this.attributes[attributeId].values[valueId];
						
						// store found attribute
						selectedAttributes.push({
							id: parseInt(attributeId),
							name: this.attributes[attributeId].name,
							value: currentValue.name,
							image: currentValue.image
						});
						
						break;
					}
				}
			}
			// get images for current variation
			var variationImages = [];
			// search for images related to valueIds given by current variation
			for(valueId in this.variations[variationId]) {
				if( !!this.images[valueId] ) {
					// store variation images if exists
					for(i=0; i<this.images[valueId].length; i++) {
						variationImages.push( this.images[valueId][i] );
					}		
				}
			}
			
			// get variation number (counter) used in backend
			var variationNumber = 1;
			for(key in this.variations) {
				if(key == variationId) {
					break;
				}
				variationNumber++;
			}
			
			// prepare object to broadcast by event
			var currentVariation = {
				id: parseInt(variationId),
				availabilityId: availabilityId,
				availabilityString: PY.Settings.Item.Availibility[availabilityId].description,
				deliveryString: PY.Settings.Item.Availibility[availabilityId].averageDays,
				availabilityIcon: PY.Settings.Item.Availibility[availabilityId].iconPath,
				item: {
					itemId: this.itemId,
					variationId: variationNumber
				},
				price: this.price,
				uvp: this.uvps[variationId],
				attributes: selectedAttributes,
				images: variationImages,
				manager: this			
			};
			
			$(window).trigger("variationChanged", currentVariation );
			
			// inject method to manager.js
			return setAvailability.apply(this);
		};
	}(Variation.Manager.prototype.setAvailability);
	
	Variation.Presenter.Base.prototype.select = function(select) {
		
		return function(valueId) {
			select.call(this, valueId);
			if(this.Manager.history.length !== this.Manager.numberOfAttributes) {
				$(window).trigger("variationReset");
			}
			return;
		};
		
	}(Variation.Presenter.Base.prototype.select);
}