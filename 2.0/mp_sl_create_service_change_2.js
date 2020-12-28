/**

 *@NApiVersion 2.0
 *@NScriptType Suitelet
 *
 * Module Description - Add / Edit Service to create corresponding service change records.
 * 
 * NSVersion    Date            		 Author         
 * 2.00       	2020-12-20              Ravija Maheshwari 
 * 
 * @Last Modified by:   Ravija
 * @Last Modified time: 2020-12-22 9:24
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

            //Loader animation
            inlineQty += '<div class="se-pre-con"></div>';

            //Alert box
            inlineQty += '<div class="alert alert-danger alert-dismissible">';
            inlineQty += '</div>';

            //Global variables
            var script_id = null;
            var deploy_id = null;
            var entryParamsString = null;
    
            var commReg = null;
            var dateEffective = null;
            var sale_type = null;
            var editPage = 'F';
    
            var closed_won;
            var opp_with_value;

            var params = context.request.parameters.custparam_params;
            var salesrep =  context.request.parameters.salesrep;
            var sendemail = null;
    
            var suspects = null;

            if(isNullorEmpty(salesrep)){
                params = JSON.parse(params);

                var customer = params.custid;
                commReg = params.commreg;
                salesrep = params.salesrep;
                sendemail = params.sendemail;
                dateEffective = params.date;
                script_id = params.customid;
                deploy_id = params.customdeploy;
                suspects = params.suspects;
                closed_won = params.closedwon;
                opp_with_value = params.oppwithvalue;
                var salesrecordid = params.salesrecordid;
            }else{
                var customer = context.request.parameters.custid;
                commReg = context.request.parameters.commreg;
                script_id =  context.request.parameters.customid;
                deploy_id = context.request.parameters.customdeploy;
                closed_won = context.request.parameters.closedwon;
                opp_with_value = context.request.parameters.oppwithvalue;
                var salesrecordid = context.request.parameters.salesrecordid;
            }

            var recCustomer = record.load({
                type: record.Type.CUSTOMER,
                id: customer
            });

            var franchisee = recCustomer.getValue({fieldId: 'partner' });
            var form = ui.createForm({
                title: 'Add / Edit Service : <a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + customer + '">' + recCustomer.getValue({fieldId: 'entityid'}) + '</a> ' + recCustomer.getValue({fieldId: 'companyname'})
            });


            form.addField({
                id: 'custpage_html2',
                type: ui.FieldType.INLINEHTML,
                label: 'Scripts'
            }).defaultValue = inlineQty;

            // Add all form fields
            form.addField({
                id: 'custpage_customer_id',
                label: 'Customer ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = customer;

            form.addField({
                id: 'custpage_customer_entityid',
                label: 'Customer ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = recCustomer.getValue({fieldId: 'entityid'});

            var franchisee = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: customer,
                columns: "partner"
            });

            form.addField({
                id: 'custpage_customer_franchisee',
                label: 'Franchisee ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = franchisee.partner[0].value ; //franchisee ID

            if (!isNullorEmpty(commReg)) {
                editPage = 'T';
                var customer_comm_reg = record.load({
                    type: 'customrecord_commencement_register',
                    id: commReg,
                    isDynamic: true
                });
                
                dateEffective = customer_comm_reg.getValue({fieldId: 'custrecord_comm_date'});
                sale_type = customer_comm_reg.getValue({fieldId: 'custrecord_sale_type'});
            }

            form.addField({
                id: 'custpage_edit_page',
                label: 'Comm Reg ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = editPage;

            form.addField({
                id: 'custpage_customer_comm_reg',
                label: 'Comm Reg ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = commReg;

            form.addField({
                id: 'custpage_date_effective',
                label: 'Comm Reg ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = dateEffective;

            form.addField({
                id: 'custpage_salesrep',
                label: 'Comm Reg ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = salesrep;

            form.addField({
                id: 'custpage_sendemail',
                label: 'Comm Reg ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = sendemail;

            form.addField({
                id: 'custpage_salesrecordid',
                label: 'Comm Reg ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = salesrecordid;

            form.addField({
                id: 'custpage_scriptid',
                label: 'Script ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = script_id;

            form.addField({
                id: 'custpage_deployid',
                label: 'Deploy ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = deploy_id;

            form.addField({
                id: 'custpage_closed_won',
                label: 'Deploy ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = closed_won;

            form.addField({
                id: 'custpage_opp_with_value',
                label: 'Deploy ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = opp_with_value;

            form.addField({
                id: 'custpage_service_change_delete',
                label: 'Deploy ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'custpage_comm_reg_delete',
                label: 'Deploy ID',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'custpage_suspects',
                label: 'BODY',
                type: ui.FieldType.TEXT
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = suspects;

            var service_type_search = serviceTypeSearch(null, [1])

            //HTML for various page sections
            var inlineHtml = dateEffectiveSection(dateEffective);
            inlineHtml += serviceChangeTypeSection(sale_type);
            inlineHtml += addNewServiceSection(recCustomer, commReg, customer);
            inlineHtml += serviceDetailsSection(service_type_search);
            inlineHtml += serviceTableSection(commReg, customer);
            inlineHtml += commencementFormSection(form, commReg, salesrep, role);

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'Scripts'
            }).defaultValue = inlineHtml;

            form.addButton({
                id: 'back',
                label: 'Back',
            });

            form.addSubmitButton({
                label: 'Save'
            });

            form.addButton({
                id: 'reset',
                label: 'Reset',
            });

            form.clientScriptFileId = 4573068;	
            context.response.writePage(form);
        }else{
            var commRegID = context.request.parameters.custpage_customer_comm_reg;
            var entity_id = context.request.parameters.custpage_customer_entityid;
            var salesrep = context.request.parameters.custpage_salesrep;
            var sendemail = context.request.parameters.custpage_sendemail;
            var closed_won = context.request.parameters.custpage_closed_won;
            var opp_with_value = context.request.parameters.custpage_opp_with_value;
            var file = context.request.parameters.upload_file_1;
            var suspects = context.request.parameters.custpage_suspects;
            var service_change_delete_string = context.request.parameters.custpage_service_change_delete;
            var comm_reg_delete_string = context.request.parameters.custpage_comm_reg_delete;

            if (!isNullorEmpty(service_change_delete_string)) {
                var service_change_delete = service_change_delete_string.split(',');
    
                for (var x = 0; x < service_change_delete.length; x++) {
                    record.delete({
                        type: 'customrecord_servicechg',
                        id: service_change_delete[x]
                    });
                }
            }

            if (!isNullorEmpty(commRegID)) {
                var searched_service_change = search.load({
                    type: 'customrecord_servicechg',
                    id: 'customsearch_smc_service_chg'
                });

               searched_service_change.filters.push(search.createFilter({
                    name: 'custrecord_servicechg_comm_reg',
                    join: null,
                    operator: search.Operator.IS,
                    values: commRegID
               }));
                    

               var resultSet_service_change = searched_service_change.run();
               var serviceChangeResult = resultSet_service_change.getRange({start:0, end: 1});
               if (serviceChangeResult.length == 0) {
                    record.delete({
                        type: 'customrecord_commencement_register',
                        id: commRegID
                    });
                }
            }

            if (!isNullorEmpty(comm_reg_delete_string)) {
                var comm_reg_delete = comm_reg_delete_string.split(',');
    
                for (var x = 0; x < comm_reg_delete.length; x++) {
                    record.delete({
                        type: 'customrecord_commencement_register',
                        id: comm_reg_delete[x]
                    });
                }
            }

            if (!isNullorEmpty(commRegID) && isNullorEmpty(salesrep)) {
                if (!isNullorEmpty(file)) {
                    file.folder = 1212243;
                    var type = file.fileType;
                    if (type == 'JPGIMAGE') {
                        type = 'jpg';
                        var file_name = getDate() + '_' + entity_id + '.' + type;
    
                    } else if (type == 'PDF') {
                        type == 'pdf';
                        var file_name = getDate() + '_' + entity_id + '.' + type;
                    } else if (type == 'PNGIMAGE') {
                        type == 'png';
                    } else if (type == 'PJPGIMAGE') {
                        type == 'png';
                    }
                    file.name= file_name;

                    // Create file and upload it to the file cabinet.
                    var id = file.save();

                    var commRegRecord  = record.load({
                        type: 'customrecord_commencement_register',
                        id: commRegID,
                        isDynamic: true
                    });

                    commRegRecord.setValue({fieldId: 'custrecord_scand_form', value: id });
                    commRegRecord.save();
                }
            }

            var customer = parseInt(context.request.parameters.custpage_customer_id);

            if (isNullorEmpty(salesrep)) {
                var params = {
                    custid: customer
                }
                redirect.toSuitelet({
                    scriptId: 'customscript_sl_service_change_2',
                    deploymentId: 'customdeploy_sl_service_change_2',
                    parameters: params
                });
                // redirect.redirect({
                //     url: 'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1114&deploy=1&compid=1048144',
                //     parameters: params
                // });
            }else if(!isNullorEmpty(salesrep) && salesrep == 'F' && !isNullorEmpty(sendemail) && sendemail == 'T'){
                if (!isNullorEmpty(suspects)) {
                    var params = {
                        suspects: suspects.toString(),
                    };
                    //customscript_sl_update_multisite
                    redirect.redirect({
                        url: 'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=803&deploy=1&compid=1048144',
                        parameters: params
                    });
                }else{
                    var params = {
                        custid: customer,
                        sales_record_id: salesrecordid,
                        closedwon: closed_won,
                        oppwithvalue: opp_with_value,
                        script_id: 'customscript_sl_finalise_page',
                        script_deploy: 'customdeploy_sl_finalise_page'
                    };
                    //customscript_sl_send_email_module
                    redirect.redirect({
                        url: 'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=744&deploy=1&compid=1048144',
                        parameters: params
                    });
                }
            }
        }
    }

    /**
     * Function to return Service search results 
     * @param {} service_type_id 
     * @param {*} service_cat 
     */
    function serviceTypeSearch(service_type_id, service_cat){

        var service_type_search =  search.create({
            type: 'customrecord_service_type',
            columns: ['internalid', 'custrecord_service_type_ns_item_array', 'name']
        });

        if(!isNullorEmpty(service_type_id)){
            newFilter = search.createFilter({
                name: 'custrecord_service_type_ns_item',
                join: null,
                operator: search.Operator.IS,
                values: service_type_id
            });

            service_type_search.filters.push( newFilter);
        }

        if(!isNullorEmpty(service_cat)){
            newFilter = search.createFilter({
                name: 'custrecord_service_type_category',
                join: null,
                operator: search.Operator.ANYOF,
                values: service_cat
            });

            service_type_search.filters.push( newFilter);
        }

        //Service type search results
        var results = service_type_search.run().getRange({
            start: 0,
            end: 1000
        });

        if(isNullorEmpty(service_type_search)){
            var service_type_search2 =  search.create({
                type: 'customrecord_service_type',
                filters: filters,
                columns: ['internalid', 'custrecord_service_type_ns_item_array']
            });

            service_type_id = service_type_id + ',';
            var serviceItemFilter = search.createFilter({
                name: 'custrecord_service_type_ns_item_array',
                join: null,
                operator: search.Operator.CONTAINS,
                values: service_type_id
            });
            service_type_search2.filters.push(serviceItemFilter);

            if(!isNullorEmpty(service_cat)){
                var serviceCategoryFilter = search.createFilter({
                    name: 'custrecord_service_type_category',
                    join: null,
                    operator: search.Operator.ANYOF,
                    values: service_cat
                });
                service_type_search2.filters.push(serviceCategoryFilter);
            }

            //Service type search results
            var results2 = service_type_search2.run().getRange({
                start: 0,
                end: 1000
            });

            return results2;
        }
        
        return results;
    }

    /**
     * Date Effective section 
     * @param {*} dateEffective 
     */
    function dateEffectiveSection(dateEffective){
        var inlineQty = '<div class="container" style="padding-top: 3%;">';
        inlineQty += '<div class="form-group container date_effective_section">';
        inlineQty += '<div class="row">';

        if (isNullorEmpty(dateEffective)) {
            inlineQty += '<div class="col-xs-7 "><div class="input-group"><span class="input-group-addon">DATE EFFECTIVE <span class="mandatory">*</span></span><input type="date" id="date_effective" value="" class="form-control date_effective"/></div></div>';
        } else {
            start_date = getFormattedDate(dateEffective);
            inlineQty += '<div class="col-xs-7 "><div class="input-group"><span class="input-group-addon">DATE EFFECTIVE <span class="mandatory">*</span></span><input type="date" id="date_effective" value="' + start_date + '" data-olddate="' + dateEffective + '" class="form-control date_effective"/></div></div>';
        }
        inlineQty += '</div>';
        inlineQty += '</div>';
        return inlineQty;
    }

    /**
     * Dropdown to choose the type of Sale type
     * @param {*} sale_type 
     */
    function serviceChangeTypeSection(sale_type){
        var inlineQty = '<div class="form-group container service_change_type_section ">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-7 commencementtype"><div class="input-group"><span class="input-group-addon" id="commencementtype_text">SALE TYPE <span class="mandatory">*</span></span><select id="commencementtype" class="form-control commencementtype" ><option></option>';

        var results =  search.create({
            type: 'customlist_sale_type',
            columns: ['name', 'internalId']
        });
        var searchResultSet = results.run().getRange({start: 0, end: 1000});

        for(var i = 0 ; searchResultSet != null && i < searchResultSet.length; i++){           
            var listValue = searchResultSet[i].getValue({name: 'name'});
            var listID = searchResultSet[i].getValue({name: 'internalId'});
            if(!isNullorEmpty(sale_type) && sale_type == listID){
                inlineQty += '<option value="' + listID + '" selected>' + listValue + '</option>';
            }else{
                inlineQty += '<option value="' + listID + '">' + listValue + '</option>';
            }
        }
        inlineQty += '</select></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        return inlineQty;
    }

    /**
     * Add new Service button section
     * @param {*} recCustomer 
     * @param {*} commReg 
     * @param {*} customer 
     */
    function addNewServiceSection(recCustomer, commReg, customer){
        var inlineQty = '<div class="form-group container create_new_service_button">';
        inlineQty += '<div class="row">';

        inlineQty += '<div class="create_new_service_section col-xs-2"><input type="button" value="ADD NEW SERVICE" class="form-control btn btn-primary" id="create_new_service" /></div>';
        var old_customer_id = recCustomer.getValue({fieldId: 'custentity_old_customer'});
        var old_customer_name = recCustomer.getText({fieldId: 'custentity_old_customer'});
        inlineQty += '<div class="get_services_section col-xs-5 hide"><input type="button" STYLE="font-size:small; white-space:normal; height:auto" value="GET SERVICES FROM ' + old_customer_name + '" class="form-control btn btn-info" id="getservices" onclick="onclick_GetServices(' + customer + ',' + old_customer_id + ',' + commReg + ')"/></div>';

        inlineQty += '</div>';
        inlineQty += '</div>';

        return inlineQty;
    }

    /**
     * Section for the Old price, new price and frequency of a selected service
     * Initially, this section is hidden and only displayed when a particular service
     * is chosen 
     * @param {*} service_type_search 
     */
    function serviceDetailsSection(service_type_search){

        //Service Section 
        var inlineQty = '<div class="form-group container row_service_type hide">';
        inlineQty += '<div class="row">'

        inlineQty += '<div class="col-xs-6 service_type_section"><div class="input-group"><span class="input-group-addon">SERVICE <span class="mandatory">*</span></span><input type="hidden" id="servicechange_id" value="" /><input type="hidden" id="row_id" value="" /><input type="hidden" id="service_id" value="" /><select class="form-control service_type" id="service_type">';

        for (var x = 0; x < service_type_search.length; x++) {
            inlineQty += '<option value="' + service_type_search[x].getValue({name: 'internalid'}) + '">' + service_type_search[x].getValue({name: 'name'}) + '</option>';
        }

        inlineQty += '</select></div></div>';

        inlineQty += '</div>';
        inlineQty += '</div>';

        //Service Description
        inlineQty += '<div class="form-group container service_descp_row hide">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-6 descp_section"><div class="input-group"><span class="input-group-addon" id="descp_text">DESCRIPTION</span><input id="descp" class="form-control descp" /></div></div>'
        inlineQty += '</div>';
        inlineQty += '</div>';

        //New Price section
        inlineQty += '<div class=" container price_info hide">'
        inlineQty += '<div class="form-group row">';

        inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">NEW PRICE <span class="mandatory">*</span></span><input id="new_price" class="form-control new_price" type="number" /></div></div>';
        inlineQty += '<div class="col-xs-3 old_price_section"><div class="input-group"><span class="input-group-addon">OLD PRICE</span><input id="old_price" readonly class="form-control old_price" /></div></div>';

        inlineQty += '</div>';
        inlineQty += '</div>';

        //Frequency info section
        inlineQty += '<div class="form-group container frequency_info hide">'

        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 daily_section"><div class="input-group"><input type="text" readonly value="Daily" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="daily" class=" daily" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 monday_section"><div class="input-group"><input type="text" readonly value="M" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="monday" class=" monday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 tuesday_section"><div class="input-group"><input type="text" readonly value="T" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="tuesday" class=" tuesday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 wednesday_section"><div class="input-group"><input type="text" readonly value="W" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="wednesday" class=" wednesday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 thursday_section"><div class="input-group"><input type="text" readonly value="Th" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="thursday" class=" thursday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 friday_section"><div class="input-group"><input type="text" readonly value="F" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="friday" class=" friday" /></span></div></div>';
        inlineQty += '<div class="col-xs-2 adhoc_section"><div class="input-group"><input type="text" readonly value="ADHOC" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="adhoc" class=" adhoc" /></span></div></div>';

        //Cancel button hidden
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container row_button hide">'
        inlineQty += '<div class="row">';

        inlineQty += '<div class="col-xs-3 add_service_section"><input type="button" value="ADD / EDIT" class="form-control btn btn-primary" id="add_service" /></div><div class="col-xs-3 edit_service_section"><input type="button" value="ADD / EDIT" class="form-control btn btn-primary" id="edit_service" /></div><div class="clear_section col-xs-3"><input type="button" value="CANCEL" class="form-control btn btn-default" id="clear" /></div>';

        inlineQty += '</div>';
        inlineQty += '</div>';
        inlineQty += '</div>';
        inlineQty += '</form>';
        return inlineQty;

    }

    /**
     * Datatable containing service details
     * @param {*} commReg 
     * @param {*} customer 
     */
    function serviceTableSection(commReg,customer){

        //Services table setup 
        var inlineQty = '<style> table#services {font-size: 14px;text-align: center;border: none; font-weight: bold;} table th{text-align: center;} </style>';
        inlineQty += '<div class="form-group container-fluid service_preview_section">';
        inlineQty += '<table cellpadding="15" id="services-preview" class="table table-responsive table-striped customer tablesorter" cellspacing="0">';
        inlineQty += '<thead style="color: white;background-color: #607799;">';
        inlineQty += '<tr class="text-center">';
        inlineQty += '<th colspan="9" scope="col" style="background-color: white;"></th>';
        inlineQty += '<th colspan="6" scope="col">FREQUENCY</th>';
        inlineQty += '</tr>';
        inlineQty += '<thead style="color: white;background-color: #607799;">';
        inlineQty += '<tr class="text-center">';
        inlineQty += '<th scope="col">ACTION</th>';
        inlineQty += '<th scope="col">SERVICE NAME</th>';
        inlineQty += '<th scope="col">SERVICE DESCRIPTION</th>';
        inlineQty += '<th scope="col">OLD PRICE</th>';
        inlineQty += '<th scope="col">NEW PRICE</th>';
        inlineQty += '<th scope="col">DATE EFFECTIVE</th>';
        inlineQty += '<th scope="col">CREATED BY</th>';
        inlineQty += '<th scope="col">LAST MODIFIED</th>';
        inlineQty += '<th scope="col">TYPE</th>';
        inlineQty += '<th scope="col">MON</th>';
        inlineQty += '<th scope="col">TUE</th>';
        inlineQty += '<th scope="col">WED</th>';
        inlineQty += '<th scope="col">THU</th>';
        inlineQty += '<th scope="col">FRI</th>';
        inlineQty += '<th scope="col">ADHOC</th>';
        inlineQty += '</tr>';
        inlineQty += '</thead>';
        inlineQty += '<tbody>';

        //Populating services table body
        var service_ids = [];

        if (!isNullorEmpty(commReg)) {
            var searched_service_change = search.load({
                id: 'customsearch_smc_service_chg',
                type: 'customrecord_servicechg'
            });

            searched_service_change.filters.push(
                search.createFilter({
                    name: 'custrecord_servicechg_comm_reg',
                    join: null,
                    operator: search.Operator.IS,
                    values: commReg
                })
            );

            searched_service_change.run().each(function(searchResult_service_change){
                service_ids[service_ids.length] = searchResult_service_change.getValue({name: 'custrecord_servicechg_service'});

                inlineQty += '<tr>';

                inlineQty += '<td class="first_col"><button class="btn btn-warning btn-sm edit_class glyphicon glyphicon-pencil" data-servicechangeid="' + searchResult_service_change.getValue({name: 'internalid'}) + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><br/><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-servicechangeid="' + searchResult_service_change.getValue({name: 'internalid'}) + '" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service_change.getValue({name: 'custrecord_servicechg_service'}) + '" data-servicetypeid="' + searchResult_service_change.getValue({name: "custrecord_service", join: "CUSTRECORD_SERVICECHG_SERVICE", summary: null}) + '" readonly value="' + searchResult_service_change.getText({name:'custrecord_servicechg_service'}) + '" /></div></td>';
                inlineQty += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service_change.getValue({name:"custrecord_service_description", join: "CUSTRECORD_SERVICECHG_SERVICE", summary: null}) + '"  type="text" /></div></td>';

                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service_change.getValue({name:"custrecord_service_price", join: "CUSTRECORD_SERVICECHG_SERVICE", summary: null}) + '"  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value="' + searchResult_service_change.getValue({name: 'custrecord_servicechg_new_price'}) + '"  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="date_effective_div input-group"><input class="form-control date_effective_class text-center" disabled value="' + searchResult_service_change.getValue({name:'custrecord_servicechg_date_effective'}) + '"  type="text" /></div></td>';

                inlineQty += '<td><div class="created_by_div input-group"><input class="form-control created_by_class text-center" disabled data-userid="' + searchResult_service_change.getValue({name:'custrecord_servicechg_created'}) + '" value="' + searchResult_service_change.getText({name:'custrecord_servicechg_created'}) + '"  type="text" /></div></td>';

                inlineQty += '<td><div class="last_modified_div input-group"><input class="form-control last_modified_class text-center" disabled value="' + searchResult_service_change.getValue({name:'lastmodified'}) + '"  type="text" /></div></td>';

                inlineQty += '<td><div class="comm_type_div input-group"><input class="form-control comm_type_class text-center" disabled value="' + searchResult_service_change.getValue({name:'custrecord_servicechg_type'}) + '" data-commtypeid="" type="text" /></div></td>';

                var freq = searchResult_service_change.getValue({name:'custrecord_servicechg_new_freq'});

                inlineQty += freqCal(freq);

                inlineQty += '</tr>';
                return true;
            });
        }

        //Get all the services associated with this customer for cases when the commReg is Null
        var serviceSearch = search.load({
            id: 'customsearch_smc_services',
            type: 'customrecord_service'
        });

        serviceSearch.filters.push(
            search.createFilter({
                name: 'custrecord_service_customer',
                join: null,
                operator: search.Operator.IS,
                values: customer
            })
        );

        if(!isNullorEmpty(service_ids)){
            serviceSearch.filters.push(
                search.createFilter({
                    name: 'internalid',
                    join: null,
                    operator: search.Operator.NONEOF,
                    values: service_ids
                })
            );
        }

        var resultSet_service = serviceSearch.run();
        var serviceResult = resultSet_service.getRange({start: 0, end: 1});
        
        if (serviceResult.length != 0) {
            resultSet_service.each(function(searchResult_service){
                inlineQty += '<tr>';

                inlineQty += '<td class="first_col"><button class="btn btn-warning btn-sm edit_class glyphicon glyphicon-pencil" data-servicechangeid="' + null + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><br/><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash hide" type="button" data-servicechangeid="" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

                inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + searchResult_service.getValue({name: 'internalid'}) + '" data-servicetypeid="' + searchResult_service.getText({name: "internalid", join: "CUSTRECORD_SERVICE", summary: null}) + '" readonly value="' + searchResult_service.getText({name: 'custrecord_service'}) + '" /></div></td>';
                inlineQty += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + searchResult_service.getValue({name: 'custrecord_service_description'}) + '"  type="text" /></div></td>';
                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + searchResult_service.getValue({name: 'custrecord_service_price'}) + '"  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value=""  type="number" step=".01" /></div></td>';
                inlineQty += '<td><div class="date_effective_div input-group"><input class="form-control date_effective_class text-center" disabled value=""  type="text" /></div></td>';
                inlineQty += '<td><div class="created_by_div input-group"><input class="form-control created_by_class text-center" disabled value=""  type="text" /></div></td>';
                inlineQty += '<td><div class="last_modified_div input-group"><input class="form-control last_modified_class text-center" disabled value=""  type="text" /></div></td>';
                inlineQty += '<td><div class="comm_type_div input-group"><input class="form-control comm_type_class text-center" disabled value="" data-commtypeid="" type="text" /></div></td>';

                if (searchResult_service.getValue({name: 'custrecord_service_day_mon'}) == 'T') {
                    inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue({name:'custrecord_service_day_tue'}) == 'T') {
                    inlineQty += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled/></div></td>';
                }

                if (searchResult_service.getValue({name:'custrecord_service_day_wed'}) == 'T') {
                    inlineQty += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue({name:'custrecord_service_day_thu'}) == 'T') {
                    inlineQty += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue({name:'custrecord_service_day_fri'}) == 'T') {
                    inlineQty += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled checked/></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled /></div></td>';
                }

                if (searchResult_service.getValue({name:'custrecord_service_day_adhoc'}) == 'T') {
                    inlineQty += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled checked /></div></td>';
                } else {
                    inlineQty += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled /></div></td>';
                }

                inlineQty += '</tr>';
                return true;
            });

            inlineQty += '</tbody>';
            inlineQty += '</table>';
        }

        return inlineQty;

    }

    /**
     * Service commmencement form upload section
     * @param {*} form 
     * @param {*} commReg 
     * @param {*} salesrep 
     * @param {*} role 
     */
    function commencementFormSection(form, commReg, salesrep, role){
        if (isNullorEmpty(salesrep) && role != 1000) {
            form.addField({
                id: 'upload_file_1',
                label: 'Service Commencement Form',
                type: ui.FieldType.FILE
            }).updateDisplaySize({
                height: 40,
                width: 100
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            });

            if (!isNullorEmpty(commReg)) {
                var commRegRecord = record.load({
                    type: 'customrecord_commencement_register',
                    id: commReg,
                    isDynamic: true
                });
                var file_id = commRegRecord.getValue({fieldId: 'custrecord_scand_form'});
                if (!isNullorEmpty(file_id)) {
                    var fileRecord = file.load({
                        id: file_id
                    })
                    var inlineQty = '<iframe id="viewer" frameborder="0" scrolling="no" width="400" height="600" src="' + fileRecord.url + '"></iframe>';
                }
            } else {
                var inlineQty = '<iframe id="viewer" frameborder="0" scrolling="no" width="400" height="600"></iframe>';
            }
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


    function getFormattedDate(stringDate) {
        var formattedDate = format.format({
            value: stringDate,
            type: format.Type.DATE 
        });

        return formattedDate;
    }

    function freqCal(freq){
        var multiselect = '';

        if (freq.indexOf(1) != -1) {
            multiselect += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            multiselect += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>';
        }
    
        if (freq.indexOf(2) != -1) {
            multiselect += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            multiselect += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled/></div></td>';
        }
    
        if (freq.indexOf(3) != -1) {
            multiselect += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            multiselect += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled /></div></td>';
        }
    
        if (freq.indexOf(4) != -1) {
            multiselect += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            multiselect += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled /></div></td>';
        }
    
        if (freq.indexOf(5) != -1) {
            multiselect += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled checked/></div></td>';
        } else {
            multiselect += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled /></div></td>';
        }
    
        if (freq.indexOf(6) != -1) {
            multiselect += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled checked /></div></td>';
        } else {
            multiselect += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled /></div></td>';
        }
    
        return multiselect;
    }

    return {
        onRequest: onRequest
    };
});