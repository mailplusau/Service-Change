/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2020-01-08 13:36:32         Ankith
 *
 * Description: Send Email Notification to a person about a Service Change        
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-02-12 09:38:25
 *
 */

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
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

        var customer = request.getParameter('custid');
        var recCustomer = nlapiLoadRecord('customer', customer);
        var franchisee = recCustomer.getFieldValue('partner');
        var form = nlapiCreateForm('Service Change Notification: <a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + customer + '">' + recCustomer.getFieldValue('entityid') + '</a> ' + recCustomer.getFieldValue('companyname'));

        form.addField('custpage_customer_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(customer);
        form.addField('custpage_customer_entityid', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(recCustomer.getFieldValue('entityid'));
        form.addField('custpage_customer_franchisee', 'text', 'Franchisee ID').setDisplayType('hidden').setDefaultValue(nlapiLookupField('customer', customer, 'partner'));

        var service_type_search = serviceTypeSearch(null, [1]);
        /**
         * Description - To add all the API's to the begining of the page
         */
        var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script><style>.mandatory{color:red;}.selectator_option_right{width: fit-content !important;}</style>';

        inlineHtml += '<div class="container" style="padding-top: 3%;">';
        inlineHtml += '<div class="form-group container requester_section">';
        inlineHtml += '<div class="row">';
        inlineHtml += '<div class="col-xs-6 heading1"><h4><span class="label label-default col-xs-12">REQUESTER DETAILS</span></h4></div>';
        inlineHtml += '</div>';
        inlineHtml += '</div>';


        inlineHtml += '<div class="form-group container row_salutation ">';
        inlineHtml += '<div class="row">'

        inlineHtml += '<div class="col-xs-6 first_name_section"><div class="input-group"><span class="input-group-addon">FIRST NAME <span class="mandatory">*</span></span><input type="text" id="first_name" class="form-control " /></div></div>';
        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += '<div class="form-group container row_salutation ">';
        inlineHtml += '<div class="row">'
        inlineHtml += '<div class="col-xs-6 last_name_section"><div class="input-group"><span class="input-group-addon">LAST NAME</span><input type="text" id="last_name" class="form-control" /></div></div>';

        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += '<div class="form-group container row_details ">';
        inlineHtml += '<div class="row">'

        inlineHtml += '<div class="col-xs-6 email_section"><div class="input-group"><span class="input-group-addon">EMAIL <span class="mandatory">*</span></span><input type="email" id="email" class="form-control " /></div></div>';
        // inlineHtml += '<div class="col-xs-4 phone_section"><div class="input-group"><span class="input-group-addon">PHONE </span><input type="number" id="phone" class="form-control " /></div></div>';

        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += '<div class="form-group container row_category ">';
        inlineHtml += '<div class="row">'

        inlineHtml += '<div class="col-xs-3 position_section"><div class="input-group"><span class="input-group-addon">POSITION</span><input type="text" id="position" class="form-control " /></div></div>';
        inlineHtml += '<div class="col-xs-3 phone_section"><div class="input-group"><span class="input-group-addon">PHONE </span><input type="number" id="phone" class="form-control " /></div></div>';

        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += '<div class="form-group container note_section">';
        inlineHtml += '<div class="row">';
        inlineHtml += '<div class="col-xs-6 note"><div class="input-group"><span class="input-group-addon" id="note_text">NOTE </span><textarea id="note" class="form-control note" rows="4" cols="50"  /></textarea></div></div>';
        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += '<div class="form-group container requester_section">';
        inlineHtml += '<div class="row">';
        inlineHtml += '<div class="col-xs-6 heading1"><h4><span class="label label-default col-xs-12">SERVICE CHANGE DETAILS</span></h4></div>';
        inlineHtml += '</div>';
        inlineHtml += '</div>';


        inlineHtml += '<div class="form-group container date_effective_section">';
        inlineHtml += '<div class="row">';

        inlineHtml += '<div class="col-xs-6 "><div class="input-group"><span class="input-group-addon">DATE EFFECTIVE <span class="mandatory">*</span></span><input type="date" id="date_effective" value="" class="form-control date_effective"/></div></div>';


        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += '<div class="form-group container service_change_type_section ">';
        inlineHtml += '<div class="row">';
        inlineHtml += '<div class="col-xs-6 commencementtype"><div class="input-group"><span class="input-group-addon" id="commencementtype_text">SALE TYPE <span class="mandatory">*</span></span><select id="commencementtype" class="form-control commencementtype" ><option></option>';
        var col = new Array();
        col[0] = new nlobjSearchColumn('name');
        col[1] = new nlobjSearchColumn('internalId');
        var results = nlapiSearchRecord('customlist_sale_type', null, null, col);
        for (var i = 0; results != null && i < results.length; i++) {
            var res = results[i];
            var listValue = res.getValue('name');
            var listID = res.getValue('internalId');
            // if (!isNullorEmpty(sale_type)) {
            // if (sale_type == listID) {
            // inlineHtml += '<option value="' + listID + '" selected>' + listValue + '</option>';
            // }
            // }
            inlineHtml += '<option value="' + listID + '">' + listValue + '</option>';
        }
        inlineHtml += '</select></div></div>';
        inlineHtml += '</div>';
        inlineHtml += '</div>';


        inlineHtml += '<div class="form-group container send_to_section ">';
        inlineHtml += '<div class="row">'
        inlineHtml += '<div class="col-xs-6 send_to_section"><div class="input-group"><span class="input-group-addon">NOTIFY <span class="mandatory">*</span></span><select multiple ng-model="send_to" ng-change="showSelectValue(send_to)" class="form-control send_to" id="send_to"><option></option>';

        var searchedActiveEmployees = nlapiLoadSearch('employee', 'customsearch_active_employees');
        var resultSetActiveEmployees = searchedActiveEmployees.runSearch();

        resultSetActiveEmployees.forEachResult(function(searchResultActiveEmployees) {
            var id = searchResultActiveEmployees.getValue('internalid');
            var firstName = searchResultActiveEmployees.getValue('firstname');
            var lastName = searchResultActiveEmployees.getValue('lastname');
            var email = searchResultActiveEmployees.getValue('email');
            var title = searchResultActiveEmployees.getValue('title');
            inlineHtml += '<option value="' + email + '" data-right="' + email + '"  data-subtitle="' + title + '">' + firstName + ' ' + lastName + '</option>';
            return true;
        });
        inlineHtml += '</select></div></div>';

        inlineHtml += '</div>';
        inlineHtml += '</div>';


        inlineHtml += '<div class="form-group container row_service_type hide">';
        inlineHtml += '<div class="row">'

        inlineHtml += '<div class="col-xs-6 service_type_section"><div class="input-group"><span class="input-group-addon">SERVICE <span class="mandatory">*</span></span><input type="hidden" id="servicechange_id" value="" /><input type="hidden" id="row_id" value="" /><input type="hidden" id="service_id" value="" /><select class="form-control service_type" id="service_type">';

        for (var x = 0; x < service_type_search.length; x++) {
            inlineHtml += '<option value="' + service_type_search[x].getValue('internalid') + '">' + service_type_search[x].getValue('name') + '</option>';
        }

        inlineHtml += '</select></div></div>';

        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += '<div class="form-group container service_descp_row hide">';
        inlineHtml += '<div class="row">';
        inlineHtml += '<div class="col-xs-6 descp_section"><div class="input-group"><span class="input-group-addon" id="descp_text">DESCRIPTION</span><input id="descp" class="form-control descp" /></div></div>'
        inlineHtml += '</div>';
        inlineHtml += '</div>';


        inlineHtml += '<div class=" container price_info hide">'
        inlineHtml += '<div class="form-group row">';

        inlineHtml += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">NEW PRICE <span class="mandatory">*</span></span><input id="new_price" class="form-control new_price" type="number" /></div></div>';
        inlineHtml += '<div class="col-xs-3 old_price_section"><div class="input-group"><span class="input-group-addon">OLD PRICE</span><input id="old_price" readonly class="form-control old_price" /></div></div>';

        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += '<div class="form-group container frequency_info hide">'

        inlineHtml += '<div class="row">';
        inlineHtml += '<div class="col-xs-2 daily_section"><div class="input-group"><input type="text" readonly value="Daily" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="daily" class=" daily" /></span></div></div>';
        inlineHtml += '<div class="col-xs-2 monday_section"><div class="input-group"><input type="text" readonly value="M" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="monday" class=" monday" /></span></div></div>';
        inlineHtml += '<div class="col-xs-2 tuesday_section"><div class="input-group"><input type="text" readonly value="T" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="tuesday" class=" tuesday" /></span></div></div>';
        inlineHtml += '<div class="col-xs-2 wednesday_section"><div class="input-group"><input type="text" readonly value="W" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="wednesday" class=" wednesday" /></span></div></div>';
        inlineHtml += '<div class="col-xs-2 thursday_section"><div class="input-group"><input type="text" readonly value="Th" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="thursday" class=" thursday" /></span></div></div>';
        inlineHtml += '<div class="col-xs-2 friday_section"><div class="input-group"><input type="text" readonly value="F" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="friday" class=" friday" /></span></div></div>';
        inlineHtml += '<div class="col-xs-2 adhoc_section"><div class="input-group"><input type="text" readonly value="ADHOC" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="adhoc" class=" adhoc" /></span></div></div>';


        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += '<div class="form-group container row_button hide">'
        inlineHtml += '<div class="row">';

        inlineHtml += '<div class="col-xs-3 add_service_section"><input type="button" value="ADD / EDIT" class="form-control btn btn-primary" id="add_service" /></div><div class="col-xs-3 edit_service_section"><input type="button" value="ADD / EDIT" class="form-control btn btn-primary" id="edit_service" /></div><div class="clear_section col-xs-3"><input type="button" value="CANCEL" class="form-control btn btn-default" id="clear" /></div>';

        inlineHtml += '</div>';
        inlineHtml += '</div>';
        inlineHtml += '</div>';


        inlineHtml += '</form>';

        /**
         * Description - To create the table and colums assiocted with the page.
         */
        inlineHtml += '<br><br><style>table#services {font-size:12px; text-align:center; border-color: #24385b}</style><div class="se-pre-con"></div><form id="package_form" class="form-horizontal"><div class="form-group container-fluid"><div><div id="alert" class="alert alert-danger fade in"></div><div class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document"><div class="modal-content" style="width: max-content;"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Information</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div><div ng-app="myApp" ng-controller="myCtrl"><table border="0" cellpadding="15" id="services" class="table table-responsive table-striped services tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th colspan="9" style="background-color: white;"></th><th colspan="6" style="vertical-align: middle;text-align: center;"><b>FREQUENCY</b></th></tr><tr class="text-center">';

        /**
         * ACTION ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;"><b>ACTION</b></th>';
        /**
         * SERVICE NAME ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;"><b>SERVICE NAME<span class="modal_display glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';
        /**
         * DESCRIPTION FROM
         */

        inlineHtml += '<th style="vertical-align: middle;text-align: center;"><b>SERVICE DESCRIPTION<span class="modal_display glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';
        /**
         * SERVICE OLD PRICE ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;"><b>OLD PRICE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * SERVICE NEW PRICE ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>NEW PRICE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * DATE EFFECTIVE ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>DATE EFFECTIVE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * CREATED BY ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>CREATED BY<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * LAST MODIFIED ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>LAST MODIFIED<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>TYPE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * MONDAY ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>MON<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * TUESDAY ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>TUE<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * WEDNESDAY ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>WED<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * THURSDAY ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>THU<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * FRIDAY ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>FRI<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th>';

        /**
         * ADHOC ROW
         */
        inlineHtml += '<th style="vertical-align: middle;text-align: center;" class=""><b>ADHOC<span class="modal_display btn-sm glyphicon glyphicon-info-sign" style="cursor: pointer;padding: 3px 3px 3px 3px;color: orange;" data-whatever=""></span></b></th></tr></thead><tbody>';

        var service_ids = [];

        var scheduledCommReg = nlapiLoadSearch('customrecord_commencement_register', 'customsearch_smc_commreg_active_2');

        var newFilters = new Array();
        newFilters[newFilters.length] = new nlobjSearchFilter("internalid", "CUSTRECORD_CUSTOMER", 'is', customer);


        scheduledCommReg.addFilters(newFilters);

        var resultSetScheduledCommReg = scheduledCommReg.runSearch();

        var singleScheduledCommReg = resultSetScheduledCommReg.getResults(0, 1);
        
        if (!isNullorEmpty(singleScheduledCommReg[0])) {
            var commReg = singleScheduledCommReg[0].getValue('internalid');

            if (!isNullorEmpty(commReg)) {
                var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_smc_service_chg');

                var newFilters = new Array();
                newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_comm_reg', null, 'is', commReg);


                searched_service_change.addFilters(newFilters);

                var resultSet_service_change = searched_service_change.runSearch();

                resultSet_service_change.forEachResult(function(searchResult_service_change) {

                    service_ids[service_ids.length] = searchResult_service_change.getValue('custrecord_servicechg_service');

                    inlineHtml += '<tr>';



                    inlineHtml += '<td class="first_col"><button class="btn btn-warning btn-sm edit_class glyphicon glyphicon-pencil" data-servicechangeid="' + searchResult_service_change.getValue('internalid') + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><br/><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-servicechangeid="' + searchResult_service_change.getValue('internalid') + '" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                    inlineHtml += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service_change.getValue('custrecord_servicechg_service') + '" data-servicetypeid="' + searchResult_service_change.getValue("custrecord_service", "CUSTRECORD_SERVICECHG_SERVICE", null) + '" readonly value="' + searchResult_service_change.getText('custrecord_servicechg_service') + '" /></div></td>';
                    inlineHtml += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service_change.getValue("custrecord_service_description", "CUSTRECORD_SERVICECHG_SERVICE", null) + '"  type="text" /></div></td>';


                    inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service_change.getValue("custrecord_service_price", "CUSTRECORD_SERVICECHG_SERVICE", null) + '"  type="number" step=".01" /></div></td>';
                    inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value="' + searchResult_service_change.getValue('custrecord_servicechg_new_price') + '"  type="number" step=".01" /></div></td>';
                    inlineHtml += '<td><div class="date_effective_div input-group"><input class="form-control date_effective_class text-center" disabled value="' + searchResult_service_change.getValue('custrecord_servicechg_date_effective') + '"  type="text" /></div></td>';

                    inlineHtml += '<td><div class="created_by_div input-group"><input class="form-control created_by_class text-center" disabled data-userid="' + searchResult_service_change.getValue('custrecord_servicechg_created') + '" value="' + searchResult_service_change.getText('custrecord_servicechg_created') + '"  type="text" /></div></td>';

                    inlineHtml += '<td><div class="last_modified_div input-group"><input class="form-control last_modified_class text-center" disabled value="' + searchResult_service_change.getValue('lastmodified') + '"  type="text" /></div></td>';

                    inlineHtml += '<td><div class="comm_type_div input-group"><input class="form-control comm_type_class text-center" disabled value="' + searchResult_service_change.getValue('custrecord_servicechg_type') + '" data-commtypeid="" type="text" /></div></td>';


                    var freq = searchResult_service_change.getValue('custrecord_servicechg_new_freq');


                    inlineHtml += freqCal(freq);


                    inlineHtml += '</tr>';
                    return true;
                });
            }
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
                inlineHtml += '<tr>';

                inlineHtml += '<td class="first_col"><button class="btn btn-warning btn-sm edit_class glyphicon glyphicon-pencil" data-servicechangeid="' + null + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><br/><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash hide" type="button" data-servicechangeid="" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                inlineHtml += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service.getValue('internalid') + '" data-servicetypeid="' + searchResult_service.getText("internalid", "CUSTRECORD_SERVICE", null) + '" readonly value="' + searchResult_service.getText('custrecord_service') + '" /></div></td>';
                inlineHtml += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service.getValue('custrecord_service_description') + '"  type="text" /></div></td>';

                inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service.getValue('custrecord_service_price') + '"  type="number" step=".01" /></div></td>';
                inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value=""  type="number" step=".01" /></div></td>';
                inlineHtml += '<td><div class="date_effective_div input-group"><input class="form-control date_effective_class text-center" disabled value=""  type="text" /></div></td>';
                inlineHtml += '<td><div class="created_by_div input-group"><input class="form-control created_by_class text-center" disabled value=""  type="text" /></div></td>';
                inlineHtml += '<td><div class="last_modified_div input-group"><input class="form-control last_modified_class text-center" disabled value=""  type="text" /></div></td>';

                inlineHtml += '<td><div class="comm_type_div input-group"><input class="form-control comm_type_class text-center" disabled value="" data-commtypeid="" type="text" /></div></td>';

                nlapiLogExecution('DEBUG', 'mon', searchResult_service.getText('custrecord_service_day_mon'))
                nlapiLogExecution('DEBUG', 'mon', searchResult_service.getValue('custrecord_service_day_mon'))

                if (searchResult_service.getValue('custrecord_service_day_mon') == 'T') {
                    inlineHtml += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineHtml += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_tue') == 'T') {
                    inlineHtml += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineHtml += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled/></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_wed') == 'T') {
                    inlineHtml += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineHtml += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_thu') == 'T') {
                    inlineHtml += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineHtml += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_fri') == 'T') {
                    inlineHtml += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineHtml += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue('custrecord_service_day_adhoc') == 'T') {
                    inlineHtml += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled checked /></div></td>';
                } else {
                    inlineHtml += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled /></div></td>';
                }


                inlineHtml += '</tr>';
                return true;
            });
        }



        inlineHtml += '</tbody>';
        inlineHtml += '</table></div></div></div></form><br/>';



        nlapiLogExecution('DEBUG', 'after')

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('startrow').setDefaultValue(inlineHtml);

        form.addSubmitButton('Submit');
        form.addButton('back', 'Back', 'onclick_back()');
        form.addButton('back', 'Reset', 'onclick_reset()');
        form.setScript('customscript_cl_customer_ue_service_chan');

        response.writePage(form);

    } else {
        response.sendRedirect('RECORD', 'customer', parseInt(request.getParameter('custpage_customer_id')), false);
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

    var todayDate = nlapiStringToDate(stringDate);
    var month = pad(todayDate.getMonth() + 1);
    var day = pad(todayDate.getDate());
    var year = (todayDate.getFullYear());
    return year + "-" + month + "-" + day;
}