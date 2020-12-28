/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 *
 * Module Description - CL for Add / Edit Service to create corresponding service change records
 * 
 * NSVersion    Date            		 Author         
 * 2.00       	2020-11-26 13:12:36      Ravija Maheshwari 
 * 
 * @Last Modified by:   Ravija
 * @Last Modified time: 2020-12-22 9:24
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
function(error, runtime, search, url, record, format, email, currentRecord) {

    //Setup 
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://system.sandbox.netsuite.com';
    }
    
    var zee = 0;
    var role = runtime.getCurrentUser().role;
    
    if (role == 1000) {
        zee = runtime.getCurrentUser();
    } else if (role == 3) { //Administrator
        zee = 6; //test
    } else if (role == 1032) { // System Support
        zee = 425904; //test-AR
    } 

    //Global variables
    var service_change_delete = [];
    var comm_reg_delete = [];

    var item_array = new Array();
    var item_price_array = [];
    var item_price_count = 0;
    var item_count = 0;



    function pageInit(context){
        //Alert box - hidden initially
        $('.alert').hide();
    
        $(document).on('click', '.close', function(e) {
            $(this).parent().hide();
        });

        //Loader animation
        $(".se-pre-con").fadeOut("slow");

        //Enable all tooltips
        $('[data-toggle="tooltip"]').tooltip();

        var scf_upload = document.getElementsByClassName('input');
        for (var i = 0; i < scf_upload.length; i++) {
            scf_upload[i].className += " form-control";
        }
        
        populateItemPriceArray();

        if ($('#commencementtype option:selected').val() == 6) {
            $('.get_services_section').removeClass('hide');
        }

        //Event listeners
        $('#create_new_service').on('click', handleAddNewService);
        $('.edit_class').on('click', handleEditServiceDisplay);
        $('#edit_service').on('click', handleAddorEditService);
        $('#adhoc').on('click', handleAdhocOption);
        $('#daily').on('click', handleDailyOption);
        $('.remove_class').on('click', handleDeleteServiceChange);
        $('#reset').on('click', reset_all);
        $('#back').on('click', handleBack);

    }

    /**
     *Create the item_price_array based on the existing service records
     */
    function populateItemPriceArray(){
        var customer_id = parseInt(currentRecord.get().getValue({fieldId: 'custpage_customer_id'}));
        var customer_record = record.load({
            type: record.Type.CUSTOMER,
            id: customer_id,
            isDynamic: true
        });
        var zeeLocation = record.load({
            type: record.Type.PARTNER,
            id: customer_record.getValue({fieldId:'partner'}),
            isDynamic: true
        }).getValue({fieldId: 'location'});

        //Search: SMC - Services
        var searched_jobs =  search.load({
            type: 'customrecord_service',
            id: 'customsearch_smc_services'
        });
        searched_jobs.filters.push(search.createFilter({
            name: 'custrecord_service_customer',
            join: null,
            operator: search.Operator.IS,
            values: parseInt(currentRecord.get().getValue({fieldId: 'custpage_customer_id' }))
        }));

        searched_jobs.run().each(function(searchResult){
            var item_description = searchResult.getValue({name: 'custrecord_service_description'});

            if (isNullorEmpty(item_description)) {
                item_description = 0;
            } else {
                item_description = item_description.replace(/\s+/g, '-').toLowerCase()
            }
            if (item_price_array[searchResult.getValue({name: 'custrecord_service'})] == undefined) {
                item_price_array[searchResult.getValue({name: 'custrecord_service'})] = [];
                item_price_array[searchResult.getValue({name: 'custrecord_service'})][0] = searchResult.getValue({name: 'custrecord_service_price'}) + '_' + item_description;
            } else {
                var size = item_price_array[searchResult.getValue({name:'custrecord_service'})].length;
                item_price_array[searchResult.getValue({name:'custrecord_service'})][size] = searchResult.getValue({name:'custrecord_service_price'}) + '_' + item_description;
            }
    
            item_price_count++;
            return true;
        });
        console.log(item_price_array);
    }

    /**
     * Fired when the "Add New Service" button is clicked
     * It displays Service, Description, New price and Frequency fields which were initially hidden
     */
    function handleAddNewService(){
        reset_all();
        $('.row_service_type').removeClass('hide');
        $('.service_descp_row').removeClass('hide');
        $('.price_info').removeClass('hide');
        $('.frequency_info').removeClass('hide');
        $('.row_button').removeClass('hide');
        $('.add_service').removeClass('hide');
        $('.old_price_section').addClass('hide');
        $('.create_new_service_button').addClass('hide');
        $('.edit_service_section').addClass('hide');
        $('#service_type').prop('disabled', false);
        $('.add_service_section').removeClass('hide');
    }

    /** 
    * Function to reset all field values
    */
    function reset_all() {
        $('.row_service_type').addClass('hide');
        $('.service_descp_row').addClass('hide');
        $('.price_info').addClass('hide');
        $('.frequency_info').addClass('hide');
        // $('.service_change_type_section').addClass('hide');
        $('.row_button').addClass('hide');
        $('.old_price_section').addClass('hide');
        $('.create_new_service_button').removeClass('hide');
        $('.edit_service_section').addClass('hide');
        $('#service_type').val(0);
        $('#descp').val('');
        $('#new_price').val('');
        $('#old_price').val('');
        $('#daily').prop('checked', false);
        $('#monday').prop('checked', false);
        $('#tuesday').prop('checked', false);
        $('#wednesday').prop('checked', false);
        $('#thursday').prop('checked', false);
        $('#friday').prop('checked', false);
        $('#adhoc').prop('checked', false);
        $('#daily').prop('disabled', false);
        $('#monday').prop('disabled', false);
        $('#tuesday').prop('disabled', false);
        $('#wednesday').prop('disabled', false);
        $('#thursday').prop('disabled', false);
        $('#friday').prop('disabled', false);
        $('#adhoc').prop('disabled', false);

    }
    
    /**
     * Fired when the Pencil Edit Icon is clicked
     * Changes the fields displayed to existing value fields of the current chosen service
     */
    function handleEditServiceDisplay(){
        reset_all();

        $('.create_new_service_button').addClass('hide');
        $('.edit_service_section').removeClass('hide');
    
        $('.row_service_type').removeClass('hide');
        $('.service_descp_row').removeClass('hide');
        $('.price_info').removeClass('hide');
        $('.frequency_info').removeClass('hide');
        $('.row_button').removeClass('hide');
        $('.old_price_section').removeClass('hide');
        $('.add_service_section').addClass('hide');
        
        var servicechangeidid = $(this).attr('data-servicechangeid');
        var rowid = $(this).attr('data-rowid');
        var service = $(this).closest('tr').find('.service_name').val();
        var servicetypeid = $(this).closest('tr').find('.service_name').attr('data-servicetypeid');
        var commtypeid = $(this).closest('tr').find('.service_name').attr('data-commtypeid');
        var serviceid = $(this).closest('tr').find('.service_name').attr('data-serviceid');
        var service_descp = $(this).closest('tr').find('.service_descp_class').val();
        var old_price = $(this).closest('tr').find('.old_service_price_class').val();
        var new_price = $(this).closest('tr').find('.new_service_price_class').val();

        $('#descp').val(service_descp);
        $('#new_price').val(new_price);
        $('#old_price').val(old_price);
        $('#service_type').val(servicetypeid);
        $('#commencementtype').val(commtypeid);
        $('#servicechange_id').val(servicechangeidid);
        $('#row_id').val(rowid);
        $('#service_id').val(serviceid);
        $('#service_type').prop('disabled', true);

        if ($(this).closest('tr').find('input.monday_class').is(':checked')) {
            $('#monday').prop('checked', true);
        } else {
            $('#monday').prop('checked', false);
        }
    
        if ($(this).closest('tr').find('input.tuesday_class').is(':checked')) {
            $('#tuesday').prop('checked', true);
        } else {
            $('#tuesday').prop('checked', false);
        }
        if ($(this).closest('tr').find('input.wednesday_class').is(':checked')) {
            $('#wednesday').prop('checked', true);
        } else {
            $('#monday').prop('checked', false);
        }
        if ($(this).closest('tr').find('input.thursday_class').is(':checked')) {
            $('#thursday').prop('checked', true);
        } else {
            $('#thursday').prop('checked', false);
        }
        if ($(this).closest('tr').find('input.friday_class').is(':checked')) {
            $('#friday').prop('checked', true);
        } else {
            $('#friday').prop('checked', false);
        }
        if ($(this).closest('tr').find('input.adhoc_class').is(':checked')) {
            $('#adhoc').prop('checked', true);
        } else {
            $('#adhoc').prop('checked', false);
        }
    }
    
    /**
     * Fired when the Add/Edit button is clicked for a chosen service
     */
    function handleAddorEditService(){
        var date_effective = $('#date_effective').val();
        var comm_typeid = $('#commencementtype option:selected').val();

        if (isNullorEmpty(date_effective)) {
            alert('Please Enter the Date Effective');
            return false;
        } else {
            var splitDate = date_effective.split('-');
            var dateEffective = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
        }

        if (isNullorEmpty(comm_typeid)) {
            alert('Please Select Sale Type');
            return false;
        }

        var servicechange_id = $('#servicechange_id').val();
        var rowid = $('#row_id').val();
        var service_id = $('#service_id').val();
        var service_typeid = $('#service_type').val();

        var service_typename = $('#service_type').text();
        var comm_typename = $('#commencementtype option:selected').text();
        var descp = $('#descp').val();
        var new_price = ($('#new_price').val());
        var old_price = parseFloat($('#old_price').val());

        if (isNullorEmpty(new_price) || new_price == 0) {
            alert('Please Enter the New Price');
            return false;
        }

        var service_name_elem = document.getElementsByClassName("service_name");
        var edit_class_elem = document.getElementsByClassName("edit_class");
        var remove_class_elem = document.getElementsByClassName("remove_class");
        var service_descp_class_elem = document.getElementsByClassName("service_descp_class");
        var old_service_price_class_elem = document.getElementsByClassName("old_service_price_class");
        var new_service_price_class_elem = document.getElementsByClassName("new_service_price_class");
        var date_effective_class = document.getElementsByClassName("date_effective_class");
        var created_by_class = document.getElementsByClassName("created_by_class");
        var last_modified_class = document.getElementsByClassName("last_modified_class");
        var comm_type_class = document.getElementsByClassName("comm_type_class");
        var monday_class_elem = document.getElementsByClassName("monday_class");
        var tuesday_class_elem = document.getElementsByClassName("tuesday_class");
        var wednesday_class_elem = document.getElementsByClassName("wednesday_class");
        var thursday_class_elem = document.getElementsByClassName("thursday_class");
        var friday_class_elem = document.getElementsByClassName("friday_class");
        var adhoc_class_elem = document.getElementsByClassName("adhoc_class");

        if (!isNullorEmpty(service_id)) {
            for (var i = 0; i < edit_class_elem.length; i++) {
                var row_service_id = service_name_elem[i].getAttribute('data-serviceid');
                if (service_id == row_service_id) {
                    if ($('input.monday').is(':checked')) {
                        monday_class_elem[i].checked = true;
                    } else {
                        monday_class_elem[i].checked = false;
                    }
    
                    if ($('input.tuesday').is(':checked')) {
                        tuesday_class_elem[i].checked = true;
                    } else {
                        tuesday_class_elem[i].checked = false;
                    }
                    if ($('input.wednesday').is(':checked')) {
                        wednesday_class_elem[i].checked = true;
                    } else {
                        wednesday_class_elem[i].checked = false;
                    }
                    if ($('input.thursday').is(':checked')) {
                        thursday_class_elem[i].checked = true;
                    } else {
                        thursday_class_elem[i].checked = false;
                    }
                    if ($('input.friday').is(':checked')) {
                        friday_class_elem[i].checked = true;
                    } else {
                        friday_class_elem[i].checked = false;
                    }
                    if ($('input.adhoc').is(':checked')) {
                        adhoc_class_elem[i].checked = true;
                    } else {
                        adhoc_class_elem[i].checked = false;
                    }
    
                    service_descp_class_elem[i].value = descp;
                    old_service_price_class_elem[i].value = old_price;
                    new_service_price_class_elem[i].value = parseFloat(new_price);
                    date_effective_class[i].value = dateEffective;
                    created_by_class[i].setAttribute('data-userid', runtime.getCurrentUser());
                    last_modified_class[i].value = getDate();
                    comm_type_class[i].value = comm_typename;
                    comm_type_class[i].setAttribute('data-commtypeid', comm_typeid);
                    remove_class_elem[i].classList.remove("hide");
    
                }
            }
        } else {
            if ($('input.monday').is(':checked')) {
                monday_class_elem[rowid - 1].checked = true;
            } else {
                monday_class_elem[rowid - 1].checked = false;
            }
    
            if ($('input.tuesday').is(':checked')) {
                tuesday_class_elem[rowid - 1].checked = true;
            } else {
                tuesday_class_elem[rowid - 1].checked = false;
            }
            if ($('input.wednesday').is(':checked')) {
                wednesday_class_elem[rowid - 1].checked = true;
            } else {
                wednesday_class_elem[rowid - 1].checked = false;
            }
            if ($('input.thursday').is(':checked')) {
                thursday_class_elem[rowid - 1].checked = true;
            } else {
                thursday_class_elem[rowid - 1].checked = false;
            }
            if ($('input.friday').is(':checked')) {
                friday_class_elem[rowid - 1].checked = true;
            } else {
                friday_class_elem[rowid - 1].checked = false;
            }
            if ($('input.adhoc').is(':checked')) {
                adhoc_class_elem[rowid - 1].checked = true;
            } else {
                adhoc_class_elem[rowid - 1].checked = false;
            }
    
            service_descp_class_elem[rowid - 1].value = descp;
            old_service_price_class_elem[rowid - 1].value = old_price;
            new_service_price_class_elem[rowid - 1].value = parseFloat(new_price);
            date_effective_class[rowid - 1].value = dateEffective;
            created_by_class[rowid - 1].setAttribute('data-userid', runtime.getCurrentUser());
            last_modified_class[rowid - 1].value = getDate();
            comm_type_class[rowid - 1].value = comm_typename;
            comm_type_class[rowid - 1].setAttribute('data-commtypeid', comm_typeid);
            remove_class_elem[rowid - 1].classList.remove("hide");
        }
        reset_all();
    }

    /**
     * Fired when the Adhoc option is checked
     */
    function handleAdhocOption(){
        if ($('input.adhoc').is(':checked')) {
            $('#daily').prop('checked', false);
            $('#monday').prop('checked', false);
            $('#daily').prop('disabled', true);
            $('#monday').prop('disabled', true);
            $('#tuesday').prop('checked', false);
            $('#tuesday').prop('disabled', true);
            $('#wednesday').prop('checked', false);
            $('#wednesday').prop('disabled', true);
            $('#thursday').prop('checked', false);
            $('#thursday').prop('disabled', true);
            $('#friday').prop('checked', false);
            $('#friday').prop('disabled', true);
        } else {
            $('#daily').prop('checked', false);
            $('#monday').prop('checked', false);
            $('#daily').prop('disabled', false);
            $('#monday').prop('disabled', false);
            $('#tuesday').prop('checked', false);
            $('#tuesday').prop('disabled', false);
            $('#wednesday').prop('checked', false);
            $('#wednesday').prop('disabled', false);
            $('#thursday').prop('checked', false);
            $('#thursday').prop('disabled', false);
            $('#friday').prop('checked', false);
            $('#friday').prop('disabled', false);
        }
    }

    /**
     * Fired when the Daily option is checked
     */
    function handleDailyOption(){
        if ($('input.daily').is(':checked')) {
            $('#monday').prop('checked', true);
            $('#monday').prop('disabled', true);
            $('#tuesday').prop('checked', true);
            $('#tuesday').prop('disabled', true);
            $('#wednesday').prop('checked', true);
            $('#wednesday').prop('disabled', true);
            $('#thursday').prop('checked', true);
            $('#thursday').prop('disabled', true);
            $('#friday').prop('checked', true);
            $('#adhoc').prop('checked', false);
            $('#friday').prop('disabled', true);
            $('#adhoc').prop('disabled', true);
        } else {
            $('#monday').prop('checked', false);
            $('#monday').prop('disabled', false);
            $('#tuesday').prop('checked', false);
            $('#tuesday').prop('disabled', false);
            $('#wednesday').prop('checked', false);
            $('#wednesday').prop('disabled', false);
            $('#thursday').prop('checked', false);
            $('#thursday').prop('disabled', false);
            $('#friday').prop('checked', false);
            $('#adhoc').prop('checked', false);
            $('#friday').prop('disabled', false);
            $('#adhoc').prop('disabled', false);
        }
    }
    
    function saveRecord(){

        //Load customer record
        var recCustomer = record.load({
            type: record.Type.CUSTOMER,
            id: parseInt(currentRecord.get().getValue({fieldId: 'custpage_customer_id'})),
            isDynamic: true
        });

        var partner = recCustomer.getValue({fieldId: 'partner'});
        var customer_status = recCustomer.getValue({fieldId: 'entitystatus'});

        //Load partner record
        var partner_record = record.load({
            type: record.Type.PARTNER,
            id: partner,
            isDynamic: true
        });
        var state = partner_record.getValue({fieldId: 'location'});
        var customer = parseInt(currentRecord.get().getValue({fieldId: 'custpage_customer_id'}));

        //Page variables
        var service_name_elem = document.getElementsByClassName("service_name");
        var edit_class_elem = document.getElementsByClassName("edit_class");
        var service_descp_class_elem = document.getElementsByClassName("service_descp_class");
        var old_service_price_class_elem = document.getElementsByClassName("old_service_price_class");
        var new_service_price_class_elem = document.getElementsByClassName("new_service_price_class");
        var monday_class_elem = document.getElementsByClassName("monday_class");
        var tuesday_class_elem = document.getElementsByClassName("tuesday_class");
        var wednesday_class_elem = document.getElementsByClassName("wednesday_class");
        var thursday_class_elem = document.getElementsByClassName("thursday_class");
        var friday_class_elem = document.getElementsByClassName("friday_class");
        var adhoc_class_elem = document.getElementsByClassName("adhoc_class");
        var created_by_class_elem = document.getElementsByClassName("created_by_class");
        var last_modified_class_elem = document.getElementsByClassName("last_modified_class");
        var comm_type_class_elem = document.getElementsByClassName("comm_type_class");
        var date_effective = $('#date_effective').val();
        var old_date_effective = $('#date_effective').attr('data-olddate');

        var monthly_service_rate = 0.0;
        var monthly_extra_service_rate = 0.0;
    
        //Ensure date is not empty and date entered is greater than today's date
        if (isNullorEmpty(date_effective)) {
            alert('Please Enter the Date Effective');
            return false;
        } else {
            var resultDate = dateEffectiveCheck(date_effective);
    
            if (resultDate == false) {
                alert('Entered Date Effective should be greater than today');
                return false;
            }
            var splitDate = date_effective.split('-');
            var dateEffective = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
        }

        var commRegID = currentRecord.get().getValue({fieldId: 'custpage_customer_comm_reg'});
        console.log('commRegID ' + commRegID);

        //Load up service change 
        var searched_service_change = search.load({
            type: 'customrecord_servicechg',
            id: 'customsearch_smc_service_chg'
        });

        if (!isNullorEmpty(commRegID)) {
            searched_service_change.filters.push(search.createFilter({
                name: 'custrecord_servicechg_comm_reg',
                join: null,
                operator: search.Operator.NONEOF,
                values: commRegID,
            }));
        }

        searched_service_change.filters.push(search.createFilter({
            name: 'custrecord_servicechg_date_effective',
            join: null,
            operator: search.Operator.ON,
            values: dateEffective,
        }));

        searched_service_change.filters.push(search.createFilter({
            name: 'custrecord_servicechg_status',
            join: null,
            operator: search.Operator.IS,
            values: 1,
        }));

        searched_service_change.filters.push(search.createFilter({
            name: 'custrecord_service_customer',
            join: 'CUSTRECORD_SERVICECHG_SERVICE',
            operator: search.Operator.IS,
            values: customer,
        }));
        
        var resultSet_service_change = searched_service_change.run();
        var serviceResult_service_change = resultSet_service_change.getRange({start: 0, end: 1});
        console.log('serviceResult_service_change: ' + serviceResult_service_change);
        console.log('commRegID: ' +  commRegID);
        if (isNullorEmpty(serviceResult_service_change) && isNullorEmpty(commRegID)) {
            console.log('edit_class_elem.length: '+  edit_class_elem.length);
            for (var i = 0; i < edit_class_elem.length; i++) {
                console.log(service_name_elem[i].getAttribute('data-serviceid'));
                var freqArray = [];
                var sale_type = comm_type_class_elem[i].value;

                if (monday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 1;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
    
                }
                if (tuesday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 2;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
                if (wednesday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 3;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
                if (thursday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 4;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
                if (friday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 5;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
                if (adhoc_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 6;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
    
                var row_service_change_id = edit_class_elem[i].getAttribute('data-servicechangeid');
                var row_service_id = service_name_elem[i].getAttribute('data-serviceid');
                var user_id = created_by_class_elem[i].getAttribute('data-userid');

                if (isNullorEmpty(row_service_id)) {
                    if (isNullorEmpty(commRegID)) {
                        commRegID = createCommReg(customer, dateEffective, partner, state,  currentRecord.get().getValue({fieldId: 'custpage_sendemail'}), customer_status);
                    }
                    console.log('inside create of Service Change record for new service');

                    var new_service_record = record.create({
                        type: 'customrecord_service',
                        isDynamic: true
                    });

                    var servicetype_id = service_name_elem[i].getAttribute('data-servicetypeid');
                    var servicetype_text = service_name_elem[i].value;
                    var new_service_price = new_service_price_class_elem[i].value;
                    var new_service_descp = service_descp_class_elem[i].value;
                    var created_by = created_by_class_elem[i].value;

                    new_service_record.setField({fieldId: 'custrecord_service', value: servicetype_id });
                    new_service_record.setField({fieldId: 'name', value: servicetype_text });
                    new_service_record.setField({fieldId: 'custrecord_service_price', value: new_service_price });
                    new_service_record.setField({fieldId: 'custrecord_service_customer', value: customer });
                    new_service_record.setField({fieldId: 'custrecord_service_description', value: new_service_descp });
                    
                    if (!isNullorEmpty(commRegID)) {
                        new_service_record.setField({fieldId: 'custrecord_service_comm_reg', value: commRegID });
                    }
                    if (monday_class_elem[i].checked == true) {
                        new_service_record.setField({fieldId: 'custrecord_service_day_mon', value: 'T' });
                    }

                    if (tuesday_class_elem[i].checked == true) {
                        new_service_record.setField({fieldId: 'custrecord_service_day_tue', value: 'T' });
                    }
                    if (wednesday_class_elem[i].checked == true) {
                        new_service_record.setField({fieldId: 'custrecord_service_day_wed', value: 'T' });
                    }
                    if (thursday_class_elem[i].checked == true) {
                        new_service_record.setField({fieldId: 'custrecord_service_day_thu', value: 'T' });
                    }
                    if (friday_class_elem[i].checked == true) {
                        new_service_record.setField({fieldId: 'custrecord_service_day_fri', value: 'T' });
                    }
                    if (adhoc_class_elem[i].checked == true) {
                        new_service_record.setField({fieldId: 'custrecord_service_day_adhoc', value: 'T' });
                    }

                    var new_service_id = new_service_record.save();
                    if (!isNullorEmpty(new_service_id)) {
                        var new_service_change_record = record.create({
                            type: 'customrecord_servicechg',
                            isDynamic: true
                        });
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_date_effective', value: dateEffective});
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_service', value: new_service_id});
                        if(currentRecord.get().getValue({fieldId: 'custpage_sendemail'}) == 'T'){
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 4});
                        }else{
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 1});
                        }

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_old_zee', value: partner});

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value: new_service_price});

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: freqArray});

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_comm_reg', value: commRegID});

                        if (role != 1000) {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value: user_id});
                        }
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_type', value: comm_type_class_elem[i].value});

                        new_service_change_record.setValue({fieldId: 'custrecord_default_servicechg_record', value: 1});

                        new_service_change_record.save();
                        record.submitFields({
                            type: 'customrecord_service',
                            id: new_service_id,
                            fields: 'isinactive',
                            values: {
                                'customrecord_service': 'T'
                            }
                        });

                    }
                        
                } else if (!isNullorEmpty(row_service_change_id)){
                    var service_change_record = record.load({
                        type: 'customrecord_servicechg',
                        id: row_service_change_id,
                        isDynamic: true
                    });
                    var service_change_new_price = service_change_record.getValue({fieldId: 'custrecord_servicechg_new_price'});
                    var service_change_old_freq = service_change_record.getValue({fieldId: 'custrecord_servicechg_old_freq'});
                    var service_change_new_freq = service_change_record.getValue({fieldId: 'custrecord_servicechg_new_freq'});
                    var service_change_date_effective = service_change_record.getValue({fieldId: 'custrecord_servicechg_new_freq'});
                    var service_change_comm_reg = service_change_record.getValue({fieldId: 'custrecord_servicechg_comm_reg'});

                    if ((!isNullorEmpty(new_service_price_class_elem[i].value) && old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) || (isNullorEmpty(service_change_old_freq) && !arraysEqual(service_change_new_freq, freqArray)) || (!isNullorEmpty(service_change_old_freq) && !arraysEqual(service_change_old_freq, freqArray)) || (service_change_date_effective != dateEffective)) {
                        console.log('inside update of Service Change record');

                        if (isNullorEmpty(commRegID)) {
                            commRegID = loadCommReg(service_change_comm_reg, dateEffective);
                        }

                        var service_id = service_name_elem[i].getAttribute('data-serviceid');
                        if (!isNullorEmpty(service_id)) {
                            service_change_record.setValue({fieldId: 'custrecord_servicechg_date_effective', value: getFormattedDate(dateEffective)});
                            if (old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) {
                                service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value: new_service_price_class_elem[i].value});
                            }else{
                                service_change_record.setValue({fieldId: 'custrecord_servicechg_old_price', value: old_service_price_class_elem[i].value});
                            }

                            if (isNullorEmpty(service_change_old_freq)) {
                                if (service_change_new_freq != freqArray) {
                                    service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: freqArray});
                                }else{
                                    service_change_record.setValue({fieldId: 'custrecord_servicechg_old_freq', value: service_change_new_freq});
                                }
                            } else{
                                if (service_change_old_freq != freqArray) {
                                    service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: freqArray});
                                }else{
                                    service_change_record.setValue({fieldId: 'custrecord_servicechg_old_freq', value: service_change_old_freq});
                                }
                            }
                            
                            service_change_record.setValue({fieldId: 'custrecord_servicechg_comm_reg', value: commRegID});

                            if (role != 1000) {
                                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value: user_id});
                            }
                        }
                        service_change_record.save();
                    }
                } else if(isNullorEmpty(row_service_change_id) && !isNullorEmpty(row_service_id)){
                    var service_record = record.load({
                        type:'customrecord_service',
                        id: row_service_id,
                        isDynamic: true
                    });
                    var current_price = service_record.getValue({fieldId: 'custrecord_service_price'});
                    var current_freq_mon = service_record.getValue({fieldId: 'custrecord_service_day_mon'});
                    var current_freq_tue = service_record.getValue({fieldId: 'custrecord_service_day_tue'});
                    var current_freq_wed = service_record.getValue({fieldId: 'custrecord_service_day_wed'});
                    var current_freq_thu = service_record.getValue({fieldId: 'custrecord_service_day_thu'});
                    var current_freq_fri = service_record.getValue({fieldId: 'custrecord_service_day_fri'});
                    var current_freq_adhoc = service_record.getValue({fieldId: 'custrecord_service_day_adhoc'});

                    var current_freq_array = [];

                    if (current_freq_mon == 'T') {
                        current_freq_array[current_freq_array.length] = 1;
                    }
                    if (current_freq_tue == 'T') {
                        current_freq_array[current_freq_array.length] = 2;
                    }
                    if (current_freq_wed == 'T') {
                        current_freq_array[current_freq_array.length] = 3;
                    }
                    if (current_freq_thu == 'T') {
                        current_freq_array[current_freq_array.length] = 4;
                    }
                    if (current_freq_fri == 'T') {
                        current_freq_array[current_freq_array.length] = 5;
                    }
                    if (current_freq_adhoc == 'T') {
                        current_freq_array[current_freq_array.length] = 6;
                    }

                    if ((!isNullorEmpty(new_service_price_class_elem[i].value) && old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) || (!arraysEqual(current_freq_array, freqArray))) {
                        console.log('inside create new Service Change record for existing Service');
                        if (isNullorEmpty(commRegID)) {
                            commRegID = createCommReg(customer, dateEffective, partner, state, currentRecord.get().getValue({fieldId: 'custpage_sendemail'}), customer_status);
                        }

                        var new_service_change_record =  record.create({
                            type: 'customrecord_servicechg',
                            isDynamic: true
                        });
                        
                        var service_id = service_name_elem[i].getAttribute('data-serviceid');
                        if (!isNullorEmpty(service_id)) {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_date_effective', value: getFormattedDate(dateEffective)});
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_service', value: service_id});

                            if(currentRecord.get().getValue({fieldId: 'custpage_sendemail'}) == 'T'){
                                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 4});
                            }else{
                                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 1});
                            }

                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_old_zee', value: partner});

                            if (old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) {
                                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value: new_service_price_class_elem[i].value});
                            }

                            if (!arraysEqual(current_freq_array, freqArray)) {
                                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: freqArray});
                            }

                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_comm_reg', value: commRegID});
                            if (role != 1000) {   
                                // console.log('Line 832');
                                // console.log('userid: ' +  userid);
                                //TODO
                                // new_service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value: user_id});
                            }

                            //COE - Service imported from old customer and edited - Link the commReg to the service
                            if ($('#commencementtype option:selected').val() == 6) {
                                var service_record = record.load({
                                    type:'customrecord_service',
                                    id: service_id,
                                    isDynamic: true
                                });
                                service_record.setField({fieldId: 'custrecord_service_comm_reg', value: commRegID});
                                service_record.save();

                                new_service_change_record.setValue({fieldId: 'custrecord_default_servicechg_record', value: 1});
                                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value: new_service_price_class_elem[i].value});
                            }
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_type', value: comm_type_class_elem[i].value});
                            new_service_change_record.save();
                        }
            
                    }else if ($('#commencementtype option:selected').val() == 6) { 
                        //COE - Service imported from old customer and not edited
                        console.log('inside create new Service Change record for existing Service - COE not edited');

                        if (isNullorEmpty(commRegID)) {
                            commRegID = createCommReg(customer, dateEffective, partner, state, currentRecord.get().getValue({fieldId: 'custpage_sendemail'}), customer_status);
                        }

                        var new_service_change_record = ecord.create({
                            type: 'customrecord_servicechg',
                            isDynamic: true
                        });
                        var service_id = service_name_elem[i].getAttribute('data-serviceid');
                        if (!isNullorEmpty(service_id)) {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_date_effective', value: getFormattedDate(dateEffective)});

                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_service', value: service_id});

                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 4});

                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_old_zee', value: partner});

                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value: new_service_price_class_elem[i].value});

                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: current_freq_array});

                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_comm_reg', value: commRegID});

                            if (role != 1000) {
                                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value: runtime.getCurrentUser()});
                            }
                            var service_record = record.load({
                                type:'customrecord_service',
                                id: service_id,
                                isDynamic: true
                            });
                            service_record.setField({fieldId: 'custrecord_service_comm_reg', value: commRegID});
                            service_record.save();
                        }
                    }
                }
            }  

            console.log(monthly_service_rate);
            currentRecord.get().setValue({fieldId: 'custpage_customer_comm_reg', value: commRegID });
            recCustomer.setValue({fieldId: 'custentity_cust_monthly_service_value', value: parseFloat(monthly_service_rate * 4.25) });    
            recCustomer.setValue({fieldId: 'custentity_monthly_extra_service_revenue', value: parseFloat(monthly_extra_service_rate * 4.25) });
            recCustomer.save();
            console.log('Saving rec 896 ');
            return true;

        } else if (!isNullorEmpty(serviceResult_service_change) && !isNullorEmpty(commRegID)){

            console.log('2th IF');
            console.log(service_change_delete);
            console.log(comm_reg_delete);
            var service_change_delete_string = service_change_delete.join();
            var comm_reg_delete_string = comm_reg_delete.join();
            currentRecord.get().setValue({fieldId: 'custpage_service_change_delete', value: service_change_delete_string });
            currentRecord.get().setValue({fieldId: 'custpage_comm_reg_delete', value: comm_reg_delete_string });
            return true;

        } else if (isNullorEmpty(serviceResult_service_change) && !isNullorEmpty(commRegID)){
            console.log('3rd IF');
            var searched_service_change =  search.load({
                type: 'customrecord_servicechg',
                id: 'customsearch_smc_service_chg'
            });

            if (!isNullorEmpty(commRegID)) {
                searched_service_change.filters.push(search.createFilter({
                    name: 'custrecord_servicechg_comm_reg',
                    join: null,
                    operator: search.Operator.ANYOF,
                    values: commRegID
                }));
            }

            searched_service_change.filters.push(search.createFilter({
                name: 'custrecord_service_customer',
                join: 'CUSTRECORD_SERVICECHG_SERVICE',
                operator: search.Operator.IS,
                values: customer
            }));

            var resultSet_service_change = searched_service_change.run();
            var serviceResult_service_change = resultSet_service_change.getRange({start: 0, end: 1});

            console.log(serviceResult_service_change);

            for (var i = 0; i < edit_class_elem.length; i++) {
                console.log(service_name_elem[i].getAttribute('data-serviceid'));

                var freqArray = [];
                var sale_type = comm_type_class_elem[i].value;
    
                if (monday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 1;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
                if (tuesday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 2;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
                if (wednesday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 3;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
                if (thursday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 4;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
                if (friday_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 5;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
                if (adhoc_class_elem[i].checked == true) {
                    freqArray[freqArray.length] = 6;
                    monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                        monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                    }
                }
    
                var row_service_change_id = edit_class_elem[i].getAttribute('data-servicechangeid');
                var row_service_id = service_name_elem[i].getAttribute('data-serviceid');
                var user_id = created_by_class_elem[i].getAttribute('data-userid');

                if (isNullorEmpty(row_service_id)) {
                    if (isNullorEmpty(commRegID)) {
                        commRegID = createCommReg(customer, dateEffective, partner, state, currentRecord.get().getValue({fieldId: 'custpage_sendemail'}), customer_status);
                    }else {
                        loadCommReg(commRegID, dateEffective);
                    }   

                    console.log('inside create of Service Change record for new service');

                    var new_service_record = record.create({
                        type: 'customrecord_service',
                        isDynamic: true
                    });

                    var servicetype_id = service_name_elem[i].getAttribute('data-servicetypeid');
                    var servicetype_text = service_name_elem[i].value;
                    var new_service_price = new_service_price_class_elem[i].value;
                    var new_service_descp = service_descp_class_elem[i].value;
                    var created_by = created_by_class_elem[i].value;

                    new_service_record.setValue({fieldId: 'custrecord_service', value: servicetype_id});
                    new_service_record.setValue({fieldId: 'name', value: servicetype_text});
                    new_service_record.setValue({fieldId: 'custrecord_service_price', value: new_service_price});
                    new_service_record.setValue({fieldId: 'custrecord_service_customer', value: customer});
                    new_service_record.setValue({fieldId: 'custrecord_service_description', value: new_service_descp});

                    if(!isNullorEmpty(commRegID)){
                        new_service_record.setValue({fieldId: 'custrecord_service_comm_reg', value: commRegID});
                    }

                    if(monday_class_elem[i].checked == true){
                        new_service_record.setValue({fieldId: 'custrecord_service_day_mon', value: 'T'});
                    }

                    if(tuesday_class_elem[i].checked == true){
                        new_service_record.setValue({fieldId: 'custrecord_service_day_tue', value: 'T'});
                    }   

                    if(wednesday_class_elem[i].checked == true){
                        new_service_record.setValue({fieldId: 'custrecord_service_day_wed', value: 'T'});
                    }

                    if(thursday_class_elem[i].checked == true){
                        new_service_record.setValue({fieldId: 'custrecord_service_day_thu', value: 'T'});
                    }

                    if(friday_class_elem[i].checked == true){
                        new_service_record.setValue({fieldId: 'custrecord_service_day_fri', value: 'T'});
                    }


                    if(adhoc_class_elem[i].checked  == true){
                        new_service_record.setValue({fieldId: 'custrecord_service_day_adhoc', value: 'T'});
                    }

                    var new_service_id = new_service_record.save();

                    if (!isNullorEmpty(new_service_id)) {
                        var new_service_change_record = record.create({
                            type: 'customrecord_servicechg'
                        });

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_date_effective', value: dateEffective});
                     

                        if (currentRecord.get().getValue({fieldId: 'custpage_sendemail'}) == 'T') {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 4});
                        }else{
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 1});
                        }

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_old_zee', value: partner});

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value: new_service_price});

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: freqArray});

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_comm_reg', value: commRegID});

                        if (role != 1000) {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value: user_id});
                        }

                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_type', value: comm_type_class_elem[i].value});

                        new_service_change_record.setValue({fieldId: 'custrecord_default_servicechg_record', value: 1});

                        new_service_change_record.save();

                        currentRecord.get().submitFields({
                            type: 'customrecord_service',
                            id: new_service_id,
                            values: 'isinactive'
                        });  
                    }

                } else if(!isNullorEmpty(row_service_change_id)){
                    var service_change_record = record.load({
                        type:'customrecord_servicechg',
                        id: row_service_change_id,
                        isDynamic: true
                    });

                    var service_change_new_price = service_change_record.getValue({fieldId: 'custrecord_servicechg_new_price'});
                    var service_change_old_freq = service_change_record.getValue({fieldId: 'custrecord_servicechg_old_freq'});
                    var service_change_new_freq = service_change_record.getValue({fieldId: 'custrecord_servicechg_new_freq'});
                    var service_change_date_effective = service_change_record.getValue({fieldId: 'custrecord_servicechg_new_freq'});
                    var service_change_comm_reg = service_change_record.getValue({fieldId: 'custrecord_servicechg_comm_reg'});

                    if ((!isNullorEmpty(new_service_price_class_elem[i].value) && old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) || (isNullorEmpty(service_change_old_freq) && !arraysEqual(service_change_new_freq, freqArray)) || (!isNullorEmpty(service_change_old_freq) && !arraysEqual(service_change_old_freq, freqArray)) || (service_change_date_effective != dateEffective)) {
                        console.log('inside update of Service Change record');

                        if (isNullorEmpty(commRegID)) {
                            commRegID = loadCommReg(service_change_comm_reg, dateEffective);
                        }

                        var service_id = service_name_elem[i].getAttribute('data-serviceid');

                        if (!isNullorEmpty(service_id)) {
                            console.log(dateEffective);
                            service_change_record.setValue({fieldId: 'custrecord_servicechg_date_effective', value: getFormattedDate(dateEffective)});

                            if (old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) {
                                console.log(new_service_price_class_elem[i].value);
                                service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value: new_service_price_class_elem[i].value});
                            }else{
                                console.log(old_service_price_class_elem[i].value);
                                service_change_record.setValue({fieldId: 'custrecord_servicechg_old_price', value: old_service_price_class_elem[i].value});
                            }

                            if (isNullorEmpty(service_change_old_freq)) {
                                if (service_change_new_freq != freqArray) {
                                    console.log(freqArray);
                                    service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: freqArray});
                                }else{
                                    console.log(service_change_new_freq);
                                    service_change_record.setValue({fieldId: 'custrecord_servicechg_old_freq', value: service_change_new_freq});
                                }
                            }else{
                                if (service_change_old_freq != freqArray) {
                                    console.log(freqArray);
                                    service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: freqArray});
                                }else{
                                    console.log(service_change_old_freq);
                                    service_change_record.setValue({fieldId: 'custrecord_servicechg_old_freq', value: service_change_old_freq});
                                }
                            }
                            console.log(commRegID)
                            service_change_record.setValue({fieldId: 'custrecord_servicechg_comm_reg', value: commRegID});
                            if (role != 1000) {
                                // console.log(user_id)
                                // service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value: user_id});
                            }
                        }
                        console.log('submit')
                        service_change_record.save();
                    }

                } else if(isNullorEmpty(row_service_change_id) && !isNullorEmpty(row_service_id)){
                    var service_record = record.load({
                        type: 'customrecord_service',
                        id: row_service_id,
                        isDynamic: true
                    });

                    var current_price = service_record.getValue({fieldId: 'custrecord_service_price'});
                    var current_freq_mon = service_record.getValue({fieldId: 'custrecord_service_day_mon'});
                    var current_freq_tue = service_record.getValue({fieldId: 'custrecord_service_day_tue'});
                    var current_freq_wed = service_record.getValue({fieldId: 'custrecord_service_day_wed'});
                    var current_freq_thu = service_record.getValue({fieldId: 'custrecord_service_day_thu'});
                    var current_freq_fri = service_record.getValue({fieldId: 'custrecord_service_day_fri'});
                    var current_freq_adhoc = service_record.getValue({fieldId: 'custrecord_service_day_adhoc'});
                 
                    var current_freq_array = [];

                    if (current_freq_mon == 'T') {
                        current_freq_array[current_freq_array.length] = 1;
                    }
                    if (current_freq_tue == 'T') {
                        current_freq_array[current_freq_array.length] = 2;
                    }
                    if (current_freq_wed == 'T') {
                        current_freq_array[current_freq_array.length] = 3;
                    }
                    if (current_freq_thu == 'T') {
                        current_freq_array[current_freq_array.length] = 4;
                    }
                    if (current_freq_fri == 'T') {
                        current_freq_array[current_freq_array.length] = 5;
                    }
                    if (current_freq_adhoc == 'T') {
                        current_freq_array[current_freq_array.length] = 6;
                    }


                if ((!isNullorEmpty(new_service_price_class_elem[i].value) && old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) || (!arraysEqual(current_freq_array, freqArray))) {
                    console.log('inside create new Service Change record for existing Service');
                    if (isNullorEmpty(commRegID)) {
                        commRegID = createCommReg(customer, dateEffective, partner, state, currentRecord.get().getValue({fieldId: 'custpage_sendemail'}), customer_status);
                    }

                    var new_service_change_record = record.create({
                        type: 'customrecord_servicechg'
                    });

                    var service_id = service_name_elem[i].getAttribute('data-serviceid');

                    if (!isNullorEmpty(service_id)) {
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_date_effective', value: dateEffective });
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_service', value: service_id });

                        if (currentRecord.get().getValue({fieldId: 'custpage_sendemail'}) == 'T') {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 4 });
                        } else {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 1 });
                        }
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_old_zee', value: partner });

                        if (old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value:  new_service_price_class_elem[i].value });
                        }

                        if (!arraysEqual(current_freq_array, freqArray)) {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: freqArray });
                        }
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_comm_reg', value: commRegID });

                        if (role != 1000) {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value: user_id });
                        }
                    }
                    new_service_change_record.setValue({fieldId: 'custrecord_servicechg_type', value: comm_type_class_elem[i].value });
                    //COE - Service imported from old customer and edited
                    if ($('#commencementtype option:selected').val() == 6) {
                        new_service_change_record.setValue({fieldId: 'custrecord_default_servicechg_record', value: 1 });
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value: new_service_price_class_elem[i].value });
                    }
                    new_service_change_record.save();
                } else if ($('#commencementtype option:selected').val() == 6) { //COE - Service imported from old customer and not edited
                    console.log('inside create new Service Change record for existing Service - COE not edited');
                    if (isNullorEmpty(commRegID)) {
                        commRegID = createCommReg(customer, dateEffective, partner, state, currentRecord.get().getValue({fieldId: 'custpage_sendemail'}), customer_status);
                    }

                    var new_service_change_record = record.create({
                        type: 'customrecord_servicechg',
                    });

                    var service_id = service_name_elem[i].getAttribute('data-serviceid');

                    if (!isNullorEmpty(service_id)) {
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_date_effective', value: dateEffective });
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_service', value: service_id });
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 2 }); //status is 
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_old_zee', value: partner });
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_price', value: old_service_price_class_elem[i].value }); //price remain the same                   
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_new_freq', value: current_freq_array }); //frequency remain the same
                        new_service_change_record.setValue({fieldId: 'custrecord_servicechg_comm_reg', value: commRegID });

                        if (role != 1000) {
                            new_service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value:  runtime.getCurrentUser()});
                        }
                    }
                    new_service_change_record.setValue({fieldId: 'custrecord_servicechg_type', value: 'Change of Entity' });
                    new_service_change_record.setValue({fieldId: 'custrecord_default_servicechg_record', value: 1 });
                    new_service_change_record.save();
                }         
                }
            }

            console.log('2nd ' + monthly_service_rate);
            currentRecord.get().setValue({fieldId: 'custpage_customer_comm_reg', value: commRegID });
            var service_change_delete_string = service_change_delete.join();
            var comm_reg_delete_string = comm_reg_delete.join();

            currentRecord.get().setValue({fieldId: 'custpage_service_change_delete', value: service_change_delete_string });
            currentRecord.get().setValue({fieldId: 'custpage_comm_reg_delete', value: comm_reg_delete_string });

            console.log(monthly_service_rate);

            recCustomer.setValue({fieldId: 'custentity_cust_monthly_service_value', value: parseFloat(monthly_service_rate * 4.25)});
            recCustomer.setValue({fieldId: 'custentity_monthly_extra_service_revenue', value: parseFloat(monthly_extra_service_rate * 4.25)});
            recCustomer.save();
            return true;
            
        } else if (!isNullorEmpty(serviceResult_service_change) && isNullorEmpty(commRegID)){
            console.log('4th IF');
            alert('There has already been a scheduled change');
            return false;
        }
        return true;
    }

    /**
     * Fired when the Delete icon button is clicked
     * @param {*} strVal 
     */
    function handleDeleteServiceChange(){
        var service_change_id = $(this).attr('data-servicechangeid');
        if (!isNullorEmpty(service_change_id)) {
            var service_change_record = record.load({
                type: 'customrecord_servicechg',
                id: service_change_id,
                isDynamic: true
            });
            var date_email = service_change_record.getValue({fieldId:'custrecord_servicechg_date_emailed'});
        }else{
            var date_email = null;
        }

        if (isNullorEmpty(date_email)) {
            if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

                var service_change_id = $(this).attr('data-servicechangeid');
    
                var commRegId = nlapiGetFieldValue('custpage_customer_comm_reg');
    
                if (!isNullorEmpty(service_change_id)) {
                    service_change_delete[service_change_delete.length] = service_change_id;
    
                    console.log(service_change_delete)
                        // nlapiDeleteRecord('customrecord_servicechg', service_change_id);
    
                    $(this).closest("tr").hide();
                } else {
                    $(this).closest("tr").hide();
                }
            }
        }else{
            alert('Notification of Price Increase Email already sent out to Customer.\n\n Please contact Head Office');
            return false;
        }
    }

    /**
     * Takes user back to the Service change list
     */
    function handleBack(){
        // var params = {
        //     custid: currentRecord.get().getValue({fieldId: 'custpage_customer_id'}),
        //     sales_record_id: currentRecord.get().getValue({fieldId: 'custpage_salesrecordid'})
        // }
        // params = JSON.stringify(params);

        // var output = url.resolveScript({
        //     deploymentId:  currentRecord.get().getValue({fieldId: 'custpage_deployid'}),
        //     scriptId: currentRecord.get().getValue({fieldId: 'custpage_scriptid'}),
        //     returnExternalUrl: false
        // });
        
        var output = url.resolveScript({
            deploymentId: 'customdeploy_service_change_list_2' ,
            scriptId: 'customscript_sl_service_change_list_2',
            returnExternalUrl: false
        });

        var upload_url = baseURL + output + '&unlayered=T&custparam_params=';
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }


    /**
    * Is Null or Empty.
    *
    * @param {Object} strVal
    */
    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }

    /**
     * Creates a new custom commencement register record and save
     * @param {*} customer 
     * @param {*} dateEffective 
     * @param {*} zee 
     * @param {*} state 
     * @param {*} can_comp 
     */
    function createCommReg(customer, dateEffective, zee, state, sendemail, customer_status) {
        customer_comm_reg = record.create({type: 'customrecord_commencement_register'});
        customer_comm_reg.setValue({fieldId: 'custrecord_date_entry', value: getDate()});

        customer_comm_reg.setValue({fieldId: 'custrecord_comm_date', value: getFormattedDate(dateEffective)});
        customer_comm_reg.setValue({fieldId: 'custrecord_comm_date_signup', value: getFormattedDate(dateEffective)});
        customer_comm_reg.setValue({fieldId: 'custrecord_customer', value: customer});
        customer_comm_reg.setValue({fieldId: 'custrecord_salesrep', value: 109783});

        //Franchisee
        customer_comm_reg.setValue({fieldId: 'custrecord_std_equiv', value: 1});
        customer_comm_reg.setValue({fieldId: 'custrecord_franchisee', value: zee});
        customer_comm_reg.setValue({fieldId: 'custrecord_wkly_svcs', value: 5});
        customer_comm_reg.setValue({fieldId: 'custrecord_in_out', value: 2}); //Inbound

        //Scheduled
        customer_comm_reg.setValue({fieldId: 'custrecord_state', value: state}); 
        customer_comm_reg.setValue({fieldId: 'custrecord_trial_status', value: 9}); 

        //Price Increase
        customer_comm_reg.setValue({fieldId: 'custrecord_sale_type', value: 13}); 

        var commRegID = customer_comm_reg.save();
        return commRegID;
    }

    /**
     * Function to load up a commencement register given the id and dateEffective
     * @param {*} id 
     * @param {*} dateEffective 
     */
    function loadCommReg(id, dateEffective){
        customer_comm_reg = record.load({
            type:'customrecord_commencement_register',
            id: id,
            isDynamic: true
        });
        customer_comm_reg.setValue({fieldId: 'custrecord_date_entry', value: getDate()});
        customer_comm_reg.setValue({fieldId: 'custrecord_comm_date', value: dateEffective});
        customer_comm_reg.setValue({fieldId: 'custrecord_sale_type', value:  $('#commencementtype option:selected').val()});

        var commRegID =  customer_comm_reg.save();
        return commRegID;

    }

    function getFormattedDate(date){
        var formattedDate = format.format({
            value: date,
            type: format.Type.DATE 
        });

        var finalDate = format.parse({
            value: formattedDate,
            type: format.Type.DATE 
        });

        return finalDate;
    }

    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length)
            return false;
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i])
                return false;
        }

        return true;
    }

     /**
     * Checks that date entered is not in the past
     * @param {Date} cancellation_date 
     */
    function dateEffectiveCheck(dateEffective){
        var date = new Date(dateEffective);

        var today = new Date();

        if (date <= today) {
            return false;
        } else {
            return true;
        }
    }

      /**
     * [getDate description] - Get the current date
     * @return {[String]} [description] - return the string date
     */
    function getDate() {
        var today = new Date();
        var date = format.format({
            value: today,
            type: format.Type.DATE  
        });
        var finalDate = format.parse({
            value: date,
            type: format.Type.DATE 
        });
        return finalDate;
    }


    function getFormattedDate(date){
        var formattedDate = format.format({
            value: date,
            type: format.Type.DATE 
        });

        var finalDate = format.parse({
            value: formattedDate,
            type: format.Type.DATE 
        });

        return finalDate;
    }


    return {
        pageInit: pageInit,
        saveRecord: saveRecord
    }
});