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

        // Load Service Record
        var serviceSea = search.load({ type: 'customrecord_service_type', id: 'customsearch_rta_service_types_2' })
        var serviceRes = serviceSea.run();
        serviceList = [];
        serviceRes.each(function(res) {
            var internalid = res.getValue({ name: 'internalid' });
            var name = res.getValue({ name: 'name' })
            serviceList.push({
                id: internalid,
                name: name
            });
            return true;
        });

        /**
         * On page initialisation
         */
        function pageInit() {
            // Background-Colors
            $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
            $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
            $("#body").css("background-color", "#CFE0CE");

            $('.loading_section').hide();
            $('#submit').removeClass('hide');

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
                            width: "25%",
                            targets: [4]
                        }
                    ],
                    autoWidth: false,
                });
            }

            // Submitter
            $('#submit').on('click', function() {
                saveRecord();
            });

            /**
             *  Increase Price on All Services Section
             */
            $(document).on('change', '#date_effective', function() {
                var date = $(this).val();
                $('.new_date_eff').val(date);

                alert('Service Increase Date has been')
            });
            $(document).on('click', '#servicesAll', function() {
                onclick_listOfServices();
                $('#servicesAddAll').removeClass('hide');
                $('#servicesRemoveAll').removeClass('hide')
            });
            // Update Increase Amount on Click of Plus Button
            $(document).on('click', '#servicesAddAll', function() {
                var inc_amount_elem = document.getElementsByClassName("inc_amount");
                var service_name_elem = document.getElementsByClassName("service_name");

                for (var x = 0; x < service_name_elem.length - 1; x++) {
                    $('.' + service_name_elem[x].value).val(inc_amount_elem[x].value);
                };

                alert('All Service Increase Amounts have been Updated')
            });
            $(document).on('click', '#servicesRemoveAll', function() {
                if (confirm('Are you sure you want to remove all service increase amounts?\n\nAll services will need to be re-entered.')) {
                    dataTable.$('.increase_amount').val(null);
                    alert('All Service Increase Amounts Removed');
                }
            });

            /** 
             *  Popup - Modal: Select Services
             */
            /* On click of the Add button */
            $(document).on('click', '.add_class', function(event) {

                if ($(this).closest('tr').find('.service_name').val() || $(this).closest('tr').find('.inc_amount').val()) {
                    var create_service_html = '';

                    create_service_html += '<tr><td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="' + $(this).closest('tr').find('.service_name').val() + '" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button><input type="hidden" class="delete_service" value="F" /></td>';
                    create_service_html += '<td><select class="form-control service_name" >';
                    create_service_html += '<option></option>'
                    serviceList.forEach(function(searchResult) {
                        var operator_internal_id = searchResult.id;
                        var operator_name = searchResult.name;
                        create_service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

                        return true;
                    })

                    create_service_html += '</select></td>';
                    // Increase Amount
                    create_service_html += '<td><input class="form-control inc_amount" placeholder="$" type="number"/></td>';

                    create_service_html += '</tr>';

                    $('#service_table tr:last').after(create_service_html);

                    $(this).toggleClass('btn-warning btn-success')
                    $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                    $(this).toggleClass('edit_service_class add_class');
                    $(this).find('edit_class').prop('title', 'Edit Service');
                    $(this).closest('tr').find('.inc_amount').attr("disabled", "disabled");
                    $(this).closest('tr').find('.service_name').attr("disabled", "disabled");

                    $(this).closest('tr').find('.first_col').append('<button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" data-serviceid="" title="Delete"></button>');
                } else {
                    if ($(this).closest('tr').find('.inc_amount').val()) {
                        alert('Invalid Increase Amount. Please add a valid Increase Amount to Proceed');
                    } else {
                        alert('No Service Selected. Please Selected a Service Amount to Proceed');
                    }
                }
            });


            $(document).on('click', '.edit_service_class', function(event) {

                var serviceid = $(this).attr('data-serviceid');
                $(this).closest('tr').find('.inc_amount').removeAttr("disabled");
                $(this).closest('tr').find('.service_name').removeAttr("disabled");

                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_service_class save_edit_class');

            });


            $(document).on('click', '.save_edit_class', function(event) {

                var old_serviceid = $(this).attr('data-serviceid');
                $(this).closest('tr').find('.inc_amount').attr("disabled", "disabled");
                $(this).closest('tr').find('.service_name').attr("disabled", "disabled");

                var new_service_id = $(this).closest('tr').find('.service_name').val();
                $(this).attr('data-serviceid', new_service_id);

                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_service_class save_edit_class');

            });

            /**
             * [description] - On click of the delete button
             */
            $(document).on('click', '.remove_class', function(event) {
                if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

                    $(this).closest('tr').find('.delete_service').val("T");
                    $(this).closest("tr").hide();
                    $(this).closest('tr').addClass('hidden')
                }
            });

            $(document).on('click', '.save_service', function(event) {

                var delete_service_elem = document.getElementsByClassName("delete_service");
                var edit_class_elem = document.getElementsByClassName("edit_service_class");
                var inc_amount_elem = document.getElementsByClassName("inc_amount");
                var service_name_elem = document.getElementsByClassName("service_name");
                console.log(service_name_elem);
                console.log(service_name_elem[0]);
                for (var i = 0; i < edit_class_elem.length; ++i) {

                    var serviceID = edit_class_elem[i].getAttribute('data-zeeservid');
                    console.log('Service ID: ' + serviceID)

                    if (delete_service_elem[i].value == 'T') {
                        if (!isNullorEmpty(serviceID)) {
                            console.log('Deleted Record');
                            var zee_service_record = record.load({
                                type: 'customrecord_spc_zee_serv_list',
                                id: serviceID,
                            });
                            zee_service_record.setValue({ fieldId: 'isinactive', value: true });
                            zee_service_record.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            console.log('Save ID: ' + zee_service_record)
                        }
                    } else {
                        if (isNullorEmpty(serviceID)) {
                            console.log('New');
                            var zee_service_record = record.create({ type: 'customrecord_spc_zee_serv_list' });
                        } else {
                            console.log('Edit Existing');
                            var zee_service_record = record.load({
                                type: 'customrecord_spc_zee_serv_list',
                                id: serviceID,
                            });
                        }
                        var serv_name_select = service_name_elem[i];
                        zee_service_record.setValue({ fieldId: 'name', value: serv_name_select.options[serv_name_select.selectedIndex].text })
                        zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_serv_inc_am', value: inc_amount_elem[i].value });
                        zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_serv_id', value: edit_class_elem[i].getAttribute('data-serviceid') });
                        zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_serv_zee', value: zee_id });
                        zee_service_record.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        console.log('Save ID: ' + zee_service_record)
                    }

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

            var saveInlineQty = '';

            //Search: SMC - Customer
            var customerSearch = search.load({
                type: "customer",
                id: "customsearch_smc_customer_4",
            });
            customerSearch.filters.push(search.createFilter({
                name: "partner",
                operator: search.Operator.ANYOF,
                values: zee_id,
            }));

            customerSearch.run().each(function(searchResult) {
                // console.log('Index: ' + index)
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

                // console.log('Service: ' + service + " $ " + searchResult.getValue({
                //     name: "custrecord_service_price",
                //     join: 'CUSTRECORD_SERVICE_CUSTOMER',
                //     summary: "GROUP"
                // }));

                if (!isNullorEmpty(service)) {
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

                    service_lower = altPackageName(service_lower);
                    service = altPackageName(service);

                    var service_id = serviceList.filter(function(el) { if (el.name == service) { return el } })[0].id;

                    serviceQty += '<div class="col-xs-6">';
                    serviceQty += '<div class="input-group">';
                    serviceQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="' + service_lower + '_number">' + service + '</span>';
                    serviceQty += '<label id="' + service_id + '_curr" class="form-control ' + service_lower + '_curr" type="text">' + service_ampo + '</label>';
                    serviceQty += '</div>'
                    serviceQty += '</div>'

                    service_count++;

                    saveServQty += serviceQty;
                    serviceTot += service;
                    // serviceQty += '</div>';

                    /**
                     *  Increase Amount Inline HTML
                     */
                    var inlineQty = '';
                    if (service_count == 2 || service_count == 4) {
                        inlineQty += '<div class="w-100"></div>'
                    }
                    inlineQty += '<div class="col-xs-6">';
                    inlineQty += '<div class="input-group">';
                    inlineQty += '<span style="background-color: #379E8F; color: white;" class="increase_text input-group-addon" id="' + service_lower + '_number">' + service + '</span>';
                    inlineQty += '<input id="' + service_id + '" class="form-control increase_amount ' + service_lower + '_inc_amount ' + service_id + '" placeholder="$" type="number"/>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    saveInlineQty += inlineQty;
                }

                if (prev_cust_id.indexOf(custid) == -1) {
                    var serviceHTML = '<div class="row">';
                    serviceHTML += saveServQty
                    serviceHTML += '</div>';

                    var inlineHTML = '<div class="row">';
                    inlineHTML += saveInlineQty
                    inlineHTML += '</div>';

                    dataSet.push([
                        '<p id="internalID" class="internalID">' + custid + '</p>',
                        '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + custid + '"><p class="entityid" style="text-align:left;">' + entityid + "</p></a>",
                        '<p internalid="companyname" class="companyname">' + companyname + '</p>',
                        serviceHTML,
                        inlineHTML,
                        serviceTot,
                        '<input type="date" class="form-control new_date_eff"/>'
                    ]);

                    service_count = 0;
                    saveServQty = '';
                    saveInlineQty = '';
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
            var service_html = '<table id= "service_table" class="table table-responsive table-striped"><thead><tr class="info"><th><b>ACTION</b></th><th><b>SERVICE NAME</b></th><th><b>INCREASE AMOUNT</b></th>';
            service_html += '</thead><tbody>';

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

                service_html += '<td class="first_col"><button class="btn btn-warning btn-sm edit_service_class glyphicon glyphicon-pencil" data-serviceid="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) + '" data-zeeservid="' + searchResult_Service.getValue({ name: "internalid" }) + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" data-serviceid="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) + '" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                service_html += '<td><select class="form-control service_name" disabled>';
                // serviceRes.each(function(searchResult) {
                //     var operator_internal_id = searchResult.getValue("internalid");
                //     var operator_name = searchResult.getValue("name");

                //     if (searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) == operator_internal_id) {
                //         service_html += '<option selected value="' + operator_internal_id + '">' + operator_name + '</option>';
                //     } else {
                //         service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';
                //     }

                //     return true;
                // });
                serviceList.forEach(function(searchResult) {
                    var operator_internal_id = searchResult.id;
                    var operator_name = searchResult.name;

                    if (searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) == operator_internal_id) {
                        service_html += '<option selected value="' + operator_internal_id + '">' + operator_name + '</option>';
                    } else {
                        service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';
                    }

                    return true;
                })

                service_html += '<td><input id="inc_amount" class="form-control inc_amount" placeholder="$" type="number" value="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_inc_am' }) + '" disabled/></td>';

                service_html += '</select></td>';
                service_html += '</tr>';

                return true;
            });


            /**
             *  Add New Service
             */
            service_html += '<tr>';

            // Add Button
            service_html += '<td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button><input type="hidden" class="delete_service" value="F" /></td>';
            // Service Name
            service_html += '<td><select class="form-control service_name" >';
            service_html += '<option></option>';
            // serviceRes.each(function(searchResult) {

            //     var operator_internal_id = searchResult.getValue("internalid");
            //     var operator_name = searchResult.getValue("name");

            //     service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

            //     return true;
            // })
            serviceList.forEach(function(searchResult) {
                var operator_internal_id = searchResult.id;
                var operator_name = searchResult.name;
                service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

                return true;
            })
            service_html += '</select></td>';
            // Increase Amount
            service_html += '<td><input class="form-control inc_amount" placeholder="$" type="number"/></td>';

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

        function altPackageName(str) {
            if (str.includes('Package')) {
                str.replace(/[^A-Z0-9]+/ig, "_");
            }
            return str;
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