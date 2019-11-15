/**
 * Module Description
 * 
 * NSVersion    Date            		Author         
 * 1.00       	2017-11-30 11:10:09   		Ankith 
 *
 * Remarks: Add / Edit Service to create corresponding service change records.       
 * 
 * @Last Modified by:   mailplusar
 * @Last Modified time: 2018-05-24 09:09:16
 *
 */

var baseURL = 'https://system.na2.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

function serviceChange(request, response) {
	if (request.getMethod() == "GET") {

		var script_id = null;
		var deploy_id = null;
		var entryParamsString = null;

		if (!isNullorEmpty(request.getParameter('custparam_params'))) {
			var params = request.getParameter('custparam_params');
			params = JSON.parse(params);
			var customer = parseInt(params.custid);
		} else {
			var customer = parseInt(request.getParameter('custid'));
		}

		var recCustomer = nlapiLoadRecord('customer', customer);
		var franchisee = recCustomer.getFieldValue('partner');

		var form = nlapiCreateForm('Service Management for : <a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + customer + '">' + recCustomer.getFieldValue('entityid') + '</a> ' + recCustomer.getFieldValue('companyname'));

		// var commReg_search = nlapiLoadSearch('customrecord_servicechg', 'customsearch_active_service_change');

		// var filterExpression = [
		// 	["custrecord_customer", "anyof", customer], // customer id
		// 	"AND", ["custrecord_franchisee", "is", franchisee] // partner id
		// ];

		// commReg_search.setFilterExpression(filterExpression);

		// var comm_reg_results = commReg_search.runSearch();

		// var count_commReg = 0;
		// var commReg = null;

		// comm_reg_results.forEachResult(function(searchResult) {
		// 	count_commReg++;

		// 	/**
		// 	 * [if description] - Only the latest comm Reg needs to be assigned
		// 	 */
		// 	if (count_commReg == 1) {
		// 		commReg = searchResult.getValue('internalid');
		// 	}

		// 	/**
		// 	 * [if description] - if more than one Comm Reg, error mail is sent
		// 	 */
		// 	if (count_commReg > 1) {
		// 		return false;
		// 	}
		// 	return true;
		// });

		form.addField('custpage_customer_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(customer);
		form.addField('custpage_customer_franchisee', 'text', 'Franchisee ID').setDisplayType('hidden').setDefaultValue(nlapiLookupField('customer', customer, 'partner'));
		// if (!isNullorEmpty(commReg)) {
		// 	form.addField('custpage_customer_comm_reg', 'text', 'Comm Reg ID').setDisplayType('hidden').setDefaultValue(commReg);
		// }

		/**
		 * Description - To get all the services associated with this customer
		 */
		var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_smc_services');

		var newFilters_service = new Array();
		newFilters_service[newFilters_service.length] = new nlobjSearchFilter('custrecord_service_customer', null, 'is', customer);

		serviceSearch.addFilters(newFilters_service);

		var resultSet_service = serviceSearch.runSearch();

		var serviceResult = resultSet_service.getResults(0, 1);

		/**
		 * Description - To add all the API's to the begining of the page
		 */
		var inlineQty = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://system.na2.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

		inlineQty += '<div class="container row ">';
		inlineQty += '<div class="col-md-4 well well-sm" style="background-color: #607799;">';
		inlineQty += '<h5 class="text-center">CURRENT SERVICE DETAILS</h5>';
		inlineQty += '</div>';
		inlineQty += '<div class="col-md-8 well well-sm" style="background-color: #607799;">';
		inlineQty += '<h5 class="text-center">SCHEDULED CHANGES</h5>';
		inlineQty += '</div>';
		inlineQty += '</div>';



		if (serviceResult.length != 0) {
			var new_item_count = 1;
			resultSet_service.forEachResult(function(searchResult_service) {
				inlineQty += '<div class="container row ">';

				inlineQty += '<div class="col-md-4 well">';
				inlineQty += '<div class="input-group form-group"><span class="input-group-addon" id="address1_text">SERVICE NAME</span><input id="service_name" class="form-control service_name" readonly value="' + searchResult_service.getText('custrecord_service') + '" /></div>';
				inlineQty += '<div class="input-group form-group"><span class="input-group-addon" id="address1_text">CURRENT PRICE | $</span><input id="current_price" class="form-control current_price" readonly value="' + searchResult_service.getValue('custrecord_service_price') + '" /></div>';
				inlineQty += '<div class="input-group form-group"><span class="input-group-addon" id="address1_text">ASSOCIATED PACKAGE</span><input id="associated_package" class="form-control associated_package" readonly value="' + searchResult_service.getText('custrecord_service_package') + '" /></div>';
				inlineQty += '<div class="input-group form-group"><span class="input-group-addon" id="address1_text">DESCRIPTION</span><input id="service_descp" class="form-control service_descp" data-serviceid="' + searchResult_service.getValue('internalid') + '" value="' + searchResult_service.getValue('custrecord_service_description') + '" /></div>';
				inlineQty += '</div>';


				var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_smc_service_chg');

				var newFilters = new Array();
				newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_service', null, 'is', searchResult_service.getValue('internalid'));
				newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_status', null, 'noneof', [2, 3]);

				searched_service_change.addFilters(newFilters);

				var resultSet_service_change = searched_service_change.runSearch();

				inlineQty += '<div class="col-md-8 well form-group">';

				inlineQty += '<table class="table table-responsive table-striped customer tablesorter"><thead style="color: white;background-color: #607799;"><tr><th>ACTION</th><th>CHANGE TYPE</th><th>DATE EFFECTIVE</th><th>NEW PRICE</th><th>COMM REG</th><th>FREQUENCY</th><th>SCF</th></tr></thead><tbody>';

				resultSet_service_change.forEachResult(function(searchResult_service_change) {

					inlineQty += '<tr>';

					inlineQty += '<td><button class="btn btn-warning btn-xs edit_class glyphicon glyphicon-pencil" data-dateeffective="' + searchResult_service_change.getValue('custrecord_servicechg_date_effective') + '" data-commreg="' + searchResult_service_change.getValue('custrecord_servicechg_comm_reg') + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button></td>';

					inlineQty += '<td>' + searchResult_service_change.getValue('custrecord_servicechg_type') + '</td>';
					inlineQty += '<td>' + searchResult_service_change.getValue('custrecord_servicechg_date_effective') + '</td>';
					inlineQty += '<td>' + searchResult_service_change.getValue('custrecord_servicechg_new_price') + '</td>';
					inlineQty += '<td>' + searchResult_service_change.getValue('custrecord_servicechg_comm_reg') + '</td>';
					inlineQty += '<td>' + searchResult_service_change.getText('custrecord_servicechg_new_freq') + '</td>';
					var fileID = searchResult_service_change.getValue("custrecord_scand_form", "CUSTRECORD_SERVICECHG_COMM_REG", null);

					if (!isNullorEmpty(fileID)) {
						var fileRecord = nlapiLoadFile(fileID);
						inlineQty += '<td><a href="' + fileRecord.getURL() + '" target="_blank">' + searchResult_service_change.getText("custrecord_scand_form", "CUSTRECORD_SERVICECHG_COMM_REG", null) + '</a></td>';
					} else {
						inlineQty += '<td></td>';
					}


					inlineQty += '</tr>';

					return true;
				});

				// inlineQty += '<tr><td colspan="7" style="text-align: center;"><input type="button" id="create_new" class="form-control btn btn-success btn-xs create_new" value="NEW SCHEDULED CHANGE" data-toggle="tooltip" data-placement="right" title="NEW SCHEDULED CHANGE" /></td></tr>';
				// inlineQty += '<tr><td colspan="7" style="text-align: center;"><input type="button" id="create_new" class="form-control btn btn-danger btn-xs cancel_service" value="CANCEL SERVICE" data-toggle="tooltip" data-serviceid="' + searchResult_service.getValue('internalid') + '" data-placement="right" title="CANCEL SERVICE" /></td></tr>';

				inlineQty += '</tbody></table>';

				inlineQty += '</div>';

				inlineQty += '</div>';
				return true;
			});
		}

		inlineQty += '<div class="form-group container row_button">'
		inlineQty += '<div class="row">';

		inlineQty += '<div class="col-xs-4 schedule_change_section"><input type="button" id="create_new" class="form-control btn btn-success btn-xs create_new" value="NEW SCHEDULED CHANGE" data-toggle="tooltip" data-placement="right" title="NEW SCHEDULED CHANGE" /></div>';
		inlineQty += '<div class="col-xs-4 cancel_service_section"><input type="button" id="create_new" class="form-control btn btn-danger btn-xs cancel_service" value="CANCEL SERVICE" data-toggle="tooltip" data-placement="right" title="CANCEL SERVICE" /></div>';

		inlineQty += '</div>';

		inlineQty += '</div>';

		form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);


		form.addSubmitButton('Submit');
		form.addButton('back', 'Back', 'onclick_back()');
		form.addButton('back', 'Reset', 'onclick_reset()');
		form.setScript('customscript_cl_service_change');

		response.writePage(form);
	} else {
		nlapiSetRedirectURL('SUITELET', 'customscript_sl_servchg_customer_list', 'customdeploy_sl_servchg_customer_list', null, params);
	}
}