/**
 * Module Description
 * 
 * NSVersion    Date            		Author         
 * 1.00       	2018-22-10 10:55:12   	Ravija Maheshwari
 *
 * Remarks: Update customer's financial tab for price increase or decrease of a new service       
 * 
 * @Last Modified by:   Ravija
 * @Last Modified time: 2020-10-22 10:32
 *
 */

var indexInCallback = 0;
var ctx = nlapiGetContext();

function scheduleFinancialUpdate() {

	//Index to control the rescheduling of SS
	var mainIndex = parseInt(ctx.getSetting('SCRIPT', 'custscript_main_index'));
	
	if(isNaN(mainIndex)){
		mainIndex = 0;
	}

	//Search for all all items whose service price and financial prices don't match
	var serviceAndFinancialPrices = nlapiLoadSearch('customer', 'customsearch3462');//customsearch3482 in prod
	var resultSet = serviceAndFinancialPrices.runSearch().getResults(mainIndex, mainIndex + 1000);

	resultSet.forEach(function(item, index) {
		indexInCallback = index;
		var usageLimit = ctx.getRemainingUsage();

		if(usageLimit < 500 || index == 999){
			// Reschedule script
			params = {
				custscript_main_index : mainIndex + index
			};

			reschedule = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
			if(reschedule == false){
				nlapiLogExecution('DEBUG', 'Rescheduling Completed', reschedule);
				return false;
			}
		}else{
			nlapiLogExecution('DEBUG', "Item", item);
			var customerId = item.getId();
			nlapiLogExecution('DEBUG', 'customer id', customerId);
			var newPrice = item.getValue('custrecord_service_price','CUSTRECORD_SERVICE_CUSTOMER', null);
			var serviceId = item.getValue('custrecord_service', 'CUSTRECORD_SERVICE_CUSTOMER', null)
			updateFinancialTab(customerId, newPrice, serviceId);
		}
	});

	//To ensure nothing was missed
	var will_reschedule = (indexInCallback < 999) ? false : true;
	if (will_reschedule) {
		// If the script will be rescheduled, we look for the element 999 of the loop to see if it is empty or not.
		var resultSet = serviceAndFinancialPrices.runSearch().getResults(main_index + index_in_callback, main_index + index_in_callback + 1);
	} else {
		// If the script will not be rescheduled, we make sure we didn't miss any results in the search.
		var resultSet = serviceAndFinancialPrices.runSearch().getResults(main_index + index_in_callback + 1, main_index + index_in_callback + 2);
    }
}


function updateFinancialTab(customerID, newPrice, serviceId){
	nlapiLogExecution('DEBUG', 'Update financial tab', '');	
	//Load up the Service record with serviceId
	var serviceRec = nlapiLoadRecord('customrecord_service_type', serviceId);
	//Get ID of item corresponding to financial tab
	var financialItemID = serviceRec.getFieldValue('custrecord_service_type_ns_item');

	var customerRec = nlapiLoadRecord('customer', customerID);
	
	for(var i = 1; i <= customerRec.getLineItemCount('itempricing'); i++){
		var itemID = customerRec.getLineItemValue('itempricing', 'item', i);
		if(itemID == financialItemID){
			//Line item exists in customer record - update price
			customerRec.setLineItemValue('itempricing', 'price', i , newPrice);
			nlapiSubmitRecord(customerRec);
		}
	}
}