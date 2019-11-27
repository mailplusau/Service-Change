/**
 * Module Description
 * 
 * NSVersion    Date            		Author         
 * 1.00       	2018-04-06 10:55:12   		Ankith 
 *
 * Remarks:         
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2019-11-27 10:09:13
 *
 */

var dateEffective;

function scheduleServiceChange() {

	var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_scheduled_servicechg_record');

	var resultSet_service_change = searched_service_change.runSearch();

	var oldCommReg = null;
	var count = 0;
	var scheduledCommReg = [];
	var activeCommReg = [];

	var old_can_date = null;
	var old_can_reason = null;
	var old_can_notice = null;
	var old_can_comp = null;

	var serviceChangeCommReg;

	resultSet_service_change.forEachResult(function(searchResult_service_change) {


		nlapiLogExecution('DEBUG', 'count', count);

		var freqArray = [];

		var serviceChangeID = searchResult_service_change.getValue('internalid');
		var servieChangeStatus = searchResult_service_change.getValue('custrecord_servicechg_status');
		var serviceChangeDateEffective = searchResult_service_change.getValue('custrecord_servicechg_date_effective');
		var serviceChangeNewPrice = searchResult_service_change.getValue('custrecord_servicechg_new_price');
		var serviceChangeNewFreq = searchResult_service_change.getValue('custrecord_servicechg_new_freq');
		var serviceChangeService = searchResult_service_change.getValue('custrecord_servicechg_service');
		var serviceChangeDefault = searchResult_service_change.getValue('custrecord_default_servicechg_record');
		serviceChangeCommReg = searchResult_service_change.getValue('custrecord_servicechg_comm_reg');
		var serviceChangeCanDate = searchResult_service_change.getValue('custrecord_servicechg_cancellation_date');
		var serviceChangeCanReason = searchResult_service_change.getValue('custrecord_servicechg_cancellation_reas');
		var serviceChangeCanNotice = searchResult_service_change.getValue('custrecord_servicechg_cancellation_not');
		var serviceChangeCanComp = searchResult_service_change.getValue('custrecord_servicechg_cancellation_comp');
		var customerID = searchResult_service_change.getValue("custrecord_service_customer", "CUSTRECORD_SERVICECHG_SERVICE", null);

		var serviceZee = searchResult_service_change.getValue("custrecord_service_franchisee", "CUSTRECORD_SERVICECHG_SERVICE", null);
		var servicePrice = searchResult_service_change.getValue("custrecord_service_price", "CUSTRECORD_SERVICECHG_SERVICE", null);

		nlapiLogExecution('DEBUG', 'serviceChangeCanDate', serviceChangeCanDate);
		nlapiLogExecution('DEBUG', 'oldCommReg', oldCommReg);
		nlapiLogExecution('DEBUG', 'serviceChangeCommReg', serviceChangeCommReg);

		if (oldCommReg != serviceChangeCommReg) {


			var unique_scheduledCommReg = [];
			var unique_activeCommReg = [];

			if (!isNullorEmpty(oldCommReg)) {
				unique_scheduledCommReg = scheduledCommReg.filter(function(elem, index, self) {
					return index == self.indexOf(elem);
				});



				unique_activeCommReg = activeCommReg.filter(function(elem, index, self) {
					return index == self.indexOf(elem);
				});


				if (unique_scheduledCommReg.length == 1) {

					var searched_active_commreg = nlapiLoadSearch('customrecord_commencement_register', 'customsearch_smc_commreg_active');

					var newFilters = new Array();
					if (!isNullorEmpty(unique_activeCommReg)) {
						newFilters[newFilters.length] = new nlobjSearchFilter('internalid', null, 'anyof', unique_activeCommReg);

						searched_active_commreg.addFilters(newFilters);
					}

					var resultSet_active_commreg = searched_active_commreg.runSearch();

					var activeCommRegResult = resultSet_active_commreg.getResults(0, 2);

					if (activeCommRegResult.length > 1) {

					} else {

						if (isNullorEmpty(old_can_date)) {
							if (!isNullorEmpty(unique_activeCommReg)) {
								for (var y = 0; y < unique_activeCommReg.length; y++) {

									updateCommReg(unique_activeCommReg[y], 7);
								}
							}
							updateCommReg(unique_scheduledCommReg[0], 2);
						} else {
							updateCommReg(unique_scheduledCommReg[0], 3);
						}
					}
				} else {
					//THROW ERROR
				}
			}
			scheduledCommReg = [];
			activeCommReg = [];
		}

		if (serviceChangeDefault == '1') {

			updateCurrentServiceChangeRecord(serviceChangeID, 2, null, null, null, null);
			updateCurrentServiceRecord(serviceChangeService)
			scheduledCommReg[scheduledCommReg.length] = serviceChangeCommReg;

			var commReg_search = nlapiLoadSearch('customrecord_commencement_register', 'customsearch_service_commreg_assign');
			var commReg_filter = new Array();
			commReg_filter[commReg_filter.length] = new nlobjSearchFilter('custrecord_customer', null, 'anyof', customerID);
			commReg_filter[commReg_filter.length] = new nlobjSearchFilter('custrecord_trial_status', null, 'is', 2);
			commReg_search.addFilters(commReg_filter);

			var comm_reg_results = commReg_search.runSearch();

			var count_commReg = 0;
			var commRegID = null;

			comm_reg_results.forEachResult(function(searchResult) {
				count_commReg++;

				/**
				 * [if description] - Only the latest comm Reg needs to be assigned
				 */
				if (count_commReg == 1) {
					commRegID = searchResult.getValue('internalid');
				}

				/**
				 * [if description] - if more than one Comm Reg, error mail is sent
				 */
				if (count_commReg > 1) {
					//WS Comment: Needs error
					nlapiCreateError('More than 1 Active CommReg', 'Customer ID: ' + customer_id);
					return false;
				}
				return true;
			});

			activeCommReg[activeCommReg.length] = commRegID;

		} else {
			var searched_service_change_2 = nlapiLoadSearch('customrecord_servicechg', 'customsearch_active_servicechg_records');

			var newFilters_2 = new Array();
			newFilters_2[newFilters_2.length] = new nlobjSearchFilter('custrecord_servicechg_service', null, 'is', serviceChangeService);

			searched_service_change_2.addFilters(newFilters_2);

			var resultSet_service_change_2 = searched_service_change_2.runSearch();

			var serviceChangeResult_2 = resultSet_service_change_2.getResults(0, 2);

			nlapiLogExecution('DEBUG', 'serviceChangeResult_2.length', serviceChangeResult_2.length)

			if (serviceChangeResult_2.length > 1) {


			} else if (serviceChangeResult_2.length == 1) {

				var serviceChangeID_2 = serviceChangeResult_2[0].getValue('internalid');
				var servieChangeStatus_2 = serviceChangeResult_2[0].getValue('custrecord_servicechg_status');
				var servieChangeCommReg_2 = serviceChangeResult_2[0].getValue('custrecord_servicechg_comm_reg');
				var servieChangeServiceMon_2 = serviceChangeResult_2[0].getValue("custrecord_service_day_mon", "CUSTRECORD_SERVICECHG_SERVICE", null);
				var servieChangeServiceTue_2 = serviceChangeResult_2[0].getValue("custrecord_service_day_tue", "CUSTRECORD_SERVICECHG_SERVICE", null);
				var servieChangeServiceWed_2 = serviceChangeResult_2[0].getValue("custrecord_service_day_wed", "CUSTRECORD_SERVICECHG_SERVICE", null);
				var servieChangeServiceThu_2 = serviceChangeResult_2[0].getValue("custrecord_service_day_thu", "CUSTRECORD_SERVICECHG_SERVICE", null);
				var servieChangeServiceFri_2 = serviceChangeResult_2[0].getValue("custrecord_service_day_fri", "CUSTRECORD_SERVICECHG_SERVICE", null);
				var servieChangeServiceAdhoc_2 = serviceChangeResult_2[0].getValue("custrecord_service_day_adhoc", "CUSTRECORD_SERVICECHG_SERVICE", null);



				if (servieChangeServiceMon_2 == '1') {
					freqArray[freqArray.length] = 1;
				}

				if (servieChangeServiceTue_2 == '1') {
					freqArray[freqArray.length] = 2;
				}
				if (servieChangeServiceWed_2 == '1') {
					freqArray[freqArray.length] = 3;
				}
				if (servieChangeServiceThu_2 == '1') {
					freqArray[freqArray.length] = 4;
				}
				if (servieChangeServiceFri_2 == '1') {
					freqArray[freqArray.length] = 5;
				}
				if (servieChangeServiceAdhoc_2 == '1') {
					freqArray[freqArray.length] = 6;
				}

				if (!isNullorEmpty(serviceChangeCanDate)) {
					nlapiLogExecution('DEBUG', 'Inside');
					inactiveServiceRecord(serviceChangeService);
					updateCurrentServiceChangeRecord(serviceChangeID_2, 3, serviceChangeCanDate, serviceChangeCanReason, serviceChangeCanNotice, serviceChangeCanComp);
					updateScheduledServiceChangeRecord(serviceChangeID, 3, null, null);
				} else {
					var currentServicePrice = updateServiceRecord(serviceChangeService, serviceChangeNewPrice, serviceChangeNewFreq);

					updateCurrentServiceChangeRecord(serviceChangeID_2, 3, null, null, null, null);

					updateScheduledServiceChangeRecord(serviceChangeID, 2, currentServicePrice, freqArray);
				}



				scheduledCommReg[scheduledCommReg.length] = serviceChangeCommReg;
				activeCommReg[activeCommReg.length] = servieChangeCommReg_2;
			} else if (serviceChangeResult_2.length == 0) {
				var currentServicePrice = updateServiceRecord(serviceChangeService, serviceChangeNewPrice, serviceChangeNewFreq);
				updateScheduledServiceChangeRecord(serviceChangeID, 2, currentServicePrice, freqArray);
			}
			// 	var servieChangeServiceAdhoc_2 = serviceChangeResult_2[0].getValue("internalid", "CUSTRECORD_SERVICECHG_SERVICE", null);

			// 	var commReg_search = nlapiLoadSearch('customrecord_commencement_register', 'customsearch_service_commreg_assign');
			// 	var commReg_filter = new Array();
			// 	commReg_filter[commReg_filter.length] = new nlobjSearchFilter('custrecord_customer', null, 'anyof', customerID);
			// 	commReg_filter[commReg_filter.length] = new nlobjSearchFilter('custrecord_trial_status', null, 'is', 2);
			// 	commReg_search.addFilters(commReg_filter);

			// 	var comm_reg_results = commReg_search.runSearch();

			// 	var count_commReg = 0;
			// 	var commRegID = null;

			// 	comm_reg_results.forEachResult(function(searchResult) {
			// 		count_commReg++;

			// 		/**
			// 		 * [if description] - Only the latest comm Reg needs to be assigned
			// 		 */
			// 		if (count_commReg == 1) {
			// 			commRegID = searchResult.getValue('internalid');
			// 		}

			// 		/**
			// 		 * [if description] - if more than one Comm Reg, error mail is sent
			// 		 */
			// 		if (count_commReg > 1) {
			// 			//WS Comment: Needs error
			// 			nlapiCreateError('More than 1 Active CommReg', 'Customer ID: ' + customer_id);
			// 			return false;
			// 		}
			// 		return true;
			// 	});

			// 	if(count_commReg == 0){

			// 	}

			// 	var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');

			// 	if (!isNullorEmpty(serviceChangeService)) {
			// 		new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', getDate());
			// 		new_service_change_record.setFieldValue('custrecord_servicechg_service', serviceChangeService);
			// 		new_service_change_record.setFieldValue('custrecord_servicechg_status', 2);
			// 		new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', serviceZee);
			// 		new_service_change_record.setFieldValue('custrecord_servicechg_new_price', servicePrice);

			// 		if (servieChangeServiceMon_2 == '1') {
			// 			freqArray[freqArray.length] = 1;
			// 		}

			// 		if (servieChangeServiceTue_2 == '1') {
			// 			freqArray[freqArray.length] = 2;
			// 		}
			// 		if (servieChangeServiceWed_2 == '1') {
			// 			freqArray[freqArray.length] = 3;
			// 		}
			// 		if (servieChangeServiceThu_2 == '1') {
			// 			freqArray[freqArray.length] = 4;
			// 		}
			// 		if (servieChangeServiceFri_2 == '1') {
			// 			freqArray[freqArray.length] = 5;
			// 		}
			// 		if (servieChangeServiceAdhoc_2 == '1') {
			// 			freqArray[freqArray.length] = 6;
			// 		}

			// 		new_service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);

			// 		new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);

			// 		new_service_change_record.setFieldValue('custrecord_servicechg_type', 'Initial Price');
			// 		nlapiSubmitRecord(new_service_change_record);

			// 	}

			// }
		}


		oldCommReg = serviceChangeCommReg;
		old_can_date = serviceChangeCanDate;
		old_can_reason = serviceChangeCanReason;
		old_can_notice = serviceChangeCanNotice;
		old_can_comp = serviceChangeCanComp;
		count++;
		return true;
	});



	var unique_scheduledCommReg = [];
	var unique_activeCommReg = [];

	if (!isNullorEmpty(oldCommReg)) {

		nlapiLogExecution('DEBUG', 'scheduledCommReg', scheduledCommReg);
		nlapiLogExecution('DEBUG', 'activeCommReg', activeCommReg);


		unique_scheduledCommReg = scheduledCommReg.filter(function(elem, index, self) {
			return index == self.indexOf(elem);
		});



		unique_activeCommReg = activeCommReg.filter(function(elem, index, self) {
			return index == self.indexOf(elem);
		});

		nlapiLogExecution('DEBUG', 'unique_scheduledCommReg.length', unique_scheduledCommReg.length);

		if (unique_scheduledCommReg.length == 1) {

			if (!isNullorEmpty(unique_activeCommReg)) {
				var searched_active_commreg = nlapiLoadSearch('customrecord_commencement_register', 'customsearch_smc_commreg_active');

				var newFilters = new Array();
				newFilters[newFilters.length] = new nlobjSearchFilter('internalid', null, 'anyof', unique_activeCommReg);

				searched_active_commreg.addFilters(newFilters);

				var resultSet_active_commreg = searched_active_commreg.runSearch();

				var activeCommRegResult = resultSet_active_commreg.getResults(0, 2);

				if (activeCommRegResult.length > 1) {

				} else {

					if (isNullorEmpty(old_can_date)) {
						if (!isNullorEmpty(unique_activeCommReg)) {
							for (var y = 0; y < unique_activeCommReg.length; y++) {

								updateCommReg(unique_activeCommReg[y], 7);
							}
						}
						updateCommReg(unique_scheduledCommReg[0], 2);
					} else {
						updateCommReg(unique_scheduledCommReg[0], 3);
					}
				}
			} else {
				updateCommReg(unique_scheduledCommReg[0], 2);
			}


		} else {
			//THROW ERROR
		}
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

function inactiveServiceRecord(id) {
	try {
		var activeServiceRecord = nlapiLoadRecord('customrecord_service', id);
		activeServiceRecord.setFieldValue('isinactive', 'T');
		nlapiSubmitRecord(activeServiceRecord);
	} catch (e) {
		var message = '';
		message += "Service Internal ID: " + id + "</br>";
		message += "----------------------------------------------------------------------------------</br>";
		message += e;


		nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'Scheduled Service Change: Cannot Update Service Record to Inactive', message, null);
	}
}



function updateServiceRecord(id, price, freq) {

	try {
		var activeServiceRecord = nlapiLoadRecord('customrecord_service', id);
		var currentServicePrice = activeServiceRecord.getFieldValue('custrecord_service_price');

		if (!isNullorEmpty(price)) {
			activeServiceRecord.setFieldValue('custrecord_service_price', price);
		}


		if (freq.indexOf(1) != -1) {
			activeServiceRecord.setFieldValue('custrecord_service_day_mon', 'T');
		} else {
			activeServiceRecord.setFieldValue('custrecord_service_day_mon', 'F');
		}
		if (freq.indexOf(2) != -1) {
			activeServiceRecord.setFieldValue('custrecord_service_day_tue', 'T');
		} else {
			activeServiceRecord.setFieldValue('custrecord_service_day_tue', 'F');
		}
		if (freq.indexOf(3) != -1) {
			activeServiceRecord.setFieldValue('custrecord_service_day_wed', 'T');
		} else {
			activeServiceRecord.setFieldValue('custrecord_service_day_wed', 'F');
		}
		if (freq.indexOf(4) != -1) {
			activeServiceRecord.setFieldValue('custrecord_service_day_thu', 'T');
		} else {
			activeServiceRecord.setFieldValue('custrecord_service_day_thu', 'F');
		}
		if (freq.indexOf(5) != -1) {
			activeServiceRecord.setFieldValue('custrecord_service_day_fri', 'T');
		} else {
			activeServiceRecord.setFieldValue('custrecord_service_day_fri', 'F');
		}
		if (freq.indexOf(6) != -1) {
			activeServiceRecord.setFieldValue('custrecord_service_day_adhoc', 'T');
		} else {
			activeServiceRecord.setFieldValue('custrecord_service_day_adhoc', 'F');
		}

		activeServiceRecord.setFieldValue('custrecord_service_date_last_price_upd', getDate());
		nlapiSubmitRecord(activeServiceRecord);

		return currentServicePrice;
	} catch (e) {

		var message = '';
		message += "Service Internal ID: " + id + "</br>";
		message += "----------------------------------------------------------------------------------</br>";
		message += e;


		nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'Scheduled Service Change: Cannot Update Service Record', message, null);

	}
}

function updateScheduledServiceChangeRecord(id, status, old_price, old_freq) {
	try {
		var scheduledServiceChangeRecord = nlapiLoadRecord('customrecord_servicechg', id);
		scheduledServiceChangeRecord.setFieldValue('custrecord_servicechg_status', status);
		scheduledServiceChangeRecord.setFieldValue('custrecord_servicechg_old_price', old_price);
		scheduledServiceChangeRecord.setFieldValue('custrecord_servicechg_old_freq', old_freq);

		nlapiSubmitRecord(scheduledServiceChangeRecord);
	} catch (e) {

		var message = '';
		message += "Service Change Internal ID: " + id + "</br>";
		message += "----------------------------------------------------------------------------------</br>";
		message += e;


		nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'Scheduled Service Change: Cannot Update Service Change Record with Old Price/Freq', message, null);

	}
}

function updateCurrentServiceChangeRecord(id, status, can_date, can_reason, can_notice, can_comp) {
	try {
		var activeServiceChangeRecord = nlapiLoadRecord('customrecord_servicechg', id);

		activeServiceChangeRecord.setFieldValue('custrecord_servicechg_status', status);

		activeServiceChangeRecord.setFieldValue('custrecord_servicechg_cancellation_date', can_date);
		activeServiceChangeRecord.setFieldValue('custrecord_servicechg_cancellation_reas', can_reason);
		activeServiceChangeRecord.setFieldValue('custrecord_servicechg_cancellation_not', can_notice);
		activeServiceChangeRecord.setFieldValue('custrecord_servicechg_cancellation_comp', can_comp);

		nlapiSubmitRecord(activeServiceChangeRecord);
	} catch (e) {

		var message = '';
		message += "Service Change Internal ID: " + id + "</br>";
		message += "----------------------------------------------------------------------------------</br>";
		message += e;


		nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'Scheduled Service Change: Cannot Update Service Change Record', message, null);

	}
}

function updateCurrentServiceRecord(id) {
	try {
		var serviceRecord = nlapiLoadRecord('customrecord_service', id);
		serviceRecord.setFieldValue('isinactive', 'F');
		nlapiSubmitRecord(serviceRecord);
	} catch (e) {

		var message = '';
		message += "Service ID: " + id + "</br>";
		message += "----------------------------------------------------------------------------------</br>";
		message += e;


		nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'Scheduled Service Change: Cannot Update Service Record to Active', message, null);

	}
}

function updateCommReg(id, status) {

	try {
		var commRegRecord = nlapiLoadRecord('customrecord_commencement_register', id);

		commRegRecord.setFieldValue('custrecord_trial_status', status);

		nlapiSubmitRecord(commRegRecord);
	} catch (e) {

		var message = '';
		message += "Comm Reg Internal ID: " + id + "</br>";
		message += "----------------------------------------------------------------------------------</br>";
		message += e;


		nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'Scheduled Service Change: Cannot Update Comm Reg Status', message, null);

	}

}

function getDate() {
	var date = new Date();
	if (date.getHours() > 6) {
		date = nlapiAddDays(date, 1);
	}
	date = nlapiDateToString(date);
	return date;
}

function GetFormattedDate(stringDate) {

	var todayDate = nlapiStringToDate(stringDate);
	var month = pad(todayDate.getMonth() + 1);
	var day = pad(todayDate.getDate());
	var year = (todayDate.getFullYear());
	return year + "-" + month + "-" + day;
}

function pad(s) {
	return (s < 10) ? '0' + s : s;
}

function dateEffectiveCheck(dateEffective) {

	var date = new Date(dateEffective);

	var today = new Date();

	if (date <= today) {
		return false;
	} else {
		return true;
	}


}

function createCommReg(customer, dateEffective, zee, state, sendemail) {
	try {
		customer_comm_reg = nlapiCreateRecord('customrecord_commencement_register');
		customer_comm_reg.setFieldValue('custrecord_date_entry', getDate());
		customer_comm_reg.setFieldValue('custrecord_comm_date', dateEffective);
		customer_comm_reg.setFieldValue('custrecord_comm_date_signup', dateEffective);
		customer_comm_reg.setFieldValue('custrecord_customer', customer);
		if (sendemail == 'T') {
			customer_comm_reg.setFieldValue('custrecord_salesrep', nlapiGetUser());
		} else {
			customer_comm_reg.setFieldValue('custrecord_salesrep', 109783);
		}
		//Franchisee
		customer_comm_reg.setFieldValue('custrecord_std_equiv', 1);
		customer_comm_reg.setFieldValue('custrecord_franchisee', zee);
		customer_comm_reg.setFieldValue('custrecord_wkly_svcs', '5');
		customer_comm_reg.setFieldValue('custrecord_in_out', 2); // Inbound
		//Scheduled
		customer_comm_reg.setFieldValue('custrecord_state', state);
		if (sendemail == 'T') {
			customer_comm_reg.setFieldValue('custrecord_trial_status', 10);
			customer_comm_reg.setFieldValue('custrecord_commreg_sales_record', parseInt(nlapiGetFieldValue('custpage_salesrecordid')));

		} else {
			customer_comm_reg.setFieldValue('custrecord_trial_status', 9);
		}; // Price Increase
		customer_comm_reg.setFieldValue('custrecord_sale_type', 10)
		var commRegID = nlapiSubmitRecord(customer_comm_reg);

		return commRegID;
	} catch (e) {

		var message = '';
		message += e;


		nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'Scheduled Service Change: Cannot Create Comm Reg', message, null);

	}
}

function loadCommReg(id, dateEffective) {
	try {
		customer_comm_reg = nlapiLoadRecord('customrecord_commencement_register', id);
		customer_comm_reg.setFieldValue('custrecord_date_entry', getDate());
		customer_comm_reg.setFieldValue('custrecord_comm_date', dateEffective);
		customer_comm_reg.setFieldValue('custrecord_comm_date_signup', dateEffective);
		var commRegID = nlapiSubmitRecord(customer_comm_reg);

		return commRegID;
	} catch (e) {

		var message = '';
		message += "Comm Reg Internal ID: " + id + "</br>";
		message += "----------------------------------------------------------------------------------</br>";
		message += e;


		nlapiSendEmail(409635, ['ankith.ravindran@mailplus.com.au'], 'Scheduled Service Change: Cannot Update Comm Reg with DE/Date Sign Up', message, null);

	}
}
/**
 * [getDate description] - Get the current date
 * @return {[String]} [description] - return the string date
 */
function getDate() {
	var date = new Date();
	// if (date.getHours() > 6)
	// {
	//     date = nlapiAddDays(date, 1);
	// }
	date = nlapiDateToString(date);

	return date;
}