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

            log.debug({
                title: 'servResult',
                details: servResult
            });

            // Customer Info and Create Service Record
            var custFinTabSearch = search.load({ type: 'customer', id: 'customsearch_package_cust_fin_tab' });
            custFinTabSearch.run().getRange({ start: 0, end: 2 }).forEach(function(custFinTabRes) {
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
                 */

                var cust_id = custFinTabRes.getValue({ name: 'internalid', summary: search.Summary.GROUP });
                var zee_id = custFinTabRes.getValue({ name: 'partner', summary: search.Summary.GROUP });
                var itemPricing = custFinTabRes.getValue({ name: 'itempricingunitprice', summary: search.Summary.GROUP });
                var itemID = custFinTabRes.getValue({ name: 'pricingitem', summary: search.Summary.GROUP })
                log.debug({
                    title: 'itemID',
                    details: itemID
                })

                // Service Type Array
                var servLineItem = servResult.filter(function(el) { if (el.packageID == itemID) { return el } })[0];
                log.debug({
                    title: 'servLineItem',
                    details: servLineItem
                })

                // Service Record Info
                var serv_price = itemPricing;
                var serv_cat = 1;
                // From Service Array
                var serv_type_id = servLineItem.serviceID;
                var serv_ns_item = servLineItem.packageID;
                var serv_name = servLineItem.name;

                // Create New Service
                var serviceRec = record.create({ type: 'customrecord_service' });
                serviceRec.setValue({ fieldId: 'name', value: serv_name })
                serviceRec.setValue({ fieldId: 'custrecord_service', value: serv_type_id })
                serviceRec.setValue({ fieldId: 'custrecord_service_price', value: serv_price })
                serviceRec.setValue({ fieldId: 'custrecord_service_category', value: serv_cat })
                serviceRec.setValue({ fieldId: 'custrecord_service_customer', value: cust_id })
                serviceRec.setValue({ fieldId: 'custrecord_service_franchisee', value: zee_id })
                serviceRec.setValue({ fieldId: 'custrecord_service_ns_item', value: serv_ns_item })
                serviceRec.save();

                log.debug({
                    title: "serviceRec: ID?",
                    details: serviceRec,
                });

                log.debug({
                    title: 'End Result: Service ID',
                    details: serv_type_id
                })
                log.debug({
                    title: 'End Result: NetSuite ITEm',
                    details: serv_ns_item
                })

                return true;
            });
        }

        return {
            execute: main
        }
    });