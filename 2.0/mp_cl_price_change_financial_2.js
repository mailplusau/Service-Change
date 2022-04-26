/**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: 
 * @Last Modified by: Anesu Chakaingesu
 * 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function(error, runtime, search, url, record, format, email, currentRecord) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;
        var currRec = currentRecord.get();

        var zee_id = parseInt(currRec.getValue({ fieldId: 'custpage_price_chng_fin_zee_id' }));
        if (!isNullorEmpty(zee_id)) {
            var zee_rec = record.load({ type: 'partner', id: zee_id });
            var zee_name = zee_rec.getValue({ fieldId: 'companyname' });
        }

        var dataSet = []
        var saveObject = [];

        /**
         * On page initialisation
         */
        function pageInit() {
            // Background-Colors
            $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
            $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
            $("#body").css("background-color", "#CFE0CE");

            $(document).on("change", "#zee_filter_dropdown", function() {
                var zee_id_dropdown = $(this).find("option:selected").val();
                var params = {
                    zeeid: zee_id_dropdown,
                };
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({
                    deploymentId: "customdeploy_sl_price_change_financial_2",
                    scriptId: "customscript_sl_price_change_financial_2",
                }) + "&custparam_params=" + params;
                currRec.setValue({
                    fieldId: "custpage_price_chng_fin_zee_id",
                    value: zee_id,
                });
                window.location.href = upload_url;
            });

            if (!isNullorEmpty(zee_id)) {
                loadCustomers(zee_id);

                var dataTable = $("#debt_preview").DataTable({
                    data: dataSet,
                    pageLength: 100,
                    order: [],
                    columns: [
                        { title: "Internal ID" }, // 0
                        { title: "ID" }, // 1
                        { title: "Company Name" }, // 2
                        { title: "Current Service Price" }, // 3,
                        { title: "Increase Amount" }, // 4,
                        { title: 'Total Increase' }, // 5
                        { title: "Date Effective" }, // 6
                    ],
                    columnDefs: [{
                            targets: [5],
                            visible: false,
                        },
                        {
                            width: "20%",
                            targets: [4]
                        }
                    ],
                    autoWidth: false,
                });
            }

            $('#submit').on('click', function() {
                saveRecord();
            });

            $(document).on('change', '#date_effective', function() {
                var date = $(this).val();
                $('.new_date_eff').val(date);
            });

            // Update Increase Amount on Click of Plus Button
            $(document).on('click', '.ampo_header', function() {
                var ampo_inc_amount = $('#ampo_header_input').val();
                $('.ampo_inc_amount').val(ampo_inc_amount);

                $(this).find('span').removeClass('glyphicon-plus');
                $(this).removeClass('btn-warning')
                $(this).find('span').addClass('glyphicon-ok');
                $(this).addClass('btn-success')
            })
            $(document).on('click', '.pmpo_header', function() {
                var pmpo_inc_amount = $('#pmpo_header_input').val();
                $('.pmpo_inc_amount').val(pmpo_inc_amount);

                $(this).find('span').removeClass('glyphicon-plus');
                $(this).removeClass('btn-warning')
                $(this).find('span').addClass('glyphicon-ok');
                $(this).addClass('btn-success')
            })
            $(document).on('click', '.cb_header', function() {
                var cb_inc_amount = $('#cb_header_input').val();
                $('.cb_inc_amount').val(cb_inc_amount);

                $(this).find('span').removeClass('glyphicon-plus');
                $(this).removeClass('btn-warning')
                $(this).find('span').addClass('glyphicon-ok');
                $(this).addClass('btn-success')
            })
            $(document).on('click', '.eb_header', function() {
                var eb_inc_amount = $('#eb_header_input').val();
                $('.eb_inc_amount').val(eb_inc_amount);

                $(this).find('span').removeClass('glyphicon-plus');
                $(this).removeClass('btn-warning')
                $(this).find('span').addClass('glyphicon-ok');
                $(this).addClass('btn-success')
            })

            // Popup - Modal
            $(document).on('click', '#servicesAll', function() { onclick_listOfServices(); });

            /**
             * [description] - On click of the Add button
             */
            $(document).on('click', '.add_class', function(event) {
                var currentScript = currentRecord.get();
                var zeeCust = currentScript.getValue({
                    fieldId: 'zee',
                });
                zee = parseInt(zeeCust);
                var multiCust = currentScript.getValue({
                    fieldId: 'multi_zee',
                });

                var multi_zee = multiCust;

                var multiTextCust = currentScript.getValue({
                    fieldId: 'multi_zee_text',
                });

                var multi_zee_text = multiTextCust;

                var operatorSearch = search.load({
                    id: 'customsearch_app_operator_load',
                    type: 'customrecord_operator'
                });

                operatorSearch.filters.push(search.createFilter({
                    name: 'custrecord_operator_franchisee',
                    operator: search.Operator.IS,
                    values: zee
                }));

                var resultSet = operatorSearch.run();

                var row_count = $('#run_table tr').length;

                row_count++;

                var create_run_html = '';

                create_run_html += '<tr><td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-runplanid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Package"></button><input type="hidden" class="delete_run" value="F" /></td>';

                create_run_html += '<td><input class="form-control run_name" type="text" /></td>';
                create_run_html += '<td><select class="form-control operator" >';
                resultSet.each(function(searchResult) {
                    var operator_internal_id = searchResult.getValue("internalid");
                    var operator_name = searchResult.getValue("name");
                    create_run_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

                    return true;
                });

                create_run_html += '</select></td>';
                if (!isNullorEmpty(multi_zee)) {
                    create_run_html += '<td><select multiple class="form-control run_zee">';
                    var multi_zee_array = multi_zee.split(',');
                    var multi_zee_text_array = multi_zee_text.split(',');
                    for (x = 0; x < multi_zee_array.length; x++) {

                        create_run_html += '<option value="' + multi_zee_array[x] + '">' + multi_zee_text_array[x] + '</option>';

                    }
                    create_run_html += '</td>';
                }
                create_run_html += '</tr>';

                $('#run_table tr:last').after(create_run_html);

                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_run_class add_class');
                $(this).find('edit_class').prop('title', 'Edit Package');
                $(this).closest('tr').find('.run_name').attr("readonly", "readonly");
                $(this).closest('tr').find('.operator').attr("readonly", "readonly");

                $(this).closest('tr').find('.first_col').append('<button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" data-runplanid="" title="Delete"></button>');

            });


            $(document).on('click', '.edit_service_class', function(event) {
                var currentScript = currentRecord.get();
                var zeeCust = currentScript.getValue({
                    fieldId: 'zee',
                });
                var multiCust = currentScript.getValue({
                    fieldId: 'multi_zee',
                });

                var multiTextCust = currentScript.getValue({
                    fieldId: 'multi_zee_text',
                });

                zee = parseInt(zeeCust);
                var multi_zee = multiCust;
                var multi_zee_text = multiTextCust;


                var runplanid = $(this).attr('data-runplanid');
                $(this).closest('tr').find('.run_name').removeAttr("readonly");
                $(this).closest('tr').find('.operator').removeAttr("readonly");
                if (!isNullorEmpty(multi_zee)) {
                    $(this).closest('tr').find('.run_zee').removeAttr("readonly");
                }


                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_run_class save_edit_class');

            });


            $(document).on('click', '.save_edit_class', function(event) {
                var currentScript = currentRecord.get();
                var zeeCust = currentScript.getValue({
                    fieldId: 'zee',
                });
                var multiCust = currentScript.getValue({
                    fieldId: 'multi_zee',
                });

                var multiTextCust = currentScript.getValue({
                    fieldId: 'multi_zee_text',
                });

                zee = parseInt(zeeCust);
                var multi_zee = multiCust;
                var multi_zee_text = multiTextCust;


                var runplanid = $(this).attr('data-runplanid');
                $(this).closest('tr').find('.run_name').attr("disabled", "disabled");
                $(this).closest('tr').find('.operator').attr("disabled", "disabled");

                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_service_class save_edit_class');

            });

            /**
             * [description] - On click of the delete button
             */
            $(document).on('click', '.remove_class', function(event) {
                if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

                    $(this).closest('tr').find('.delete_run').val("T");
                    $(this).closest("tr").hide();
                }
            });
        }

        function loadCustomers(zee_id) {
            var saveServQty = '';
            var serviceTot = 0;
            var service_count = 0;
            var prev_cust_id = [];
            var index = 0;
            var totalAmount = 0;

            //Search: SMC - Customer
            var customerSearch = search.load({
                type: "customer",
                id: "customsearch_smc_customer_4",
            });
            customerSearch.filters.push(
                search.createFilter({
                    name: "partner",
                    operator: search.Operator.ANYOF,
                    values: zee_id,
                })
            );
            console.log('OUTSIDE')

            customerSearch.run().each(function(searchResult) {
                console.log('Index: ' + index)
                var custid = searchResult.getValue({
                    name: "internalid",
                    summary: "GROUP"
                });
                if (index == 0) {
                    prev_cust_id.push(custid);
                }

                var entityid = searchResult.getValue({
                    name: "entityid",
                    summary: "GROUP"
                });
                var companyname = searchResult.getValue({
                    name: "companyname",
                    summary: "GROUP"
                });
                var last_price_increase = searchResult.getValue({
                    name: "custentity_date_of_last_price_increase"
                });
                // var parent_maap_number = searchResult.getValue({ name: "custentity_maap_bankacctno_parent", join:sullSummary operatorsearch.Summary.GROUP});

                /**
                 *  List of Services
                 */
                var service = searchResult.getText({
                    name: "custrecord_service",
                    join: 'CUSTRECORD_SERVICE_CUSTOMER',
                    summary: "GROUP"
                });
                var service_lower = service.toLowerCase();
                console.log('Service: ' + service + " $ " + searchResult.getValue({
                    name: "custrecord_service_price",
                    join: 'CUSTRECORD_SERVICE_CUSTOMER',
                    summary: "GROUP"
                }));

                /**
                 *  List of Current Service Inline HTML
                 */
                var serviceQty = ''; // <div class="form-group container">

                if (service_count == 2 || service_count == 4) {
                    saveServQty += '<div class="w-100"></div>'
                }
                var service_ampo = '$' + searchResult.getValue({
                    name: "custrecord_service_price",
                    join: 'CUSTRECORD_SERVICE_CUSTOMER',
                    summary: "GROUP"
                });
                serviceQty += '<div class="col-xs-6">';
                serviceQty += '<div class="input-group">';
                serviceQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="' + service_lower + '_number">' + service + '</span>';
                serviceQty += '<label id="' + service_lower + '_curr" class="form-control ' + service_lower + '_curr" type="text">' + service_ampo + '</label>';
                serviceQty += '</div>'
                serviceQty += '</div>'

                service_count++;

                saveServQty += serviceQty;
                serviceTot += service;
                // serviceQty += '</div>';

                /**
                 *  Increase Amount Inline HTML
                 */
                // var inlineQty = ''; //<div class="form-group container">

                // inlineQty += '<div class="row">';

                // inlineQty += '<div class="col-xs-6">';
                // inlineQty += '<div class="input-group">';
                // inlineQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="ampo_header_text">AMPO</span>';
                // inlineQty += '<input id="ampo_inc_amount" class="form-control ampo_inc_amount" placeholder="$" type="number"/>';
                // inlineQty += '</div>';
                // inlineQty += '</div>';

                // // AMPO
                // inlineQty += '<div class="col-xs-6">';
                // inlineQty += '<div class="input-group">';
                // inlineQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="ampo_header_text">AMPO</span>';
                // inlineQty += '<input id="ampo_inc_amount" class="form-control ampo_inc_amount" placeholder="$" type="number"/>';
                // inlineQty += '</div>';
                // inlineQty += '</div>';

                // // PMPO
                // inlineQty += '<div class="col-xs-6">';
                // inlineQty += '<div class="input-group">';
                // inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon" id="pmpo_number">PMPO</span>';
                // inlineQty += '<input id="pmpo_inc_amount" class="form-control pmpo_inc_amount" placeholder="$" type="number"/>';
                // inlineQty += '</div>';
                // inlineQty += '</div>';

                // inlineQty += '</div>';

                // inlineQty += '<div class="row">';

                // // EB
                // inlineQty += '<div class="col-xs-6">';
                // inlineQty += '<div class="input-group">';
                // inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon" id="eb_number">EB</span>';
                // inlineQty += '<input id="eb_inc_amount" class="form-control eb_inc_amount" placeholder="$" type="number"/>';
                // inlineQty += '</div>';
                // inlineQty += '</div>';

                // // CB
                // inlineQty += '<div class="col-xs-6">';
                // inlineQty += '<div class="input-group">';
                // inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon" id="cb_number">CB</span>';
                // inlineQty += '<input id="cb_inc_amount" class="form-control cb_inc_amount" placeholder="$" type="number"/>';
                // inlineQty += '</div>';
                // inlineQty += '</div>';

                // inlineQty += '</div>';

                // inlineQty += '</div>';

                var inlineQty = '';
                inlineQty += '<div class="col-xs-6">';
                inlineQty += '<div class="input-group">';
                inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon" id="' + service_lower + '_number">' + service + '</span>';
                inlineQty += '<input id="' + service_lower + '_inc_amount" class="form-control ' + service_lower + '_inc_amount" placeholder="$" type="number"/>';
                inlineQty += '</div>';
                inlineQty += '</div>';

                if (prev_cust_id.indexOf(custid) == -1) {
                    console.log('New Customer')

                    var serviceHTML = '<div class="row">';
                    serviceHTML += saveServQty
                    serviceHTML += '</div>';

                    console.log(saveServQty)

                    dataSet.push([
                        '<p id="internalID" class="internalID">' + custid + '</p>',
                        '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + custid + '"><p class="entityid" style="text-align:left;">' + entityid + "</p></a>",
                        '<p internalid="companyname" class="companyname">' + companyname + '</p>',
                        serviceHTML,
                        inlineQty,
                        serviceTot,
                        '<input type="date" class="form-control new_date_eff"/>'
                    ]);

                    service_count = 0;
                    saveServQty = '';
                }

                prev_cust_id.push(custid);

                // Store info until new Customer

                // dataSet1.push(['☑', custid, companyname, last_price_increase, inlineQty]);

                totalAmount++;
                index++;

                return true;
            });
        }

        function onclick_listOfServices() {
            // Header Information
            var service_html = '<table id= "run_table" class="table table-responsive table-striped"><thead><tr class="info"><th><b>ACTION</b></th><th><b>SERVICE NAME</b></th><th><b>INCREASE AMOUNT</b></th>';
            service_html += '</thead><tbody>';

            // Load Service Record
            var serviceSea = search.load({ type: 'customrecord_service_type', id: 'customsearch_rta_service_types_2' })
            var serviceRes = serviceSea.run();

            // Load Zee Services
            var searchSet = search.load({ type: 'customrecord_spc_zee_serv_list', id: 'customsearch_spc_zee_serv_list' });
            searchSet.filters.push(search.createFilter({
                name: 'custrecord_spc_zee_serv_zee',
                operator: search.Operator.IS,
                values: zee_id
            }));
            var resultSet_Service = searchSet.run();

            /**
             *  Existing Services
             */
            resultSet_Service.each(function(searchResult_Service) {

                service_html += '<tr>';

                service_html += '<td class="first_col"><button class="btn btn-warning btn-sm edit_service_class glyphicon glyphicon-pencil" data-serviceid="' + searchResult_Service.getValue('custrecord_spc_zee_serv_id') + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" data-serviceid="' + searchResult_Service.getValue('custrecord_spc_zee_serv_id') + '" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                service_html += '<td><select class="form-control operator" disabled>';
                serviceRes.each(function(searchResult) {
                    var operator_internal_id = searchResult.getValue("internalid");
                    var operator_name = searchResult.getValue("name");

                    if (searchResult_Service.getValue('custrecord_spc_zee_serv_id') == operator_internal_id) {
                        service_html += '<option selected value="' + operator_internal_id + '">' + operator_name + '</option>';
                    } else {
                        service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';
                    }

                    return true;
                });

                service_html += '<td><input id="inc_amount" class="form-control inc_amount" placeholder="$" type="number" value="' + searchResult_Service.getValue('custrecord_spc_zee_serv_inc_am') + '"/></td>';

                service_html += '</select></td>';
                service_html += '</tr>';

                return true;
            });


            /**
             *  Add New Service
             */
            service_html += '<tr>';

            // Add Button
            service_html += '<td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Package"></button><input type="hidden" class="delete_service" value="F" /></td>';
            // Service Name
            service_html += '<td><select class="form-control service_name" >';
            serviceRes.each(function(searchResult) {

                var operator_internal_id = searchResult.getValue("internalid");
                var operator_name = searchResult.getValue("name");

                service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

                return true;
            })
            service_html += '</select></td>';
            // Increase Amount
            service_html += '<td><input class="form-control inc_amount" placeholder="$" type="number" /></td>';

            service_html += '</tr>';

            // Create Modal
            service_html += '</tbody></table>';
            $('#myModal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Add/Edit List of Services</label></h4></div>');
            $('#myModal .modal-body').html("");
            $('#myModal .modal-body').html(service_html);
            $('#myModal').modal("show");
        }

        function saveRecord(context) {
            // Clear JSON
            saveObject = [];

            /**
             *  Start Save Function ::
             */
            // Header Information
            var internalID = document.getElementsByClassName('internalID')
            var id = document.getElementsByClassName('entityid')
                // var companyname = document.getElementsByClassName('companyname');

            // Date Effective at Top
            var date_effective = document.getElementById('date_effective');
            date_effective = new Date(date_effective.value);
            date_effective.toISOString().split('T')[0];
            date_effective = dateISOToNetsuite(date_effective);
            date_effective = format.parse({ value: date_effective, type: format.Type.DATE });


            /** 
             *  Data in Table 
             */
            // Date Effective Class in Table
            var date_eff_in_table = document.getElementsByClassName('new_date_eff');

            //Services
            var ampo_inc_amount = document.getElementsByClassName('ampo_inc_amount');
            var pmpo_inc_amount = document.getElementsByClassName('pmpo_inc_amount');
            var eb_inc_amount = document.getElementsByClassName('eb_inc_amount');
            var cb_inc_amount = document.getElementsByClassName('cb_inc_amount');


            /**
             *  Save Record Object :
             * 
             *  Create JSON that contains Object for each Customer and corresponding customer price increase information
             */
            for (var x = 0; x < id.length; x++) {

                var cust_id = parseInt(internalID[x].innerHTML);
                var entity_id = parseInt(id[x].innerHTML);

                var date_eff = new Date(date_eff_in_table[x].value);
                date_eff.toISOString().split('T')[0];
                date_eff = dateISOToNetsuite(date_eff);
                date_eff = format.parse({ value: date_eff, type: format.Type.DATE });

                var ampo_val = 0;
                var pmpo_val = 0;
                var cb_val = 0;
                var eb_val = 0;
                if (!isNullorEmpty(ampo_inc_amount[x])) {
                    ampo_val = parseInt(ampo_inc_amount[x].value);
                }
                if (!isNullorEmpty(pmpo_inc_amount[x].value)) {
                    pmpo_val = parseInt(ampo_inc_amount[x].value);
                }
                if (!isNullorEmpty(cb_inc_amount[x].value)) {
                    cb_val = parseInt(ampo_inc_amount[x].value);
                }
                if (!isNullorEmpty(eb_inc_amount[x].value)) {
                    eb_val = parseInt(ampo_inc_amount[x].value);
                }

                saveObject.push({
                    customerId: cust_id,
                    entityId: entity_id,
                    dateEff: date_eff,
                    services: {
                        ampo: ampo_val,
                        pmpo: pmpo_val,
                        cb: cb_val,
                        eb: eb_val
                    },
                })
            }

            var rec = record.create({
                type: 'customrecord_spc_finance_alloc',
                isDynamic: true
            });
            rec.setValue({ fieldId: 'name', value: zee_name });
            rec.setValue({ fieldId: 'custrecord_price_chg_fin_zee', value: zee_id })
            rec.setValue({ fieldId: 'custrecord_price_chg_fin_date_eff', value: date_effective })
            rec.setValue({ fieldId: 'custrecord_price_chg_fin_json', value: JSON.stringify(saveObject) });
            rec.save();

            console.log('Save record Information: ' + zee_name + ' ' + zee_id + ' ' + date_effective)
            console.log(saveObject);

            alert('Record has been Saved');

            location.reload();

            return true;
        }

        /**
         * @param   {Number} x
         * @returns {String} The same number, formatted in Australian dollars.
         */
        function financial(x) {
            if (typeof(x) == 'string') {
                x = parseFloat(x);
            }
            if (isNullorEmpty(x) || isNaN(x)) {
                return "$0.00";
            } else {
                return x.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
            }
        }

        /**
         * Used to pass the values of `date_from` and `date_to` between the scripts and to Netsuite for the records and the search.
         * @param   {String} date_iso       "2020-06-01"
         * @returns {String} date_netsuite  "1/6/2020"
         */
        function dateISOToNetsuite(date_iso) {
            var date_netsuite = '';
            if (!isNullorEmpty(date_iso)) {
                var date_utc = new Date(date_iso);
                // var date_netsuite = nlapiDateToString(date_utc);
                var date_netsuite = format.format({
                    value: date_utc,
                    type: format.Type.DATE
                });
            }
            return date_netsuite;
        }

        /**
         * [getDate description] - Get the current date
         * @return {[String]} [description] - return the string date
         */
        function getDate() {
            var date = new Date();
            date = format.format({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            });

            return date;
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord
        };
    });