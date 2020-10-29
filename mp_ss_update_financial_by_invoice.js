/**
 * Module Description
 * 
 * NSVersion    Date            		Author         
 * 1.00       	2018-29-10 10:42   	Ravija Maheshwari
 *
 * Remarks: A scheduled script to update customer's financial tab based on the invoice price
 * 
 * @Last Modified by:   Ravija
 * @Last Modified time: 10:42
 *
 */

//H2H -> 20 to 44
//Pick up and delivery from PO -> 8 to 9

var indexInCallback = 0;
var ctx = nlapiGetContext();

function scheduleFinancialUpdate() {

	//Index to control the rescheduling of SS
	var mainIndex = parseInt(ctx.getSetting('SCRIPT', 'custscript_main_index'));
	
	if(isNaN(mainIndex)){
		mainIndex = 0;
	}

	//Load search AUDIT - SMC - Invoice Price vs Financial Tab
	var invoicePrice = nlapiLoadSearch('customer', 'customsearch3485'); 
	var resultSet = invoicePrice.runSearch().getResults(mainIndex, mainIndex + 1000);

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
			
            var customerId = item.getId();
            nlapiLogExecution('DEBUG', "Customer", customerId);
            var newPrice = item.getValue('rate', 'transaction', null);
            nlapiLogExecution('DEBUG', "new price", newPrice);
            var itemID = item.getValue('item', 'transaction', null);
            nlapiLogExecution('DEBUG', "item ID to change", itemID);
			updateFinancialTab(customerId, newPrice, itemID);
		}
	});

	//To ensure nothing was missed
	var will_reschedule = (indexInCallback < 999) ? false : true;
	if (will_reschedule) {
		// If the script will be rescheduled, we look for the element 999 of the loop to see if it is empty or not.
		var resultSet = invoicePrice.runSearch().getResults(main_index + index_in_callback, main_index + index_in_callback + 1);
	} else {
		// If the script will not be rescheduled, we make sure we didn't miss any results in the search.
		var resultSet = invoicePrice.runSearch().getResults(main_index + index_in_callback + 1, main_index + index_in_callback + 2);
    }
}


function updateFinancialTab(customerID, newPrice, itemID){
	nlapiLogExecution('DEBUG', 'Update financial tab', '');	
    //Load up the customer record
	var customerRec = nlapiLoadRecord('customer', customerID);
	
	for(var i = 1; i <= customerRec.getLineItemCount('itempricing'); i++){
		if(itemID ==  customerRec.getLineItemValue('itempricing', 'item', i)){
			//Line item exists in customer record - update price
			customerRec.setLineItemValue('itempricing', 'price', i , newPrice);
            nlapiSubmitRecord(customerRec);
            break;
		}
    }
}
