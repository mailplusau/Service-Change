/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 *
 * Module Description - 
 * 
 * NSVersion    Date            		 Author         
 * 2.00       	2020-12-21 13:12:36      Ravija Maheshwari 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
function(error, runtime, search, url, record, format, email, currentRecord) {

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

    var service_deleted = [];

    function pageInit(context){
        $('.alert').hide();

        $(".se-pre-con").fadeOut("slow");;
        
        //Add datatable styling 
        $(document).ready(function () {
        var servicesTables = $('#services-preview').DataTable({
            "pageLength": 25
            });
        });  

        $(document).on('click', '.close', function(e) {
            $(this).parent().hide();
        });

        $(document).on('click', ".remove_class", handleDeleteService);
        $(document).on('click', ".unremove_class", handleUndoDeleteService);
        $("#back").on('click', handleBack);
    }

    /*
    * Fired when the Tick Mark icon is clicked. Undoes deletion.
    */
    function handleUndoDeleteService(){
        var service_change_id = $(this).attr('data-servicechangeid');
        var service_id = $(this).attr('data-serviceid');

        var index = service_deleted.indexOf(service_id);
        if (index !== -1) {
            service_deleted.splice(index, 1);
        }

        service_deleted[service_deleted.length] = service_id;

        $(this).removeClass('glyphicon-ok');
        $(this).removeClass('btn-success');
        $(this).removeClass('unremove_class');

        $(this).addClass('btn-danger');
        $(this).addClass('glyphicon-trash');
        $(this).addClass('remove_class');

    }


    /**
     * Fired when the Delete icon button is clicked 
     */
    function handleDeleteService(){
        if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

            var service_change_id = $(this).attr('data-servicechangeid');
            var service_id = $(this).attr('data-serviceid');
    
            service_deleted[service_deleted.length] = service_id;
    
            $(this).removeClass('glyphicon-trash');
            $(this).removeClass('btn-danger');
            $(this).removeClass('remove_class');
    
            $(this).addClass('btn-success');
            $(this).addClass('glyphicon-ok');
            $(this).addClass('unremove_class');
        }
    }

    /**
    
    /**
     * Fired when the back button is clicked
     */
    function handleBack(){
        var params = {
            custid: parseInt(nlapiGetFieldValue('custpage_customer_id'))
        }
        params = JSON.stringify(params);
        var output = url.resolveScript({
            deploymentId: 'customdeploy_sl_service_change_2',
            scriptId: 'customscript_sl_service_change_2',
            returnExternalUrl: false
        }); 
        var upload_url = baseURL + output + '&custparam_params=' + params;
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }   

    function saveRecord(){

        var customer_id = parseInt(currentRecord.get().getValue({fieldId: 'custpage_customer_id'}));
        var partner = parseInt(currentRecord.get().getValue({fieldId: 'custpage_customer_franchisee'}));

        var partner_record = record.load({
            type: record.Type.PARTNER,
            id: partner
        });

        var state = partner_record.getValue({fieldId: 'location'});
        var commRegID = null;
        var cancellation_date = $('#cancel_date').val();
        var cancellation_reason = $('#cancel_reason option:selected').val();
        var cancellation_comp = $('#cancel_comp option:selected').val();
        var cancellation_notice = $('#cancel_notice option:selected').val();

        if (isNullorEmpty(cancellation_date)) {
            showAlert('Please Enter the Cancellation Date');
            return false;
        } else {
            var resultDate = dateEffectiveCheck(cancellation_date);
        
            if (resultDate == false) {
                alert('Entered Date Effective should be greater than today');
                return false;
            }
            var splitDate = cancellation_date.split('-');
            cancellation_date = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
        }

        if (isNullorEmpty(cancellation_reason)) {
            showAlert('Please Enter the Cancellation Reason');
            return false;
        }

        if (isNullorEmpty(cancellation_notice)) {
            showAlert('Please Enter the Cancellation Notice');
            return false;
        }

        if (!isNullorEmpty(service_deleted)) {
            for (var x = 0; x < service_deleted.length; x++) {
                if (isNullorEmpty(commRegID)) {
                    commRegID = createCommReg(customer_id, cancellation_date, partner, state, cancellation_reason, cancellation_notice, cancellation_comp);
                }

                var new_service_change_record = record.create({
                    type: 'customrecord_servicechg'
                });

                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_date_effective', value: getFormattedDate(cancellation_date)});
                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_cancellation_date', value: getFormattedDate(cancellation_date)});
                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_cancellation_reas', value: cancellation_reason});
                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_cancellation_not', value: cancellation_notice});
                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_cancellation_comp', value: cancellation_comp});
                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_service',value: service_deleted[x]});
                new_service_change_record.setValue({fieldId: 'custrecord_servicechg_status', value: 1});
                new_service_change_record.setValue({fieldId:'custrecord_servicechg_old_zee', value: partner});
                new_service_change_record.setValue({fieldId:'custrecord_servicechg_old_price', value: $('#service_price').val()});
                new_service_change_record.setValue({fieldId:'custrecord_servicechg_comm_reg', value: commRegID});
                new_service_change_record.setValue({fieldId:'custrecord_servicechg_created', value: 109783});
                new_service_change_record.setValue({fieldId:'custrecord_servicechg_type', value: 'Service Cancellation'});
                var id = new_service_change_record.save();
                console.log('Service change record ID : ' + id);
            }
        }
        return true;
    }

    /**
     * Creates a new custom commencement register record and save
     * @param {*} customer 
     * @param {*} dateEffective 
     * @param {*} zee 
     * @param {*} state 
     * @param {*} can_reason 
     * @param {*} can_notice 
     * @param {*} can_comp 
     */
    function createCommReg(customer, dateEffective, zee, state, can_reason, can_notice, can_comp){
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
        customer_comm_reg.setValue({fieldId: 'custrecord_commreg_cancel_notice', value: can_notice}); 
        customer_comm_reg.setValue({fieldId: 'custrecord_commreg_cancel_reason', value: can_reason}); 

        var commRegID = customer_comm_reg.save();
        return commRegID;
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
     * Is Null or Empty.
     *
     * @param {Object} strVal
     */
    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
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

    
    function showAlert(message) {
        $('.alert').html(message + '<a href="#" class="close" aria-label="close">&times;</a>');
        $('.alert').show();
    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
    }
});
