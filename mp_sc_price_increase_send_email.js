/**
 * Module Description
 * 
 * NSVersion    Date            		Author         
 * 1.00       	2018-04-06 10:55:12   		Ankith 
 *
 * Remarks: Send email out to customers for price increase         
 * 
 * @Last Modified by:   ankit
 * @Last Modified time: 2020-10-14 12:48:45
 *
 */

var dateEffective;

function schedulePriceIncreaseEmail() {

	var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_scheduled_servicechg_email');

	var resultSet_service_change = searched_service_change.runSearch();

	var oldCustomerID = null;
	var count = 0;
	var scheduledCommReg = [];
	var activeCommReg = [];
	var oldDateEffective = null;

	var price_difference = 0.0

	var service_table_header = '<table width="500" border="1"><thead><tr><th>SERVICE</th><th>AMOUNT OF INCREASE(Exc. GST)</th></tr></thead><tbody>';

	var service_rows = '';

	var service_table_footer = '</tbody></table>';

	var service_table = '';

	var serviceChangeCommReg;

	resultSet_service_change.forEachResult(function(searchResult_service_change) {


		nlapiLogExecution('DEBUG', 'count', count);

		var freqArray = [];

		var serviceChangeID = searchResult_service_change.getValue('internalid');
		var customerID = searchResult_service_change.getValue("custrecord_service_customer", "CUSTRECORD_SERVICECHG_SERVICE", null);
		var servieChangeStatus = searchResult_service_change.getValue('custrecord_servicechg_status');
		var serviceChangeDateEffective = searchResult_service_change.getValue('custrecord_servicechg_date_effective');
		var serviceChangeNewPrice = parseFloat(searchResult_service_change.getValue('custrecord_servicechg_new_price'));
		var servicePrice = searchResult_service_change.getValue("custrecord_service_price", "CUSTRECORD_SERVICECHG_SERVICE", null);
		var serviceChangeNewFreq = searchResult_service_change.getValue('custrecord_servicechg_new_freq');
		var serviceChangeService = searchResult_service_change.getValue('custrecord_servicechg_service');
		var serviceChangeServiceText = searchResult_service_change.getText('custrecord_servicechg_service');
		var serviceChangeDefault = searchResult_service_change.getValue('custrecord_default_servicechg_record');
		serviceChangeCommReg = searchResult_service_change.getValue('custrecord_servicechg_comm_reg');
		var NSItem = searchResult_service_change.getText("custrecord_service_ns_item", "CUSTRECORD_SERVICECHG_SERVICE", null);


		if (count == 0) {

			price_difference = serviceChangeNewPrice - servicePrice;
			service_table += service_table_header;
			service_rows += '<tr><th>' + NSItem + '</th><th>$' + price_difference + '</th></tr>';
			service_table += service_rows;
			price_difference = 0.0;

			service_rows = '';

			nlapiLogExecution('DEBUG', 'service_table', service_table);

			var serviceChangeRecord = nlapiLoadRecord('customrecord_servicechg', serviceChangeID);
			serviceChangeRecord.setFieldValue('custrecord_servicechg_date_emailed', getDate());
			nlapiSubmitRecord(serviceChangeRecord);

		} else {
			if (oldCustomerID != customerID || oldDateEffective != serviceChangeDateEffective) {

				service_table += service_table_footer;

				nlapiLogExecution('DEBUG', 'service_table', service_table);

				var emailMerger = nlapiCreateEmailMerger(178);

				var recCustomer = nlapiLoadRecord('customer', oldCustomerID);
				var account_email = recCustomer.getFieldValue('email');
				// var postaladdress = '';
				// var siteaddress = '';
				// var siteaddressfull = '';
				var billaddressfull = '';
				var unit = '';
				var street_address = '';
				var city = '';
				var state = '';
				var postcode = '';


				for (p = 1; p <= recCustomer.getLineItemCount('addressbook'); p++) {
					// if (isNullorEmpty(postaladdress) && recCustomer.getLineItemValue('addressbook', 'isresidential', p) == "T") {
					// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr1', p))) {
					// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'addr1', p) + '\n';

					// 	}
					// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr2', p))) {
					// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'addr2', p) + '\n';

					// 	}
					// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'city', p))) {
					// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'city', p) + ' ';

					// 	}
					// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'state', p))) {
					// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'state', p) + ' ';
					// 	}
					// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'zip', p))) {
					// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'zip', p);
					// 	}
					// }
					if (isNullorEmpty(billaddressfull) && recCustomer.getLineItemValue('addressbook', 'defaultbilling', p) == "T") {
						if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr1', p))) {
							billaddressfull += recCustomer.getLineItemValue('addressbook', 'addr1', p) + '\n';
							unit = recCustomer.getLineItemValue('addressbook', 'addr1', p);
						}
						if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr2', p))) {
							billaddressfull += recCustomer.getLineItemValue('addressbook', 'addr2', p) + '\n';
							street_address = recCustomer.getLineItemValue('addressbook', 'addr2', p)
						}
						if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'city', p))) {
							billaddressfull += recCustomer.getLineItemValue('addressbook', 'city', p) + ' ';
							city = recCustomer.getLineItemValue('addressbook', 'city', p);
						}
						if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'state', p))) {
							billaddressfull += recCustomer.getLineItemValue('addressbook', 'state', p) + ' ';
							state = recCustomer.getLineItemValue('addressbook', 'state', p)
						}
						if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'zip', p))) {
							billaddressfull += recCustomer.getLineItemValue('addressbook', 'zip', p);
							postcode = recCustomer.getLineItemValue('addressbook', 'zip', p);
						}
					}
				}

				// var emp_rec = nlapiLoadRecord('employee', nlapiGetUser());
				// var sales_rep_email = emp_rec.getFieldValue('email');

				emailMerger.setEntity('customer', oldCustomerID);

				var mergeResult = emailMerger.merge();

				var subject = mergeResult.getSubject();
				var message = mergeResult.getBody();


				nlapiLogExecution('DEBUG', 'service_table', service_table);
				nlapiLogExecution('DEBUG', 'getDate()', getDate());
				nlapiLogExecution('DEBUG', 'unit', unit);
				nlapiLogExecution('DEBUG', 'street_address', street_address);
				nlapiLogExecution('DEBUG', 'city', city);
				nlapiLogExecution('DEBUG', 'state', state);
				nlapiLogExecution('DEBUG', 'postcode', postcode);
				nlapiLogExecution('DEBUG', 'oldDateEffective', oldDateEffective);

				message = message.replace(/<NLEMSERVICETABLE>/gi, service_table);
				message = message.replace(/<NLEMDATE>/gi, getDate());
				message = message.replace(/<NLEMUNIT>/gi, unit);
				message = message.replace(/<NLEMSTREETADDRESS>/gi, street_address);
				message = message.replace(/<NLEMCITY>/gi, city);
				message = message.replace(/<NLEMSTATE>/gi, state);
				message = message.replace(/<NLEMPOSTCODE>/gi, postcode);
				message = message.replace(/<NLEMDATEEFFECTIVE>/gi, oldDateEffective);

				var records = new Object();
				records['entity'] = oldCustomerID;

				nlapiSendEmail(280700, account_email, subject, message, null, null, records, null);


				service_rows = '';
				service_table = '';

				price_difference = serviceChangeNewPrice - servicePrice;
				service_table += service_table_header;
				service_rows += '<tr><th>' + NSItem + '</th><th>$' + price_difference + '</th></tr>';
				service_table += service_rows;
				price_difference = 0.0;

				service_rows = '';

				var serviceChangeRecord = nlapiLoadRecord('customrecord_servicechg', serviceChangeID);
				serviceChangeRecord.setFieldValue('custrecord_servicechg_date_emailed', getDate());
				nlapiSubmitRecord(serviceChangeRecord);

			} else {
				price_difference = serviceChangeNewPrice - servicePrice;
				service_rows += '<tr><th>' + NSItem + '</th><th>$' + price_difference + '</th></tr>';
				service_table += service_rows;
				price_difference = 0.0;

				service_rows = '';

				nlapiLogExecution('DEBUG', 'service_table', service_table);

				var serviceChangeRecord = nlapiLoadRecord('customrecord_servicechg', serviceChangeID);
				serviceChangeRecord.setFieldValue('custrecord_servicechg_date_emailed', getDate());
				nlapiSubmitRecord(serviceChangeRecord);

			}
		}

		oldCustomerID = customerID;
		oldDateEffective = serviceChangeDateEffective;
		count++;
		return true;
	});

	if (count > 0) {
		service_table += service_table_footer;

		nlapiLogExecution('DEBUG', 'service_table', service_table);

		var emailMerger = nlapiCreateEmailMerger(178);

		var recCustomer = nlapiLoadRecord('customer', oldCustomerID);
		var account_email = recCustomer.getFieldValue('email');
		var postaladdress = '';
		var siteaddress = '';
		var siteaddressfull = '';
		var billaddressfull = '';
		var unit = '';
		var street_address = '';
		var city = '';
		var state = '';
		var postcode = '';


		for (p = 1; p <= recCustomer.getLineItemCount('addressbook'); p++) {
			// if (isNullorEmpty(postaladdress) && recCustomer.getLineItemValue('addressbook', 'isresidential', p) == "T") {
			// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr1', p))) {
			// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'addr1', p) + '\n';

			// 	}
			// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr2', p))) {
			// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'addr2', p) + '\n';

			// 	}
			// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'city', p))) {
			// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'city', p) + ' ';

			// 	}
			// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'state', p))) {
			// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'state', p) + ' ';
			// 	}
			// 	if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'zip', p))) {
			// 		postaladdress += recCustomer.getLineItemValue('addressbook', 'zip', p);
			// 	}
			// }
			if (isNullorEmpty(billaddressfull) && recCustomer.getLineItemValue('addressbook', 'defaultbilling', p) == "T") {
				if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr1', p))) {
					billaddressfull += recCustomer.getLineItemValue('addressbook', 'addr1', p) + '\n';
					unit = recCustomer.getLineItemValue('addressbook', 'addr1', p);
				}
				if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'addr2', p))) {
					billaddressfull += recCustomer.getLineItemValue('addressbook', 'addr2', p) + '\n';
					street_address = recCustomer.getLineItemValue('addressbook', 'addr2', p)
				}
				if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'city', p))) {
					billaddressfull += recCustomer.getLineItemValue('addressbook', 'city', p) + ' ';
					city = recCustomer.getLineItemValue('addressbook', 'city', p);
				}
				if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'state', p))) {
					billaddressfull += recCustomer.getLineItemValue('addressbook', 'state', p) + ' ';
					state = recCustomer.getLineItemValue('addressbook', 'state', p)
				}
				if (!isNullorEmpty(recCustomer.getLineItemValue('addressbook', 'zip', p))) {
					billaddressfull += recCustomer.getLineItemValue('addressbook', 'zip', p);
					postcode = recCustomer.getLineItemValue('addressbook', 'zip', p);
				}
			}
		}

		// var emp_rec = nlapiLoadRecord('employee', nlapiGetUser());
		// var sales_rep_email = emp_rec.getFieldValue('email');

		emailMerger.setEntity('customer', oldCustomerID);

		var mergeResult = emailMerger.merge();   

		var subject = mergeResult.getSubject();
		var message = mergeResult.getBody();

		nlapiLogExecution('DEBUG', 'service_table', service_table);
		nlapiLogExecution('DEBUG', 'getDate()', getDate());
		nlapiLogExecution('DEBUG', 'unit', unit);
		nlapiLogExecution('DEBUG', 'street_address', street_address);
		nlapiLogExecution('DEBUG', 'city', city);
		nlapiLogExecution('DEBUG', 'state', state);
		nlapiLogExecution('DEBUG', 'postcode', postcode);
		nlapiLogExecution('DEBUG', 'oldDateEffective', oldDateEffective);

		message = message.replace(/<NLEMSERVICETABLE>/gi, service_table);
		message = message.replace(/<NLEMDATE>/gi, getDate());
		message = message.replace(/<NLEMUNIT>/gi, unit);
		message = message.replace(/<NLEMSTREETADDRESS>/gi, street_address);
		message = message.replace(/<NLEMCITY>/gi, city);
		message = message.replace(/<NLEMSTATE>/gi, state);
		message = message.replace(/<NLEMPOSTCODE>/gi, postcode);
		message = message.replace(/<NLEMDATEEFFECTIVE>/gi, oldDateEffective);

		var records = new Object();
		records['entity'] = oldCustomerID;

		nlapiSendEmail(35031, account_email, subject, message, null, null, records, null);

	}
}

function getTomorrowDate() {
	var tomorrow = new Date();
	if (tomorrow.getHours() > 6) {
		tomorrow = nlapiAddDays(tomorrow, 1);
	}
	tomorrow.setDate(tomorrow.getDate() + 1);

	return nlapiDateToString(tomorrow);
}


function getDate() {
	var date = new Date();
	if (date.getHours() > 6) {
		date = nlapiAddDays(date, 1);
	}
	date = nlapiDateToString(date);
	return date;
}