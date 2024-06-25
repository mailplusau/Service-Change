/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 2.00         2021-09-20 09:33:08         Anesu
 *
 * Description: xxxxxxxx
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
 * @Last Modified by:   Anesu
 * @Last Modified time: 2021-09-20 09:33:08 
 * 
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/task', 'N/format'],
    function (ui, email, runtime, search, record, http, log, redirect, task, format) {
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
            if (context.request.method === 'GET') {
                var is_params = 'T';
                type = context.request.parameters.type;

                var params_params = context.request.parameters;
                if (!isNullorEmpty(params_params.custparam_params)) {
                    var params = JSON.parse(context.request.parameters.custparam_params);
                }
                var zee_id = 0;
                var zee_name = '';
                var zee_state = '';

                if (!isNullorEmpty(params)) {
                    zee_id = parseInt(params.zeeid);
                }

                if (!isNullorEmpty(zee_id) && zee_id != 0) {
                    var zee_rec = record.load({ type: 'partner', id: zee_id });
                    zee_name = zee_rec.getValue({ fieldId: 'companyname' });
                    zee_state = zee_rec.getValue({ fieldId: 'location' })
                }

                var form = ui.createForm({ title: ' ' });

                // Load jQuery
                var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
                // Load Tooltip
                inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';

                // Load Bootstrap
                inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
                inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
                // Load DataTables
                // inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.12.0/css/jquery.dataTables.min.css">';
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/responsive/1.0.7/css/responsive.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/rowgroup/1.1.3/js/dataTables.rowGroup.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/dataTables.buttons.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/buttons.html5.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/buttons.print.min.js"></script> '

                // Load Bootstrap-Select
                inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
                inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';

                // Semantic Select
                // inlineHtml += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.css">';
                // inlineHtml += '<script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.js"></script>';

                // Load Netsuite stylesheet and script
                inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
                inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
                inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml += '<style>.mandatory{color:red;}</style>';

                //Date Range Picker
                inlineHtml += '<script type="text/javascript" src="https://cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>'
                inlineHtml += '<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>'
                inlineHtml += '<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />'

                // New Website Color Schemes
                // Old Main Color: ##379E8F (Green)
                // New Main Color: #095C7B (Blue)
                // Background Color: #CFE0CE (Light Green)
                // Button Color: #FBEA51 (Yellow)
                // Text Color: #103D39 (Dark Green)

                inlineHtml += '<div class="a" style="width: 100%; background-color: #CFE0CE; padding: 20px; min-height: 100vh; height: 100%; ">'; // margin-top: -40px
                if (role != 1000) { // If Page is not Opened By Zee, Name Finance Team. Else if Zee. Use Zee Name
                    inlineHtml += '<h1 id="title"style="text-align: center; color: #103D39; font-size: 22px; font-weight: bold; line-height: 33px; vertical-align: top; margin-bottom: 4px; ">Scheduled Price Change: Finance Team</h1>';
                } else {
                    inlineHtml += '<h1 id="title"style="text-align: center; color: #103D39; font-size: 22px; font-weight: bold; line-height: 33px; vertical-align: top; margin-bottom: 4px; ">Scheduled Price Change ' + zee_name + '</h1>';
                }

                inlineHtml += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #095C7B; color: #fff }';
                inlineHtml += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #095C7B; color: #095C7B; }';
                inlineHtml += '</style>';

                // Define alert window.
                inlineHtml += '<div class="container" style="margin-top:14px;" hidden><div id="alert" class="alert alert-danger fade in"></div></div>';

                // Define information window.
                inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';
                inlineHtml += '<div style="margin-top: -40px"><br/>';

                // Buttons
                // inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="new_agreement" onclick="">New Franchisee Agreement</button>';
                // inlineHtml += '<h1 style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Consolidation Invoicing</h1>';

                // Popup Modal Section
                inlineHtml += '<div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Notes Section</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-primary save_service" data-dismiss="modal">Update All Services</button><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
                inlineHtml += '<div id="myModal2" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Notes Section</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-primary save_service_2" data-dismiss="modal">Update  Services For All Franchisees</button><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
                inlineHtml += '<div id="myModal3" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Notes Section</h4><br></div><div class="modal-body">' + instructions() + '</div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

                inlineHtml += '<br>';

                if (role != 1000) { // Only Show Dropdown if Not a Zee
                    inlineHtml += zeeDropdownSection(zee_id);
                }

                inlineHtml += instructionSection();

                if (!isNullorEmpty(zee_id)) {
                    inlineHtml += increaseAmount();

                    inlineHtml += customerListHeader();

                    inlineHtml += dataTable();

                    inlineHtml += loadingSection();

                    inlineHtml += '<div class="loading_section_text"><p style="color: red; text-align: center;">Please note this page may take up to 2 minutes to load. Do not refresh!</p></div>'

                    inlineHtml += submit();
                } else {
                    if (role != 1000) { // Only Show if Not a Zee
                        inlineHtml += '<h1 style="font-size: 12px; font-weight: 700; color: #103D39; text-align: center">Please select a Franchisee</h1>';
                    } else {
                        inlineHtml += loadingSection();
                        inlineHtml += '<div class=""><h1 style="font-size: 10px; font-weight: 700; color: red; text-align: center">Redirecting... Please wait. May take up to 30 seconds.</h1></div>';
                    }
                }

                inlineHtml += '</div></div>'

                form.addField({
                    id: 'preview_table',
                    label: 'inlinehtml',
                    type: 'inlinehtml'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW
                }).defaultValue = inlineHtml;

                // Zee ID
                form.addField({
                    id: "custpage_price_chng_fin_zee_id",
                    label: "Zee ID",
                    type: ui.FieldType.TEXT,
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN,
                }).defaultValue = zee_id;
                // Zee Name
                form.addField({
                    id: "custpage_price_chng_fin_zee_name",
                    label: "Zee Name",
                    type: ui.FieldType.TEXT,
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN,
                }).defaultValue = zee_name;
                // Zee State
                form.addField({
                    id: "custpage_price_chng_fin_zee_state",
                    label: "Zee State",
                    type: ui.FieldType.TEXT,
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN,
                }).defaultValue = zee_state;

                // Load Service Type Object
                var serviceTypeObj = loadServiceType();
                form.addField({
                    id: "custpage_price_chng_fin_service_type_obj",
                    label: "Service Type Object",
                    type: ui.FieldType.LONGTEXT,
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN,
                }).defaultValue = JSON.stringify(serviceTypeObj);

                // Load Finance Allocated Zee Service Record
                var allocatedZeeServiceRecord = loadAllocatedZeeServiceRecord(zee_id);
                // form.addField({
                //     id: "custpage_price_chng_fin_allocated_zee_service_record",
                //     label: "Allocated Zee Service Record",
                //     type: ui.FieldType.LONGTEXT,
                // }).updateDisplayType({
                //     displayType: ui.FieldDisplayType.HIDDEN,    
                // }).defaultValue = JSON.stringify(allocatedZeeServiceRecord);
                // Create For Loop to Create Multiple Load Max Invoice Fields given number of characters above 10000 (Max Number of Characters for Long Text Field)
                var allocatedZeeServiceRecordString = JSON.stringify(allocatedZeeServiceRecord);
                var allocatedZeeServiceRecordStringArray = [];
                var allocatedZeeServiceRecordStringArrayIndex = 0;
                var allocatedZeeServiceRecordStringArrayLength = 0;
                var allocatedZeeServiceRecordStringArrayLength = Math.ceil(allocatedZeeServiceRecordString.length / 10000);
                for (var i = 0; i < allocatedZeeServiceRecordStringArrayLength; i++) {
                    allocatedZeeServiceRecordStringArray[i] = allocatedZeeServiceRecordString.substring(allocatedZeeServiceRecordStringArrayIndex, allocatedZeeServiceRecordStringArrayIndex + 10000);
                    allocatedZeeServiceRecordStringArrayIndex += 10000;
                }
                for (var i = 0; i < allocatedZeeServiceRecordStringArrayLength; i++) {
                    form.addField({
                        id: "custpage_price_chng_fin_allocated_zee_service_record_" + i,
                        label: "Allocated Zee Service Record",
                        type: ui.FieldType.LONGTEXT,
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN,
                    }).defaultValue = allocatedZeeServiceRecordStringArray[i];
                }
                // Create Field for number of allocatedZeeServiceRecord
                form.addField({
                    id: "custpage_price_chng_fin_allocated_zee_service_record_length",
                    label: "Allocated Zee Service Record Length",
                    type: ui.FieldType.INTEGER,
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN,
                }).defaultValue = allocatedZeeServiceRecordStringArrayLength;

                // Load Max Invoice (Most Recent Invoice of Customer) from Search Result
                // Create For Loop to Create Multiple Load Max Invoice Fields given number of characters above 10000 (Max Number of Characters for Long Text Field)
                var maxInvoice = loadMaxInvoice(zee_id);
                var maxInvoiceString = JSON.stringify(maxInvoice);
                var maxInvoiceStringArray = [];
                var maxInvoiceStringArrayIndex = 0;
                var maxInvoiceStringArrayLength = 0;
                var maxInvoiceStringArrayLength = Math.ceil(maxInvoiceString.length / 10000);
                for (var i = 0; i < maxInvoiceStringArrayLength; i++) {
                    maxInvoiceStringArray[i] = maxInvoiceString.substring(maxInvoiceStringArrayIndex, maxInvoiceStringArrayIndex + 10000);
                    maxInvoiceStringArrayIndex += 10000;
                }
                for (var i = 0; i < maxInvoiceStringArrayLength; i++) {
                    form.addField({
                        id: "custpage_price_chng_fin_max_invoice_" + i,
                        label: "Max Invoice",
                        type: ui.FieldType.LONGTEXT,
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN,
                    }).defaultValue = maxInvoiceStringArray[i];
                };
                // Create Field for number of maxInvoiceStringArray
                form.addField({
                    id: "custpage_price_chng_fin_max_invoice_array_length",
                    label: "Max Invoice Array Length",
                    type: ui.FieldType.INTEGER,
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN,
                }).defaultValue = maxInvoiceStringArrayLength;

                // Load Today Date
                form.addField({
                    id: "custpage_price_chng_fin_today_date",
                    label: "Date Today",
                    type: ui.FieldType.TEXT,
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN,
                }).defaultValue = todayDate();

                form.addField({
                    id: 'custpage_table_csv',
                    label: 'CSV Export',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                form.clientScriptFileId = 5604134; //Sandbox 5605927 // Prod - 5604134

                context.response.writePage(form);
            } else { }
        }

        function zeeDropdownSection(zeeid) {
            var inlineQty = '<div class="form-group container zeeDropdown">';
            inlineQty += '<div class="row col-xs-6" style="left: 25%; margin-top: 20px;">'; //col-xs-6 d-flex justify-content-center

            inlineQty += '<div class="input-group">';
            inlineQty += '<span style="background-color: #095C7B; color: white;" class="input-group-addon">Franchisee</span>';
            inlineQty += '<select id="zee_filter_dropdown" class="form-control" required>';
            inlineQty += '<option></option>';
            var zeesSearch = search.load({ type: 'partner', id: 'customsearch_smc_franchisee' });
            // zeesSearch.filters.push(search.createFilter({
            //     name: 'entityid',
            //     operator: search.Operator.DOESNOTSTARTWITH,
            //     values: 'Test'
            // }))
            var zeesSearchResults = zeesSearch.run();
            log.audit({
                title: 'JSON Stringify - zeesSearchResults',
                details: JSON.stringify(zeesSearchResults)
            })
            zeesSearchResults.each(function (zeesSearchResult) {
                var zee_id = zeesSearchResult.getValue({ name: 'internalid', summmary: search.Summary.GROUP });
                var zee_name = zeesSearchResult.getValue({ name: 'companyname', summmary: search.Summary.GROUP });
                var zee_state = zeesSearchResult.getText({ name: 'location' });

                if (zee_id == zeeid) {
                    inlineQty += '<option value="' + zee_id + '" state="' + zee_state + '" selected>' + zee_name + '</option>';
                } else {
                    inlineQty += '<option value="' + zee_id + '" state="' + zee_state + '">' + zee_name + '</option>';
                }
                return true;
            });
            inlineQty += '</select>';
            inlineQty += '</div>';

            inlineQty += '</div></div>';

            return inlineQty;
        }

        /**
         * The table that will display the differents invoices linked to the franchisee and the time period.
         * @return  {String}    inlineQty
         */
        function dataTable() {
            var inlineQty = '';
            inlineQty += '<style>table#debt_preview {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#debt_preview th{text-align: center;} .bolded{font-weight: bold;} /* Chrome, Safari, Edge, Opera */input::-webkit-outer-spin-button,input::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;}/* Firefox */input[type=number] {-moz-appearance: textfield;} table#debt_preview.table-striped.DTFC_Cloned tbody tr:nth-of-type(even) { background-color: white; }</style>';

            inlineQty += '<table id="debt_preview" class="table table-responsive table-striped customer tablesorter" style="width: 100%; background-color: white;">';
            inlineQty += '<thead style="color: white; background-color: #095C7B;">';
            inlineQty += '<tr class="text-center">';
            inlineQty += '</tr>';
            inlineQty += '</thead>';

            inlineQty += '<tbody id="result_debt" class="result-debt"></tbody>';

            inlineQty += '</table>';

            return inlineQty;
        }

        function increaseAmount() {
            var inlineQty = '<style>.green-back { background-color: #095C7B; color: white; }.vl {border-left: 6px solid green;height: 500px; }</style>';

            // Increase Header
            inlineQty += '<div class="form-group container inc_amount_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #095C7B; color: white;">Change Price on All Services</span></h4></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container inc_price_section">';
            inlineQty += '<div class="row">';

            inlineQty += '<div class="col-xs-3"></div>';
            // Increase Button
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<input style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="servicesAll" class="col-xs-12" onclick="" value="Add/Edit All Services"></input>';
            inlineQty += '</div>';
            // Bulk Update
            // inlineQty += '<div class="col-xs-4">';
            // inlineQty += '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="bulkUpdate" class="col-xs-12">Bulk Update Services</button>';
            // inlineQty += '</div>';

            inlineQty += '<div class="col-xs-3"></div>';

            inlineQty += '</div></div>';

            return inlineQty;
        }

        function customerListHeader() {
            // Customer List Header
            var inlineQty = '<div class="form-group container cust_list_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #095C7B; color: white;">Customer List: Filters</span></h4></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            // Customer List Filters
            inlineQty += '<div class="form-group container cust_list_section">';
            inlineQty += '<div class="row">';

            // Export CSV
            inlineQty += '<div class="col-xs-3">';
            inlineQty += '<input id="btn-export-csv" class="col-xs-12 hide" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;" value="Export CSV"></input>';
            inlineQty += '</div>';

            // Expand All
            // inlineQty += '<div class="col-xs-3">';
            // inlineQty += '<button id="btn-show-all-children" class="col-xs-12 hide" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Expand All</button>' // 
            // inlineQty += '</div>';

            // Collapse All
            // inlineQty += '<div class="col-xs-3">';
            // inlineQty += '<button id="btn-hide-all-children" class="col-xs-12 hide" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Collapse All</button>'
            // inlineQty += '</div>';

            // Reset All
            inlineQty += '<div class="col-xs-3">';
            inlineQty += '<input type="button" id="reset-all" class="col-xs-12 hide" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;" value="Reset All"></input>';
            inlineQty += '</div>';



            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function submit() {
            // Save Edit
            var inlineQty = '<div class="container submitSection">'; //style="margin-top: 20px;"

            inlineQty += '<div class="row justify-content-center">';

            inlineQty += '<div class="col-xs-4"></div>';
            inlineQty += '<div class="col-4">';
            // inlineQty += '<input type="button" style="background-color: #095C7B; color: white; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;"  id="submit" value=""></input>';
            inlineQty += '<button style="background-color: #095C7B; color: white; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="submit" class="col-xs-4 submit_btn hide" onclick="">Save/Update</button>';
            inlineQty += '</div>';
            inlineQty += '<div class="col-xs-4"></div>';

            inlineQty += '</div>';

            inlineQty += '<div class="row justify-content-center">';

            inlineQty += '<div class="col-xs-2"></div>';
            inlineQty += '<div class="col-xs-8">';
            inlineQty += '<p style="color: red; font-weight: 200; text-align: center;">To ensure records are saved correctly, DO NOT LEAVE THIS PAGE or open a new tab.\nPlease Note. If page runs out of memory whilst saving, click okay, refresh page and re-input missing data. The missing data will be saved.</p>';
            inlineQty += '<div class="col-xs-2"></div>';

            inlineQty += '</div>';

            inlineQty += '</div>';

            return inlineQty;
        }

        function loadMaxInvoice(zee_id) {
            var maxInvID = []; // Max Invoice ID
            var maxInvItem = [];
            var maxInvCust = [];
            var maxInvVal = [];
            var cust_index = 0;
            // Get Most Recent Invoice and Services Within.
            var maxInvSearch = search.load({
                id: 'customsearch_smc_customer_5_2',
                type: 'customer'
            });
            maxInvSearch.filters.push(search.createFilter({
                name: 'partner',
                operator: search.Operator.ANYOF,
                values: zee_id
            }))
            maxInvSearch.run().each(function (res) {
                var companyname = res.getValue({
                    name: 'internalid',
                    summary: 'GROUP'
                });
                var netSuiteItem = res.getValue({
                    name: 'item',
                    join: 'transaction',
                    summary: 'GROUP'
                });
                if (maxInvCust.indexOf(companyname) == -1 || cust_index == 0) {
                    maxInvCust.push(companyname);
                    maxInvItem = [];
                }
                if (maxInvItem.indexOf(netSuiteItem) == -1) {
                    maxInvItem.push(netSuiteItem);

                    var internalid = res.getValue({
                        name: 'internalid',
                        join: 'transaction',
                        summary: 'MAX'
                    });
                    var item_rate = res.getValue({ // Get Item Rate / Service Price
                        name: 'rate',
                        join: 'transaction',
                        summary: 'GROUP'
                    });
                    maxInvID.push(internalid);

                    maxInvVal.push({ custid: companyname, itemid: netSuiteItem, invid: internalid, itemrate: item_rate });
                    cust_index++;
                    return true;
                }
                cust_index++;
                return true;
            });

            return maxInvVal;
        }

        function loadAllocatedZeeServiceRecord(zee_id) {
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
            currAllocatedSearch.run().each(function (res) {
                var internalid = res.getValue({ name: 'internalid' });
                var cust_id = res.getValue({ name: 'custrecord_price_chg_fin_cust_id' });
                var service_id = res.getValue({ name: 'custrecord_price_chg_fin_serv' });
                var service_type_id = res.getValue({ name: 'custrecord_price_chg_fin_serv_type_id' });
                // var inc_price = res.getValue({ name: 'custrecord_price_chg_fin_inc_am' }); // Old Increase Price
                // var date_eff = res.getValue({ name: 'custrecord_price_chg_fin_date_eff' }); // Old Date Effective
                var date_eff = res.getValue({ name: 'custrecord_servicechg_date_effective', join: 'CUSTRECORD_PRICE_CHG_IT_SERV_CHG_ID' }); // Service Change: Date Effective
                date_eff = dateNetsuiteToISO(date_eff);
                var inc_price = res.getValue({ name: 'custrecord_servicechg_new_price', join: 'CUSTRECORD_PRICE_CHG_IT_SERV_CHG_ID' }); // Service Change: Total Amount Val

                var serv_chg_id = res.getValue({ name: 'custrecord_price_chg_it_serv_chg_id' });
                var comm_reg_id = res.getValue({ name: 'custrecord_price_chg_fin_comm_reg' });

                /** IT Page List */
                var approved = res.getValue({ name: 'custrecord_price_chg_it_approve' });
                var emailed = res.getValue({ name: 'custrecord_price_chg_it_email_sent' });

                savedList.push({ id: internalid, custid: cust_id, zeeid: zee_id, servid: service_id, servtypeid: service_type_id, date: date_eff, incval: inc_price, approved: approved, emailed: emailed, serv_chg_id: serv_chg_id, comm_reg_id: comm_reg_id });
                return true;
            });

            return savedList;
        }

        function loadServiceType() {
            // Load Service Record
            var serviceTypeSea = search.load({ type: 'customrecord_service_type', id: 'customsearch_rta_service_types_2' })
            var serviceTypeRes = serviceTypeSea.run();
            var serviceTypeList = [];
            serviceTypeRes.each(function (res) {
                var internalid = res.getValue({ name: 'internalid' });
                var name = res.getValue({ name: 'name' })
                serviceTypeList.push({
                    id: internalid,
                    name: name
                });
                return true;
            });

            return serviceTypeList;
        }

        function loadingSection() {
            var inlineQty = '<div class="form-group container loading_section"></div>';
            inlineQty += '<style> .loading_section { border: 14px solid #f3f3f3; border-radius: 50%; border-top: 14px solid #095C7B; width: 90px; height: 90px; -webkit-animation: spin 2s linear infinite; /* Safari */ animation: spin 2s linear infinite;';
            inlineQty += 'left: 50%; }' //position: fixed; z-index: 1000; 
            /* Safari */
            inlineQty += '@-webkit-keyframes spin {0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } }';

            inlineQty += '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            inlineQty += '</style>';

            // inlineQty += '<div class="loading_section_text"><p style="color: red; text-align: center;">Please note this page may take up to 2 minutes to load. Do not refresh!</p></div>'

            return inlineQty;
        }

        function instructionSection() {
            //Instruction Section
            var inlineQty = '<div class="row" style="margin-top: 20px; margin-bottom: 20px;">';
            inlineQty += '<div class="col-md-4"></div>';
            inlineQty += '<div class="col-md-4" style="text-align: center;">';
            inlineQty += '<input type="button" id="btn-instructions" class="col-xs-12" style="background-color: #FBEA51; border-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;" value="Instructions"></input>';
            inlineQty += '</div>';
            inlineQty += '<div class="col-md-4"></div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function instructions() {
            var inlineQty = '';

            inlineQty += '<b><u>Scheduled Price Change Page Description</u></b>';
            inlineQty += role == 1000 ? '<br>Purpose of this page is to schedule price change on services for some  of your customers' : '<br>Purpose of this page is to schedule price change on services for some customers under a Franchisee' + ' (Excluding customers such as AP, SC, NeoPost)<br>';
            inlineQty += '<br><b>There are two options:</b><br>Complete a Bulk Update of All Services under All Customers in List using: <button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" onclick="">Add/Edit All Services</button>';
            inlineQty += '<li>Add Services, how much you want to increase the service by (ie +$1) and date effective. Make sure to click <button class="btn btn-success btn-sm glyphicon glyphicon-plus" data-serviceid="" data-zeeservid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button> button to add into the list.</li>';
            inlineQty += '<li>To Edit Bulk Update Service Existing click on <button class="btn btn-warning btn-sm glyphicon glyphicon-pencil" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button> to submit any changes made on field.<li>';
            inlineQty += '<li>To Delete Bulk Update Service click <button class="btn btn-danger btn-sm glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button> to remove. Then click <button type="button" class="btn btn-primary" >Update All Services</button>  to update table.<li>';
            inlineQty += '<br>OR<br>';
            inlineQty += '<br>Update Each Customer Separately by Service in the Customer List Table below:';
            inlineQty += '<li>Add a New Total Amount Price and Date Effective in the Fields Respective</li>';
            inlineQty += '<br><b>Once completed. Submit for Price Changes to be Saved/Scheduled.</b><br>';
            inlineQty += '<br>';
            inlineQty += '<b><u>Page Functionality</u></b>';
            inlineQty += '<br>';
            inlineQty += '<b>Change Price on All Services (Bulk Updated All Services)</b>';
            inlineQty += '<br>On click of button a popup appears showing a table listing services used for a bulk update of all associated services in customer list table below. Select the services, increase amount, and date effective you would like to apply to all services and click <button class="btn btn-success btn-sm glyphicon glyphicon-plus" data-serviceid="" data-zeeservid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button>. These can be amended or deleted if you do not want to bulk update services with that amount or date effective. Once happy, click <button type="button" class="btn btn-primary">Update All Services</button> to apply to all services.<br>';

            // Table Section;
            inlineQty += '<br>';
            inlineQty += '<!-- Table for Add/Edit List of Services --> <li> Row appears for when you add a new bulk update service. <table class="table table-responsive table-striped"><thead><tr class=""><th><b>ACTION</b></th><th><b>SERVICE NAME</b></th><th><b>INCREASE AMOUNT</b></th><th><b>DATE EFFECTIVE</b></th></thead><tbody>';
            inlineQty += '<td class=""><button class="btn btn-success btn-sm glyphicon glyphicon-plus" data-serviceid="" data-zeeservid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button><input type="hidden" class="" value="F" /></td>';
            inlineQty += '<td><select class="form-control"><option></option>AMPO<option></option>PMPO<option></option></select></td><td><input class="form-control" placeholder="$" type="number"/></td>';
            inlineQty += '<td><input class="form-control" type="date"/></td>';
            inlineQty += '</tr></tbody></table></li>';
            inlineQty += '<br>';

            // Edit Section;
            inlineQty += '<br>';
            inlineQty += '<!-- Table for Add/Edit List of Services --> <li> When a bulk update service exists, you can edit it to change the increase amount or date effective. <table class="table table-responsive table-striped"><thead><tr class=""><th><b>ACTION</b></th><th><b>SERVICE NAME</b></th><th><b>INCREASE AMOUNT</b></th><th><b>DATE EFFECTIVE</b></th></thead><tbody>';
            inlineQty += '<td class="first_col"><button class="btn btn-warning btn-sm glyphicon glyphicon-pencil" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><button class="btn btn-danger btn-sm glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="" value="F" /></td>';
            inlineQty += '<td><select class="form-control"><option></option>AMPO<option></option>PMPO<option></option></select></td><td><input class="form-control" placeholder="$" type="number"/></td>';
            inlineQty += '<td><input class="form-control" type="date"/></td>';
            inlineQty += '</tr></tbody></table></li>';
            inlineQty += '<br>';

            inlineQty += '<br>';
            inlineQty += '<br>';
            inlineQty += '<b>Export CSV Section</b>';
            inlineQty += '<br>';
            inlineQty += '<button class="col-xs-3" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Export CSV</button>';
            inlineQty += '<ul><li>On click, a CSV Export of the currently scheduled price change is downloaded. Only data which has been saved will be in this export <b>(if you have made changes on the page, but have not saved, this will not be shown in the CSV).</b></li></ul>';
            inlineQty += '<br>';
            inlineQty += '<b>Customer List: Filters</b>';
            inlineQty += '<br>';
            // inlineQty += '<button class="col-xs-3" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Expand All</button>';
            // inlineQty += '<ul><li>Expand all Customer rows to show all services for customer based on most recent invoice.</li>';
            // inlineQty += '</ul>';
            // inlineQty += '<button class="col-xs-3" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Collapse All</button>';
            // inlineQty += '<ul><li>Collapse all Customer rows to show only customer name.</li></ul>';
            inlineQty += '<button class="col-xs-3" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Reset All</button>';
            inlineQty += '<ul><li>Reset all services to default/blank.</li></ul>';
            inlineQty += '<br>';
            inlineQty += '<b>Submit</b>';
            inlineQty += '<br>';
            inlineQty += '<button style="background-color: #095C7B; color: white; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" class="col-xs-3" onclick="">Save/Update</button>';
            inlineQty += '<ul><li>Click to Submit all Services Data which has been filled. This will be sent to IT team to verify and schedule all services for price increase.</li></ul>';

            return inlineQty;
        }

        function todayDate() {
            // Date Today n Date Tomorrow
            var today_date = new Date(); // Test Time 6:00pm - '2022-06-29T18:20:00.000+10:00'
            today_date.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })
            var hour_time = today_date.getHours();

            if (hour_time < 17) { // If Current Time is Before 5:00pm
                today_date = today_date.toISOString().split('T')[0];
            } else { // If Current Time is After 5:00pm, Change Date as Tomorrow.
                var today_year = today_date.getFullYear();
                var today_month = today_date.getMonth();
                var today_day = today_date.getDate();
                var today_in_day = new Date(Date.UTC(today_year, today_month, today_day + 1));
                today_date = today_in_day.toISOString().split('T')[0];
            }

            return today_date;
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

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            onRequest: onRequest
        }
    });