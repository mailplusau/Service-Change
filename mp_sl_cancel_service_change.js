/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2019-11-16 08:33:09         Ankith
 *
 * Description:         
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2019-11-27 17:11:13
 *
 */


var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}

function cancelService(request, response) {
    if (request.getMethod() == "GET") {

        var commReg = null;
        var params = request.getParameter('custparam_params');

        params = JSON.parse(params);

        var customer = params.custid;
        // var service_id = params.service;

        var recCustomer = nlapiLoadRecord('customer', customer);
        // var serviceRecord = nlapiLoadRecord('customrecord_service', service_id);
        var franchisee = recCustomer.getFieldValue('partner');

        var form = nlapiCreateForm('Cancel Service');

        form.addField('custpage_customer_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(customer);
        // form.addField('custpage_service_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(service_id);
        form.addField('custpage_customer_franchisee', 'text', 'Franchisee ID').setDisplayType('hidden').setDefaultValue(nlapiLookupField('customer', customer, 'partner'));

        /**
         * Description - To add all the API's to the begining of the page
         */
        var inlineQty = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><style>.mandatory{color:red;}</style><div class="se-pre-con"></div><div id="alert" class="alert alert-danger fade in"></div>';

        inlineQty += '<div class="container" style="padding-top: 3%;">';


        inlineQty += '<div class="form-group container row_cancellation ">';
        inlineQty += '<div class="row">'

        inlineQty += '<div class="col-xs-6 cancel_date_section"><div class="input-group"><span class="input-group-addon">CANCELLATION DATE <span class="mandatory">*</span></span></span><input type="date" class="form-control" id="cancel_date" value="" /></div></div>';

        inlineQty += '<div class="col-xs-6 cancel_reason_section"><div class="input-group"><span class="input-group-addon">CANCELLATION REASON</span><select class="form-control" id="cancel_reason" ><option></option>';
        var col = new Array();
        col[0] = new nlobjSearchColumn('name');
        col[1] = new nlobjSearchColumn('internalId');
        var newFiltersReason = new Array();
        newFiltersReason[newFiltersReason.length] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
        var results = nlapiSearchRecord('customlist58', null, newFiltersReason, col);
        for (var i = 0; results != null && i < results.length; i++) {
            var res = results[i];
            var listValue = res.getValue('name');
            var listID = res.getValue('internalId');

            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }

        inlineQty += '</select></div></div>';

        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container row_cancellation ">';
        inlineQty += '<div class="row">'

        inlineQty += '<div class="col-xs-6 cancel_comp_section"><div class="input-group"><span class="input-group-addon">CANCELLATION COMPETITOR</span><select class="form-control" id="cancel_comp" ><option></option>';
        var col = new Array();
        col[0] = new nlobjSearchColumn('name');
        col[1] = new nlobjSearchColumn('internalId');
        var newFiltersComp = new Array();
        newFiltersComp[newFiltersComp.length] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
        var results = nlapiSearchRecord('customlist33', null, newFiltersComp, col);
        for (var i = 0; results != null && i < results.length; i++) {
            var res = results[i];
            var listValue = res.getValue('name');
            var listID = res.getValue('internalId');
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
        }
        inlineQty += '</select></div></div>';

        inlineQty += '<div class="col-xs-6 cancel_notice_section"><div class="input-group"><span class="input-group-addon">CANCELLATION NOTICE</span><select class="form-control" id="cancel_notice" ><option></option>';
        var col = new Array();
        col[0] = new nlobjSearchColumn('name');
        col[1] = new nlobjSearchColumn('internalId');
        var results = nlapiSearchRecord('customlist_cancellation_notice', null, null, col);
        for (var i = 0; results != null && i < results.length; i++) {
            var res = results[i];
            var listValue = res.getValue('name');
            var listID = res.getValue('internalId');
            inlineQty += '<option value="' + listID + '" >' + listValue + '</option>';

        }

        inlineQty += '</select></div></div>';


        inlineQty += '</div>';
        inlineQty += '</div>';



        /**
         * Description - To create the table and colums assiocted with the page.
         */
        inlineQty += '<br><br><style>table#services {font-size:12px; text-align:center; border-color: #24385b}</style><div class="se-pre-con"></div><form id="package_form" class="form-horizontal"><div class="form-group container-fluid"><div><div class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document"><div class="modal-content" style="width: max-content;"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Information</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div><div ng-app="myApp" ng-controller="myCtrl"><table border="0" cellpadding="15" id="services" class="table table-responsive table-striped services tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><tr class="text-center">';

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
        inlineQty += '<th style="vertical-align: middle;text-align: center;" class=""><b>NEW PRICE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th></tr></thead><tbody>';


        var service_ids = [];

        if (!isNullorEmpty(commReg)) {
            var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_smc_service_chg');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_comm_reg', null, 'is', commReg);


            searched_service_change.addFilters(newFilters);

            var resultSet_service_change = searched_service_change.runSearch();

            resultSet_service_change.forEachResult(function(searchResult_service_change) {

                service_ids[service_ids.length] = searchResult_service_change.getValue('custrecord_servicechg_service');

                inlineQty += '<tr>';



                inlineQty += '<td class="first_col"><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-serviceid="' + searchResult_service_change.getValue('custrecord_servicechg_service') + '"  data-servicechangeid="' + searchResult_service_change.getValue('internalid') + '" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service_change.getValue('custrecord_servicechg_service') + '" data-servicetypeid="" readonly value="' + searchResult_service_change.getText('custrecord_servicechg_service') + '" /></div></td>';
                inlineQty += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service_change.getValue("custrecord_service_description", "CUSTRECORD_SERVICECHG_SERVICE", null) + '"  type="text" /></div></td>';


                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service_change.getValue("custrecord_service_price", "CUSTRECORD_SERVICECHG_SERVICE", null) + '"  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value="' + searchResult_service_change.getValue('custrecord_servicechg_new_price') + '"  type="number" step=".01" /></div></td>';



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
            resultSet_service.forEachResult(function(searchResult_service) {
                inlineQty += '<tr>';

                inlineQty += '<td class="first_col"><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-servicechangeid="" data-toggle="tooltip" data-placement="right" title="Delete" data-serviceid="' + searchResult_service.getValue('internalid') + '"></button><input type="hidden" class="delete_service" value="F" /></td>';

                inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service.getValue('internalid') + '" data-servicetypeid="' + searchResult_service.getText("internalid", "CUSTRECORD_SERVICE", null) + '" readonly value="' + searchResult_service.getText('custrecord_service') + '" /></div></td>';
                inlineQty += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service.getValue('custrecord_service_description') + '"  type="text" /></div></td>';

                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service.getValue('custrecord_service_price') + '"  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value=""  type="number" step=".01" /></div></td>';



                inlineQty += '</tr>';
                return true;
            });
        }



        inlineQty += '</tbody>';
        inlineQty += '</table></div></div></div></form><br/>';


        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);


        form.addSubmitButton('Submit');
        form.addButton('back', 'Back', 'onclick_back()');
        form.addButton('back', 'Reset', 'onclick_reset()');
        form.setScript('customscript_cl_cancel_service_change');

        response.writePage(form);

    } else {
        var customer = parseInt(request.getParameter('custpage_customer_id'));
        var params = {
            custid: customer

        }

        nlapiSetRedirectURL('SUITELET', 'customscript_sl_service_change', 'customdeploy_sl_service_change', null, params);
    }
}