/**

 *@NApiVersion 2.0
 *@NScriptType Suitelet
 *
 * Module Description - 
 * 
 * NSVersion    Date            		 Author         
 * 2.00       	2020-12-19 13:12:36      Ravija Maheshwari 
 * 
 * @Last Modified by: Ravija
 * @Last Modified time: 2020-12-20 11:55
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format', 'N/currentRecord', 'N/file'],
function(ui, email, runtime, search, record, http, log, redirect, format, currentRecord, file) {
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

            // Load Bootstrap
            inlineQty += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
            inlineQty += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';

            // Load Netsuite stylesheet and script
            inlineQty += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
            inlineQty += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
            inlineQty += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlineQty += '<style>.mandatory{color:red;}</style>';

            inlineQty += '<link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
     

            //Set the customer id
            if(!isNullorEmpty(context.request.parameters.custparam_params)){
                var params = context.request.parameters.custparam_params;
                params = JSON.parse(params);
                var customer = parseInt(params.custid);
            }else{
                var customer = parseInt(context.request.custid);
            }

            var recCustomer = record.load({
                type: record.Type.CUSTOMER,
                id: customer,
                isDynamic: true
            });

            var franchisee = recCustomer.getValue({fieldId: 'partner'});

            var form = ui.createForm({
                title: 'Service Management for : <a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + customer + '">' + recCustomer.getValue({fieldId: 'entityid'}) +'</a> ' + recCustomer.getValue({fieldId: 'companyname'})           
            });

            
            form.addField({
                id: 'custpage_customer_id',
                label: 'Customer ID',
                type: ui.FieldType.TEXT
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

            inlineQty += currentAndScheduledServiceSection(customer);

            inlineQty += serviceActionsSection();

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview table'
            }).defaultValue = inlineQty ; 


            form.addSubmitButton({
                label: 'Submit'
            });

            form.addButton({
                id: 'back',
                label: 'Back',
            });

            form.addResetButton();

            form.clientScriptFileId = 4569927;
            context.response.writePage(form);
        }else{
            redirect.toSuitelet({
                scriptId: 'customscript_sl_service_change_list_2',
                deploymentId: 'customdeploy_service_change_list_2',
                isExternal: false,
                parameters: params
            })
        }
         
    }

    /**
     * Section displaying the current service details and existing scheduled chnages
     * @param {*} customerId
     */
    function currentAndScheduledServiceSection(customerId){

        // Get all the services associated with this customer
        var serviceFilter = search.createFilter({
            name: 'custrecord_service_customer',
            join: null,
            operator: search.Operator.IS,
            values: customerId
        });

        var serviceSearch = search.load({
            type: 'customrecord_service',
            id: 'customsearch_smc_services'
        });

        serviceSearch.filters.push(serviceFilter);
        
        var serviceResult = serviceSearch.run();
        var firstService = serviceResult.getRange({
            start: 0,
            end: 1000
        });

        var inlineQty = '<div class="container row ">';
		inlineQty += '<div class="col-md-4 well well-sm" style="background-color: #607799;">';
		inlineQty += '<h5 class="text-center">CURRENT SERVICE DETAILS</h5>';
		inlineQty += '</div>';
		inlineQty += '<div class="col-md-8 well well-sm" style="background-color: #607799;">';
		inlineQty += '<h5 class="text-center">SCHEDULED CHANGES</h5>';
		inlineQty += '</div>';
        inlineQty += '</div>';
        
        if (firstService.length != 0) {
           
            serviceResult.each(function(service) {
                inlineQty += '<div class="container row ">';
                inlineQty += '<div class="col-md-4 well">';
                
                //Current Service Details section
				inlineQty += '<div class="input-group form-group"><span class="input-group-addon" id="address1_text">SERVICE NAME</span><input id="service_name" class="form-control service_name" readonly value="' + service.getText('custrecord_service') + '" /></div>';
				inlineQty += '<div class="input-group form-group"><span class="input-group-addon" id="address1_text">CURRENT PRICE | $</span><input id="current_price" class="form-control current_price" readonly value="' + service.getValue('custrecord_service_price') + '" /></div>';
				inlineQty += '<div class="input-group form-group"><span class="input-group-addon" id="address1_text">ASSOCIATED PACKAGE</span><input id="associated_package" class="form-control associated_package" readonly value="' + service.getText('custrecord_service_package') + '" /></div>';
				inlineQty += '<div class="input-group form-group"><span class="input-group-addon" id="address1_text">DESCRIPTION</span><input id="service_descp" class="form-control service_descp" data-serviceid="' + service.getValue('internalid') + '" value="' + service.getValue('custrecord_service_description') + '" /></div>';
                inlineQty += '</div>';

                //Scheduled changes searcch
                var searchedServiceChange = search.load({
                    id: 'customsearch_smc_service_chg',
                    type: 'customrecord_servicechg'
                });
                
                //Filter for all service changes services for this customer 
                searchedServiceChange.filters.push(search.createFilter({
                    name: 'custrecord_servicechg_service',
                    join: null,
                    operator: search.Operator.IS,
                    values: service.getValue({name:'internalid'})
                }));

                searchedServiceChange.filters.push(search.createFilter({
                    name: 'custrecord_servicechg_status',
                    join: null,
                    operator: search.Operator.NONEOF,
                    values: [2, 3]
                }));

                var resultSearchedServiceChg = searchedServiceChange.run();
                
                //Scheduled changes section
                inlineQty += '<div class="col-md-8 well form-group">';

                inlineQty += '<table class="table table-responsive table-striped customer tablesorter"><thead style="color: white;background-color: #607799;"><tr><th>ACTION</th><th>CHANGE TYPE</th><th>DATE EFFECTIVE</th><th>NEW PRICE</th><th>COMM REG</th><th>FREQUENCY</th><th>SCF</th></tr></thead><tbody>';
                
                resultSearchedServiceChg.each(function(searchedServiceChg){
                    inlineQty += '<tr>';

                    inlineQty += '<td><button class="btn btn-warning btn-xs edit_class glyphicon glyphicon-pencil" data-dateeffective="' + searchedServiceChg.getValue({name: 'custrecord_servicechg_date_effective'}) + '" data-commreg="' + searchedServiceChg.getValue({name: 'custrecord_servicechg_comm_reg'}) + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button></td>';
 
                    inlineQty += '<td>' + searchedServiceChg.getValue({name: 'custrecord_servicechg_type'}) + '</td>';
					inlineQty += '<td>' + searchedServiceChg.getValue({name:'custrecord_servicechg_date_effective'}) + '</td>';
					inlineQty += '<td>' + searchedServiceChg.getValue({name:'custrecord_servicechg_new_price'}) + '</td>';
					inlineQty += '<td>' + searchedServiceChg.getValue({name:'custrecord_servicechg_comm_reg'}) + '</td>';
                    inlineQty += '<td>' + searchedServiceChg.getText({name:'custrecord_servicechg_new_freq'}) + '</td>';

                    var fileID = searchedServiceChg.getValue({
                        name: 'custrecord_scand_form',
                        name: 'CUSTRECORD_SERVICECHG_COMM_REG',
                        summary: null
                    }); 

                    if (!isNullorEmpty(fileID)) {
						var fileRecord = file.load({
                            id: fileID
                        });

                        inlineQty += '<td><a href="' + fileRecord.url + '" target="_blank">' + searchedServiceChg.getText({name: "custrecord_scand_form", join: "CUSTRECORD_SERVICECHG_COMM_REG", summary: null}) + '</a></td>';
                        
					} else {
						inlineQty += '<td></td>';
                    }
                    inlineQty += '</tr>';
                    return true;

                });	

                inlineQty += '</tbody></table>';
				inlineQty += '</div>';
				inlineQty += '</div>';
                return true;
            });
        }
        return inlineQty;
    }
    
    /**
     * Section for the New Scheduled Change and Cancel Service buttons
     */
    function serviceActionsSection(){
        var inlineQty = '<div class="form-group container row_button">';
        inlineQty += '<div class="row">';

        inlineQty += '<div class="col-xs-4 schedule_change_section"><input type="button" id="create_new" class="form-control btn btn-success btn-xs create_new" value="NEW SCHEDULED CHANGE" data-toggle="tooltip" data-placement="right" title="NEW SCHEDULED CHANGE" /></div>';
		inlineQty += '<div class="col-xs-4 cancel_service_section"><input type="button" id="cancel_service" class="form-control btn btn-danger btn-xs cancel_service" value="CANCEL SERVICE" data-toggle="tooltip" data-placement="right" title="CANCEL SERVICE" /></div>';

		inlineQty += '</div>';
		inlineQty += '</div>';

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