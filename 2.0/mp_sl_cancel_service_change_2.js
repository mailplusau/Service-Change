/**

 *@NApiVersion 2.0
 *@NScriptType Suitelet
 *
 * Module Description -
 * 
 * NSVersion    Date            		 Author         
 * 2.00       	2020-12-19 13:12:36      Ravija Maheshwari
 * 
 * @Last Modified by:   Ravija Maheshwari
 * @Last Modified time: 2020-12-21 13:10
 * 
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

            //Load Jquery
            var inlineQty = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';

            // Load DataTables
            inlineQty += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
            inlineQty += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

            // Load Bootstrap
            inlineQty += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
            inlineQty += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';

            // Load Netsuite stylesheet and script
            inlineQty += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
            inlineQty += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
            inlineQty += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlineQty += '<style>.mandatory{color:red;}</style>';

            inlineQty += '<link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            //Load Jquery
            inlineQty = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';

            // Load DataTables
            inlineQty += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
            inlineQty += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

            // Load Bootstrap
            inlineQty += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
            inlineQty += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';

            // Load Netsuite stylesheet and script
            inlineQty += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
            inlineQty += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
            inlineQty += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlineQty += '<style>.mandatory{color:red;}</style>';

            inlineQty += '<link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

            //Loader animation
            inlineQty += '<div class="se-pre-con"></div>';

            //Alert box
            inlineQty += '<div class="alert alert-danger alert-dismissible">';
            inlineQty += '</div>';
           
            var commReg = null; 
            var params = context.request.parameters.custparam_params;
            params = JSON.parse(params);

            //Create form - Cancel Service
            var form = ui.createForm({
                title: 'Cancel Service'
            });

            //Load current customer's record
            var customer = params.custid;

            var recCustomer = record.load({
                type: record.Type.CUSTOMER,
                id: customer,
                isDynamic: true
            });

            form.addField({
                id: 'custpage_customer_id',
                type: ui.FieldType.TEXT,
                label: 'Customer ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = customer;

            var franchisee = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: customer,
                columns: "partner"
            });

            form.addField({
                id: 'custpage_customer_franchisee',
                type: ui.FieldType.TEXT,
                label: 'Franchisee ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = franchisee.partner[0].value ; //franchisee ID

            inlineQty += cancellationDateAndReason();
            inlineQty += cancellationCompetitorAndNotice();
            inlineQty += serviceDisplayTable(commReg, customer);

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview table'
            }).defaultValue = inlineQty;

            //Add form buttons
            form.addSubmitButton({
                label: 'Submit'
            });

            form.addButton({
                id: 'back',
                label: 'Back',
            });

            form.addButton({
                id: 'reset',
                label: 'Reset',
            });
            form.clientScriptFileId = 4570637;
            context.response.writePage(form);
        }else{
            var customer = parseInt(context.request.parameters.custpage_customer_id);
            var params = {
                custid: customer
            };

            redirect.redirect({
                url: 'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1114&deploy=1&compid=1048144',
                parameters: params
            });

        }

        /**
         * Section to display Row 1 containing Cancellation Date and Cancellation Reason 
         * fields
         */
        function cancellationDateAndReason(){
            var inlineQty = '<div class="container" style="padding-top: 3%;">';
            inlineQty += '<div class="form-group container row_cancellation ">';
            inlineQty += '<div class="row">'

            inlineQty += '<div class="col-xs-6 cancel_date_section">';
            inlineQty += '<div class="input-group">';

            inlineQty += '<span class="input-group-addon">CANCELLATION DATE <span class="mandatory">*</span></span></span>';
            inlineQty += '<input type="date" class="form-control" id="cancel_date" value="" /></div></div>';

            //Get all the cancellation reasons from customlist58
            var filterReason = search.createFilter({
                name: 'isinactive',
                join: null,
                operator: search.Operator.IS,
                values: 'F',
            });
            
            var results =  search.create({
                type: 'customlist58',
                columns: ['name', 'internalId']
            });
            results.filters.push(filterReason);

            var searchResultSet = results.run().getRange({start: 0, end: 1000});

            //Cancellation reason display
            inlineQty += '<div class="col-xs-6 cancel_reason_section"><div class="input-group"><span class="input-group-addon">CANCELLATION REASON</span><select class="form-control" id="cancel_reason" ><option></option>';

            for(var i = 0 ; i < searchResultSet.length; i++){           
                var listValue = searchResultSet[i].getValue({name: 'name'});
                var listID = searchResultSet[i].getValue({name: 'internalId'});
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }

            inlineQty += '</select></div></div>';

            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        /**
         * Section to display Row 2 containing Cancellation Competitor and Cancellation Notice 
         * fields
         */
        function cancellationCompetitorAndNotice(){
            var inlineQty = '<div class="form-group container row_cancellation ">';
            inlineQty += '<div class="row">'

            //Cancellation competitor
            inlineQty += '<div class="col-xs-6 cancel_comp_section"><div class="input-group"><span class="input-group-addon">CANCELLATION COMPETITOR</span><select class="form-control" id="cancel_comp" ><option></option>';

            var filterReason = search.createFilter({
                name: 'isinactive',
                join: null,
                operator: search.Operator.IS,
                values: 'F',
            });

            var results =  search.create({
                type: 'customlist33',
                columns: ['name', 'internalId']
            });
            results.filters.push(filterReason);

            var searchResultSet = results.run().getRange({start: 0, end: 1000});
            
            for(var i = 0 ; i < searchResultSet.length; i++){           
                var listValue = searchResultSet[i].getValue({name: 'name'});
                var listID = searchResultSet[i].getValue({name: 'internalId'});
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
            inlineQty += '</select></div></div>';

            //Cancellation Notice
            inlineQty += '<div class="col-xs-6 cancel_notice_section"><div class="input-group"><span class="input-group-addon">CANCELLATION NOTICE</span><select class="form-control" id="cancel_notice" ><option></option>';

            var results =  search.create({
                type: 'customlist_cancellation_notice',
                columns: ['name', 'internalId']
            });
            var searchResultSet = results.run().getRange({start: 0, end: 1000});

            for(var i = 0 ; i < searchResultSet.length; i++){           
                var listValue = searchResultSet[i].getValue({name: 'name'});
                var listID = searchResultSet[i].getValue({name: 'internalId'});
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
            inlineQty += '</select></div></div>';


            inlineQty += '</div>';
            inlineQty += '</div>';
            return inlineQty;
        }

        /**
         * Service details table
         */

        function serviceDisplayTable(commReg, customer){
           
            var inlineQty = '<style> table#services {font-size: 14px;text-align: center;border: none; font-weight: bold;} table th{text-align: center;} </style>';
            inlineQty += '<div class="form-group container services_preview_section">';
            inlineQty += '<table cellpadding="15" id="services-preview" class="table table-responsive table-striped services tablesorter" cellspacing="0">';
            inlineQty += '<thead style="color: white;background-color: #607799;">';
            inlineQty += '<tr class="text-center">';
            inlineQty += '<th scope="col">ACTION</th>';
            inlineQty += '<th scope="col">SERVICE NAME</th>';
            inlineQty += '<th scope="col">SERVICE DESCRIPTION</th>';
            inlineQty += '<th scope="col">OLD PRICE</th>';
            inlineQty += '<th scope="col">NEW PRICE</th>';
            inlineQty += '</tr>';
            inlineQty += '</thead>';
            inlineQty += '<tbody>';

            //Populating the table
            var service_ids = [];

            if(!isNullorEmpty(commReg)){
                var searched_service_change = search.load({
                    id: 'customsearch_smc_service_chg',
                    type: 'customrecord_servicechg'
                });

                var newFilter = search.createFilter({
                    name: 'custrecord_servicechg_comm_reg',
                    join: null,
                    operator: 'anyof',
                    values: commReg
                });

                searched_service_change.filters.push(newFilter);

                searched_service_change.run().each(function(service_change){
                    service_ids[service_ids.length] = service_change.getValue({name: 'custrecord_servicechg_service'});

                    inlineQty += '<tr>';

                    inlineQty += '<td class="first_col"><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-serviceid="' + service_change.getValue({name: 'custrecord_servicechg_service'}) + '"  data-servicechangeid="' + service_change.getValue({name: 'internalid'}) + '" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                    inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + service_change.getValue({name: 'custrecord_servicechg_service'}) + '" data-servicetypeid="" readonly value="' + service_change.getText({name: 'custrecord_servicechg_service'}) + '" /></div></td>';

                    inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + service_change.getValue({name: "custrecord_service_price", join: "CUSTRECORD_SERVICECHG_SERVICE", summary: null}) + '"  type="number" step=".01" /></div></td>';

                    inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value="' + service_change.getValue({name: 'custrecord_servicechg_new_price'}) + '"  type="number" step=".01" /></div></td>';

                    inlineQty += '</tr>';
                    return true;
                })

            }

            //Get all the services associated with this customer
            var serviceSearch = search.load({
                id: 'customsearch_smc_services',
                type: 'customrecord_service'
            });
            
            serviceSearch.filters.push(
                search.createFilter({
                name: 'custrecord_service_customer',
                join: null,
                operator: search.Operator.ANYOF,
                values: customer
                })
            );

            if (!isNullorEmpty(service_ids)) {
                serviceSearch.filters.push(
                    search.createFilter({
                    name: 'internalid',
                    join: null,
                    operator: search.Operator.NONEOF,
                    values: service_ids
                    })
                );
            }

            var resultSet_service = serviceSearch.run()
            var serviceResult  = resultSet_service.getRange({start: 0, end: 1});
            if (serviceResult.length != 0) {    
                resultSet_service.each(function(service){
                    inlineQty += '<tr>';

                    inlineQty += '<td class="first_col"><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-servicechangeid="" data-toggle="tooltip" data-placement="right" title="Delete" data-serviceid="' + service.getValue({name: 'internalid'}) + '"></button><input type="hidden" class="delete_service" value="F" /></td>';

                    inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + service.getValue({name: 'internalid'}) + '" data-servicetypeid="' + service.getText({name: "internalid", join: "CUSTRECORD_SERVICE", summary: null}) + '" readonly value="' + service.getText({name: 'custrecord_service'}) + '" /></div></td>';
                    inlineQty += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + service.getValue({name: 'custrecord_service_description'}) + '"  type="text" /></div></td>';

                    inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" id="service_price" disabled value="' + service.getValue({name: 'custrecord_service_price'}) + '"  type="number" step=".01" /></div></td>';
                    inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value=""  type="number" step=".01" /></div></td>';

                    inlineQty += '</tr>';
                    return true; 
                });
            }
            inlineQty += '</tbody>';
            inlineQty += '</table></div></div></div></form><br/>';

            return inlineQty;

        }

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



