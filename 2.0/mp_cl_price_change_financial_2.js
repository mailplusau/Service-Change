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
function (error, runtime, search, url, record, format, email, currentRecord) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var role = runtime.getCurrentUser().role;
    var currRec = currentRecord.get();

    var zee_id = parseInt(currRec.getValue({ fieldId: 'custpage_price_chng_fin_zee_id' }));
    if (!isNullorEmpty(zee_id)){
        var zee_rec = record.load({ type: 'partner', id: zee_id });
        var zee_name = zee_rec.getValue({ fieldId: 'companyname' });
    }
    
    var dataSet = []
    var saveObject = [];

    /**
     * On page initialisation
     */
    function pageInit() {
        // Background-Colors
        $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
        $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
        $("#body").css("background-color", "#CFE0CE");

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

        if (!isNullorEmpty(zee_id)){
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
                columnDefs: [
                    // {
                    //     targets: [4],
                    //     visible: false,
                    // }, 
                    {
                        width: "20%",
                        targets: [4]
                    }
                ],
                autoWidth: false,
            });
        }

        $('#submit').on('click', function(){
            saveRecord();
        });

        $(document).on('change', '#date_effective', function(){
            var date = $(this).val();
            $('.new_date_eff').val(date);
        });
       
        // Update Increase Amount on Click of Plus Button
        $(document).on('click', '.ampo_header', function(){
            var ampo_inc_amount = $('#ampo_header_input').val();
            $('.ampo_inc_amount').val(ampo_inc_amount);

            $(this).find('span').removeClass('glyphicon-plus');
            $(this).removeClass('btn-warning')
            $(this).find('span').addClass('glyphicon-ok');
            $(this).addClass('btn-success')
        })
        $(document).on('click', '.pmpo_header', function(){
            var pmpo_inc_amount = $('#pmpo_header_input').val();
            $('.pmpo_inc_amount').val(pmpo_inc_amount);

            $(this).find('span').removeClass('glyphicon-plus');
            $(this).removeClass('btn-warning')
            $(this).find('span').addClass('glyphicon-ok');
            $(this).addClass('btn-success')
        })
        $(document).on('click', '.cb_header', function(){
            var cb_inc_amount = $('#cb_header_input').val();
            $('.cb_inc_amount').val(cb_inc_amount);

            $(this).find('span').removeClass('glyphicon-plus');
            $(this).removeClass('btn-warning')
            $(this).find('span').addClass('glyphicon-ok');
            $(this).addClass('btn-success')
        })
        $(document).on('click', '.eb_header', function(){
            var eb_inc_amount = $('#eb_header_input').val();
            $('.eb_inc_amount').val(eb_inc_amount);

            $(this).find('span').removeClass('glyphicon-plus');
            $(this).removeClass('btn-warning')
            $(this).find('span').addClass('glyphicon-ok');
            $(this).addClass('btn-success')
        })

        /**
         *  Popup - Modal
         */

        $(document).on('click', '#servicesAll', function(){

            var service_html = '<table id= "run_table" class="table table-responsive table-striped"><thead><tr class="info"><th><b>ACTION</b></th><th><b>SERVICE NAME</b></th><th><b>INCREASE AMOUNT</b></th>';

            service_html += '</thead><tbody>';
            
            $('#myModal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Add/Edit List of Services</label></h4></div>');
            $('#myModal .modal-body').html("");
            $('#myModal .modal-body').html(service_html);
            $('#myModal').modal("show");
        });
    }

    function loadCustomers(zee_id){
        var saveServQty = '';
        var serviceTot = 0;
        var service_count = 0;
        var prev_cust_id = [];
        var index = 0;
        var totalAmount = 0;

        //Search: SMC - Customer
        var customerSearch = search.load({
            type: "customer",
            id: "customsearch_smc_customer_4",
        });
        customerSearch.filters.push(
            search.createFilter({
                name: "partner",
                operator: search.Operator.ANYOF,
                values: zee_id,
            })
        );
        console.log('OUTSIDE')

        customerSearch.run().each(function(searchResult) {
            console.log('Index: ' + index)
            var custid = searchResult.getValue({
                name: "internalid",
                summary: "GROUP"
            });
            if (index == 0){
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
            console.log('Service: ' + service + " $ " + searchResult.getValue({
                name: "custrecord_service_price",
                join: 'CUSTRECORD_SERVICE_CUSTOMER',
                summary: "GROUP"
            }));

            /**
             *  List of Current Service Inline HTML
             */
            var serviceQty = ''; // <div class="form-group container">

            if(service_count == 2 || service_count == 4){
                saveServQty += '<div class="w-100"></div>'
            }
            var service_ampo = '$' + searchResult.getValue({
                name: "custrecord_service_price",
                join: 'CUSTRECORD_SERVICE_CUSTOMER',
                summary: "GROUP"
            });
            serviceQty += '<div class="col-xs-6">';
            serviceQty += '<div class="input-group">';
            serviceQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="'+service_lower+'_number">'+ service +'</span>';
            serviceQty += '<label id="'+service_lower+'_curr" class="form-control '+service_lower+'_curr" type="text">'+service_ampo+'</label>';
            serviceQty += '</div>'
            serviceQty += '</div>'

            service_count++;

            saveServQty += serviceQty;
            serviceTot += service;
            // serviceQty += '</div>';

            /**
             *  Increase Amount Inline HTML
             */
            // var inlineQty = ''; //<div class="form-group container">

            // inlineQty += '<div class="row">';

            // inlineQty += '<div class="col-xs-6">';
            // inlineQty += '<div class="input-group">';
            // inlineQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="ampo_header_text">AMPO</span>';
            // inlineQty += '<input id="ampo_inc_amount" class="form-control ampo_inc_amount" placeholder="$" type="number"/>';
            // inlineQty += '</div>';
            // inlineQty += '</div>';

            // // AMPO
            // inlineQty += '<div class="col-xs-6">';
            // inlineQty += '<div class="input-group">';
            // inlineQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="ampo_header_text">AMPO</span>';
            // inlineQty += '<input id="ampo_inc_amount" class="form-control ampo_inc_amount" placeholder="$" type="number"/>';
            // inlineQty += '</div>';
            // inlineQty += '</div>';

            // // PMPO
            // inlineQty += '<div class="col-xs-6">';
            // inlineQty += '<div class="input-group">';
            // inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon" id="pmpo_number">PMPO</span>';
            // inlineQty += '<input id="pmpo_inc_amount" class="form-control pmpo_inc_amount" placeholder="$" type="number"/>';
            // inlineQty += '</div>';
            // inlineQty += '</div>';

            // inlineQty += '</div>';

            // inlineQty += '<div class="row">';

            // // EB
            // inlineQty += '<div class="col-xs-6">';
            // inlineQty += '<div class="input-group">';
            // inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon" id="eb_number">EB</span>';
            // inlineQty += '<input id="eb_inc_amount" class="form-control eb_inc_amount" placeholder="$" type="number"/>';
            // inlineQty += '</div>';
            // inlineQty += '</div>';

            // // CB
            // inlineQty += '<div class="col-xs-6">';
            // inlineQty += '<div class="input-group">';
            // inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon" id="cb_number">CB</span>';
            // inlineQty += '<input id="cb_inc_amount" class="form-control cb_inc_amount" placeholder="$" type="number"/>';
            // inlineQty += '</div>';
            // inlineQty += '</div>';

            // inlineQty += '</div>';

            // inlineQty += '</div>';

            var inlineQty = '';
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon" id="'+service_lower+'_number">'+service+'</span>';
            inlineQty += '<input id="'+service_lower+'_inc_amount" class="form-control '+service_lower+'_inc_amount" placeholder="$" type="number"/>';
            inlineQty += '</div>';
            inlineQty += '</div>';
            
            if (prev_cust_id.indexOf(custid) == -1){
                console.log('New Customer')

                var serviceHTML = '<div class="row">';
                serviceHTML += saveServQty
                serviceHTML += '</div>';

                console.log(saveServQty)

                dataSet.push([
                    '<p id="internalID" class="internalID">'+custid+'</p>',
                    '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + custid + '"><p class="entityid" style="text-align:left;">' + entityid + "</p></a>",
                    '<p internalid="companyname" class="companyname">'+companyname+'</p>',
                    serviceHTML,
                    inlineQty,
                    serviceTot,
                    '<input type="date" class="form-control new_date_eff"/>'
                ]);

                service_count = 0;
                saveServQty = '';
            }           

            prev_cust_id.push(custid);

            // Store info until new Customer

            // dataSet1.push(['☑', custid, companyname, last_price_increase, inlineQty]);

            totalAmount++;
            index++;

            return true;
        });
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
        for(var x = 0; x < id.length; x++){
            
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
            if (!isNullorEmpty(ampo_inc_amount[x])){
                ampo_val = parseInt(ampo_inc_amount[x].value);
            }
            if (!isNullorEmpty(pmpo_inc_amount[x].value)){
                pmpo_val = parseInt(ampo_inc_amount[x].value);
            }
            if (!isNullorEmpty(cb_inc_amount[x].value)){
                cb_val = parseInt(ampo_inc_amount[x].value);
            }
            if (!isNullorEmpty(eb_inc_amount[x].value)){
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
            type: 'customrecord_price_change_financial',
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