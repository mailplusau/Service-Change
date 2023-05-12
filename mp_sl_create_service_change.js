/**
 * Module Description
 * 
 * NSVersion    Date            		Author         
 * 1.00       	2017-11-30 11:10:09   		Ankith 
 *
 * Remarks: Add / Edit Service to create corresponding service change records.       
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-02-20 13:51:21
 *
 */

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();
if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
} else if (role == 3) { //Administrator
    zee = 6; //test
} else if (role == 1032) { // System Support
    zee = 425904; //test-AR
}

function serviceChange(request, response) {
    if (request.getMethod() == "GET") {

        var script_id = null;
        var deploy_id = null;
        var entryParamsString = null;

        var commReg = null;
        var dateEffective = null;
        var sale_type = null;
        var editPage = 'F';

        var closed_won;
        var opp_with_value;

        var save_customer;

        var params = request.getParameter('custparam_params');
        var salesrep = request.getParameter('salesrep');
        var sendemail = null;

        var suspects = null;

        if (isNullorEmpty(salesrep)) {
            params = JSON.parse(params);

            nlapiLogExecution('DEBUG', 'params', JSON.stringify(params));

            var customer = (params.custid);
            commReg = (params.commreg);
            salesrep = (params.salesrep);
            sendemail = (params.sendemail);
            dateEffective = (params.date);
            script_id = params.customid;
            deploy_id = params.customdeploy;
            suspects = params.suspects;
            closed_won = params.closedwon;
            opp_with_value = params.oppwithvalue;
            save_customer = params.savecustomer;

            var salesrecordid = (params.salesrecordid);
        } else {
            var customer = request.getParameter('custid');
            commReg = String(request.getParameter('commreg'));
            script_id = request.getParameter('customid');
            deploy_id = request.getParameter('customdeploy');
            closed_won = request.getParameter('closedwon');
            opp_with_value = request.getParameter('oppwithvalue');
            save_customer = request.getParameter('savecustomer');
            var salesrecordid = request.getParameter('salesrecordid');
        }

        nlapiLogExecution('DEBUG', 'customer', customer);
        nlapiLogExecution('DEBUG', 'commReg', commReg);
        var recCustomer = nlapiLoadRecord('customer', customer);
        var franchisee = recCustomer.getFieldValue('partner');

        var form = nlapiCreateForm('Add / Edit Service : <a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + customer + '">' + recCustomer.getFieldValue('entityid') + '</a> ' + recCustomer.getFieldValue('companyname'));

        // var commReg_search = nlapiLoadSearch('customrecord_servicechg', 'customsearch_service_change_record_all');

        // var filterExpression = [
        // 	["custrecord_customer", "anyof", customer], // customer id
        // 	"AND", ["custrecord_franchisee", "is", franchisee], // partner id
        // 	"AND", ["custrecord_servicechg_status", "anyof", [2]]
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

        form.addField('custpage_customer_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(String(customer));
        form.addField('custpage_customer_entityid', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(recCustomer.getFieldValue('entityid'));
        form.addField('custpage_customer_franchisee', 'text', 'Franchisee ID').setDisplayType('hidden').setDefaultValue(nlapiLookupField('customer', customer, 'partner'));
        if (!isNullorEmpty(commReg)) {
            editPage = 'T';
            var customer_comm_reg = nlapiLoadRecord('customrecord_commencement_register', commReg);
            dateEffective = customer_comm_reg.getFieldValue('custrecord_comm_date');
            sale_type = customer_comm_reg.getFieldValue('custrecord_sale_type');
        }
        form.addField('custpage_edit_page', 'text', 'Comm Reg ID').setDisplayType('hidden').setDefaultValue(editPage);
        form.addField('custpage_customer_comm_reg', 'text', 'Comm Reg ID').setDisplayType('hidden').setDefaultValue(String(commReg));
        form.addField('custpage_date_effective', 'text', 'Comm Reg ID').setDisplayType('hidden').setDefaultValue(dateEffective);
        form.addField('custpage_salesrep', 'text', 'Comm Reg ID').setDisplayType('hidden').setDefaultValue(salesrep);
        form.addField('custpage_sendemail', 'text', 'Comm Reg ID').setDisplayType('hidden').setDefaultValue(sendemail);
        form.addField('custpage_salesrecordid', 'text', 'Comm Reg ID').setDisplayType('hidden').setDefaultValue(String(salesrecordid));
        form.addField('custpage_scriptid', 'text', 'Script ID').setDisplayType('hidden').setDefaultValue(script_id);
        form.addField('custpage_deployid', 'text', 'Deploy ID').setDisplayType('hidden').setDefaultValue(deploy_id);
        form.addField('custpage_closed_won', 'text', 'Deploy ID').setDisplayType('hidden').setDefaultValue(closed_won);
        form.addField('custpage_opp_with_value', 'text', 'Deploy ID').setDisplayType('hidden').setDefaultValue(opp_with_value);
        form.addField('custpage_save_customer', 'text', 'Deploy ID').setDisplayType('hidden').setDefaultValue(save_customer);
        form.addField('custpage_service_change_delete', 'text', 'Deploy ID').setDisplayType('hidden');
        form.addField('custpage_comm_reg_delete', 'text', 'Deploy ID').setDisplayType('hidden');

        form.addField('custpage_suspects', 'text', 'BODY').setDisplayType('hidden').setDefaultValue(suspects);
        // }



        var service_type_search = serviceTypeSearch(null, [1]);

        /**
         * Description - To add all the API's to the begining of the page
         */
        var inlineQty = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><style>.mandatory{color:red;}</style>';

        inlineQty += '<div class="container" style="padding-top: 3%;">';

        inlineQty += '<div class="form-group container date_effective_section">';
        inlineQty += '<div class="row">';
        if (isNullorEmpty(dateEffective)) {
            inlineQty += '<div class="col-xs-7 "><div class="input-group"><span class="input-group-addon">DATE EFFECTIVE <span class="mandatory">*</span></span><input type="date" id="date_effective" value="" class="form-control date_effective"/></div></div>';
        } else {
            start_date = GetFormattedDate(dateEffective);
            inlineQty += '<div class="col-xs-7 "><div class="input-group"><span class="input-group-addon">DATE EFFECTIVE <span class="mandatory">*</span></span><input type="date" id="date_effective" value="' + start_date + '" data-olddate="' + dateEffective + '" class="form-control date_effective"/></div></div>';
        }

        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container service_change_type_section ">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-7 commencementtype"><div class="input-group"><span class="input-group-addon" id="commencementtype_text">SALE TYPE <span class="mandatory">*</span></span><select id="commencementtype" class="form-control commencementtype" ><option></option>';
        var col = new Array();
        col[0] = new nlobjSearchColumn('name');
        col[1] = new nlobjSearchColumn('internalId');
        var results = nlapiSearchRecord('customlist_sale_type', null, null, col);
        for (var i = 0; results != null && i < results.length; i++) {
            var res = results[i];
            var listValue = res.getValue('name');
            var listID = res.getValue('internalId');
            if (!isNullorEmpty(sale_type) && sale_type == listID) {
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            } if (save_customer == 'T') {
                if (listID == 7) {
                    inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
                } else {
                    inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
                }
            } else {
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        }
        inlineQty += '</select></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container create_new_service_button">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="create_new_service_section col-xs-2"><input type="button" value="ADD NEW SERVICE" class="form-control btn btn-primary" id="create_new_service" /></div>';
        var old_customer_id = recCustomer.getFieldValue('custentity_old_customer');
        var old_customer_name = recCustomer.getFieldText('custentity_old_customer');
        inlineQty += '<div class="get_services_section col-xs-5 hide"><input type="button" STYLE="font-size:small; white-space:normal; height:auto" value="GET SERVICES FROM ' + old_customer_name + '" class="form-control btn btn-info" id="getservices" onclick="onclick_GetServices(' + customer + ',' + old_customer_id + ',' + commReg + ')"/></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';




        inlineQty += '<div class="form-group container row_service_type hide">';
        inlineQty += '<div class="row">'

        inlineQty += '<div class="col-xs-6 service_type_section"><div class="input-group"><span class="input-group-addon">SERVICE <span class="mandatory">*</span></span><input type="hidden" id="servicechange_id" value="" /><input type="hidden" id="row_id" value="" /><input type="hidden" id="service_id" value="" /><select class="form-control service_type" id="service_type">';

        for (var x = 0; x < service_type_search.length; x++) {
            inlineQty += '<option value="' + service_type_search[x].getValue('internalid') + '">' + service_type_search[x].getValue('name') + '</option>';
        }

        inlineQty += '</select></div></div>';

        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container service_descp_row hide">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-6 descp_section"><div class="input-group"><span class="input-group-addon" id="descp_text">DESCRIPTION</span><input id="descp" class="form-control descp" /></div></div>'
        inlineQty += '</div>';
        inlineQty += '</div>';


        inlineQty += '<div class=" container price_info hide">'
        inlineQty += '<div class="form-group row">';

        inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">NEW PRICE <span class="mandatory">*</span></span><input id="new_price" class="form-control new_price" type="number" /></div></div>';
        inlineQty += '<div class="col-xs-3 old_price_section"><div class="input-group"><span class="input-group-addon">OLD PRICE</span><input id="old_price" readonly class="form-control old_price" /></div></div>';

        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container frequency_info hide">'

        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 daily_section"><div class="input-group"><input type="text" readonly value="Daily" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="daily" class=" daily" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 monday_section"><div class="input-group"><input type="text" readonly value="M" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="monday" class=" monday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 tuesday_section"><div class="input-group"><input type="text" readonly value="T" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="tuesday" class=" tuesday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 wednesday_section"><div class="input-group"><input type="text" readonly value="W" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="wednesday" class=" wednesday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 thursday_section"><div class="input-group"><input type="text" readonly value="Th" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="thursday" class=" thursday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 friday_section"><div class="input-group"><input type="text" readonly value="F" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="friday" class=" friday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 adhoc_section"><div class="input-group"><input type="text" readonly value="ADHOC" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="adhoc" class=" adhoc" /></span></div></div>';


        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container row_button hide">'
        inlineQty += '<div class="row">';

        inlineQty += '<div class="col-xs-3 add_service_section"><input type="button" value="ADD / EDIT" class="form-control btn btn-primary" id="add_service" /></div><div class="col-xs-3 edit_service_section"><input type="button" value="ADD / EDIT" class="form-control btn btn-primary" id="edit_service" /></div><div class="clear_section col-xs-3"><input type="button" value="CANCEL" class="form-control btn btn-default" id="clear" /></div>';

        inlineQty += '</div>';
        inlineQty += '</div>';
        inlineQty += '</div>';


        inlineQty += '</form>';


        /**
         * Description - To create the table and colums assiocted with the page.
         */
        inlineQty += '<br><br><style>table#services {font-size:12px; text-align:center; border-color: #24385b}</style><div class="se-pre-con"></div><form id="package_form" class="form-horizontal"><div class="form-group container-fluid"><div><div id="alert" class="alert alert-danger fade in"></div><div class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document"><div class="modal-content" style="width: max-content;"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Information</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div><div ng-app="myApp" ng-controller="myCtrl"><table border="0" cellpadding="15" id="services" class="table table-responsive table-striped services tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th colspan="9" style="background-color: white;"></th><th colspan="6" style="vertical-align: middle;text-align: center;"><b>FREQUENCY</b></th></tr><tr class="text-center">';

        /**
         * ACTION ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>ACTION</b></th>';
        /**
         * SERVICE NAME ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>SERVICE NAME<span class="modal_display glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';
        /**
         * DESCRIPTION FROM
         */

        inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>SERVICE DESCRIPTION<span class="modal_display glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';
        /**
         * SERVICE OLD PRICE ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>OLD PRICE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * SERVICE NEW PRICE ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>NEW PRICE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * DATE EFFECTIVE ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>DATE EFFECTIVE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * CREATED BY ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>CREATED BY<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * LAST MODIFIED ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>LAST MODIFIED<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>TYPE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * MONDAY ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>MON<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * TUESDAY ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>TUE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * WEDNESDAY ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>WED<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * THURSDAY ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>THU<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * FRIDAY ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>FRI<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * ADHOC ROW
         */
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>ADHOC<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th></tr></thead><tbody>';

        var service_ids = [];

        if (!isNullorEmpty(commReg)) {
            var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_smc_service_chg');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_comm_reg', null, 'is', commReg);


            searched_service_change.addFilters(newFilters);

            var resultSet_service_change = searched_service_change.runSearch();

            resultSet_service_change.forEachResult(function (searchResult_service_change) {

                service_ids[service_ids.length] = searchResult_service_change.getValue('custrecord_servicechg_service');

                inlineQty += '<tr>';



                inlineQty += '<td class="first_col"><button class="btn btn-warning btn-sm edit_class glyphicon glyphicon-pencil" data-servicechangeid="' + searchResult_service_change.getValue('internalid') + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><br/><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-servicechangeid="' + searchResult_service_change.getValue('internalid') + '" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service_change.getValue('custrecord_servicechg_service') + '" data-servicetypeid="' + searchResult_service_change.getValue("custrecord_service", "CUSTRECORD_SERVICECHG_SERVICE", null) + '" readonly value="' + searchResult_service_change.getText('custrecord_servicechg_service') + '" /></div></td>';
                inlineQty += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service_change.getValue("custrecord_service_description", "CUSTRECORD_SERVICECHG_SERVICE", null) + '"  type="text" /></div></td>';


                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service_change.getValue("custrecord_service_price", "CUSTRECORD_SERVICECHG_SERVICE", null) + '"  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value="' + searchResult_service_change.getValue('custrecord_servicechg_new_price') + '"  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="date_effective_div input-group"><input class="form-control date_effective_class text-center" disabled value="' + searchResult_service_change.getValue('custrecord_servicechg_date_effective') + '"  type="text" /></div></td>';

                inlineQty += '<td><div class="created_by_div input-group"><input class="form-control created_by_class text-center" disabled data-userid="' + searchResult_service_change.getValue('custrecord_servicechg_created') + '" value="' + searchResult_service_change.getText('custrecord_servicechg_created') + '"  type="text" /></div></td>';

                inlineQty += '<td><div class="last_modified_div input-group"><input class="form-control last_modified_class text-center" disabled value="' + searchResult_service_change.getValue('lastmodified') + '"  type="text" /></div></td>';

                inlineQty += '<td><div class="comm_type_div input-group"><input class="form-control comm_type_class text-center" disabled value="' + searchResult_service_change.getValue('custrecord_servicechg_type') + '" data-commtypeid="" type="text" /></div></td>';


                var freq = searchResult_service_change.getValue('custrecord_servicechg_new_freq');


                inlineQty += freqCal(freq);


                inlineQty += '</tr>';
                return true;
            });
        }


        /**
         * Description - To get all the services associated with this customer
         */
        var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_smc_services');

        var newFilters_service = new Array();
        newFilters_service[newFilters_service.length] = new nlobjSearchFilter('custrecord_service_customer', null, 'is', customer);
        if (!isNullorEmpty(service_ids)) {
            newFilters_service[newFilters_service.length] = new nlobjSearchFilter('internalid', null, 'noneof', service_ids);
        }

        serviceSearch.addFilters(newFilters_service);

        var resultSet_service = serviceSearch.runSearch();

        var serviceResult = resultSet_service.getResults(0, 1);

        if (serviceResult.length != 0) {
            resultSet_service.forEachResult(function (searchResult_service) {
                inlineQty += '<tr>';

                inlineQty += '<td class="first_col"><button class="btn btn-warning btn-sm edit_class glyphicon glyphicon-pencil" data-servicechangeid="' + null + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><br/><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash hide" type="button" data-servicechangeid="" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service.getValue('internalid') + '" data-servicetypeid="' + searchResult_service.getText("internalid", "CUSTRECORD_SERVICE", null) + '" readonly value="' + searchResult_service.getText('custrecord_service') + '" /></div></td>';
                inlineQty += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service.getValue('custrecord_service_description') + '"  type="text" /></div></td>';

                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service.getValue('custrecord_service_price') + '"  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value=""  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="date_effective_div input-group"><input class="form-control date_effective_class text-center" disabled value=""  type="text" /></div></td>';
                inlineQty += '<td><div class="created_by_div input-group"><input class="form-control created_by_class text-center" disabled value=""  type="text" /></div></td>';
                inlineQty += '<td><div class="last_modified_div input-group"><input class="form-control last_modified_class text-center" disabled value=""  type="text" /></div></td>';

                inlineQty += '<td><div class="comm_type_div input-group"><input class="form-control comm_type_class text-center" disabled value="" data-commtypeid="" type="text" /></div></td>';

                nlapiLogExecution('DEBUG', 'mon', searchResult_service.getText('custrecord_service_day_mon'))
                nlapiLogExecution('DEBUG', 'mon', searchResult_service.getValue('custrecord_service_day_mon'))

                if (searchResult_service.getValue('custrecord_service_day_mon') == 'T') {
                    inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_tue') == 'T') {
                    inlineQty += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled/></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_wed') == 'T') {
                    inlineQty += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_thu') == 'T') {
                    inlineQty += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_fri') == 'T') {
                    inlineQty += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_adhoc') == 'T') {
                    inlineQty += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled checked /></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled /></div></td>';
                }


                inlineQty += '</tr>';
                return true;
            });
        }



        inlineQty += '</tbody>';
        inlineQty += '</table></div></div></div></form><br/>';

        nlapiLogExecution('DEBUG', 'after')

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('startrow').setDefaultValue(inlineQty);

        if (isNullorEmpty(salesrep) && role != 1000) {
            form.addField('upload_file_1', 'file', 'Service Commencement Form').setLayoutType('outsidebelow', 'startrow').setDisplaySize(40);

            if (!isNullorEmpty(commReg)) {
                var commRegRecord = nlapiLoadRecord('customrecord_commencement_register', commReg);
                var file_id = commRegRecord.getFieldValue('custrecord_scand_form');
                if (!isNullorEmpty(file_id)) {
                    var fileRecord = nlapiLoadFile(file_id);
                    var inlineQty2 = '<iframe id="viewer" frameborder="0" scrolling="no" width="400" height="600" src="' + fileRecord.getURL() + '"></iframe>';
                }
            } else {
                var inlineQty2 = '<iframe id="viewer" frameborder="0" scrolling="no" width="400" height="600"></iframe>';
            }
            form.addField('preview_table2', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty2);

            nlapiLogExecution('DEBUG', 'inside');
        }


        nlapiLogExecution('DEBUG', 'end');
        form.addSubmitButton('Submit');
        form.addButton('back', 'Back', 'onclick_back()');
        form.addButton('back', 'Reset', 'onclick_reset()');
        form.setScript('customscript_cl_create_service_change');

        response.writePage(form);
    } else {

        var commRegID = request.getParameter('custpage_customer_comm_reg');
        var entity_id = request.getParameter('custpage_customer_entityid');
        var salesrep = request.getParameter('custpage_salesrep');
        var sendemail = request.getParameter('custpage_sendemail');
        var salesrecordid = request.getParameter('custpage_salesrecordid');
        var closed_won = request.getParameter('custpage_closed_won');

        var opp_with_value = request.getParameter('custpage_opp_with_value');
        var file = request.getFile('upload_file_1');

        var suspects = request.getParameter('custpage_suspects')

        var service_change_delete_string = request.getParameter('custpage_service_change_delete');
        var comm_reg_delete_string = request.getParameter('custpage_comm_reg_delete');

        if (!isNullorEmpty(service_change_delete_string)) {
            var service_change_delete = service_change_delete_string.split(',');

            for (var x = 0; x < service_change_delete.length; x++) {
                nlapiDeleteRecord('customrecord_servicechg', service_change_delete[x])
            }
        }

        if (!isNullorEmpty(commRegID)) {

            nlapiLogExecution('DEBUG', 'commRegID', commRegID)
            var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_smc_service_chg');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_comm_reg', null, 'is', commRegID);


            searched_service_change.addFilters(newFilters);

            var resultSet_service_change = searched_service_change.runSearch();

            var serviceChangeResult = resultSet_service_change.getResults(0, 1);
            nlapiLogExecution('DEBUG', 'serviceChangeResult.length', serviceChangeResult.length)
            if (serviceChangeResult.length == 0) {
                nlapiLogExecution('DEBUG', 'commRegID', commRegID)
                nlapiDeleteRecord('customrecord_commencement_register', commRegID);
            }
        }

        if (!isNullorEmpty(comm_reg_delete_string)) {
            var comm_reg_delete = comm_reg_delete_string.split(',');

            for (var x = 0; x < comm_reg_delete.length; x++) {
                nlapiDeleteRecord('customrecord_commencement_register', comm_reg_delete[x])
            }
        }

        if (!isNullorEmpty(commRegID) && isNullorEmpty(salesrep)) {
            if (!isNullorEmpty(file)) {
                file.setFolder(1212243);

                var type = file.getType();
                if (type == 'JPGIMAGE') {
                    type = 'jpg';
                    var file_name = getDate() + '_' + entity_id + '.' + type;

                } else if (type == 'PDF') {
                    type == 'pdf';
                    var file_name = getDate() + '_' + entity_id + '.' + type;
                } else if (type == 'PNGIMAGE') {
                    type == 'png';
                } else if (type == 'PJPGIMAGE') {
                    type == 'png';
                }

                file.setName(file_name);

                // Create file and upload it to the file cabinet.
                var id = nlapiSubmitFile(file);

                var commRegRecord = nlapiLoadRecord('customrecord_commencement_register', commRegID);

                commRegRecord.setFieldValue('custrecord_scand_form', id);

                nlapiSubmitRecord(commRegRecord);
            }
        }

        var customer = parseInt(request.getParameter('custpage_customer_id'));

        if (isNullorEmpty(salesrep)) {
            var params = {
                custid: customer

            }

            nlapiSetRedirectURL('SUITELET', 'customscript_sl_service_change', 'customdeploy_sl_service_change', null, params);
        } else if (!isNullorEmpty(salesrep) && salesrep == 'T') {
            var params = {
                recid: customer,
                sales_record_id: salesrecordid

            }

            nlapiSetRedirectURL('SUITELET', 'customscript_sl_finalise_page', 'customdeploy_sl_finalise_page', null, params);
        } else if (!isNullorEmpty(salesrep) && salesrep == 'F' && !isNullorEmpty(sendemail) && sendemail == 'T') {

            nlapiLogExecution('DEBUG', 'suspects', suspects);

            if (!isNullorEmpty(suspects)) {
                var params = {
                    suspects: suspects.toString(),
                };


                nlapiSetRedirectURL('SUITELET', 'customscript_sl_update_multisite', 'customdeploy_sl_update_multisite', null, params);
            } else {
                var params = {
                    custid: customer,
                    sales_record_id: salesrecordid,
                    closedwon: closed_won,
                    oppwithvalue: opp_with_value,
                    script_id: 'customscript_sl_finalise_page',
                    script_deploy: 'customdeploy_sl_finalise_page'
                };
                nlapiSetRedirectURL('SUITELET', 'customscript_sl_send_email_module', 'customdeploy_sl_send_email_module', null, params);
            }


        }

    }
}

function freqCal(freq) {

    var multiselect = '';



    if (freq.indexOf(1) != -1) {
        multiselect += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>';
    }

    if (freq.indexOf(2) != -1) {
        multiselect += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled/></div></td>';
    }

    if (freq.indexOf(3) != -1) {
        multiselect += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled /></div></td>';
    }

    if (freq.indexOf(4) != -1) {
        multiselect += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled /></div></td>';
    }

    if (freq.indexOf(5) != -1) {
        multiselect += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled checked/></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled /></div></td>';
    }

    if (freq.indexOf(6) != -1) {
        multiselect += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled checked /></div></td>';
    } else {
        multiselect += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled /></div></td>';
    }



    return multiselect;
}


function getDate() {
    var date = (new Date());
    // if (date.getHours() > 6) {
    //     date = nlapiAddDays(date, 1);

    // }
    // date.setHours(date.getHours() + 17);
    var date_string = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate() + '_' + date.getHours() + '' + date.getMinutes();

    return date_string;
}

function pad(s) {
    return (s < 10) ? '0' + s : s;
}

function GetFormattedDate(stringDate) {
    nlapiLogExecution('DEBUG', 'Date string', stringDate);
    var todayDate = nlapiStringToDate(stringDate);
    var month = pad(todayDate.getMonth() + 1);
    var day = pad(todayDate.getDate());
    var year = (todayDate.getFullYear());
    var temp = year + "-" + month + "-" + day;
    nlapiLogExecution('DEBUG', 'Date formatted', temp);
    return year + "-" + month + "-" + day;
}