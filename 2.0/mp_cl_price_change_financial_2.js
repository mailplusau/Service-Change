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
        if (runtime.envType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        
        var role = runtime.getCurrentUser().role;
        var currRec = currentRecord.get();
        var ctx = runtime.getCurrentScript();

        var zee_id = parseInt(currRec.getValue({ fieldId: 'custpage_price_chng_fin_zee_id' }));
        if (!isNullorEmpty(zee_id)) {
            var zee_rec = record.load({ type: 'partner', id: zee_id });
            var zee_name = zee_rec.getValue({ fieldId: 'companyname' });
        }

        var dataSet = []

        // Load Service Record
        var serviceTypeSea = search.load({ type: 'customrecord_service_type', id: 'customsearch_rta_service_types_2' })
        var serviceTypeRes = serviceTypeSea.run();
        var serviceTypeList = [];
        serviceTypeRes.each(function(res) {
            var internalid = res.getValue({ name: 'internalid' });
            var name = res.getValue({ name: 'name' })
            serviceTypeList.push({
                id: internalid,
                name: name
            });
            return true;
        });

        // Load Allocated Zee Service Record
        var savedList = [];
        var currAllocatedSearch = search.load({
            id: 'customsearch_spc_finance_alloc',
            type: 'customrecord_spc_finance_alloc'
        });
        currAllocatedSearch.filters.push(search.createFilter({
            name: 'custrecord_price_chg_fin_zee',
            operator: search.Operator.IS,
            values: zee_id
        }));
        currAllocatedSearch.run().each(function(res) {
            var internalid = res.getValue({ name: 'internalid' });
            var date_eff = res.getValue({ name: 'custrecord_price_chg_fin_date_eff' });
            var cust_id = res.getValue({ name: 'custrecord_price_chg_fin_cust_id' });
            var service_id = res.getValue({ name: 'custrecord_price_chg_fin_serv' });
            var service_type_id = res.getValue({ name: 'custrecord_price_chg_fin_serv_type_id' });
            var inc_price = res.getValue({ name: 'custrecord_price_chg_fin_inc_am' });
            
            /** IT Page List */
            var approved = res.getValue({ name: 'custrecord_price_chg_it_approve' });
            var emailed = res.getValue({ name: 'custrecord_price_chg_it_email_sent' });
            var serv_chg_id = res.getValue({ name: 'custrecord_price_chg_it_serv_chg_id' });

            savedList.push({ id: internalid, custid: cust_id, zeeid: zee_id, servid: service_id, servtypeid: service_type_id, date: date_eff, incval: inc_price, approved: approved, emailed: emailed, serv_chg_id: serv_chg_id });
            return true;
        });
        console.log(savedList)

        // Date Today n Date Tomorrow
        var today_date = new Date(); // Test Time 6:00pm - '2022-06-29T18:20:00.000+10:00'
        today_date.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })
        var hour_time = today_date.getHours();

        if (hour_time < 17){ // If Current Time is Before 5:00pm
            today_date = today_date.toISOString().split('T')[0];
        } else { // If Current Time is After 5:00pm, Change Date as Tomorrow.
            var today_year = today_date.getFullYear();
            var today_month = today_date.getMonth();
            var today_day = today_date.getDate();
            var today_in_day = new Date(Date.UTC(today_year, today_month, today_day + 1));
            today_date = today_in_day.toISOString().split('T')[0]; 
        }
        console.log(today_date)
        
        // Maximum Invoice Search
        var maxInvID = []; // Max Invoice ID
        var maxInvItem = [];
        var cust_index = 0;
        var maxInvCust = [];
        var maxInvSearch = search.load({
            id: 'customsearch_smc_customer_5_2',
            type: 'customer'
        });
        maxInvSearch.filters.push(search.createFilter({
            name: 'partner',
            operator: search.Operator.ANYOF,
            values: zee_id
        }))
        maxInvSearch.run().each(function(res){
            var companyname = res.getValue({
                name: 'internalid',
                summary: 'GROUP'
            });
            var netSuiteItem = res.getValue({
                name: 'item',
                join: 'transaction',
                summary: 'GROUP'
            }); 
            if (cust_index == 0){
                maxInvCust.push(companyname);
            }
            if (maxInvCust.indexOf(companyname) == -1){
                maxInvCust.push(companyname);
                maxInvItem = [];
            }
            if (maxInvItem.indexOf(netSuiteItem) == -1){
                maxInvItem.push(netSuiteItem);

                var internalid = res.getValue({
                    name: 'internalid',
                    join: 'transaction',
                    summary: 'MAX'
                });
                maxInvID.push(internalid);
                cust_index++;
                return true;
            } else {
                cust_index++;
                return true;
            }
        });
        console.log(maxInvID);

        /**
         * On page initialisation
         */
        function pageInit() {
            // Background-Colors
            $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
            $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
            $("#body").css("background-color", "#CFE0CE");

            // Hide/UnHide Elements
            $('.loading_section').hide();
            $('#reset-all').removeClass('hide')
            $('#btn-export-csv').removeClass('hide');
            $('#btn-instructions').removeClass('hide');
            $('#btn-show-all-children').removeClass('hide')
            $('#btn-hide-all-children').removeClass('hide')
            $('#submit').removeClass('hide');

            // Bulk Update Zee Dropdown
            $('select').selectpicker();

            // If Logged in As Zee, Hide Zee Dropdown and Redirect to Zee's Page
            if (role == 1000) { // Page has not be assigned to Zee yet
                $('.zeeDropdown').addClass('hide');
                if (zee_id == 0) {
                    var params = {
                        zeeid: runtime.getCurrentUser().id,
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
                }
            }

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

            $(document).on("click", "#spc_it_page", function() {
                var zee_id_dropdown = $(this).find("option:selected").val();
                var params = {
                    zeeid: zee_id_dropdown,
                };
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({
                    deploymentId: "customdeploy_sl_price_change_it_2",
                    scriptId: "customscript_sl_price_change_it_2",
                }) + "&custparam_params=" + params;
                window.location.href = upload_url;
            });

            if (!isNullorEmpty(zee_id)) {
                loadCustomers(zee_id);

                var dataTable = $("#debt_preview").DataTable({
                    data: dataSet,
                    pageLength: 100,
                    order: [],
                    columns: [{
                            title: 'Expand',
                            className: 'dt-control',
                            orderable: false,
                            data: null,
                            defaultContent: '',
                        },
                        { title: "Internal ID" }, // 1
                        { title: "Customer ID" }, // 2
                        { title: "Company Name" }, // 3
                        { title: "Franchisee" }, // 4,
                        { title: "Date Last Price Increase" }, // 5,
                        { title: 'Child Object' } // 6 Child Object for Child Table
                    ],
                    columnDefs: [{
                            targets: [1, 6],
                            visible: false,
                        }
                    ],
                    autoWidth: false,
                });

                // Load with All Child Cells Open
                dataTable.rows().every(function() {
                    // this.child(format(this.data())).show();
                    this.child(createChild(this)).show();
                });

                // Handle click on "Expand All" button
                $('#btn-show-all-children').on('click', function() {
                    // Enumerate all rows
                    dataTable.rows().every(function() {
                        // If row has details collapsed
                        if (!this.child.isShown()) {
                            // Open this row
                            this.child.show();
                            $(this.node()).addClass('shown');
                        }
                    });
                });

                // Handle click on "Collapse All" button
                $('#btn-hide-all-children').on('click', function() {
                    // Enumerate all rows
                    dataTable.rows().every(function() {
                        // If row has details expanded
                        if (this.child.isShown()) {
                            // Collapse row details
                            this.child.hide();
                            $(this.node()).removeClass('shown');
                        }
                    });
                });

                // Remove all Increase Amount Data
                $('#reset-all').on('click', function() {
                    // Open Data Table
                    dataTable.page.len(-1).draw();
                    dataTable.rows().every(function() {
                        this.child.show();
                    });

                    // Set Values as Null
                    $('.total_amount').val('');
                    $('.increase_amount').text('$0.00')
                    $('.new_date_eff').val('');
                    
                    $('.total_amount').closest('tr').css('background-color', ''); // Reset CSS

                    // Redraw Data Table with Rows Closed.
                    dataTable.page.len(100).draw();
                    dataTable.rows().every(function() {
                        // If row has details expanded
                        if (this.child.isShown()) {
                            // Collapse row details
                            this.child.hide();
                            $(this.node()).removeClass('shown');
                        }
                    });
                });

                // CSV Export Button
                $('#btn-export-csv').on('click', function() {
                    downloadCsv();
                });

                // Add event listener for opening and closing child table details on button.
                $('#debt_preview tbody').on('click', 'td.dt-control', function() {
                    var tr = $(this).closest('tr');
                    var row = dataTable.row(tr);

                    if (row.child.isShown()) {
                        // This row is already open - close it
                        destroyChild(row);
                        tr.removeClass('shown');
                        tr.removeClass('parent');
                    } else {
                        // Open this row
                        row.child.show();
                        tr.addClass('shown');
                        tr.addClass('parent');
                    }
                });
            }

            // Submitter
            $('#submit').on('click', function() {
                saveRecord();
            });

            /** 
             *  Popup - Modal: Select Services
             */
            $(document).on('click', '#servicesAll', function() {
                onclick_listOfServices();
            });
            $(document).on('click', '#bulkUpdate', function() {
                onclick_bulkUpdate();
            });
            $(document).on('click', '#btn-instructions', function() {
                onclick_instructions();
            });
            /* On click of the Add button */
            $(document).on('click', '.add_class', function(event) {
                if (!isNullorEmpty($(this).closest('tr').find('.service_name').val()) || !isNullorEmpty($(this).closest('tr').find('.inc_amount').val()) || !isNullorEmpty($(this).closest('tr').find('.date_eff_all').val())) {
                    var create_service_html = '';

                    create_service_html += '<tr><td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="' + $(this).closest('tr').find('.service_name').val() + '" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button><input type="hidden" class="delete_service" value="F" /></td>';
                    create_service_html += '<td><select class="form-control service_name" >';
                    create_service_html += '<option></option>'
                    serviceTypeList.forEach(function(searchResult) {
                        var operator_internal_id = searchResult.id;
                        var operator_name = searchResult.name;
                        create_service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

                        return true;
                    })

                    create_service_html += '</select></td>';
                    // Increase Amount
                    create_service_html += '<td><input class="form-control inc_amount" placeholder="$" type="number"/></td>';
                    //Date Effective
                    create_service_html += '<td><input id="date_eff_all" class="form-control date_eff_all" type="date" min="'+today_date+'" value="' + $('#date_effective').val() + '"/></td>';

                    create_service_html += '</tr>';

                    $('#service_table tr:last').after(create_service_html);

                    $(this).closest('tr').find('.add_class').attr("data-serviceid", $(this).closest('tr').find('.service_name').val());

                    $(this).toggleClass('btn-warning btn-success')
                    $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                    $(this).toggleClass('edit_service_class add_class');
                    $(this).find('edit_class').prop('title', 'Edit Service');
                    $(this).closest('tr').find('.inc_amount').attr("disabled", "disabled");
                    $(this).closest('tr').find('.service_name').attr("disabled", "disabled");
                    $(this).closest('tr').find('.date_eff_all').attr("disabled", "disabled");

                    $(this).closest('tr').find('.first_col').append('<button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button>');
                } else {
                    if ($(this).closest('tr').find('.inc_amount').val()) {
                        alert('Invalid Increase Amount. Please add a valid Increase Amount to Proceed');
                    } else {
                        if (isNullorEmpty($(this).closest('tr').find('.date_eff_all').val())) {
                            alert('Please Add Valid Date to Proceed');
                        } else {
                            alert('No Service Selected. Please Selected a Service Amount to Proceed');
                        }

                    }
                }
            });
            // Edit Services
            $(document).on('click', '.edit_service_class', function(event) {

                $(this).closest('tr').find('.inc_amount').removeAttr("disabled");
                $(this).closest('tr').find('.service_name').removeAttr("disabled");
                $(this).closest('tr').find('.date_eff_all').removeAttr("disabled");

                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_service_class save_edit_class');

            });
            // Save Services
            $(document).on('click', '.save_edit_class', function(event) {

                $(this).closest('tr').find('.inc_amount').attr("disabled", "disabled");
                $(this).closest('tr').find('.service_name').attr("disabled", "disabled");
                $(this).closest('tr').find('.date_eff_all').attr("disabled", "disabled");

                var new_service_id = $(this).closest('tr').find('.service_name').val();
                $(this).attr('data-serviceid', new_service_id);

                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_service_class save_edit_class');

            });
            // [description] - On click of the delete button
            $(document).on('click', '.remove_class', function(event) {
                if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

                    $(this).closest('tr').find('.delete_service').val("T");
                    $(this).closest("tr").hide();
                    $(this).closest('tr').addClass('hidden')
                }
            });
            // Save Services List - Modal 1
            $(document).on('click', '.save_service', function(event) {
                var delete_service_elem = document.getElementsByClassName("delete_service");
                var edit_class_elem = document.getElementsByClassName("edit_service_class");
                var inc_amount_elem = document.getElementsByClassName("inc_amount");
                var service_name_elem = document.getElementsByClassName("service_name");
                var date_eff_elem = document.getElementsByClassName('date_eff_all');
                for (var i = 0; i < edit_class_elem.length; ++i) {

                    var serviceID = edit_class_elem[i].getAttribute('data-zeeservid');

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
                        var date_eff = new Date(date_eff_elem[i].value);
                        if (!isNullorEmpty(date_eff)) {
                            date_eff = date_eff.toISOString().split('T')[0];
                            zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_date_eff', value: date_eff });
                        }
                        try {
                            zee_service_record.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            console.log('Save ID: ' + zee_service_record)
                        } catch (e) {
                            alert(e)
                        }
                    }
                }

                // Update all Services Line Items
                var inc_amount_elem = document.getElementsByClassName("inc_amount");
                var service_name_elem = document.getElementsByClassName("service_name");
                var date_eff_elem = document.getElementsByClassName('date_eff_all')

                dataTable.page.len(-1).draw();

                for (var x = 0; x < service_name_elem.length - 1; x++) {
                    dataTable.rows().eq(0).each(function(index) {
                        var row = dataTable.row(index)
                        var data = row.data();
                        var child_row = data[6];

                        child_row.forEach(function(child) {
                            if (child.type_id == service_name_elem[x].value) {
                                var inv_price = child.curr_inv_price;
                                var inv_price_split = inv_price.split('$')[1];
                                var format_price = Number(inv_price_split.replace(/[^0-9.-]+/g, ""));
                                var total_val = (format_price + parseFloat(inc_amount_elem[x].value));

                                $('input[data-inv-price="' + child.curr_inv_price + '"]').each(function() {
                                    if ($(this).attr('id') == child.id) {
                                        $(this).val(total_val).trigger("change");
                                        if ($(this).closest('tr').hasClass('odd')) {
                                            $(this).closest('tr').css('background-color', 'rgba(255, 249, 190, 1)'); // LightGoldenRodYellow
                                        } else {
                                            $(this).closest('tr').css('background-color', 'rgba(255, 249, 210, 1)'); // Ivory
                                        }
                                    }
                                })
                                $('.new_date_eff_' + child.id).val(date_eff_elem[x].value);
                            }
                            return true;
                        })
                    })
                };

                dataTable.page.len(100).draw();

                // Update Increase Amounts
                alert('All Service Increase Amounts have been Updated')
            });
            // Save Bulk Service Update - Modal 2
            $(document).on('click', '.save_service_2', function(event) {

                var zee_elem = document.getElementsByClassName('zee_bulk_dropdown')
                var delete_service_elem = document.getElementsByClassName("delete_service");
                var edit_class_elem = document.getElementsByClassName("edit_service_class");
                var inc_amount_elem = document.getElementsByClassName("inc_amount");
                var service_name_elem = document.getElementsByClassName("service_name");
                var date_eff_elem = document.getElementsByClassName('date_eff_all');
                for (var i = 0; i < edit_class_elem.length; ++i) {
                    var servInternalID = edit_class_elem[i].getAttribute('data-zeeservid');
                    var zeeList = zee_elem[i];

                    zeeList.forEach(function(res) {

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
                        zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_serv_zee', value: res.zeeid });
                        var date_eff = new Date(date_eff_elem[i].value);
                        if (!isNullorEmpty(date_eff)) {
                            date_eff = date_eff.toISOString().split('T')[0];
                            zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_date_eff', value: date_eff });
                        }
                        try {
                            zee_service_record.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            console.log('Save ID: ' + zee_service_record)
                        } catch (e) {
                            alert(e)
                        }
                    });
                }
                alert("All Franchisee's Service List has been Updated")
            });

            /**
             *  Page Functionality - DataTable.
             */
            $(document).on('change', '.total_amount', function() {
                var tot_amount = $(this).val(); // Total Amount Integer | col 4
                var inv_amount = $(this).closest('td').prev().prev().text(); // Current invoice Amount | col 2
                var inv_amount_val = inv_amount.split('$')[1];
                inv_amount_val = Number(inv_amount_val.replace(/[^0-9.-]+/g, "")); // Current Invoice Amount Integer

                if (tot_amount != 0 && !isNullorEmpty(tot_amount)) {
                    var increase_amount = tot_amount - inv_amount_val;
                    increase_amount = financial(increase_amount);
                    // var increase_amount_id = $(this).closest('td').prev().attr('id');
                    $(this).closest('td').prev().replaceWith('<td><label class="form-control increase_amount " disabled>' + increase_amount + '</label></td>');
                } else {
                    increase_amount = financial(0);
                    $(this).closest('td').prev().replaceWith('<td><label class="form-control increase_amount " disabled>' + increase_amount + '</label></td>');
                }
            });
            // On Change of Total Amount or Date Effective
            $(document).on('change', '.total_amount, .new_date_eff', function() {
            // $('.total_amount, .new_date_eff').change(function(){
                if (!isNullorEmpty($(this).closest('tr').find('.new_date_eff').val()) && !isNullorEmpty($(this).closest('tr').find('.total_amount').val())){
                    if ($(this).hasClass('odd')) {
                        $(this).closest('tr').css('background-color', 'rgba(255, 249, 190, 1)'); // LightGoldenRodYellow
                    } else {
                        $(this).closest('tr').css('background-color', 'rgba(255, 249, 210, 1)'); // Ivory
                    }
                } else {
                    $(this).closest('tr').css('background-color', '');
                }
            })

            console.log(ctx.getRemainingUsage())
        }

        function createChild(row) {
            // This is the table we'll convert into a DataTable
            var table = $('<table class="display" width="50%"/>');
            var childSet = [];
            row.data()[6].forEach(function(el) {
                if (el.approved == true){
                    childSet.push([el.item, //0
                        '<a href="' + baseURL + "/app/accounting/transactions/custinvc.nl?id=" + el.inv_id + '" target="_blank"><p class="entityid">' + el.inv_date + '</p></a>', //1
                        '<label id="' + el.item + '" class="services" data-servid="' + el.id + '" data-servtypeid="'+el.type_id+'" data-custid="' + el.custid + '" type="text">' + el.curr_inv_price + '</label>', //2
                        '<label id="' + el.id + '" class="form-control increase_amount ' + el.id + '"disabled>' + financial(el.inc_price) + '</label>', //3
                        '<input id="' + el.id + '" class="form-control total_amount ' + el.id + '" placeholder="$" type="number" data-inv-price="' + el.curr_inv_price + '" data-custid="' + el.custid + '" value="' + el.tot_price + '" disabled/>', //4
                        '<input type="date" min="'+today_date+'" class="form-control new_date_eff new_date_eff_' + el.id + '" ' + el.date_eff + ' value="' + el.date_eff + '" disabled/>', //5
                        el.complete, //6
                        el.approved //7
                    ]);
                } else {
                    childSet.push([el.item, //0
                        '<a href="' + baseURL + "/app/accounting/transactions/custinvc.nl?id=" + el.inv_id + '" target="_blank"><p class="entityid">' + el.inv_date + '</p></a>', //1
                        '<label id="' + el.item + '" class="services" data-servid="' + el.id + '" data-servtypeid="'+el.type_id+'" data-custid="' + el.custid + '" type="text">' + el.curr_inv_price + '</label>', //2
                        '<label id="' + el.id + '" class="form-control increase_amount ' + el.id + '"disabled>' + financial(el.inc_price) + '</label>', //3
                        '<input id="' + el.id + '" class="form-control total_amount ' + el.id + '" placeholder="$" type="number" data-inv-price="' + el.curr_inv_price + '" data-custid="' + el.custid + '" value="' + el.tot_price + '"/>', //4
                        '<input type="date" min="'+today_date+'" class="form-control new_date_eff new_date_eff_' + el.id + '" ' + el.date_eff + ' value="' + el.date_eff + '"/>', //5 
                        el.complete, //6
                        el.approved //7
                    ]);
                }
            });

            // Display it the child row
            row.child(table).show();

            // Initialise as a DataTable
            var usersTable = table.DataTable({
                "bPaginate": false,
                "bLengthChange": false,
                "bFilter": false,
                "bInfo": false,
                "bAutoWidth": false,
                data: childSet,
                columns: [
                    { title: 'Item' }, //0
                    { title: 'Latest Invoice Date'}, // 1
                    { title: 'Latest Invoice Price' }, //2
                    { title: 'Increase Amount' }, //3
                    { title: 'New Total Price' }, //4
                    { title: 'Date Effective' }, //5
                    { title: 'Complete?' }, //6
                    { title: 'Approved By IT?'} //7
                ],
                columnDefs: [{
                    targets: [6,7],
                    visible: false
                }, ],
                rowCallback: function(row, data) {
                    if (data[6] == true) {
                        if ($(row).hasClass('odd')) {
                            $(row).css('background-color', 'rgba(144, 238, 144, 0.75)'); // LightGreen
                        } else {
                            $(row).css('background-color', 'rgba(152, 251, 152, 0.75)'); // YellowGreen
                        }
                    }
                }
            });
        }

        function destroyChild(row) {
            // var table = $("table", row.child());
            // table.detach();
            // table.DataTable().destroy();

            // And then hide the row
            row.child.hide();
        }

        function loadCustomers(zee_id) {
            var index = 0;
            
            var prev_cust_id = [];
            var prev_entity_id = [];
            var prev_comp_name = [];

            var childObject = [];

            var serv_id_list = [];

            var csvSet = []; // CSV Export Set

            //Search: SMC - Customer
            var customerSearch = search.load({
                type: "customer",
                id: "customsearch_smc_customer_5",
            });
            customerSearch.filters.push(search.createFilter({
                name: "partner",
                operator: search.Operator.ANYOF,
                values: zee_id,
            }));
            if (maxInvID.length > 0){
                customerSearch.filters.push(search.createFilter({
                    name: "internalid",
                    operator: search.Operator.ANYOF,
                    join: 'transaction',
                    values: maxInvID,
                }));
            } else {
                console.log('Missing Invoices. Maximum Invoice Length: ' + maxInvID.length)
            }
            var customerSearchResLength = customerSearch.runPaged().count;
            customerSearch.run().each(function(searchResult) {
                // console.log('Index: ' + index)
                var custid = searchResult.getValue({
                    name: "internalid",
                    summary: "GROUP"
                });
                var entityid = searchResult.getValue({
                    name: "entityid",
                    summary: "GROUP"
                });
                var companyname = searchResult.getValue({
                    name: "companyname",
                    summary: "GROUP",
                    sort: search.Sort.ASC,
                });
                if (index == 0) {
                    prev_cust_id.push(custid) // Push First Iteration of Customer ID.
                    prev_entity_id.push(entityid);
                    prev_comp_name.push(companyname);
                }
                var last_price_increase = searchResult.getValue({
                    name: "custentity_date_of_last_price_increase",
                    summary: "GROUP"
                });
                /**
                 *  List of Services
                 */
                var service_id = searchResult.getValue({
                    name: "internalid",
                    join: 'CUSTRECORD_SERVICE_CUSTOMER',
                    summary: "GROUP"
                });
                if (serv_id_list.indexOf(service_id) != -1){ // If Service ID has already been pushed, Skip
                    return true;
                }
                serv_id_list.push(service_id);
                
                var service = searchResult.getText({
                    name: "custrecord_service",
                    join: 'CUSTRECORD_SERVICE_CUSTOMER',
                    summary: "GROUP",
                    sort: search.Sort.DESC
                });
                var service_lower = service.toLowerCase();

                /**
                 *  List of Current Service Inline HTML
                 */
                var service_price = '$' + searchResult.getValue({
                    name: "custrecord_service_price",
                    join: 'CUSTRECORD_SERVICE_CUSTOMER',
                    summary: "GROUP"
                });
                /**
                 *  Transaction Record: Invoice Price
                 */
                var inv_id = searchResult.getValue({
                    name: "internalid",
                    join: "transaction",
                    summary: search.Summary.GROUP
                });
                var inv_price = '$' + searchResult.getValue({
                    name: "rate",
                    join: "transaction",
                    summary: search.Summary.GROUP
                });
                var inv_date = searchResult.getValue({
                    name: "trandate",
                    join: "transaction",
                    summary: search.Summary.GROUP
                });

                // Default Values to be updated later by Savedlist data if Price Increase Already Scheduled.
                var inc_price = '';
                var tot_price = '';
                var saved_date_eff = '';

                var service_type_id = serviceTypeList.filter(function(el) { if (el.name == service) { return el } })[0].id;
                if (!isNullorEmpty(savedList)) {
                    var savedListFiltered = savedList.filter(function(el) { if (el.custid == custid && el.servtypeid == service_type_id) { return el } });

                    if (savedListFiltered.length > 0) {
                        savedListFiltered.forEach(function(res) {
                            // console.log('Finance Allocate Record Exists - ID = ' + res.id)
                            var inv_price_val = inv_price.split('$')[1];
                            inv_price_val = Number(inv_price_val.replace(/[^0-9.-]+/g, ""));

                            // Update Values
                            inc_price = (parseFloat(res.incval) - parseFloat(inv_price_val))
                            tot_price = res.incval;
                            stored_date_eff = res.date;

                            var approved = res.approved;

                            childObject.push({ id: service_id, type_id: service_type_id, item: service, curr_inv_price: inv_price, inc_price: (parseFloat(res.incval) - parseFloat(inv_price_val)), tot_price: res.incval, date_eff: res.date, serv_price: service_price, custid: custid, complete: true, approved: approved, inv_date: inv_date, inv_id: inv_id });

                            return true;
                        })
                    } else {
                        // console.log('Finance Allocate Record Not Created - List Length = 0')
                        childObject.push({ id: service_id, type_id: service_type_id, item: service, curr_inv_price: inv_price, inc_price: inc_price, tot_price: tot_price, date_eff: saved_date_eff, serv_price: service_price, custid: custid, complete: false, approved: false, inv_date: inv_date, inv_id: inv_id });
                    }
                } else {
                    // console.log('Finance Allocate Record Not Created')
                    childObject.push({ id: service_id, type_id: service_type_id, item: service, curr_inv_price: inv_price, inc_price: inc_price, tot_price: tot_price, date_eff: saved_date_eff, serv_price: service_price, custid: custid, complete: false, approved: false, inv_date: inv_date, inv_id: inv_id });
                }

                console.log('Index: ' + index)
                console.log(prev_cust_id)
                console.log('Cust ID ' + custid)
                console.log('Service ' + service_id)
                console.log(childObject)
                
                if (prev_cust_id.indexOf(custid) == -1) {
                    console.log('New Customer. Save Child Object and Reset')

                    const tempChildObj = childObject[childObject.length - 1];
                    console.log(tempChildObj)
                    childObject.pop();

                    dataSet.push(['',
                        '<p id="internalID" class="internalID">' + prev_cust_id[prev_cust_id.length-1] + '</p>',
                        '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + prev_cust_id[prev_cust_id.length-1] + '"><p class="entityid">' +  prev_entity_id[prev_entity_id.length-1] + "</p></a>",
                        '<p internalid="companyname" class="companyname">' +  prev_comp_name[prev_comp_name.length-1] + '</p>',
                        zee_name,
                        last_price_increase,
                        childObject
                    ]);

                    childObject = [tempChildObj];

                    prev_cust_id.push(custid);
                    prev_entity_id.push(entityid);
                    prev_comp_name.push(companyname);
                }
                if (index == (customerSearchResLength - 1)){
                    console.log('Last Index')
                    dataSet.push(['',
                        '<p id="internalID" class="internalID">' + custid + '</p>',
                        '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + custid + '"><p class="entityid">' + entityid + "</p></a>",
                        '<p internalid="companyname" class="companyname">' + companyname + '</p>',
                        zee_name,
                        last_price_increase,
                        childObject
                    ]);
                } 

                // Push Invoice Line Item to CSV Set
                csvSet.push([custid, entityid, companyname, zee_name, last_price_increase, service, service_price, inv_price, inv_date, inv_id, tot_price, inc_price, saved_date_eff]);

                index++;            

                return true;
            });

            saveCsv(csvSet);
        }

        function onclick_listOfServices() {
            // Header Information
            var service_html = '<table id= "service_table" class="table table-responsive table-striped"><thead><tr class="info"><th><b>ACTION</b></th><th><b>SERVICE NAME</b></th><th><b>INCREASE AMOUNT</b></th><th><b>DATE EFFECTIVE</b></th>';
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
                serviceTypeList.forEach(function(searchResult) {
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

                service_html += '<td><input id="" class="form-control date_eff_all" type="date" min="'+today_date+'" value="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_date_eff' }) + '" disabled/></td>';

                service_html += '</select></td>';
                service_html += '</tr>';

                return true;
            });


            /**
             *  Add New Service
             */
            service_html += '<tr>';

            // Add Button
            service_html += '<td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="" data-zeeservid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button><input type="hidden" class="delete_service" value="F" /></td>';
            // Service Name
            service_html += '<td><select class="form-control service_name" >';
            service_html += '<option></option>';
            serviceTypeList.forEach(function(searchResult) {
                var operator_internal_id = searchResult.id;
                var operator_name = searchResult.name;
                service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

                return true;
            })
            service_html += '</select></td>';
            // Increase Amount
            service_html += '<td><input class="form-control inc_amount" placeholder="$" type="number"/></td>';

            service_html += '<td><input class="form-control date_eff_all" type="date" min="'+today_date+'"/></td>';

            service_html += '</tr>';

            // Create Modal
            service_html += '</tbody></table>';
            $('#myModal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Add/Edit List of Services</label></h4></div>');
            $('#myModal .modal-body').html("");
            $('#myModal .modal-body').html(service_html);
            $('#myModal').modal("show");
        }

        // function onclick_bulkUpdate() {
        //     // Header Information
        //     var service_html = '<table id= "service_table" class="table table-responsive table-striped"><thead><tr class="info"><th><b>ACTION</b></th><th><b>FRANCHISEE</b></th><th><b>SERVICE NAME</b></th><th><b>INCREASE AMOUNT</b></th><th><b>DATE EFFECTIVE</b></th>';
        //     service_html += '</thead><tbody>';

        //     // Load Zee Services
        //     var searchSet = search.load({ type: 'customrecord_spc_zee_serv_list', id: 'customsearch_spc_zee_serv_list' });
        //     searchSet.filters.push(search.createFilter({
        //         name: 'custrecord_spc_zee_serv_zee',
        //         operator: search.Operator.IS,
        //         values: zee_id
        //     }));
        //     var resultSet_Service = searchSet.run();

        //     /**
        //      *  Add New Service
        //      */
        //     service_html += '<tr>';

        //     // Add Button
        //     service_html += '<td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="" data-zeeservid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button><input type="hidden" class="delete_service" value="F" /></td>';

        //     service_html += '<td><select id="zee_bulk_dropdown" class="form-control" multiple="">';
        //     service_html += '<option></option>';
        //     var zeesSearch = search.load({ type: 'partner', id: 'customsearch_smc_franchisee' });
        //     // zeesSearch.filters.push(search.createFilter({
        //     //     name: 'entityid',
        //     //     operator: search.Operator.DOESNOTSTARTWITH,
        //     //     values: 'Test'
        //     // }))
        //     var zeesSearchResults = zeesSearch.run();
        //     zeesSearchResults.each(function(zeesSearchResult) {
        //         var zeeid = zeesSearchResult.getValue({ name: 'internalid', summmary: search.Summary.GROUP });
        //         var zeename = zeesSearchResult.getValue({ name: 'companyname', summmary: search.Summary.GROUP });
        //         var zeestate = zeesSearchResult.getText({ name: 'location' });

        //         service_html += '<option value="' + zeeid + '" state="' + zeestate + '">' + zeename + '</option>';

        //         return true;
        //     });
        //     service_html += '</select></td>';

        //     // Service Name
        //     service_html += '<td><select class="form-control service_name" >';
        //     service_html += '<option></option>';
        //     serviceTypeList.forEach(function(searchResult) {
        //         var operator_internal_id = searchResult.id;
        //         var operator_name = searchResult.name;
        //         service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

        //         return true;
        //     })
        //     service_html += '</select></td>';
        //     // Increase Amount
        //     service_html += '<td><input class="form-control inc_amount" placeholder="$" type="number"/></td>';

        //     service_html += '<td><input class="form-control date_eff_all" type="date" min="'+today_date+'"/></td>';

        //     service_html += '</tr>';

        //     // Create Modal
        //     service_html += '</tbody></table>';

        //     $('#myModal2 .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Add/Edit List of Services for Franchisees</label></h4></div>');
        //     $('#myModal2 .modal-body').html("");
        //     $('#myModal2 .modal-body').html(service_html);
        //     $('#myModal2').modal("show");

        //     $('select').selectpicker();
        // }

        function onclick_instructions(){
            $('#myModal3 .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Instructions for Scheduled Price Change</label></h4></div>');
            // $('#myModal3 .modal-body').html(instructions());
            $('#myModal3').modal("show");
        }

        function saveRecord(context) {
            // Run Loading Function
            $('.loading_section').appendTo('.debt_preview_wrapper');
            $('.loading_section').show();
            $('.submit_btn').hide();

            /** Dynamic Update of DataTable to Display all Line Items */
            var dataTable = $("#debt_preview").DataTable();
            dataTable.page.len(-1).draw();
            dataTable.rows().every(function() {
                this.child.show();
            });

            /** Data in Table */
            var date_eff_elem = document.getElementsByClassName('new_date_eff');
            var inc_am_elem = document.getElementsByClassName('total_amount');
            var inv_price_elem = document.getElementsByClassName('services');

            if (inv_price_elem.length > 0){
                var cust_id_list = [];
                for (var x = 0; x < inv_price_elem.length - 1; x++) {
                    
                    var date_eff = date_eff_elem[x].value;
                    var inc_am = inc_am_elem[x].value;

                    if (!isNullorEmpty(inc_am) && inc_am != 0) {
                        var service_type_id = inv_price_elem[x].getAttribute('data-servtypeid');
                        var cust_id = inv_price_elem[x].getAttribute('data-custid');
                        cust_id_list.push(cust_id);
                        // var inc_price_assigned = inc_am_elem[x].getAttribute('data-inc-amount');
                        var service_id = inv_price_elem[x].getAttribute('data-servid');

                        console.log('Customer ID: ' + cust_id + ' Service Type ID ' + service_type_id + ' Service ID ' + service_id + ' Date ' + date_eff + ' Increase Amount ' + inc_am);
                        /**
                         *  Customer ID
                         *  Franchisee
                         *  Date Effective
                         *  Service
                         *  New Price
                         */
                        var savedListFiltered = savedList.filter(function(el) { if (el.custid == cust_id && el.servtypeid == service_type_id) { return el } });
                        console.log('Saved List: ' + JSON.stringify(savedListFiltered))
                        if (savedListFiltered.length > 0) {
                            savedListFiltered.forEach(function(res) {
                                var recID = res.id;

                                var rec = record.load({
                                    type: 'customrecord_spc_finance_alloc',
                                    id: recID
                                });
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_date_eff', value: date_eff })
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_inc_am', value: inc_am })
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_serv', value: service_id })
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_serv_type_id', value: service_type_id })
                                rec.save();

                                return true;
                            });
                        } else {
                            var rec = record.create({
                                type: 'customrecord_spc_finance_alloc',
                                isDynamic: true
                            });
                            rec.setValue({ fieldId: 'name', value: zee_name });
                            rec.setValue({ fieldId: 'custrecord_price_chg_fin_cust_id', value: cust_id })
                            rec.setValue({ fieldId: 'custrecord_price_chg_fin_zee', value: zee_id })
                            rec.setValue({ fieldId: 'custrecord_price_chg_fin_date_eff', value: date_eff })
                            rec.setValue({ fieldId: 'custrecord_price_chg_fin_serv', value: service_id })
                            rec.setValue({ fieldId: 'custrecord_price_chg_fin_serv_type_id', value: service_type_id })
                            rec.setValue({ fieldId: 'custrecord_price_chg_fin_inc_am', value: inc_am })
                            rec.save();
                        }
                    }
                }
                // Run Email Script to notify IT Team
                email.send({
                    author: 112209, // 25537
                    body: '<html><body><p1><strong>Hi IT Team,</strong><br><br>New Scheduled Price Increase Submitted for ' + zee_name + '. Please visit <a href="https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1448&deploy=1&custparam_params={%22zeeid%22:%22' + zee_id + '%22}">Scheduled Price Change: IT Page</a> to view/edit/process changes.</p1>\n<p1>List of Customer IDs: '+JSON.stringify(cust_id_list)+'</p1></body></html>',
                    subject: 'Scheduled Price Increase Amounts Added for ' + zee_name + ' (Finance Page)',
                    recipients: ['anesu.chakaingesu@mailplus.com.au'],
                    cc: ['popie.popie@mailplus.com.au', 'ankith.ravindran@mailplus.com.au']
                });
                alert('Records have been Saved');
                location.reload();
            } else {
                alert('No Records have been Saved. Please Fill Out Valid Price Increases')
            }
            return true;
        }

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         * @param {Array} invDataSet The `invDataSet` created in `loadDatatable()`.
         */
        function saveCsv(csvDataSet) { //exportDataSet
            // csvDataSet = csvDataSet[0];
            var title = 'Scheduled Price Change - ' + zee_name;

            var headers = ['Customer ID', 'Customer Name', 'Company Name', 'Franchisee', 'Last Price Increase', 'Service', 'Service Price', 'Invoice Price', 'Invoice Date', 'Invoice ID', 'New TotalPrice', 'Increase Amount', 'Date Effective'];
            var csv = title;
            csv += "\n\n";

            console.log('CSV Data Set (STRING): ' + JSON.stringify(csvDataSet));

            csv += headers + "\n";
            csvDataSet.forEach(function (row) { // Table Data Set
                csv += row.join(',');
                csv += "\n";
            });
            currRec.setValue({ fieldId: 'custpage_table_csv', value: csv })
            // downloadCsv();

            return true;
        }

        /**
         * Load the string stored in the hidden field 'custpage_table_csv'.
         * Converts it to a CSV file.
         * Creates a hidden link to download the file and triggers the click of the link.
         */
         function downloadCsv() {
            // var csv = nlapiGetFieldValue('custpage_table_csv');
            var csv = currRec.getValue({ fieldId: 'custpage_table_csv' })
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var content_type = 'text/csv';
            var csvFile = new Blob([csv], { type: content_type });
            var url = window.URL.createObjectURL(csvFile);
            var filename = 'Scheduled Price Change ' + zee_name + '.csv';
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
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