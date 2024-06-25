/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript

 * Author:               Ankith Ravindran
 * Created on:           Tue Jun 25 2024
 * Modified on:          Tue Jun 25 2024 13:59:21
 * SuiteScript Version:  2.0 
 * Description:           
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
 */



define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format', 'N/https', 'N/email', 'N/url'],
    function (runtime, search, record, log, task, currentRecord, format, https, email, url) {
        var zee = 0;
        var role = runtime.getCurrentUser().role;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.envType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        function main() {

            var today = new Date();
            today.setHours(today.getHours() + 17);

            // NetSuite Search: Activate Services - From Quote to Signed
            var quoteServiceChangeSearch = search.load({
                id: 'customsearch8931',
                type: 'customrecord_service',
            });

            var count = quoteServiceChangeSearch.runPaged().count;

            log.debug({
                title: 'count',
                details: count
            });
            quoteServiceChangeSearch.run().each(function (searchResult) {

                var serviceInternalID = searchResult.getValue({
                    name: "internalid"
                });
                var commRegInternalID = searchResult.getValue({
                    name: "internalid",
                    join: "CUSTRECORD_SERVICE_COMM_REG",
                });
                var serviceChangeInternalID = searchResult.getValue({
                    name: "internalid",
                    join: "CUSTRECORD_SERVICECHG_SERVICE",
                });

                var serviceRecord = record.load({
                    type: 'customrecord_service',
                    id: serviceInternalID,
                });
                serviceRecord.setValue({
                    fieldId: 'isinactive',
                    value: false
                })
                serviceRecord.save({
                    ignoreMandatoryFields: true
                });


                var commRegRecord = record.load({
                    type: 'customrecord_commencement_register',
                    id: commRegInternalID,
                });
                commRegRecord.setValue({
                    fieldId: 'custrecord_trial_status',
                    value: 2
                })
                commRegRecord.save({
                    ignoreMandatoryFields: true
                });

                var serviceChangeRecord = record.load({
                    type: 'customrecord_servicechg',
                    id: serviceChangeInternalID,
                });
                serviceChangeRecord.setValue({
                    fieldId: 'custrecord_servicechg_status',
                    value: 2
                })
                serviceChangeRecord.save({
                    ignoreMandatoryFields: true
                });

                return true;
            });

        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            execute: main
        }
    }
);