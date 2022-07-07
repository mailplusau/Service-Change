/**
 * Module Description
 * 
 * NSVersion    Date            		Author         
 * 1.00       	2018-29-10 10:42   	Ravija Maheshwari
 *
 * Remarks: 
 * 
 * @Last Modified by:   Anesu
 * @Last Modified time: 11:07
 *
 */

var indexInCallback = 0;
var ctx = nlapiGetContext();

function scheduleFinancialUpdate() { 

	//Index to control the rescheduling of SS
	var mainIndex = parseInt(ctx.getSetting('SCRIPT', 'custscript_comm_vs_fin_main_index'));
	
	if(isNaN(mainIndex)){
		mainIndex = 0;
	}

	//Load search - Customers Commenced (November 1st, 2020)
	var commencedCustomers = nlapiLoadSearch('customer', 'customsearch_comm_vs_fin_price'); // customsearch3500 
	var resultSet = commencedCustomers.runSearch().getResults(mainIndex, mainIndex + 10);

	resultSet.forEach(function(customer, index) {
		indexInCallback = index;
		var usageLimit = ctx.getRemainingUsage();

		if(usageLimit < 500 || index == 999){
			// Reschedule script
			params = {
				custscript_comm_vs_fin_main_index : mainIndex + index
			};

			reschedule = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
			if(reschedule == false){
				nlapiLogExecution('DEBUG', 'Rescheduling Completed', reschedule);
				return false;
			}
		}else{
            var commId = customer.getValue('internalid', "CUSTRECORD_CUSTOMER", null);
            var customerId = customer.getId();
			nlapiLogExecution('DEBUG', "Customer", customerId);


			//Search for all service change records within a commencement record
            var filters = new Array();
            filters[0] = new nlobjSearchFilter('custrecord_servicechg_comm_reg', null, 'is', commId);
            
            var cols = new Array();
            cols[0] = new nlobjSearchColumn('id')
            cols[1] = new nlobjSearchColumn('custrecord_servicechg_service');
            cols[2] = new nlobjSearchColumn('custrecord_servicechg_status');
			cols[3] = new nlobjSearchColumn('custrecord_servicechg_new_price');
			cols[4] = new nlobjSearchColumn('custrecord_servicechg_old_price');
            
			var commencedServices = nlapiSearchRecord('customrecord_servicechg', null, filters, cols);
			
			//Store all 'custrecord_service_ns_item' in a separate array
			var nsItemIds = new Array();
			var nsItemIndex = 0;
			commencedServices.forEach(function(service){
				var serviceRecordId = service.getValue('custrecord_servicechg_service');
				var serviceRecord = nlapiLoadRecord('customrecord_service', serviceRecordId);
				nsItemIds[nsItemIndex] = serviceRecord.getFieldValue('custrecord_service_ns_item');
				nsItemIndex++;
			});

			nlapiLogExecution('DEBUG', 'service change record ns items array', nsItemIds);

			
            commencedServices.forEach(function(service) {
                var newCommPrice = parseFloat(service.getValue('custrecord_servicechg_new_price'));
                var serviceStatus = service.getValue('custrecord_servicechg_status'); //should be 2 i.e Active
				var serviceRecordId = service.getValue('custrecord_servicechg_service');
				var serviceOldPrice = parseFloat(service.getValue('custrecord_servicechg_old_price'));

                var serviceRecord = nlapiLoadRecord('customrecord_service', serviceRecordId);
				var itemId = serviceRecord.getFieldValue('custrecord_service_ns_item');

				var customerRec = nlapiLoadRecord('customer', customerId);

				
				if(hasDuplicates(nsItemIds, itemId)){
					nlapiLogExecution('DEBUG', 'Has duplicate - itemId ', itemId);
					//Get the string service name form itemID
					var serviceItemRec = nlapiLoadRecord('serviceitem', itemId);
					var itemServiceName = serviceItemRec.getFieldValue('itemid');
					// nlapiLogExecution('DEBUG', 'itemServiceName', itemServiceName);
					
					//For each financial item, check the itemServiceName and the old price
					for(var i = 1; i <= customerRec.getLineItemCount('itempricing'); i++){
						var nsItem = customerRec.getLineItemValue('itempricing', 'item', i)
						var nsRec =  nlapiLoadRecord('serviceitem', nsItem);
						var nsName = nsRec.getFieldValue('itemid');
						var price = parseFloat(customerRec.getLineItemValue('itempricing', 'price', i)); 
						// nlapiLogExecution('DEBUG', 'serviceOldPRice', serviceOldPrice);
						// nlapiLogExecution('DEBUG', 'financial price', price);
						
						if(price == serviceOldPrice && nsName.indexOf(itemServiceName) != -1){
							//update
							nlapiLogExecution('DEBUG', '(DUP) Updated to price ' , newCommPrice);
							customerRec.setLineItemValue('itempricing', 'price', i , newCommPrice);
							nlapiSubmitRecord(customerRec);
							break;
						}
					}
				}else{
					//If there are no duplicates of itemId in nsItemids array
					//Match on itemID
					for(var i = 1; i <= customerRec.getLineItemCount('itempricing'); i++){
						if(itemId ==  customerRec.getLineItemValue('itempricing', 'item', i)){
							var price =  parseFloat(customerRec.getLineItemValue('itempricing', 'price', i));
							//There couldbe two services with the same item Id
							if(price != newCommPrice) {
								// nlapiLogExecution('DEBUG', 'Updating item price', itemId);
								nlapiLogExecution('DEBUG', 'Updated to price' , newCommPrice);
								// update price
								customerRec.setLineItemValue('itempricing', 'price', i , newCommPrice);
								nlapiSubmitRecord(customerRec);
								break;
							}
						}
					}
				}

              
            });
		}
	});

	//To ensure nothing was missed
	var will_reschedule = (indexInCallback < 999) ? false : true;
	if (will_reschedule) {
		// If the script will be rescheduled, we look for the element 999 of the loop to see if it is empty or not.
		var resultSet = commencedCustomers.runSearch().getResults(mainIndex + indexInCallback, mainIndex + indexInCallback + 1);
	} else {
		// If the script will not be rescheduled, we make sure we didn't miss any results in the search.
		var resultSet = commencedCustomers.runSearch().getResults(mainIndex + indexInCallback + 1, mainIndex + indexInCallback + 2);
    }
}


function hasDuplicates(array, value){
	var count = 0;
	for(var i = 0; i < array.length; i++){
		if(array[i] == value){
			count++;
		}
	}

	if(count > 1){
		return true;
	}else{
		return false
	}
}