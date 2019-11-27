var usage_threshold = 30; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;

var ctx = nlapiGetContext();

function createServiceChange() {

	if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_prev_deployment'))) {
		prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_prev_deployment');
	} else {
		prev_inv_deploy = ctx.getDeploymentId();
	}


	var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_smc_services_2');

	var resultSetService = serviceSearch.runSearch();


	resultSetService.forEachResult(function(searchResultService) {

		if (ctx.getRemainingUsage() <= usage_threshold_invoice) {
			var params = {
				custscript_prev_deployment_serv_chg: ctx.getDeploymentId(),
			}

			var reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
		}

		var serviceID = searchResultService.getValue('internalid');
		var serviceTypeText = searchResultService.getText("internalid", "CUSTRECORD_SERVICE", null);
		var serviceType = searchResultService.getValue("internalid", "CUSTRECORD_SERVICE", null);
		var serviceDescp = searchResultService.getValue('custrecord_service_description');
		var servicePrice = searchResultService.getValue('custrecord_service_price');
		var partner = searchResultService.getValue('custrecord_service_franchisee');

		var freqMon = searchResultService.getValue('custrecord_service_day_mon');
		var freqTue = searchResultService.getValue('custrecord_service_day_tue');
		var freqWed = searchResultService.getValue('custrecord_service_day_wed');
		var freqThu = searchResultService.getValue('custrecord_service_day_thu');
		var freqFri = searchResultService.getValue('custrecord_service_day_fri');
		var freqAdhoc = searchResultService.getValue('custrecord_service_day_adhoc');
		var customerID = searchResultService.getValue('custrecord_service_customer');

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
				nlapiCreateError('More than 1 Active CommReg', 'Customer ID: ' + customerID);
				return false;
			}
			return true;
		});

		if (count_commReg == 0) {
			var partnerRec = nlapiLoadRecord('partner', partner);
			var state = partnerRec.getFieldValue('location');
			nlapiLogExecution('DEBUG', 'customerID', customerID);
			commRegID = createCommReg(customerID, getDate(), partner, state, 'T');
		}

		var searchedServiceChange = nlapiLoadSearch('customrecord_servicechg', 'customsearch_active_servicechg_records');

		var newFiltersServiceChange = new Array();
		newFiltersServiceChange[newFiltersServiceChange.length] = new nlobjSearchFilter('custrecord_servicechg_service', null, 'is', serviceID);

		searchedServiceChange.addFilters(newFiltersServiceChange);

		var resultSetServiceChange = searchedServiceChange.runSearch();

		var serviceChangeResult = resultSetServiceChange.getResults(0, 1);

		if (serviceChangeResult.length == 0) {
			var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');

			if (!isNullorEmpty(serviceID)) {
				new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', getDate());
				new_service_change_record.setFieldValue('custrecord_servicechg_service', serviceID);
				new_service_change_record.setFieldValue('custrecord_servicechg_status', 2);
				new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', partner);
				new_service_change_record.setFieldValue('custrecord_servicechg_new_price', servicePrice);

				var freqArray = [];

				if (freqMon == 'T') {
					freqArray[freqArray.length] = 1
				}
				if (freqTue == 'T') {
					freqArray[freqArray.length] = 2
				}
				if (freqWed == 'T') {
					freqArray[freqArray.length] = 3
				}
				if (freqThu == 'T') {
					freqArray[freqArray.length] = 4
				}
				if (freqFri == 'T') {
					freqArray[freqArray.length] = 5
				}
				if (freqAdhoc == 'T') {
					freqArray[freqArray.length] = 6
				}

				new_service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);

				new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);

				new_service_change_record.setFieldValue('custrecord_servicechg_type', 'Initial Price');
				nlapiSubmitRecord(new_service_change_record);

			}

		}

		return true;
	});
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
	customer_comm_reg = nlapiCreateRecord('customrecord_commencement_register');
	customer_comm_reg.setFieldValue('custrecord_date_entry', getDate());
	customer_comm_reg.setFieldValue('custrecord_comm_date', dateEffective);
	customer_comm_reg.setFieldValue('custrecord_comm_date_signup', dateEffective);
	customer_comm_reg.setFieldValue('custrecord_customer', customer);
	if (sendemail == 'T') {
		customer_comm_reg.setFieldValue('custrecord_salesrep', 109783);
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
		// customer_comm_reg.setFieldValue('custrecord_commreg_sales_record', parseInt(nlapiGetFieldValue('custpage_salesrecordid')));

	} else {
		customer_comm_reg.setFieldValue('custrecord_trial_status', 9);
	}; // Price Increase
	customer_comm_reg.setFieldValue('custrecord_sale_type', 10)
	var commRegID = nlapiSubmitRecord(customer_comm_reg);

	return commRegID;
}

function loadCommReg(id, dateEffective) {
	customer_comm_reg = nlapiLoadRecord('customrecord_commencement_register', id);
	customer_comm_reg.setFieldValue('custrecord_date_entry', getDate());
	customer_comm_reg.setFieldValue('custrecord_comm_date', dateEffective);
	customer_comm_reg.setFieldValue('custrecord_comm_date_signup', dateEffective);
	var commRegID = nlapiSubmitRecord(customer_comm_reg);

	return commRegID;
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