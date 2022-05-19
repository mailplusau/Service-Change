/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * @Last Modified by:   Anesu Chakaingesu
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
    function(runtime, search, record, log, task, currentRecord, format) {
        var zee = 0;
        var role = 0;

        role = runtime.getCurrentUser().role;

        var currRec = currentRecord.get();

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }

        function main() {
            log.debug({
                    title: 'Start'
                })
                // Service Type Search and Results
            var servResult = [];
            var servSearch = search.load({ type: 'customrecord_service_type', id: 'customsearch_rta_service_types_2' })
            servSearch.run().each(function(res) {
                var name = res.getValue({ name: 'name' });
                var serv_id = res.getValue({ name: 'internalid' });
                var packge_id = res.getValue({ name: 'internalid', join: 'CUSTRECORD_SERVICE_TYPE_NS_ITEM' });

                servResult.push({
                    name: name,
                    serviceID: serv_id,
                    packageID: packge_id
                });

                return true;
            });

            // Remove Group If Package Already associated with Customer
            var packResults = [];
            var packgServSearch = search.load({ type: 'customrecord_service', id: 'customsearch_price_chng_new_serv' });
            packgServSearch.run().each(function(res) {
                var cust_id = res.getValue({ name: 'internalid', join: 'CUSTRECORD_SERVICE_CUSTOMER' })

                packResults.push(cust_id);

                return true;
            });
            log.debug({
                title: 'packRes',
                details: packResults
            })

            // Customer Info and Create Service Record
            var custFinTabSearch = search.load({ type: 'customer', id: 'customsearch_package_cust_fin_tab' });
            custFinTabSearch.run().getRange({ start: 0, end: 700 }).forEach(function(custFinTabRes) {

                // From Customer Record
                var cust_id = custFinTabRes.getValue({ name: 'internalid', summary: search.Summary.GROUP });
                var itemID = custFinTabRes.getValue({ name: 'pricingitem', summary: search.Summary.GROUP });
                // Service Type Array
                var servLineItem = servResult.filter(function(el) { if (el.packageID == itemID) { return el } })[0];
                if (isNullorEmpty(servLineItem)) {
                    return true;
                }
                // From Service Array
                var serv_type_id = servLineItem.serviceID;

                if (!isNullorEmpty(serv_type_id) && packResults.indexOf(cust_id) == -1) {

                    log.debug({
                        title: 'Service ID',
                        details: serv_type_id
                    })
                    log.debug({
                        title: 'Customer ID',
                        details: cust_id
                    });

                    var serv_ns_item = servLineItem.packageID;
                    var serv_name = servLineItem.name;

                    /**
                     *  Process:
                     *      Load Cusotmer Record Info. Get: (Skip Duplicate Customer IDs)
                     *          Item Price
                     *          Item ID
                     * 
                     *      Get Service Type ID from Service List
                     * 
                     *      Create New Service Record
                     *          Requirements:
                     *          Name
                     *          Service - Package
                     *          Price
                     *          Category
                     *          Customer ID
                     *          Zee
                     *          Netsuite Item
                     * 
                     *          Commencement
                     *          GST
                     *          Date Reviewed
                     * 
                     */

                    var zee_id = custFinTabRes.getValue({ name: 'partner', summary: search.Summary.GROUP });
                    var itemPricing = custFinTabRes.getValue({ name: 'itempricingunitprice', summary: search.Summary.GROUP });
                    var commReg = custFinTabRes.getValue({ name: 'internalid', join: 'CUSTRECORD_CUSTOMER', summary: search.Summary.GROUP });

                    // Service Record Info
                    var serv_price = itemPricing;
                    var serv_cat = 1;

                    // Create New Service
                    var serviceRec = record.create({ type: 'customrecord_service' });
                    serviceRec.setValue({ fieldId: 'name', value: serv_name }) // Service Name
                    serviceRec.setValue({ fieldId: 'custrecord_service', value: serv_type_id }) // Service Type ID
                    serviceRec.setValue({ fieldId: 'custrecord_service_price', value: serv_price }) // Service Price
                    serviceRec.setValue({ fieldId: 'custrecord_service_category', value: serv_cat }) // Category: Services
                    serviceRec.setValue({ fieldId: 'custrecord_service_customer', value: cust_id }) // Customer
                    serviceRec.setValue({ fieldId: 'custrecord_service_franchisee', value: zee_id }) // Franchisee
                    serviceRec.setValue({ fieldId: 'custrecord_service_ns_item', value: serv_ns_item }) // NetSuite Item
                    serviceRec.setValue({ fieldId: 'custrecord_service_gst', value: 1 }) // GST
                    var today = new Date();
                    serviceRec.setValue({ fieldId: 'custrecord_service_date_reviewed', value: today }) // Date Reviewed
                    serviceRec.setValue({ fieldId: 'custrecord_service_comm_reg', value: commReg }) // Comm Reg
                    serviceRec.save();

                    // Update Packaged Service Added Field under Customer
                    var custRec = record.load({ type: 'customer', id: cust_id })
                    if (custRec.getValue({ fieldId: 'custentity_spc_packg_serv_added' }) != true || custRec.getValue({ fieldId: 'custentity_spc_packg_serv_added' }) != 'T') {
                        custRec.setValue({ fieldId: "custentity_spc_packg_serv_added", value: true });
                        custRec.save();
                    }

                    log.debug({
                        title: "serviceRec: ID Set",
                        details: serviceRec,
                    });

                } else [
                    log.error({
                        title: 'Service ID Undefined or Customer Already Allocated Service',
                        details: serv_type_id + ' & ' + cust_id
                    })
                ]

                return true;
            });
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            execute: main
        }
    });