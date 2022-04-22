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
            type = context.request.parameters.type;

            var params_params = context.request.parameters;
            if (!isNullorEmpty(params_params.custparam_params)) {
                var params = JSON.parse(
                    context.request.parameters.custparam_params
                );
            }
            var zee_id;
            var commReg;
            var cust_id;

            if (!isNullorEmpty(params)) {
                zee_id = parseInt(params.zeeid);
                commReg = parseInt(params.commreg);
                cust_id = parseInt(params.cust_id)
            }

            var form = ui.createForm({ title: " " });

            // Load jQuery
            // var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
            var inlineHtml =
                '<script src="https://code.jquery.com/jquery-3.5.0.js" crossorigin="anonymous"></script>';

            // Load Tooltip
            inlineHtml +=
                '<script src="https://unpkg.com/@popperjs/core@2"></script>';

            // Load Bootstrap
            inlineHtml +=
                '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
            inlineHtml +=
                '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
            // Load DataTables
            inlineHtml +='<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
            inlineHtml +='<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
            inlineHtml +='<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/rowgroup/1.1.3/js/dataTables.rowGroup.min.js"></script> ';
            inlineHtml +='<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/dataTables.buttons.min.js"></script> ';
            inlineHtml +='<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script> ';
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script> ';
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script> ';
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/buttons.html5.min.js"></script> ';
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/buttons.print.min.js"></script> ';

            // Load Netsuite stylesheet and script
            inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
            inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
            inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlineHtml += "<style>.mandatory{color:red;}</style>";

            // Load Bootstrap-Select
            inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
            inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';

            // Semantic Select
            inlineHtml += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.css">';
            inlineHtml += '<script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.js"></script>';

            // Load Search In Dropdown
            // inlineHtml += '<link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/css/select2.min.css" rel="stylesheet" />';
            // inlineHtml += '<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/js/select2.min.js"></script>';

            // New Website Color Schemes
            // Main Color: #379E8F
            // Background Color: #CFE0CE
            // Button Color: #FBEA51
            // Text Color: #103D39

            inlineHtml += '<div class="a" style="width: 100%; background-color: #CFE0CE; padding: 20px; min-height: 100vh; height: 100%; ">'; // margin-top: -40px
            // inlineHtml += '<h1 style="text-align: center; color: #103D39; display: inline-block; font-size: 22px; font-weight: bold; line-height: 33px; vertical-align: top; margin-bottom: 4px;">Scheduled Price Change: Finance Team</h1>';
            inlineHtml += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
            inlineHtml += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
            inlineHtml += '</style>';

            // // Define alert window.
            // inlineHtml +='<div class="container" style="margin-top:14px;" hidden><div id="alert" class="alert alert-danger fade in"></div></div>';

            // // Define information window.
            // inlineHtml +='<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';
            // inlineHtml += '<div style="margin-top: -40px"><br/>';

            // Buttons
            inlineHtml +='<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="smc" onclick="">Service Management Console</button>';
            inlineHtml +='<h1 style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Scheduled Price Change: Edit</h1>';

            // Click for Instructions
            // inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo" style="background-color: #FBEA51; color: #103D39;">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
            // inlineHtml += '<ul><li><input type="button" class="btn-xs" style="background-color: #fff; color: black;" disabled value="Submit Search" /> - <ul><li>Click "Submit Search" to load Datatable using current parameters</li></ul></li>'
            // inlineHtml += '<li>Functionalities available on the Table Collections Table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort collections invoices according to the values in the columns. This is default to "Days Overdue".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></ul></li><li><b>Search</b><ul><li>You can search for specific Customer or Invoice by typing into the "Search" field</li></ul></li></ul></li>';
            // inlineHtml += '<li>Table Filters:<ul><li><b>Matching MAAP Allocation</b><ul><li><button type="button" class="btn-xs btn-success " disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li><li><button type="button" class="btn-xs btn-danger " disabled><span class="glyphicon glyphicon-minus"></span></button> - Click to remove MAAP Allocation search filter from table. This is set default to "Days Overdue".</li></ul></li> <li><b>MP Ticket Column</b><ul><button type="button" class="btn-xs btn-success" disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li></ul></li></ul></li><li>Clickable Actions Available Per Invoice in DataTable:</li>';
            // inlineHtml += '<ul><li><button type="button" class="btn-xs" disabled><span class="span_class glyphicon glyphicon-pencil"></span></button> - Click to open Notes Section for Selected Invoice. (Notes Section is seperate from User Notes)</li>';
            // inlineHtml += '<li><button type="button" class="btn-xs btn-secondary" disabled><span class="glyphicon glyphicon-eye-open"></span></button> - Click to Set Invoice has "Viewed" by a member of the Finance Team.</li>';
            // inlineHtml += '<li><button type="button" class="btn-xs btn-info" disabled><span class="glyphicon glyphicon-time"></span></button> - Click to view Snooze Timers</li><li><button type="button" class="timer-1day form=control btn-xs btn-info" disabled><span class="span_class">1 Day</span></button> - Click to select Snooze duration of invoice from Table Collections Page.</li>';
            // inlineHtml += '</li></ul></div>';

            // inlineHtml += '<div class="se-pre-con"></div>'
            // inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b><ul><li>Functionalities available on the Customer listing/table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort customer list according to the values in the columns. This is default to "Customer Name".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></ul></li><li><b>Search</b><ul><li>You can search for specific customer by typing into the "Search" field</li></ul></li></ul></li><li>Clickable Actions available per customer:</li><ul><li><button class="btn-xs btn-default" disabled>UPLOAD SCF</button> - <ul><li>Available for customers with missing Service Commencement Forms (SCF) in the system. You will need to upload the latest signed SCF for each relevant customers which outlines the service commencement date along with the Service(s) and Price(s).</li></ul></li><li><button class="btn-xs btn-warning" disabled>REVIEW</button> / <button class="btn-xs btn-primary" disabled>EDIT</button> - <ul><li>Review or Edit customer details (eg. Addresses, Service and Pricing, Packages) to set them up for Run Digitalisation.</li></ul></li><li><button class="btn-xs btn-danger" disabled>CANCEL</button> - <ul><li>You may Cancel non-active customers providing details and reasons around the Cancellation.</li><li>You <b><u>DO NOT NEED</u></b> to cancel customers with <b><u>Adhoc</u></b> arrangements.</li></ul></li><li><button class="btn-xs btn-default" disabled>Duplicate COMMREG</button> - <ul><li>Please contact <b><u>Head Office</u></b> if you see this Action against any customer</li></ul></li></ul></li></ul></ul></div>';

            // inlineHtml = '<div class="form-group container loading_section"></div>';
            // inlineHtml += '<style> .loading_section { border: 14px solid #f3f3f3; border-radius: 50%; border-top: 14px solid #379E8F; width: 90px; height: 90px; -webkit-animation: spin 2s linear infinite; /* Safari */ animation: spin 2s linear infinite;';
            // inlineHtml += 'left: 50%; }' //position: fixed; z-index: 1000;
            // /* Safari */
            // inlineHtml += '@-webkit-keyframes spin {0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } }';
            // inlineHtml += '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            // inlineHtml += '</style>';

            // Comm Reg
            inlineHtml += commRegSection(commReg);
            inlineHtml += "<br>";
            inlineHtml += "<br>";

            // Tab Selection
            inlineHtml += '<div class="tabSection hide">'; //
            inlineHtml += editTab();
            inlineHtml += "</div>";

            inlineHtml += "</div></div>"; // </div>

            form.addField({
                    id: "preview_table",
                    label: "inlinehtml",
                    type: "inlinehtml",
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW,
                }).defaultValue = inlineHtml;

            form.addField({
                id: "custpage_price_change_edit_zee_id",
                label: "Zee ID",
                type: ui.FieldType.TEXT,
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN,
            }).defaultValue = zee_id;
            
            form.addField({
                id: "custpage_price_change_edit_cust_id",
                label: "Customer ID",
                type: ui.FieldType.TEXT,
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN,
            }).defaultValue = cust_id;

            form.addField({
                id: "custpage_price_change_edit_comm_reg",
                label: "Commencement Register",
                type: ui.FieldType.TEXT,
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN,
            }).defaultValue = commReg;

            form.clientScriptFileId = 5606277 //5595961; // 

            context.response.writePage(form);
        } else {

        }
    }

    function commRegSection(commReg) {

        var inlineQty = '<style>table#comm_reg_preview {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#comm_reg_preview th{text-align: center;} .bolded{font-weight: bold;}</style>';

        /**
         *  Comm Reg Header
         */
        inlineQty += '<div class="form-group container comm_header_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #379E8F; color: white;">Commencement Register</span></h4></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<table id="comm_reg_preview" class="table table-responsive table-striped customer tablesorter" style="width: 100%;">';
        inlineQty += '<thead style="color: white; background-color: #379E8F;">';
        inlineQty += '<tr class="text-center">';
        // inlineQty += '<th>Commencement Register</th>';
        inlineQty += '</tr>';
        inlineQty += '</thead>';

        inlineQty += '<tbody id="result_data_comm_reg" class="result-data-comm-reg">';
        inlineQty += '</tbody>';
        inlineQty += '</table>';

        inlineQty += '<div class="form-row container comm_reg_section">'
        inlineQty += '<div class="row">'

        inlineQty += '<div class="col-xs-2"></div>' // Blank Placeholder

        inlineQty += '<div class="col-xs-4 schedule_change_section"><input type="button" id="create_new" class="form-control btn btn-success btn-xs create_new" value="New Scheduled Change" data-toggle="tooltip" data-placement="right" title="NEW SCHEDULED CHANGE" /></div>';
        inlineQty += '<div class="col-xs-4 cancel_service_section"><input type="button" id="cancel_service" class="form-control btn btn-danger btn-xs cancel_service" value="Cancel Service" data-toggle="tooltip" data-placement="right" title="CANCEL SERVICE" /></div>';

        inlineQty += '<div class="col-xs-2"></div>' // Blank Placeholder


        inlineQty += '</div>'
        inlineQty += '</div>'

        return inlineQty;
    }

    /**
     * The table that will display the differents invoices linked to the franchisee and the time period.
     * @return  {String}    inlineQty
     */
    function editTab() {
        var inlineQty = '<style>table#data_preview {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#data_preview th{text-align: center;} .bolded{font-weight: bold;}</style>';

        /**
         *  Edit Header
         */
        inlineQty += '<div class="form-group container edit_header_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-12 heading1">';
        inlineQty += '<h4><span style="background-color: #379E8F" class="form-group label label-default col-xs-12">Edit</span></h4>';
        inlineQty += '</div></div></div>';

        /**
         *  Date Effective
         */
        inlineQty += '<div class="form-group container date_effective_section">';
        inlineQty += '<div class="row">';
        // if (isNullorEmpty(dateEffective)) {
        inlineQty += '<div class="col-xs-6"><div class="input-group"><span style="background-color: #379E8F; color: white;" class="input-group-addon">Date Effective <span class="mandatory">*</span></span><input type="date" id="date_effective" value="" class="form-control date_effective"/></div></div>';
        // } else {
        //     start_date = GetFormattedDate(dateEffective);
        //     inlineQty += '<div class="col-xs-7 "><div class="input-group"><span class="input-group-addon">DATE EFFECTIVE <span class="mandatory">*</span></span><input type="date" id="date_effective" value="' + start_date + '" data-olddate="' + dateEffective + '" class="form-control date_effective"/></div></div>';
        // } 

        /** 
         *  Sales Type
         */
        inlineQty += '<div class="col-xs-6 commencementtype"><div class="input-group"><span style="background-color: #379E8F; color: white;" class="input-group-addon" id="commencementtype_text">Sale Type <span class="mandatory">*</span></span><select id="commencementtype" class="form-control commencementtype"><option></option>';

        var col = new Array();
        col[0] = search.createColumn({
            name: 'name',
        })
        col[1] = search.createColumn({
            name: 'internalId',
        });
        var results = search.create({ type: 'customlist_sale_type', columns: col });
        results.run().each(function(res) {
            var listValue = res.getValue({ name: 'name' });
            var listID = res.getValue({ name: 'internalId' });
            // if (!isNullorEmpty(sale_type) && sale_type == listID) {
            //     inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            // } else {
            inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            // }
            return true;
        })
        inlineQty += '</select></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        /**
         *  DataTable
         */
        inlineQty += '<table id="data_preview" class="table table-responsive table-striped customer tablesorter" style="width: 100%;">';
        inlineQty += '<thead style="color: white; background-color: #379E8F;">';
        inlineQty += '<tr class="text-center">';
        inlineQty += '</tr>';
        inlineQty += '</thead>';

        inlineQty += '<tbody id="result_data" class="result-data"></tbody>';
        inlineQty += '</table>';

        inlineQty += '<div class="form-row container edit_submit_section">'
        inlineQty += '<div class="row">'
        inlineQty += '<div class="col-xs-2"></div>' // Blank Placeholder
        inlineQty += '<div class="col-xs-4 schedule_change_section"><input type="button" id="sumbit_edit" style="color: #103D39;" class="form-control btn btn-warning btn-xs sumbit_edit" value="Submit" data-toggle="tooltip" data-placement="right" title="Submit" /></div>';
        inlineQty += '<div class="col-xs-4 cancel_service_section"><input type="button" id="next_customer" style="color: #103D39;" class="form-control btn btn-warning btn-xs next_customer" value="Next Customer" data-toggle="tooltip" data-placement="right" title="Next Customer" /></div>';
        inlineQty += '<div class="col-xs-2"></div>' // Blank Placeholder
        inlineQty += '</div>'
        inlineQty += '</div>'

        return inlineQty;
    }

    /**
     * The period dropdown field.
     * @param   {String}    date_from
     * @param   {String}    date_to
     * @return  {String}    `inlineQty`
     */
    function periodDropdownSection(date_from, date_to) {
        var selected_option = (isNullorEmpty(date_from) && isNullorEmpty(date_to)) ? 'selected' : '';
        var inlineQty = '<div class="form-group container period_dropdown_section">';
        inlineQty += '<div class="row">';
        // Period dropdown field
        inlineQty += '<div class="col-xs-12 period_dropdown_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="period_dropdown_text">Period</span>';
        inlineQty += '<select id="period_dropdown" class="form-control">';
        inlineQty += '<option ' + selected_option + '></option>';
        inlineQty += '<option value="this_week">This Week</option>';
        inlineQty += '<option value="last_week">Last Week</option>';
        inlineQty += '<option value="this_month">This Month</option>';
        inlineQty += '<option value="last_month">Last Month</option>';
        inlineQty += '<option value="full_year">Full Year (1 Jan -)</option>';
        inlineQty += '<option value="financial_year">Financial Year (1 Jul -)</option>';
        inlineQty += '</select>';
        inlineQty += '</div></div></div></div>';

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