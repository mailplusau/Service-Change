/**
*@NApiVersion 2.x
*@NScriptType ClientScript
*/

/**
 * Module Description -
 * NS Version       Date             Author
 * 2.00             2020-12-20       Ravija Maheshwari
 * 
 * @Last Modified by: Ravija Maheshwari
 * @Last Modified time: 11:57
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

    function pageInit(context){
        //Enable all tooltips
        $('[data-toggle="tooltip"]').tooltip()
        //Event listeners
        $('#create_new').on('click', handleAddScheduledChange);
        $('#cancel_service').on('click', handleCancelService);
        $('.edit_class').on('click', handleEditService);
        $('#back').on('click', handleBack);
    }  
    
    /**
     * Fired when the New Scheduled Change button is clicked
     */
    function handleAddScheduledChange(){
        var params = {
            custid: parseInt(nlapiGetFieldValue('custpage_customer_id')),
            customid: 'customscript_sl_service_change',
            customdeploy: 'customdeploy_sl_create_service_change'
        }
        params = JSON.stringify(params);

        var output = url.resolveScript({
            deploymentId: 'customdeploy_sl_create_service_change',
            scriptId: 'customscript_sl_create_service_change',
            returnExternalUrl: false
        });

        var upload_url = baseURL + output + '&custparam_params=' + params;
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }

    /**
     * Fired when the Cancel Service button is clicked
    */
    function handleCancelService(){
        var params = {
            custid: parseInt(currentRecord.get().getValue({fieldId: 'custpage_customer_id'}))
        }
        params = JSON.stringify(params);

        var output = url.resolveScript({
            deploymentId: 'customdeploy_sl_cancel_service_change',
            scriptId: 'customscript_sl_cancel_service_change',
            returnExternalUrl: false
        });

        var upload_url = baseURL + output + '&custparam_params=' + params;
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }

    /**
    * Fired when the Edit button is clicked
    */
    function handleEditService(){
        var commregid = $(this).attr('data-commreg');
        var dateEffective = $(this).attr('data-dateeffective');

        var params = {
            custid: parseInt(currentRecord.get().getValue({fieldId: 'custpage_customer_id'})),
            salesrep: null,
            commreg: commregid,
            customid: 'customscript_sl_service_change',
            customdeploy: 'customdeploy_sl_service_change',
            date: dateEffective
        }
        params = JSON.stringify(params);

        var output = url.resolveScript({
            deploymentId: 'customdeploy_sl_create_service_change_2',
            scriptId: 'customscript_sl_create_service_change_2',
            returnExternalUrl: false
        });

        var upload_url = baseURL + output + '&custparam_params=' + params;
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }

    /**
     *  Fired when the Back button is clicked
     */
    function handleBack(){

        var output = url.resolveScript({
            deploymentId: 'customdeploy_service_change_list_2',
            scriptId: 'customscript_sl_service_change_list_2',
            returnExternalUrl: false
        });
        
        var upload_url = baseURL + output;
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }

    /**
     * Fired when the Submit button is clicked
     * Saves the service change changes
     */
    function saveRecord(){
        var service_descp_elem = document.getElementsByClassName("service_descp");
        for (var i = 0; i < service_descp_elem.length; ++i) {
            var service_id = service_descp_elem[i].getAttribute('data-serviceid');
            var service_descp_value = service_descp_elem[i].value;
    
            if(!isNullorEmpty(service_descp_value)){

                var service_record = record.load({
                    type: 'customrecord_service',
                    id: service_id,
                    isDynamic: true
                });
    
                service_record.setValue({fieldId: 'custrecord_service_description', value: service_descp_value});
    
                service_record.save();
            }
        }
        return true;
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
        pageInit: pageInit,
        saveRecord: saveRecord
    }
     
});