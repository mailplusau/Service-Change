/**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: Client Script for Finance Team Page. Script ID on Netsuite: 1449.
 * 
 * Associated Scripts with Process: 
 * Finance Page - Client: 1449
 * Finance Page - Suitelet: 1448
 * IT Page - Client: 1572
 * IT Page - Suitelet: 1465
 * 
 * Scheduled Service Change: 730
 * Automated Finance Tab Price Updated from Commenced Service Price: 1081
 * 
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

        var userName = runtime.getCurrentUser().name;
        var user_id = runtime.getCurrentUser().id;

        var zee_id = parseInt(currRec.getValue({ fieldId: 'custpage_price_chng_fin_zee_id' }));
        var zee_name = currRec.getValue({ fieldId: 'custpage_price_chng_fin_zee_name' });
        var zee_state = currRec.getValue({ fieldId: 'custpage_price_chng_fin_zee_state' });
        // var zee_email = currRec.getValue({ fieldId: 'custpage_price_chng_fin_zee_email' });

        var dataSet = [];

        // Load Service Record
        const serviceTypeList = JSON.parse(currRec.getValue({ fieldId: 'custpage_price_chng_fin_service_type_obj' }));
        console.log(serviceTypeList);

        // Load Allocated Zee Service Record
        // const savedList = JSON.parse(currRec.getValue({ fieldId: 'custpage_price_chng_fin_allocated_zee_service_record' }));
        // console.log(savedList);
        // Saved Array Field Length 
        var savedListLength = currRec.getValue({ fieldId: 'custpage_price_chng_fin_allocated_zee_service_record_length' });
        var savedListArray = [];
        for (var i = 0; i < savedListLength; i++) {
            var savedListString = currRec.getValue({ fieldId: 'custpage_price_chng_fin_allocated_zee_service_record_' + i });
            savedListArray.push(savedListString);
        }
        savedList = JSON.parse(savedListArray.join(''));
        console.log(savedList);

        // Load Max Invoice (Most Recent Invoice from Customers Under Zee
        // var maxInvVal = loadMaxInvoice();
        var maxInvoiceArrayLength = currRec.getValue({ fieldId: 'custpage_price_chng_fin_max_invoice_array_length' });
        // console.log('maxInvoiceArrayLength: ' + maxInvoiceArrayLength);
        // Loop through Max Invoice Array and Populate maxInvVal
        var maxInvVal = '';
        for (var i = 0; i < maxInvoiceArrayLength; i++) {
            var maxInvoiceString = currRec.getValue({ fieldId: 'custpage_price_chng_fin_max_invoice_' + i });
            maxInvVal += maxInvoiceString;
        }
        maxInvVal = JSON.parse(maxInvVal); // Parse Max Invoice String
        console.log(maxInvVal)
        const maxInvID = [new Set(maxInvVal.map(function(item) { return item.invid }))];
        console.log(maxInvID);

        // Date Today n Date Tomorrow
        const today_date = currRec.getValue({ fieldId: 'custpage_price_chng_fin_today_date' });

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
            $('.loading_section_text').hide();
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
                } else {
                    $('#title').text('Scheduled Price Change: ' + zee_name);
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

                // Add New Line Underneath to Warn User of Page Refresh
                var warning = '<div class="alert alert-warning alert-dismissible show" role="alert">\
                    <strong>Warning!</strong> You will be redirected to the selected Zee\'s page.\
                    Please do not refresh the page or select another Zee in dropdown.\
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                        <span aria-hidden="true">&times;</span>\
                    </button>\
                </div>';
                $('.zeeDropdown').after(warning);

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
                    pageLength: 1000,
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
                            targets: [0, 1, 6], // Hide Expand
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
                    dataTable.page.len(1000).draw();
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

                dataTable.page.len(1000).draw();

                // Update Increase Amounts
                console.log('All Service Increase Amounts have been Updated')
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
                        // $(this).closest('tr').css('background-color', 'rgba(255, 249, 190, 1)'); // LightGoldenRodYellow 
                        $(this).closest('tr').css('background-color', 'rgba(144, 238, 144, 0.75)'); // LightGreen
                    } else {
                        // $(this).closest('tr').css('background-color', 'rgba(255, 249, 210, 1)'); // Ivory
                        $(this).closest('tr').css('background-color', 'rgba(152, 251, 152, 0.75)'); // YellowGreen
                    }
                } else if (isNullorEmpty($(this).closest('tr').find('.new_date_eff').val()) && !isNullorEmpty($(this).closest('tr').find('.total_amount').val())){ 
                    if ($(this).hasClass('odd')) {
                        $(this).closest('tr').css('background-color', 'rgba(255, 249, 190, 1)'); // LightGoldenRodYellow
                    } else {
                        $(this).closest('tr').css('background-color', 'rgba(255, 249, 210, 1)'); // Ivory
                    }
                } else if (!isNullorEmpty($(this).closest('tr').find('.new_date_eff').val()) && isNullorEmpty($(this).closest('tr').find('.total_amount').val())){
                    if ($(this).hasClass('odd')) {
                        $(this).closest('tr').css('background-color', 'rgba(255, 249, 190, 1)'); // LightGoldenRodYellow
                    } else {
                        $(this).closest('tr').css('background-color', 'rgba(255, 249, 210, 1)'); // Ivory
                    }
                } else {
                    $(this).closest('tr').css('background-color', '');
                }
            })

            // Remove total amount and date effective on child row on click of delete button
            $(document).on('click', '.remove_service_row', function() {
                if (confirm('Are you sure you want to delete this item?')) {
                    $(this).closest('tr').find('.total_amount').val('');
                    $(this).closest('tr').find('.new_date_eff').val('');
                    $(this).closest('tr').css('background-color', '');
                }
            });

            // On Click of 
            $(document).on("click", ".remove_check", function() {
                alert('Service Line Item has Already Been Scheduled for Price Increase. Please Contact IT for Further Review') // Sechduled Service Change Record
            });

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
                        '',//'<input type="button" class="btn btn-danger btn-sm remove_service_row glyphicon glyphicon-trash" title="Delete Data in Service Row"><i class="fa fa-trash-o" style="color:white;"></i></input>', //6
                        el.complete, //7
                        el.approved //8
                    ]);
                } else {
                    childSet.push([el.item, //0
                        '<a href="' + baseURL + "/app/accounting/transactions/custinvc.nl?id=" + el.inv_id + '" target="_blank"><p class="entityid">' + el.inv_date + '</p></a>', //1
                        '<label id="' + el.item + '" class="services" data-servid="' + el.id + '" data-servtypeid="'+el.type_id+'" data-custid="' + el.custid + '" type="text">' + el.curr_inv_price + '</label>', //2
                        '<label id="' + el.id + '" class="form-control increase_amount ' + el.id + '"disabled>' + financial(el.inc_price) + '</label>', //3
                        '<input id="' + el.id + '" class="form-control total_amount ' + el.id + '" placeholder="$" type="number" data-inv-price="' + el.curr_inv_price + '" data-custid="' + el.custid + '" value="' + el.tot_price + '"/>', //4
                        '<input type="date" min="'+today_date+'" class="form-control new_date_eff new_date_eff_' + el.id + '" ' + el.date_eff + ' value="' + el.date_eff + '"/>', //5 
                        '<button type="button" class="btn btn-danger btn-sm remove_service_row glyphicon glyphicon-trash" title="Delete Data in Service Row"><i class="fa fa-trash-o" style="color:white;"></i></button>', //6
                        el.complete, //7
                        el.approved //8
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
                    { title: 'Action' }, //6
                    { title: 'Complete?' }, //7
                    { title: 'Approved By IT?'} //8
                ],
                columnDefs: [{
                    targets: [7,8],
                    visible: false
                }, ],
                rowCallback: function(row, data) {
                    if (data[8] == true) {
                        // Row Color Blank
                        $(row).css('background-color', '');

                        $(row).find("td").eq(6).replaceWith('<td><button class="remove_check btn btn-sm glyphicon glyphicon-minus" data-custid="'+data[9]+'" data-incid="'+data[8]+'" data-commreg="'+data[13]+'" data-servchgid="'+data[14]+'" title="Price Increase Scheduled" type="button"/></td>') // 
                    } else if (data[7] == true) {
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
            if (maxInvID.length > 0){ // If there are invoices for the Zee
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
            console.log(customerSearchResLength) // Get Result Length

            var customerServiceList = [];
            for (var i = 0; i < customerSearchResLength; i += 1000) {
                customerServiceList.push(customerSearch.run().getRange({
                    start: i,
                    end: i + 999
                }))
            }

            var total_index = 0;
            for (var x = 0; x < customerServiceList.length; x++) {
                customerServiceList[x].forEach(function(searchResult, index, arr) {
                    total_index++;
                    // console.log('Index: ' + index);
                    console.log("Total Index: " + total_index);
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
                    var last_price_increase = searchResult.getValue({
                        name: "custentity_date_of_last_price_increase",
                        summary: "GROUP"
                    });
                    if (index == 0) {
                        prev_cust_id.push(custid) // Push First Iteration of Customer ID.
                        prev_entity_id.push(entityid);
                        prev_comp_name.push(companyname);
                    }
                    
                    /**
                     *  List of Services
                     */
                    var service_id = searchResult.getValue({
                        name: "internalid",
                        join: 'CUSTRECORD_SERVICE_CUSTOMER',
                        summary: "GROUP"
                    });
                     /**
                     *  List of Current Service Inline HTML
                     */
                    var service_price = searchResult.getValue({ // Service Item Rate
                        name: "custrecord_service_price",
                        join: 'CUSTRECORD_SERVICE_CUSTOMER',
                        summary: "GROUP"
                    });
                    var service_netsuite_item = searchResult.getValue({
                        name: "custrecord_service_ns_item",
                        join: "CUSTRECORD_SERVICE_CUSTOMER",
                        summary: "GROUP",
                    });
                    var service_netsuite_item_array = searchResult.getValue({
                        name: "custrecord_service_type_ns_item_array",
                        join: "CUSTRECORD_SERVICE_CUSTOMER",
                        summary: "GROUP",
                    });
                    console.log(service_netsuite_item_array + ' - ' + service_netsuite_item);

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
                     
                    // Number of Services Matches that on Invoice.
                    var nonmatching_ServiceOnInvoice = maxInvVal.filter(function(el) { if (inv_id == el.invid && service_netsuite_item == parseInt(el.itemid) && parseFloat(service_price) != parseFloat(el.itemrate)) { return el } });
                    // console.log(service_netsuite_item, service_price)

                    service_price = financial(service_price); // Add $ Formatting to Service Price 

                    if ((!serv_id_list.includes(service_id) && nonmatching_ServiceOnInvoice.length == 0) || (total_index == customerSearchResLength)) { // Only Run if Service ID is not in the List and if the Service Price on the Invoice Matches the Service Price on the Customer Record OR if it is the last iteration of the search. 
                        serv_id_list.push(service_id);
                        console.log('Service Added: ' + service_id + ' | ' + 'Customer ID: ' + custid + ' | ' + 'Index: ' + index + ' | ' + 'Customer Search Length: ' + customerSearchResLength)
                        var service = searchResult.getText({
                            name: "custrecord_service",
                            join: 'CUSTRECORD_SERVICE_CUSTOMER',
                            summary: "GROUP",
                            sort: search.Sort.DESC
                        });

                        // Default Values to be updated later by Savedlist data if Price Increase Already Scheduled.
                        var inc_price = '';
                        var tot_price = '';
                        var stored_date_eff = '';
    
                        var service_type_id = serviceTypeList.filter(function(el) { if (el.name == service) { return el } })[0].id;
                        if (!isNullorEmpty(savedList)) {
                            // var savedListFiltered = savedList.filter(function(el) { if (el.custid == custid && el.servtypeid == service_type_id) { return el } });
                            var savedListFiltered = savedList.filter(function(el) { if (el.custid == custid && el.servid == service_id) { return el } });
                            if (savedListFiltered.length > 0) {
                                var inv_price_val = inv_price.split('$')[1];
                                inv_price_val = Number(inv_price_val.replace(/[^0-9.-]+/g, ""));

                                // Update Values
                                inc_price = (parseFloat(savedListFiltered[0].incval) - parseFloat(inv_price_val))
                                tot_price = savedListFiltered[0].incval;
                                stored_date_eff = savedListFiltered[0].date;

                                var approved = savedListFiltered[0].approved; // = Approved By IT Field;

                                childObject.push({ id: service_id, type_id: service_type_id, item: service, curr_inv_price: inv_price, inc_price: (parseFloat(savedListFiltered[0].incval) - parseFloat(inv_price_val)), tot_price: savedListFiltered[0].incval, date_eff: savedListFiltered[0].date, serv_price: service_price, custid: custid, complete: true, approved: approved, inv_date: inv_date, inv_id: inv_id });
                            } else {
                                childObject.push({ id: service_id, type_id: service_type_id, item: service, curr_inv_price: inv_price, inc_price: inc_price, tot_price: tot_price, date_eff: stored_date_eff, serv_price: service_price, custid: custid, complete: false, approved: false, inv_date: inv_date, inv_id: inv_id });
                            }
                        } else {
                            childObject.push({ id: service_id, type_id: service_type_id, item: service, curr_inv_price: inv_price, inc_price: inc_price, tot_price: tot_price, date_eff: stored_date_eff, serv_price: service_price, custid: custid, complete: false, approved: false, inv_date: inv_date, inv_id: inv_id });
                        }
                        
                        if (prev_cust_id.indexOf(custid) == -1) {
                            const tempChildObj = childObject[childObject.length - 1];
                            childObject.pop();
    
                            dataSet.push(['',
                                '<p id="internalID" class="internalID">' + prev_cust_id[prev_cust_id.length-1] + '</p>',
                                '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + prev_cust_id[prev_cust_id.length-1] + '" target="_blank"><p class="entityid">' +  prev_entity_id[prev_entity_id.length-1] + "</p></a>",
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
                        if (total_index == (customerSearchResLength)){ // Index of Last Item in List if Ran Once, or Total Index of Last Item in List if Ran Multiple Times | OLD INDEX - index == (customerSearchResLength - 1) || 
                            console.log('E Don Cast, Last Last...')
                            if (serv_id_list.includes(service_id)) { // If SAME Service HAS ALREADY Ben Added to ChildTable, Remove it from the ChildTable
                                childObject.pop();
                            }
                            dataSet.push(['',
                                '<p id="internalID" class="internalID">' + custid + '</p>',
                                '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + custid + '" target="_blank"><p class="entityid">' + entityid + "</p></a>",
                                '<p internalid="companyname" class="companyname">' + companyname + '</p>',
                                zee_name,
                                last_price_increase,
                                childObject
                            ]);
                        } 
    
                        // Push Invoice Line Item to CSV Set
                        csvSet.push([custid, entityid, companyname, zee_name, last_price_increase, service, service_price, inv_price, inv_date, inv_id, tot_price, inc_price, stored_date_eff]);    
                    }           

                    return true;
                });
                
                saveCsv(csvSet);
            }
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

            var service_id_list = [];

            if (inv_price_elem.length > 0){
                // Try Catch Error and Display Error Message
                try {                 
                    var cust_id_list = [];
                    for (var x = 0; x < inv_price_elem.length - 1; x++) {
                        console.log('NEW LOOP')
                        var date_eff = date_eff_elem[x].value;
                        var inc_am = inc_am_elem[x].value;

                        if (!isNullorEmpty(inc_am) && inc_am != 0 && !isNullorEmpty(date_eff)) { // Increase Amount and Date Effective Is Not Null - Create/Update Finance Allocate Record, Service Change & Commencement Register 
                            var service_id = inv_price_elem[x].getAttribute('data-servid');
                            if (!service_id_list.includes(service_id)) { // If Service ID is Unique.
                                service_id_list.push(service_id);
                                var service_type_id = inv_price_elem[x].getAttribute('data-servtypeid');
                                var cust_id = inv_price_elem[x].getAttribute('data-custid');
                                cust_id_list.push(cust_id);

                                console.log('Customer ID: ' + cust_id + ' Service Type ID ' + service_type_id + ' Service ID ' + service_id + ' Date ' + date_eff + ' Increase Amount ' + inc_am);

                                // Date Formatting
                                var date_eff_raw = date_eff; // 2020-01-01
                                var date_eff_formatted = dateISOToNetsuite(date_eff_raw);
                                var date_eff_netsuite = date_eff_formatted; // 1/1/2020
                                date_eff = format.parse({ value: date_eff_formatted, type: format.Type.DATE });

                                /**
                                 * Search for Existing Record on Finance Allocate Record.
                                 */
                                // var savedListFiltered = savedList.filter(function(el) { if (el.custid == cust_id && el.servtypeid == service_type_id) { return el } });
                                var savedListFiltered = savedList.filter(function(el) { if (el.custid == cust_id && el.servid == service_id) { return el } });
                                if (savedListFiltered.length > 0) { // If Exists, Update Record.
                                        var recID = savedListFiltered[0].id;

                                        /**
                                         *  Update Existing Comm Reg | Still Create as Some Most New Price Increases Ones Will Not Have This Set Up Yet.
                                        */ 
                                        var commRegSearch = search.load({ type: 'customrecord_commencement_register', id: 'customsearch_comm_reg_signed_2' });
                                        commRegSearch.filters.push(search.createFilter({
                                            name: 'custrecord_customer',
                                            operator: search.Operator.IS,
                                            values: cust_id // 517563
                                        }));
                                        var commRegRes = commRegSearch.run().getRange({ start: 0, end: 1 });
                                        console.log(commRegRes.length, commRegRes);
                                        if (commRegRes.length > 0){
                                            console.log('Commencement Date: ' + commRegRes[0].getValue('custrecord_comm_date'));
                                            if (date_eff_netsuite == commRegRes[0].getValue('custrecord_comm_date')){
                                                var commRegID = updateCommReg(commRegRes[0].getValue('internalid'), date_eff);
                                            } else {
                                                console.log('NEED TO CREATE New Comm Reg: ' + commRegID)
                                                var commRegID = createCommReg(cust_id, date_eff, zee_id, zee_state);
                                            }
                                        }
                                        
                                        /**
                                         *  Update Service Change Record.
                                        */
                                        if (!isNullorEmpty(savedListFiltered[0].serv_chg_id)){ // If Service Change Record Exists - Update
                                            var service_chg_id = updateServiceChg(savedListFiltered[0].serv_chg_id, date_eff, inc_am, commRegID);
                                        } else {
                                            var service_chg_id = createServiceChg(date_eff, service_id, zee_id, inc_am, commRegID, user_id, financeAllocateID);
                                        }

                                        /**
                                         *  Update Finance Allocate Record.
                                         *  This is NOT mandatory.
                                         */
                                        var financeAllocateID = updateFinanceAllocateRecord(recID, date_eff_raw, inc_am, service_chg_id, commRegID);
                                } else { // IF Doesn't Exist, Create New Record.
                                    /**
                                     *  Create New Comm Reg
                                     */ 
                                    var commRegSearch = search.load({ type: 'customrecord_commencement_register', id: 'customsearch_comm_reg_signed_2' });
                                    commRegSearch.filters.push(search.createFilter({
                                        name: 'custrecord_customer',
                                        operator: search.Operator.IS,
                                        values: cust_id // 517563
                                    }));
                                    var commRegRes = commRegSearch.run().getRange({ start: 0, end: 1 });
                                    console.log(commRegRes.length, commRegRes);
                                    if (commRegRes.length > 0){ // Only create new comm reg if customer has comm reg record already.
                                        console.log('Commencement Date: ' + commRegRes[0].getValue('custrecord_comm_date'));
                                        if (date_eff_netsuite == commRegRes[0].getValue('custrecord_comm_date')){
                                            var commRegID = updateCommReg(commRegRes[0].getValue('internalid'), date_eff);
                                        } else {
                                            console.log('NEED TO CREATE New Comm Reg: ' + commRegID)
                                            var commRegID = createCommReg(cust_id, date_eff, zee_id, zee_state);
                                        }
                                    } else {
                                        var commRegID = createCommReg(cust_id, date_eff, zee_id, zee_state);
                                    }

                                    /**
                                     *  Create Service Change Record.
                                    */
                                    var new_service_chg_id = createServiceChg(date_eff, service_id, zee_id, inc_am, commRegID, '', user_id); // financeAllocateID - Not sure if I need to add Finance Allocate Value to Service Change Record.

                                    /**
                                     *  Create New Finance Allocate Record.
                                     */
                                    var financeAllocateID = createFinanceAllocateRecord(cust_id, zee_id, zee_name, service_id, service_type_id, inc_am, date_eff_raw, new_service_chg_id, commRegID);
                                }
                            }
                        } else if (isNullorEmpty(inc_am) && isNullorEmpty(date_eff)) { // If Both Date Effective and Increase Amount is Null (Price Increase Deleted)
                            var service_type_id = inv_price_elem[x].getAttribute('data-servtypeid');
                            var cust_id = inv_price_elem[x].getAttribute('data-custid');
                            // var fin_alloc_id = inv_price_elem[x].getAttribute('data-finallocid');
                            // var service_id = inv_price_elem[x].getAttribute('data-servid');

                            var savedListFiltered = savedList.filter(function(el) { if (el.custid == cust_id && el.servtypeid == service_type_id) { return el } });

                            if (!savedListFiltered[0].id){
                                // Delete Finance Allocate Record
                                record.delete({
                                    type: 'customrecord_spc_finance_alloc',
                                    id: savedListFiltered[0].id
                                });

                                // Delete Comm Reg
                                var commRegSearch = search.load({ type: 'customrecord_commencement_register', id: 'customsearch_comm_reg_signed_2' });
                                commRegSearch.filters.push(search.createFilter({
                                    name: 'custrecord_customer',
                                    operator: search.Operator.IS,
                                    values: cust_id // 517563
                                }));
                                var commRegRes = commRegSearch.run().getRange({ start: 0, end: 1 });
                                if (commRegRes.length > 0){
                                    delCommReg(commRegRes[0].getValue('internalid'));
                                } 

                                // Delete Service Change
                                delServiceChg(savedListFiltered[0].serv_chg_id); 
                            }
                        } else {
                            alert('Please fill out all fields');
                            
                            $('.loading_section').hide();
                            $('.submit_btn').show();

                            return false;
                        }
                    }
                    // Run Email Script to notify IT Team
                    // email.send({
                    //     author: 112209, // 25537
                    //     body: '<html><body><p1><strong>Hi IT Team,</strong><br><br>New Scheduled Price Increase Submitted for ' + zee_name + '. Please visit <a href="https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1465&deploy=1&custparam_params={%22zeeid%22:%22' + zee_id + '%22}">Scheduled Price Change: IT Page</a> to view/edit/process changes.</p1>\n<p1>List of Customer IDs: '+JSON.stringify(cust_id_list)+'</p1><br><p1>Price Change Processed by: '+userName+' '+userID+'</p1></body></html>',
                    //     subject: 'Scheduled Price Increase Added for ' + zee_name + ' (Finance Page)',
                    //     recipients: ['anesu.chakaingesu@mailplus.com.au', 'popie.popie@mailplus.com.au'], // , 
                    //     cc: ['ankith.ravindran@mailplus.com.au', 'fiona.harrison@mailplus.com.au'] //,
                    // });
                    alert('Records have been Saved. Please wait for reload.');
                    location.reload();
                } catch (e) {
                    alert('Please Contact IT with Copy of Error Message if Issue Persists \n' + e);
                    console.log(e)
                }
            } else {
                alert('No Records have been Saved. Please Fill Out Valid Price Increases')
            }
            
            // Re-add Submit Button
            $('.loading_section').hide();
            $('.submit_btn').show();
            return true;
        }

        /**
         *  Finance Allocate Record Functions
         */
        /**
         * 
         * @param {*} commRegID 
         * @param {*} zee 
         * @param {*} customer 
         * @param {*} dateEffective 
         * @param {*} priceIncrease 
         * @param {*} state 
         * @returns 
         */
        function createFinanceAllocateRecord(cust_id, zee_id, zee_name, service_id, service_type_id, priceIncreaseAmount, date_eff, service_chg_id, comm_reg_id) {
            var financeAlloc = record.create({
                type: 'customrecord_spc_finance_alloc',
                isDynamic: true
            });
            financeAlloc.setValue({ fieldId: "name", value: zee_name, label: "Name" }),
            financeAlloc.setValue({ fieldId: "custrecord_price_chg_fin_zee", value: zee_id, label: "Franchisee"});
            financeAlloc.setValue({ fieldId: "custrecord_price_chg_fin_cust_id", value: cust_id, label: "Customer ID"});
            financeAlloc.setValue({ fieldId: "custrecord_price_chg_fin_date_eff", value: date_eff, label: "Date Effective"});
            financeAlloc.setValue({ fieldId: "custrecord_price_chg_fin_serv", value: service_id, label: "Service ID"});
            financeAlloc.setValue({ fieldId: "custrecord_price_chg_fin_serv_type_id", value: service_type_id, label: "Service Type ID"});
            financeAlloc.setValue({ fieldId: "custrecord_price_chg_fin_inc_am", value: priceIncreaseAmount, label: "New Service Price"});
            financeAlloc.setValue({ fieldId: "custrecord_price_chg_it_serv_chg_id", value: service_chg_id, label: "Service Change ID"});
            financeAlloc.setValue({ fieldId: "custrecord_price_chg_fin_comm_reg", value: comm_reg_id, label: "Commencement Register ID"});
            var finAllocateID = financeAlloc.save();
            // finAllocateID = '1' //Test
            
            return finAllocateID;
        }
        function updateFinanceAllocateRecord(recID, date_eff, inc_am, service_chg_id, comm_reg_id){
            var financeAlloc = record.load({
                type: 'customrecord_spc_finance_alloc',
                id: recID
            });
            financeAlloc.setValue({ fieldId: 'custrecord_price_chg_fin_date_eff', value: date_eff });
            financeAlloc.setValue({ fieldId: 'custrecord_price_chg_fin_inc_am', value: inc_am }); 
            financeAlloc.setValue({ fieldId: "custrecord_price_chg_it_approve", value: false }) // Change to False as Status has Changed from IT Original Value.
            financeAlloc.setValue({ fieldId: 'custrecord_price_chg_it_serv_chg_id', value: service_chg_id})
            financeAlloc.setValue({ fieldId: 'custrecord_price_chg_fin_comm_reg', value: comm_reg_id})
            finAllocateID = financeAlloc.save();

            return finAllocateID;
        }

        /**
         *  Commencement Register Functions
         */
        function createCommReg(customer, dateEffective, zee, state) {
            var customer_comm_reg = record.create({
                type: 'customrecord_commencement_register',
                isDynamic: true
            });

            var today = format.parse({ value: getDate(), type: format.Type.DATE });

            customer_comm_reg.setValue({ fieldId: 'custrecord_date_entry', value: today });
            customer_comm_reg.setValue({ fieldId: 'custrecord_comm_date', value: dateEffective });
            customer_comm_reg.setValue({ fieldId: 'custrecord_comm_date_signup', value: dateEffective });
            customer_comm_reg.setValue({ fieldId: 'custrecord_customer', value: customer });
            customer_comm_reg.setValue({ fieldId: 'custrecord_salesrep', value: 109783 });
            customer_comm_reg.setValue({ fieldId: 'custrecord_std_equiv', value:1 });
            if (role != 1000) {
                customer_comm_reg.setValue({ fieldId: 'custrecord_franchisee', value: zee });//Franchisee
            }
            customer_comm_reg.setValue({ fieldId: 'custrecord_wkly_svcs', value:'5' });
            customer_comm_reg.setValue({ fieldId: 'custrecord_in_out', value: 2 }); // Inbound
            customer_comm_reg.setValue({ fieldId: 'custrecord_state', value: state });
            customer_comm_reg.setValue({ fieldId: 'custrecord_trial_status', value: 10 }); // Quote = 10 | Scheduled = 9
            customer_comm_reg.setValue({ fieldId: 'custrecord_sale_type', value: 10 }) // Price Increase
            var commRegID = customer_comm_reg.save();
            // var commRegID = '1' //Test
            console.log('New commRegID: ' + commRegID)

            return commRegID;
        }
        function updateCommReg(id, dateEffective) {
            var today = format.parse({ value: getDate(), type: format.Type.DATE });

            customer_comm_reg = record.load({ type: 'customrecord_commencement_register', id: id });
            customer_comm_reg.setValue({ fieldId: 'custrecord_date_entry', value: today });
            customer_comm_reg.setValue({ fieldId: 'custrecord_comm_date', value: dateEffective });
            customer_comm_reg.setValue({ fieldId: 'custrecord_sale_type', value: 10 }); // 
            customer_comm_reg.setValue({ fieldId: 'custrecord_trial_status', value: 10 }); // Quote = 10 | Scheduled = 9
            // customer_comm_reg.setValue({ fieldId: 'custrecord_comm_date_signup', value:dateEffective);
            var commRegID = customer_comm_reg.save();
            // var commRegID = '0' //Test
            console.log('Update Comm Reg' + commRegID);

            return commRegID;
        }
        function delCommReg(id){
            record.delete({
                type: 'customrecord_commencement_register',
                id: id
            });
            console.log('Delete Existing Comm Reg: ' + id);
            return true;
        }

        /**
         *  Service Change Functions
         */
        function createServiceChg(date_eff, service_id, zee_id, inc_am, commRegID, user_id, fin_alloc_id) {
            var servChgRecord = record.create({
                type: 'customrecord_servicechg',
                isDynamic: true
            });
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_date_effective', value: date_eff });
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_service', value: service_id });
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_status', value: 4 }); // Quote = 4 | Scheduled = 1
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_old_zee', value: zee_id });
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_new_price', value: inc_am }); //inc_price
            // servChgRecord.setValue({ fieldId: 'custrecord_servicechg_new_freq', value:  });
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_comm_reg', value: commRegID });
            if (role != 1000) {
                servChgRecord.setValue({ fieldId: 'custrecord_servicechg_created', value: user_id });
            }
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_type', value: 'Price Increase' });
            // servChgRecord.setValue({ fieldId: 'custrecord_default_servicechg_record', value: 1 });
            // servChgRecord.setValue({ fieldId: 'custrecord_servicechg_fin_alloc', value: fin_alloc_id }); // Store Finance Allocate Record ID
            var servChgRecordSaveID = servChgRecord.save();
            console.log('Service Chg Record Created: ' + servChgRecordSaveID);

            return servChgRecordSaveID;
        }
        function updateServiceChg(id, date_eff, inc_am, commRegID) {
            var servChgRecord = record.load({ type: 'customrecord_servicechg', id: id });
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_date_effective', value: date_eff });
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_new_price', value: inc_am }); //inc_price
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_comm_reg', value: commRegID });
            servChgRecord.setValue({ fieldId: 'custrecord_servicechg_status', value: 4 }); // Quote = 4 | Scheduled = 1
            var servChgRecordSaveID = servChgRecord.save();
            console.log('Service Chg Record Updated: ' + servChgRecordSaveID);

            return servChgRecordSaveID;
        }
        function delServiceChg(id) {
            record.delete({
                type: 'customrecord_servicechg',
                id: id
            });
            console.log('Delete Existing Service Chg: ' + id);
            return true;
        }           

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         * @param {Array} invDataSet The `invDataSet` created in `loadDatatable()`.
         */
        function saveCsv(csvDataSet) { //exportDataSet
            // csvDataSet = csvDataSet[0];
            var title = 'Scheduled Price Change - ' + zee_name;

            var headers = ['Customer ID', 'Customer Name', 'Company Name', 'Franchisee', 'Last Price Increase', 'Service', 'Service Price', 'Invoice Price', 'Invoice Date', 'Invoice ID', 'New Total Price', 'Increase Amount', 'Date Effective'];
            var csv = title;
            csv += "\n\n";

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

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
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
         * Used to set the value of the date input fields.
         * @param   {String} date_netsuite  "1/6/2020"
         * @returns {String} date_iso       "2020-06-01"
         */
        function dateNetsuiteToISO(date_netsuite) {
            var date_iso = '';
            if (!isNullorEmpty(date_netsuite)) {
                // var date = nlapiStringToDate(date_netsuite);

                var date = date_netsuite.split('/');

                var date_day = date[0];
                var date_month = date[1];
                var date_year = date[2];
                var date_utc = new Date(Date.UTC(date_year, date_month - 1, date_day));
                date_iso = date_utc.toISOString().split('T')[0];

                // var date_day = date.getDate();
                // var date_month = date.getMonth();
                // var date_year = date.getFullYear();
                // var date_utc = new Date(Date.UTC(date_year, date_month, date_day));
                // date_iso = date_utc.toISOString().split('T')[0];
            }
            return date_iso;
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