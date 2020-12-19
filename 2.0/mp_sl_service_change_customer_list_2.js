/**

 *@NApiVersion 2.0
 *@NScriptType Suitelet
 *
 * Module Description -
 * 
 * NSVersion    Date            		 Author         
 * 2.00       	2020-11-26 13:12:36      Ravija Maheshwari 
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format', 'N/currentRecord'],
function(ui, email, runtime, search, record, http, log, redirect, format, currentRecord) {
    function onRequest(context) {

        //Setup
        var baseURL = 'https://system.na2.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        var zee = 0;
        var role = runtime.getCurrentUser().role;

        if (role == 1000) {
            zee = runtime.getCurrentUser().id;
        } else if (role == 3) { //Administrator
            zee = 6; //test
        } else if (role == 1032) { // System Support
            zee = 425904; //test-AR
        }


        if(context.request.method === 'GET'){
            var form = ui.createForm({
                title: 'Cancel Scheduled Price Change - Customer List'
            });
            
            //Load Jquery
            var inlinehtml2 = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';

            // Load DataTables
            inlinehtml2 += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
            inlinehtml2 += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

            // Load Bootstrap
            inlinehtml2 += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
            inlinehtml2 += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';

            // Load Netsuite stylesheet and script
            inlinehtml2 += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
            inlinehtml2 += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
            inlinehtml2 += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlinehtml2 += '<style>.mandatory{color:red;}</style>';

            inlinehtml2 += '<link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
     
            //Instructions
            inlinehtml2 += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute; z-index: 9999;" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b><ul><li>Functionalities available on the Customer listing/table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort customer list according to the values in the columns. This is default to "Customer Name".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></ul></li><li><b>Search</b><ul><li>You can search for specific customer by typing into the "Search" field</li></ul></li></ul></li><li>Clickable Actions available per customer:</li><ul><li><button class="btn-xs btn-default" disabled>UPLOAD SCF</button> - <ul><li>Available for customers with missing Service Commencement Forms (SCF) in the system. You will need to upload the latest signed SCF for each relevant customers which outlines the service commencement date along with the Service(s) and Price(s).</li></ul></li><li><button class="btn-xs btn-warning" disabled>REVIEW</button> / <button class="btn-xs btn-primary" disabled>EDIT</button> - <ul><li>Review or Edit customer details (eg. Addresses, Service and Pricing, Packages) to set them up for Run Digitalisation.</li><li>Any service added needs to be scheduled on the Run Scheduler.</li><li>Any service deleted will be removed from your run. It will no longer appear on the calendar and app.</li></ul></li><li><button class="btn-xs btn-danger" disabled>COVID CANCEL</button> - <ul><li>You may Cancel non-active customers providing details and reasons around the Cancellation.</li><li>You <b><u>DO NOT NEED</u></b> to cancel customers with <b><u>Adhoc</u></b> arrangements.</li></ul></li><li><button class="btn-xs btn-default" disabled>Duplicate COMMREG</button> - <ul><li>Please contact <b><u>Head Office</u></b> if you see this Action against any customer</li></ul></li></ul></li></ul></ul></div>';


            //If role is Admin or System Support, add dropdown to select zee
            if (role != 1000) {
                inlinehtml2 += zeeDropDown(context);
            }
            
            //Set zee if one is chosen
            if (!isNullorEmpty(context.request.parameters.zee)) {
                zee = context.request.parameters.zee;
            }
            
            inlinehtml2 += populateCustomerTable(zee, baseURL);

            //Set inlineQty for Instruction button and zee dropdown
            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview table'
            }).defaultValue = inlinehtml2;
        
            form.clientScriptFileId = 4563740;
            context.response.writePage(form);
            
        }

       

    }

    /**
     * Returns inlineHtml which contains the dropdown to choose zees
     * @param {} context 
     */
    function zeeDropDown(context){
        var inlineHtml = '<div class="col-xs-12 admin_section" margin-top:30px "><b>Select Zee</b> <select class="form-control zee_dropdown" >';

        //WS Edit: Updated Search to SMC Franchisee (exc Old/Inactives)
        //Search: SMC - Franchisees
        var searched_zee = search.load({
            type: search.Type.PARTNER,
            id: 'customsearch_smc_franchisee'
        });

        var resultSet_zee = searched_zee.run();
        
        var count_zee = 0;

        var zee_id;

        inlineHtml += '<option value=""></option>'

        resultSet_zee.each(function(searchResult_zee) {
            zee_id = searchResult_zee.getValue({name: 'internalid'});
            // WS Edit: Updated entityid to companyname
            zee_name = searchResult_zee.getValue({name:'companyname'});
            if (context.request.parameters.zee == zee_id) {
                inlineHtml += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
              } else {
                inlineHtml += '<option value="' + zee_id + '">' + zee_name + '</option>';
              }
      
              return true;
        });

        inlineHtml += '</select></div>';

        return inlineHtml;
    }

    function populateCustomerTable(zee, baseURL){


        var inlineQty = '<style> table#customer {font-size: 14px;text-align: center;border: none; font-weight: bold;} table th{text-align: center;} </style>';
        inlineQty += '<div class="form-group container-fluid customers_preview_section">';
        inlineQty += '<table cellpadding="15" id="customers-preview" class="table table-responsive table-striped customer tablesorter" cellspacing="0">';
        inlineQty += '<thead style="color: white;background-color: #607799;">';
        inlineQty += '<tr class="text-center">';
        inlineQty += '<th scope="col">Review Complete</th>';
        inlineQty += '<th scope="col">ID</th>';
        inlineQty += '<th scope="col">Customer Name</th>';
        inlineQty += '<th scope="col">Date of Last price Increase</th>';
        inlineQty += '<th scope="col">Action</th>';
        inlineQty += '</tr>';
        inlineQty += '</thead>';
        inlineQty += '<tbody>';

        /**
        * Description - Get the list of Customer that have Trial or Signed Status for a particular zee
        */

        //Load customer record
        var zeeRecord = record.load({
            type: record.Type.PARTNER,
            id: zee,
            isDynamic: true
        });
        var name = zeeRecord.getValue({fieldId: 'companyname'});

        log.debug({
            title: 'zee rec name',
            details: name
        });


        //Search: SMC - Customer
        var customerSearch = search.load({
            type: search.Type.CUSTOMER,
            id: 'customsearch_smc_customer'
        });

        var filter = search.createFilter({
            name:'partner',
            join: null,
            operator: search.Operator.ANYOF,
            values: zee,
        });
        customerSearch.filters.push(filter);

        var resultSetCustomer = customerSearch.run();

        resultSetCustomer.each(function(searchResult){

            log.debug({
                title: 'search result',
                details: searchResult
            });

            var custid = searchResult.getValue({
                name: 'internalid',
                join: null,
                summary: search.Summary.GROUP
            });

            var entityid = searchResult.getValue({
                name: 'entityid',
                join: null,
                summary: search.Summary.GROUP
            });

            var companyname = searchResult.getValue({
                name: 'companyname',
                join: null,
                summary: search.Summary.GROUP
            });

            var last_price_increase = searchResult.getValue({
                name: 'custentity_date_of_last_price_increase',
                join: null,
                summary: search.Summary.GROUP
            });

            //Retrieve column values to Identify Reviewed Services and Correct CommReg
            var serviceCount = searchResult.getValue({
                name: 'formulanumeric',
                join: null,
                summary: search.Summary.MAX
            });

            //Retrieve column values to Identify Reviewed Services and Correct CommReg
            //Count of Reviewed Services
            var serviceCount = searchResult.getValue({
                name: 'formulanumeric',
                join: null,
                summary: search.Summary.MAX
            });

            //Count of Correct CommReg
            var commRegCount = searchResult.getValue({
                name: 'formulacurrency',
                join: null,
                summary: search.Summary.COUNT
            });

            if (commRegCount == 0) {
                inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td ><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" id="commRegUpload_'+custid+'" value="UPLOAD SCF"></div><div class="col-sm-6"><input type="button" class="form-control btn-danger cancel_customer" value="CANCEL" id="cancel_customer_'+custid+'"></div></div></td></tr>';
            } else if (commRegCount > 1) {
                inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td ><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="form-control btn-default" value="Duplicate COMMREG"></div><div class="col-sm-6"><input type="button" class="form-control btn-danger cancel_customer" value="CANCEL" id="cancel_customer_'+custid+'"></div></div></td></tr>';
            } else if (serviceCount == 0) {
                //If no service record present for customer, Review button will be shown
                inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="review_customer form-control btn-warning" value="REVIEW" id="review_customer_'+custid+'" ></div><div class="col-sm-6"><input type="button" class="form-control btn-danger cancel_customer" value="CANCEL" id="cancel_customer_'+custid+'"></div></div></td></tr>';
            } else {
                //If service record is present for customer, Edit button is shown
                inlineQty += '<tr class="dynatable-editable"><td style="text-align: center;"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25"></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-primary" value="EDIT" id="edit_customer_'+custid+'"></div><div class="col-sm-6"><input type="button" class="form-control btn-danger cancel_customer" value="CANCEL" id="cancel_customer_'+custid+'"></div></div></td></tr>';
            }
            return true;
        });

        inlineQty += '</tbody>';
        inlineQty += '</table><br/>';

        return inlineQty;
    }

    /**
     * Is Null or Empty.
     *
     * @param {Object} strVal
     */
    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }

    return {
        onRequest: onRequest
    };
});