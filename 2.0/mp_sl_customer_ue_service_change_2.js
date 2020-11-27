/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 2.00         2020-10-15 09:33:08         Anesu
 *
 * Description: Send Email Notification to a person about a Service Change        
 * 
 * @Last Modified by:   Anesu
 * @Last Modified time: 2020-10-15 16:49:26
 * 
 */

define(['N/ui/serverWidget', 'N/runtime', 'N/search', 'N/record', 'N/log', 'N/redirect', 'N/error'],
    function(ui, runtime, search, record, log, redirect, error) {
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }

        role = runtime.getCurrentUser().role;

        if (role == 1000) {
            zee = runtime.getCurrentUser().id;
        } else if (role == 3) { //Administrator
            zee = 6; //test
        } else if (role == 1032) { // System Support
            zee = 425904; //test-AR
        }

        function onRequest(context) {
            var type = 'create';

            if (context.request.method === 'GET') {
                type = context.request.parameters.type;
                var customer = context.request.parameters.custid;

                log.debug({
                    title: 'Customer ID',
                    details: customer
                });

                var recCustomer = record.load({
                    type: 'customer',
                    id: customer
                });

                var customer_status = recCustomer.getValue({ fieldId: 'entitystatus' });

                log.debug({
                    title: 'Customer Status',
                    details: customer_status
                });

                entityid = recCustomer.getValue({
                    fieldId: 'entityid'
                });

                companyname = recCustomer.getValue({
                    fieldId: 'companyname'
                });

                zee = recCustomer.getValue({
                    fieldId: 'partner'
                });

                var form = ui.createForm({
                    title: 'Service Change Notification: <a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + customer + '">' + entityid + '</a> ' + companyname
                });



                /**
                 * Description - To add all the API's to the begining of the page
                 */
                var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

                // Load jQuery
                inlineHtml += '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';

                // Load Tooltip
                inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';

                // Load Bootstrap
                inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
                inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';

                // Load DataTables
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

                // Load Bootstrap-Select
                inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
                inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';

                // Load Netsuite stylesheet and script
                inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
                inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
                inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml += '<style>.mandatory{color:red;}</style>';

                inlineHtml += '<link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';


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

                form.addField({
                    id: 'upload_file_1',
                    label: 'SERVICE CHANGE PDF UPLOAD',
                    type: 'file'
                });
                // .updateLayoutType({
                //     layoutType: ui.FieldLayoutType.STARTROW
                // });

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

                var results = search.create({
                    type: 'customlist_sale_type',
                    columns: [{
                        name: 'name'
                    }, {
                        name: 'internalId'
                    }]
                });
                var resResult = results.run().getRange({
                    start: 0,
                    end: 20
                });
                resResult.forEach(function(res) {
                    var listValue = res.getValue({ name: 'name' });
                    var listID = res.getValue({ name: 'internalId' });
                    inlineHtml += '<option value="' + listID + '">' + listValue + '</option>';
                });

                inlineHtml += '</select></div></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';


                inlineHtml += '<div class="form-group container send_to_section ">';
                inlineHtml += '<div class="row">'
                inlineHtml += '<div class="col-xs-6 send_to_section"><div class="input-group"><span class="input-group-addon">NOTIFY <span class="mandatory">*</span></span><select multiple ng-model="send_to" ng-change="showSelectValue(send_to)" class="form-control send_to" id="send_to"><option></option>';

                var searchedActiveEmployees = search.load({
                    id: 'customsearch_active_employees',
                    type: 'employee'
                });
                var resultSetActiveEmployees = searchedActiveEmployees.run();
                resultSetActiveEmployees.each(function(searchResultActiveEmployees) {
                    var id = searchResultActiveEmployees.getValue({ name: 'internalid' });
                    var firstName = searchResultActiveEmployees.getValue({ name: 'firstname' });
                    var lastName = searchResultActiveEmployees.getValue({ name: 'lastname' });
                    var email = searchResultActiveEmployees.getValue({ name: 'email' });
                    var title = searchResultActiveEmployees.getValue({ name: 'title' });
                    inlineHtml += '<option value="' + email + '" data-right="' + email + '"  data-subtitle="' + title + '">' + firstName + ' ' + lastName + '</option>';
                    return true;
                });

                inlineHtml += '</select></div></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';


                inlineHtml += '<div class="form-group container row_service_type hide">';
                inlineHtml += '<div class="row">'

                inlineHtml += '<div class="col-xs-6 service_type_section"><div class="input-group"><span class="input-group-addon">SERVICE <span class="mandatory">*</span></span><input type="hidden" id="servicechange_id" value="" /><input type="hidden" id="row_id" value="" /><input type="hidden" id="service_id" value="" /><select class="form-control service_type" id="service_type">';

                // var service_type_search = serviceTypeSearch(null, [1]);
                // for (var x = 0; x < service_type_search.length; x++) {
                //     inlineHtml += '<option value="' + service_type_search[x].getValue({name: 'internalid'}) + '">' + service_type_search[x].getValue({name: 'name'}) + '</option>';
                // }

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
                // inlineHtml += '</form>';

                /**
                 * Description - To create the table and colums assiocted with the page.
                 */
                inlineHtml += '<br><br>';
                inlineHtml += '<style>table#services {font-size:12px; text-align:center; border-color: #24385b}</style>';
                inlineHtml += '<form id="package_form" class="form-horizontal">';
                inlineHtml += '<div class="form-group container-fluid"><div><div id="alert" class="alert alert-danger fade in"></div>';
                inlineHtml += '<div class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document"><div class="modal-content" style="width: max-content;"><div class="modal-header">';
                inlineHtml += '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Information</h4><br> </div>';
                inlineHtml += '<div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div><div ng-app="myApp" ng-controller="myCtrl">';
                inlineHtml += '<table border="0" cellpadding="15" id="services" class="table table-responsive table-striped services tablesorter" cellspacing="0" style="width: 100%;">';
                inlineHtml += '<thead style="color: white;background-color: #607799;"><tr><th colspan="9" style="background-color: white;"></th><th colspan="6" style="vertical-align: middle;text-align: center;"><b>FREQUENCY</b></th></tr><tr class="text-center">';

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

                // var scheduledCommReg = nlapiLoadSearch('customrecord_commencement_register', 'customsearch_smc_commreg_active_2');

                var scheduledCommReg = search.load({
                    id: 'customsearch_smc_commreg_active_2',
                    type: 'customrecord_commencement_register'
                });

                scheduledCommReg.filters.push(search.createFilter({
                    name: 'internalid',
                    join: 'CUSTRECORD_CUSTOMER',
                    operator: search.Operator.IS,
                    values: customer
                }));

                var resultSetScheduledCommReg = scheduledCommReg.run().getRange({
                    start: 0,
                    end: 1
                });

                if (!isNullorEmpty(resultSetScheduledCommReg[0])) {
                    var commReg = resultSetScheduledCommReg[0].getValue({ name: 'internalid' });

                    if (!isNullorEmpty(commReg)) {
                        searched_service_change = search.load({
                            id: 'customsearch_smc_service_chg',
                            type: 'customrecord_servicechg'
                        });
                        searched_service_change.push(search.createFilter({
                            name: 'custrecord_servicechg_comm_reg',
                            operator: search.Operator.IS,
                            values: commReg
                        }));

                        var searched_service_change_result = searched_service_change.run().getRange({
                            start: 0,
                            end: 100
                        });

                        searched_service_change_result.forEach(function(searchResult_service_change) {

                            service_ids[service_ids.length] = searchResult_service_change.getValue({ name: 'custrecord_servicechg_service' });

                            inlineHtml += '<tr>';

                            inlineHtml += '<td class="first_col"><button class="btn btn-warning btn-sm edit_class glyphicon glyphicon-pencil" data-servicechangeid="' + searchResult_service_change.getValue({
                                name: 'internalid'
                            }) + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><br/><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-servicechangeid="' + searchResult_service_change.getValue({
                                name: 'internalid'
                            }) + '" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                            inlineHtml += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service_change.getValue({
                                name: 'custrecord_servicechg_service'
                            }) + '" data-servicetypeid="' + searchResult_service_change.getValue({
                                name: 'custrecord_service',
                                join: 'CUSTRECORD_SERVICECHG_SERVICE'
                            }) + '" readonly value="' + searchResult_service_change.getText('custrecord_servicechg_service') + '" /></div></td>';
                            inlineHtml += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service_change.getValue({
                                name: 'custrecord_service_description',
                                join: 'CUSTRECORD_SERVICECHG_SERVICE'
                            }) + '"  type="text" /></div></td>';


                            inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service_change.getValue({
                                name: 'custrecord_service_price',
                                join: 'CUSTRECORD_SERVICECHG_SERVICE'
                            }) + '"  type="number" step=".01" /></div></td>';
                            inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value="' + searchResult_service_change.getValue({
                                name: 'custrecord_servicechg_new_price'
                            }) + '"  type="number" step=".01" /></div></td>';
                            inlineHtml += '<td><div class="date_effective_div input-group"><input class="form-control date_effective_class text-center" disabled value="' + searchResult_service_change.getValue({ name: 'custrecord_servicechg_date_effective' }) + '"  type="text" /></div></td>';

                            inlineHtml += '<td><div class="created_by_div input-group"><input class="form-control created_by_class text-center" disabled data-userid="' + searchResult_service_change.getValue({
                                name: 'custrecord_servicechg_created'
                            }) + '" value="' + searchResult_service_change.getText({ name: 'custrecord_servicechg_created' }) + '"  type="text" /></div></td>';

                            inlineHtml += '<td><div class="last_modified_div input-group"><input class="form-control last_modified_class text-center" disabled value="' + searchResult_service_change.getValue({ name: 'lastmodified' }) + '"  type="text" /></div></td>';

                            inlineHtml += '<td><div class="comm_type_div input-group"><input class="form-control comm_type_class text-center" disabled value="' + searchResult_service_change.getValue({ name: 'custrecord_servicechg_type' }) + '" data-commtypeid="" type="text" /></div></td>';

                            var freq = searchResult_service_change.getValue({ name: 'custrecord_servicechg_new_freq' });

                            inlineHtml += freqCal(freq);
                            inlineHtml += '</tr>';
                            return true;
                        });
                    }
                }

                /**
                 * Description - To get all the services associated with this customer
                 */

                var serv_customer_rec_filter = search.createFilter({
                    name: 'custrecord_service_customer',
                    operator: search.Operator.IS,
                    values: customer
                });
                if (!isNullorEmpty(service_ids)) {
                    serv_customer_rec_filter = search.createFilter({
                        name: 'custrecord_service_customer',
                        operator: search.Operator.IS,
                        values: customer
                    });
                }

                var serviceSearch = search.load({
                    type: 'customrecord_service',
                    id: 'customsearch_smc_services'
                });
                serviceSearch.filters.push(serv_customer_rec_filter);
                var resultSet_service = serviceSearch.run().getRange({
                    start: 0,
                    end: 100
                });

                if (serviceSearch.length != 0) { //&& serviceSearch.length > 4000
                    resultSet_service.forEach(function(searchResult_service) {
                        inlineHtml += '<tr>';

                        inlineHtml += '<td class="first_col"><button class="btn btn-warning btn-sm edit_class glyphicon glyphicon-pencil" data-servicechangeid="' + null + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><br/><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash hide" type="button" data-servicechangeid="" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                        inlineHtml += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service.getValue({ name: 'custrecord_service_price' }) + '" data-servicetypeid="' + searchResult_service.getText({ join: 'CUSTRECORD_SERVICE', name: 'internalid' }) + '" readonly value="' + searchResult_service.getText({ name: 'custrecord_service' }) + '" /></div></td>';
                        inlineHtml += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service.getValue({ name: 'custrecord_service_description' }) + '"  type="text" /></div></td>';

                        inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service.getValue({ name: 'custrecord_service_price' }) + '"  type="number" step=".01" /></div></td>';
                        inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value=""  type="number" step=".01" /></div></td>';
                        inlineHtml += '<td><div class="date_effective_div input-group"><input class="form-control date_effective_class text-center" disabled value=""  type="text" /></div></td>';
                        inlineHtml += '<td><div class="created_by_div input-group"><input class="form-control created_by_class text-center" disabled value=""  type="text" /></div></td>';
                        inlineHtml += '<td><div class="last_modified_div input-group"><input class="form-control last_modified_class text-center" disabled value=""  type="text" /></div></td>';

                        inlineHtml += '<td><div class="comm_type_div input-group"><input class="form-control comm_type_class text-center" disabled value="" data-commtypeid="" type="text" /></div></td>';

                        // log.debug({
                        //     title: mon,
                        //     details: searchResult_service.getText({
                        //         fieldId: 'custrecord_service_day_mon'
                        //     })
                        // });
                        // log.debug({
                        //     title: mon,
                        //     details: searchResult_service.getText({
                        //         fieldId: 'custrecord_service_day_mon'
                        //     })
                        // });

                        if (searchResult_service.getValue({ name: 'custrecord_service_day_mon' }) == 'T') {
                            inlineHtml += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>';
                        } else {
                            inlineHtml += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>';
                        }

                        if (searchResult_service.getValue({ name: 'custrecord_service_day_tue' }) == 'T') {
                            inlineHtml += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled checked/></div></td>';
                        } else {
                            inlineHtml += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled/></div></td>';
                        }

                        if (searchResult_service.getValue({ name: 'custrecord_service_day_wed' }) == 'T') {
                            inlineHtml += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled checked/></div></td>';
                        } else {
                            inlineHtml += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled /></div></td>';
                        }

                        if (searchResult_service.getValue({ name: 'custrecord_service_day_thu' }) == 'T') {
                            inlineHtml += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled checked/></div></td>';
                        } else {
                            inlineHtml += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled /></div></td>';
                        }

                        if (searchResult_service.getValue({ name: 'custrecord_service_day_fri' }) == 'T') {
                            inlineHtml += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled checked/></div></td>';
                        } else {
                            inlineHtml += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled /></div></td>';
                        }

                        if (searchResult_service.getValue({ name: 'custrecord_service_day_adhoc' }) == 'T') {
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

                form.addField({
                    id: 'custpage_customer_id',
                    type: ui.FieldType.TEXT,
                    label: 'Customer ID'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = parseInt(customer);


                form.addField({
                    id: 'custpage_customer_entityid',
                    type: ui.FieldType.TEXT,
                    label: 'Customer ID'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = entityid;

                form.addField({
                    id: 'custpage_customer_franchisee',
                    type: ui.FieldType.TEXT,
                    label: 'Franchisee ID'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = zee;

                form.addSubmitButton({
                    label: 'Submit'
                });

                form.addField({
                    id: 'preview_table',
                    label: 'inlinehtml',
                    type: 'inlinehtml'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW
                }).defaultValue = inlineHtml;

                form.addButton({
                    id: 'back',
                    label: 'Reset',
                    functionName: 'onclick_reset()'
                });

                form.addButton({
                    id: 'back',
                    label: 'Back',
                    functionName: 'onclick_back()'
                });

                form.clientScriptFileId = 4367324;

                context.response.writePage(form);
            } else {
                // var entity_id = request.getParameter('customer');
                var customer = context.request.parameters.custid;

                context.response.sendRedirect({
                    identifier: 'RECORD',
                    type: 'customer',
                    id: parseInt(customer)
                });

                var file = context.request.getFile('upload_file_1');

                if (!isNullorEmpty(file)) {
                    file.setFolder(2562887);

                    var file_type = file.getType();
                    if (file_type == 'PDF') {
                        file_type == 'pdf';
                        var file_name = getDate() + '_' + customer + '.' + file_type;
                        var file_name = 'service_change_notification_' + customer + '.' + file_type;
                    }
                    // else if (file_type == 'PNGIMAGE') {
                    //     file_type == 'png';
                    // } else if (file_type == 'PJPGIMAGE') {
                    //     file_type == 'png';
                    // }

                    file.setName(file_name);

                    if (file_type == 'PDF') {
                        var id = file.save(file);
                    } else {
                        error.create({
                            message: 'Must be in PDF format',
                            name: 'PDF_ERROR',
                            notifyOff: true
                        });
                    }

                    // Create file and upload it to the file cabinet.
                    // var id = nlapiSubmitFile(file);

                    // commRegRecord.setValue('custrecord_scand_form', id);

                    var commRegRecord = record.create({
                        type: 'customrecord_commencement_register' //id: commRegID
                    });

                    commRegRecord.setValue({
                        fieldId: 'custrecord_scand_form',
                        value: id
                    });
                    log.audit({
                        title: 'Audit Entry - Document ID',
                        details: 'Document Value / ID is: ' + id
                    });
                    commRegRecord.save()
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

            var todayDate = nlapiStringToDate(stringDate);
            var month = pad(todayDate.getMonth() + 1);
            var day = pad(todayDate.getDate());
            var year = (todayDate.getFullYear());
            return year + "-" + month + "-" + day;
        }

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        return {
            onRequest: onRequest
        };

    });