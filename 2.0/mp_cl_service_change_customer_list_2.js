/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 *
 * Module Description - Allows user to enter competitor if cancelllation reason is 'Competitor'. 
 * Reroutes back to the customscript_service_pricing_review_2 page
 * 
 * NSVersion    Date            		 Author         
 * 2.00       	2020-11-26 13:12:36      Ravija Maheshwari 
 * 
 * Last Modified by: Ravija Maheshwari on 2020-19-12 16:36
 *
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
            //Add datatable styling 
            $(document).ready(function () {
                var customersTable = $('#customers-preview').DataTable({
                "pageLength": 25
            });
        });

        //On selecting zee, reload the page with selected Zee parameter
        $(document).on("change", ".zee_dropdown", function(e) {

            var zee = $(this).val();

            var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1093&deploy=1&compid=1048144";
            url += "&zee=" + zee + "";

            window.location.href = url;
        });

        $(".cancel_customer").on('click', handleCancelClick);
        $(".review_customer").on('click', handleReviewClick);
        $(".commRegUpload").on('click', commRegUpload);
        $(".edit_customer").on('click', handleEditCustomer);

    }   

    


    //Fires on click of the CANCEL button
    function handleCancelClick() {
        //Get customer id from the ID of button clicked
        var custid = (this.id).split('_')[2];
    
        var params = {
            custid: custid
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

    //Fires on click of the REVIEW button
    function handleReviewClick(){
        var custid = (this.id).split('_')[2];

        var params = {
            custid: custid,
            servicechange: 'T'
        }
        params = JSON.stringify(params);
        
        var output = url.resolveScript({
            deploymentId: 'customdeploy_sl_smc_main',
            scriptId: 'customscript_sl_smc_main',
            returnExternalUrl: false
        });

        var upload_url = baseURL + output + '&unlayered=T&custparam_params=' + params;
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }

    //Fires on  click of the EDIT button
    function handleEditCustomer(){
        var custid = (this.id).split('_')[2];

        var params = {
            custid: custid,
        }
        params = JSON.stringify(params);

        var output = url.resolveScript({
            deploymentId: 'customdeploy_sl_service_change',
            scriptId: 'customscript_sl_service_change',
            returnExternalUrl: false
        });

        var upload_url = baseURL + output  + '&custparam_params=' + params;
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
    }

    //Fires on click of UPLOAD SCF button
    function commRegUpload() {
        var custid = (this.id).split('_')[1];

        var output = url.resolveScript({
            deploymentId: 'customdeploy_sl_salesbtns_upload_file',
            scriptId: 'customscript_sl_salesbtns_upload_file',
            returnExternalUrl: false
        });

        var upload_url = baseURL + output  + '&recid=' + custid + '&sales_record_id=' + null + '&upload_file=F&upload_file_id=' + null + '&file_type=T&type=SMC';
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
    

    return {
        pageInit: pageInit
    }
});