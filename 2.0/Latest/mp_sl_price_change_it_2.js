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
 * @Last Modified by:   Anesu
 * @Last Modified time: 2021-09-20 09:33:08 
 * 
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/task', 'N/format'],
    function(ui, email, runtime, search, record, http, log, redirect, task, format) {
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

                if (!isNullorEmpty(params)) {
                    zee_id = parseInt(params.zeeid);
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
                // Old Main Color: #379E8F (Green)
                // New Main Color: #095C7B (Blue)
                // Background Color: #CFE0CE (Light Green)
                // Button Color: #FBEA51 (Yellow)
                // Text Color: #103D39 (Dark Green)

                inlineHtml += '<div class="a" style="width: 100%; background-color: #CFE0CE; padding: 20px; min-height: 100vh; height: 100%; ">'; // margin-top: -40px
                inlineHtml += '<h1 style="text-align: center; color: #103D39; font-size: 22px; font-weight: bold; line-height: 33px; vertical-align: top; margin-bottom: 4px;">Scheduled Price Change: IT Team</h1>';
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
                inlineHtml += '<div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Notes Section</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-primary save_service" data-dismiss="modal">Save</button><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
                inlineHtml += '<div id="myModal3" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Notes Section</h4><br></div><div class="modal-body">'+instructions()+'</div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';


                // Click for Instructions
                // inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo" style="background-color: #FBEA51; color: #103D39;">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
                // inlineHtml += '<ul><li><input type="button" class="btn-xs" style="background-color: #fff; color: black;" disabled value="Submit Search" /> - <ul><li>Click "Submit Search" to load Datatable using current parameters</li></ul></li>'
                // inlineHtml += '<li>Functionalities available on the Debt Collections Table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort collections invoices according to the values in the columns. This is default to "Days Overdue".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></ul></li><li><b>Search</b><ul><li>You can search for specific Customer or Invoice by typing into the "Search" field</li></ul></li></ul></li>';
                // inlineHtml += '<li>Table Filters:<ul><li><b>Matching MAAP Allocation</b><ul><li><button type="button" class="btn-xs btn-success " disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li><li><button type="button" class="btn-xs btn-danger " disabled><span class="glyphicon glyphicon-minus"></span></button> - Click to remove MAAP Allocation search filter from table. This is set default to "Days Overdue".</li></ul></li> <li><b>MP Ticket Column</b><ul><button type="button" class="btn-xs btn-success" disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li></ul></li></ul></li><li>Clickable Actions Available Per Invoice in DataTable:</li>';
                // inlineHtml += '<ul><li><button type="button" class="btn-xs" disabled><span class="span_class glyphicon glyphicon-pencil"></span></button> - Click to open Notes Section for Selected Invoice. (Notes Section is seperate from User Notes)</li>';
                // inlineHtml += '<li><button type="button" class="btn-xs btn-secondary" disabled><span class="glyphicon glyphicon-eye-open"></span></button> - Click to Set Invoice has "Viewed" by a member of the Finance Team.</li>';
                // inlineHtml += '<li><button type="button" class="btn-xs btn-info" disabled><span class="glyphicon glyphicon-time"></span></button> - Click to view Snooze Timers</li><li><button type="button" class="timer-1day form=control btn-xs btn-info" disabled><span class="span_class">1 Day</span></button> - Click to select Snooze duration of invoice from Debt Collections Page.</li>';
                // inlineHtml += '</li></ul></div>';

                inlineHtml += '<br>';
                inlineHtml += zeeDropdownSection(zee_id);

                // inlineHtml += instructionSection();

                if (!isNullorEmpty(zee_id)) {
                    // inlineHtml += increaseAmount();

                    inlineHtml += customerListHeader();

                    inlineHtml += submitAll();

                    inlineHtml += dataTable();

                    inlineHtml += loadingSection();

                    inlineHtml += submitAll();
                }

                inlineHtml += '</div></div>'

                form.addField({
                    id: 'preview_table',
                    label: 'inlinehtml',
                    type: 'inlinehtml'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW
                }).defaultValue = inlineHtml;

                form.addField({
                    id: "custpage_price_chng_fin_zee_id",
                    label: "Zee ID",
                    type: ui.FieldType.TEXT,
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN,
                }).defaultValue = zee_id;

                form.clientScriptFileId = 5787224 ; //Sandbox 5607528 // Prod - 5787224

                context.response.writePage(form);
            } else {}
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
            zeesSearchResults.each(function(zeesSearchResult) {
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

        function customerListHeader() {
            // Increase Header
            var inlineQty = '<div class="form-group container cust_filter_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #095C7B; color: white;">Customer List</span></h4></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            // Customer List Filters
            inlineQty += '<div class="form-group container cust_list_section">';
            inlineQty += '<div class="row">';

            // Instructions
            inlineQty += '<div class="col-xs-2">';
            inlineQty += '<button id="btn-instructions" class="col-xs-12 hide" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Instructions</button>' // 
            inlineQty += '</div>';

            // Expand All
            // inlineQty += '<div class="col-xs-3">';
            // inlineQty += '<button id="btn-show-all-children" class="col-xs-12 hide" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Expand All</button>'
            // inlineQty += '</div>';

            // Collapse All
            // inlineQty += '<div class="col-xs-3">';
            // inlineQty += '<button id="btn-hide-all-children" class="col-xs-12 hide" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Collapse All</button>'
            // inlineQty += '</div>';

            // Reset All
            // inlineQty += '<div class="col-xs-2">';
            // inlineQty += '<button id="reset-all" class="hide" type="button">Reset All</button>'
            // inlineQty += '</div>';

            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function increaseAmount() {
            var inlineQty = '<style>.green-back { background-color: #095C7B; color: white; }.vl {border-left: 6px solid green;height: 500px; }</style>';

            // Increase Header
            inlineQty += '<div class="form-group container date_filter_section">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #095C7B; color: white;">Increase Price on All Services</span></h4></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="container inc_price_section">';
            inlineQty += '<div class="row">';

            inlineQty += '<div class="col-xs-3"></div>';
            // Increase Button
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="servicesAll" class="col-xs-12" onclick="">Add/Edit All Services</button>';
            inlineQty += '</div>';

            inlineQty += '<div class="col-xs-3"></div>';

            inlineQty += '</div></div>';

            return inlineQty;
        }

        function loadingSection() {
            var inlineQty = '<div class="form-group container loading_section"></div>';
            inlineQty += '<style> .loading_section { border: 14px solid #f3f3f3; border-radius: 50%; border-top: 14px solid #095C7B; width: 90px; height: 90px; -webkit-animation: spin 2s linear infinite; /* Safari */ animation: spin 2s linear infinite;';
            inlineQty += 'left: 50%; }' //position: fixed; z-index: 1000; 
                /* Safari */
            inlineQty += '@-webkit-keyframes spin {0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } }';

            inlineQty += '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            inlineQty += '</style>';

            return inlineQty;
        }

        function submitAll() {
            // Save Edit
            var inlineQty = '<div class="container">'; //style="margin-top: 20px;"
            inlineQty += '<div class="row justify-content-center">';

            inlineQty += '<div class="col-xs-4"></div>';
            inlineQty += '<div class="col-4">';
            // inlineQty += '<input type="button" style="background-color: #095C7B; color: white; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px;"  id="submit" value=""></input>';
            inlineQty += '<button style="background-color: #FBEA51; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="submitAll" class="col-xs-4 submit_btn" onclick="">Schedule Emails for All</button>';
            inlineQty += '</div>';
            inlineQty += '<div class="col-xs-4"></div>';

            inlineQty += '</div></div>';

            return inlineQty;
        }

        function instructionSection(){
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

        function instructions(){
            var inlineQty = '';

            inlineQty += '<b><u>Scheduled Price Change Page Description</u></b>';
            inlineQty += '<br>Purpose of this page is to schedule price change on services for some customers under a Franchisee (Excluding customers such as AP, SC, NeoPost)<br>';
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
            inlineQty += '<button class="col-xs-3" type="button" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px;">Reset All</button>';
            inlineQty += '<ul><li>Reset all services to default/blank.</li></ul>';
            inlineQty += '<br>';
            inlineQty += '<b>Submit</b>';
            inlineQty += '<br>';
            inlineQty += '<button style="background-color: #095C7B; color: white; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" class="col-xs-3" onclick="">Save/Update</button>';
            inlineQty += '<ul><li>Click to Submit all Services Data which has been filled. This will be sent to IT team to verify and schedule all services for price increase.</li></ul>';

            return inlineQty;
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

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            onRequest: onRequest
        }
    });