/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * Author:               Ankith Ravindran
 * Created on:           Fri Apr 14 2023
 * Modified on:          Fri Apr 14 2023 11:23:16
 * SuiteScript Version:  2.0
 * Description:          Client script for the Service Change page to notify team memebrs about service changes like Cancellations/Price Changes/Frequency Changes and more. 
 *
 * Copyright (c) 2023 MailPlus Pty. Ltd.
 */


define(['N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/currentRecord', 'N/email'],
    function (runtime, search, url, record, format, currentRecord, email) { //require, factory
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        var ctx = runtime.getCurrentScript();

        var zee = 0;
        var role = runtime.getCurrentUser().role;

        var deleted_service_ids = [];
        var deleted_job_ids = [];

        if (role == 1000) {
            // Franchisee
            zee = runtime.getCurrentUser();
        } else if (role == 3) { //Administrator
            zee = 6; //test
        } else if (role == 1032) { // System Support
            zee = 425904; //test-AR
        }

        var customer_id = null;

        var service_change_delete = [];
        var comm_reg_delete = [];

        function init() {
            $(window).load(function () {
                // Animate loader off screen
                $(".se-pre-con").fadeOut("slow");
            });

            var app = angular.module('myApp', []);
            app.controller('myCtrl', function ($scope) {

            });

            $(document).on('change', '.input', function (e) {

                pdffile = document.getElementsByClassName("input");

                pdffile_url = URL.createObjectURL(pdffile[0].files[0]);
                $('#viewer').attr('src', pdffile_url);
            });
        }

        function readURL(input) {

            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#output').attr('src', e.target.result);
                }

                reader.readAsDataURL(input.files[0]);
            }
        }

        var item_array = new Array();
        var item_price_array = [];
        var item_price_count = 0;
        var item_count = 0;

        function showAlert(message) {
            $('#alert').html('<button type="button" class="close">&times;</button>' + message);
            $('#alert').show();
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0;

            $(document).on('click', '#alert .close', function (e) {
                $(this).parent().hide();
            });
        }

        function beforeLoad() {

        }

        function afterLoad() {

            $('.requester_header').removeClass('hide');
            $('.first_name_row').removeClass('hide');
            $('.last_name_row').removeClass('hide');
            $('.email_row').removeClass('hide');
            $('.position_role_row').removeClass('hide');
            $('.note_section').removeClass('hide');
            $('.service_change_header').removeClass('hide');
            $('.date_effective_section').removeClass('hide');
            $('.service_change_type_section').removeClass('hide');
            $('.send_to_section').removeClass('hide');
            // $('.surcharge_div').removeClass('hide');

            $('.loading_section').addClass('hide');
        }

        function pageInit() {
            // $('#alert').hide();
            $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
            $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
            $("#body").css("background-color", "#CFE0CE");
            $(".selectator_options").css("list-style-type", "none !important");
            $(".selectator_option_subtitle").css("font-size", "100% !important");
            $(".selectator_option_subtitle").css("color", "#103d39 !important");
            $(".uir-outside-fields-table").addClass('hide');
            $(".uir-outside-fields-table").css('margin-right', '0%');
            $(".uir-outside-fields-table").css('margin-left', '25%');

            // $('.cancel_reason_div').addClass('hide');
            // $('.cancel_notice_div').addClass('hide');
            // $('.cancel_comp_div').addClass('hide');
            $(".uir-outside-fields-table").addClass('hide');

            var scf_upload = document.getElementsByClassName('input');

            /**
             * Show the tabs content on click of a tab
             */
            $(".nav-tabs").on("click", "a", function (e) {
                $(this).tab('show');
            });

            for (var i = 0; i < scf_upload.length; i++) {
                scf_upload[i].className += " form-control";
            }

            $(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });

            var comm_typeid = $('#commencementtype option:selected').val();
            if (comm_typeid == 13 || comm_typeid == '13') {
                $('#send_to').val('belinda.urbani@mailplus.com.au');
                $(".uir-outside-fields-table").removeClass('hide');
            }

            $('#commencementtype').on('change', function () {
                if ($(this, 'option:selected').val() == 13 || $(this, 'option:selected').val() == '13') {
                    $('.cancel_reason_div').removeClass('hide');
                    $('.cancel_notice_div').removeClass('hide');
                    $('.cancel_comp_div').removeClass('hide');
                    $(".uir-outside-fields-table").removeClass('hide');
                    $('#send_to').val('belinda.urbani@mailplus.com.au');
                } else if ($(this, 'option:selected').val() == 21 || $(this, 'option:selected').val() == '21') {
                    $('.surcharge_div').removeClass('hide');
                } else {
                    $('.cancel_reason_div').addClass('hide');
                    $('.cancel_notice_div').addClass('hide');
                    $('.cancel_comp_div').addClass('hide');
                    $(".uir-outside-fields-table").addClass('hide');
                }

            });

            // AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');
            // $('.send_to').selectator({
            //     keepOpen: true,
            //     showAllOptionsOnFocus: true,
            //     selectFirstOptionOnSearch: false
            // });

            var scf_upload_field = document.getElementsByClassName('uir-field');

            for (var i = 0; i < scf_upload_field.length; i++) {
                scf_upload_field[i].setAttribute("style", "padding-left:15%;");
            }

            $('#upload_file_1_fs_lbl_uir_label').attr("style", "padding-left:15%;");

            var test_record = currentRecord.get();
            customer_id = parseInt(test_record.getValue({
                fieldId: 'custpage_customer_id'
            }));
            var customer_record = record.load({
                type: 'customer',
                id: customer_id
            });
            var zeeLocation = record.load({
                id: customer_record.getValue({
                    fieldId: 'partner'
                }),
                type: 'partner'
            });

            afterLoad();


        }


        /**
         * Converts the date string in the "invoice_date" table to the format of "date_selected".
         * @param   {String}    invoice_date    ex: '4/6/2020'
         * @returns {String}    date            ex: '2020-06-04'
         */
        function dateCreated2DateSelectedFormat(invoice_date) {
            // date_created = '4/6/2020'
            var date_array = invoice_date.split('/');
            // date_array = ["4", "6", "2020"]
            var year = date_array[2];
            var month = date_array[1];
            if (month < 10) {
                month = '0' + month;
            }
            var day = date_array[0];
            if (day < 10) {
                day = '0' + day;
            }
            return year + '-' + month + '-' + day;
        }

        /**
         * @param   {Number} x
         * @returns {String} The same number, formatted in Australian dollars.
         */
        function financial(x) {
            if (typeof (x) === 'string') {
                x = parseFloat(x);
            }
            if (isNullorEmpty(x)) {
                return "$0.00";
            } else {
                return x.toLocaleString('en-AU', {
                    style: 'currency',
                    currency: 'AUD'
                });
            }
        }
        /**
         * [AddJavascript description] - Add the JS to the postion specified in the page.
         * @param {[type]} jsname [description]
         * @param {[type]} pos    [description]
         */
        function AddJavascript(jsname, pos) {
            var tag = document.getElementsByTagName(pos)[0];
            var addScript = document.createElement('script');
            addScript.setAttribute('type', 'text/javascript');
            addScript.setAttribute('src', jsname);
            tag.appendChild(addScript);
        }


        /**
         * [AddStyle description] - Add the CSS to the position specified in the page
         * @param {[type]} cssLink [description]
         * @param {[type]} pos     [description]
         */
        function AddStyle(cssLink, pos) {
            var tag = document.getElementsByTagName(pos)[0];
            var addLink = document.createElement('link');
            addLink.setAttribute('type', 'text/css');
            addLink.setAttribute('rel', 'stylesheet');
            addLink.setAttribute('href', cssLink);
            tag.appendChild(addLink);
        }

        function stringToDate(val) {
            return format.parse({
                value: val,
                type: format.Type.DATE
            })
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal ==
                undefined || strVal == 'undefined' || strVal == '- None -');
        }

        /**
         * Load the result set of the invoices records linked to the customer.
         * @param   {String}                customer_id
         * @param   {String}                invoice_status
         * @return  {nlobjSearchResultSet}  invoicesResultSet
         */
        function loadInvoicesSearch(customer_id, invoice_status) {
            var invoicesResultSet;
            if (!isNullorEmpty(customer_id)) {
                var invoicesSearch = search.load({
                    id: 'customsearch_mp_ticket_invoices_datatabl',
                    type: search.Type.INVOICE
                });
                var invoicesFilterExpression = invoicesSearch.filterExpression;
                invoicesFilterExpression.push('AND');
                invoicesFilterExpression.push(['entity', search.Operator.IS,
                    customer_id
                ]);

                // Open Invoices
                if (invoice_status == 'open' || isNullorEmpty(invoice_status)) {
                    invoicesFilterExpression.push('AND', ["status", search.Operator.ANYOF,
                        "CustInvc:A"
                    ]); // Open Invoices
                } else if (invoice_status == 'paidInFull') {
                    invoicesFilterExpression.push('AND', ["status", search.Operator.ANYOF,
                        "CustInvc:B"
                    ]); // Paid in Full

                    var today_date = new Date();
                    var today_day = today_date.getDate();
                    var today_month = today_date.getMonth();
                    var today_year = today_date.getFullYear();
                    var date_3_months_ago = new Date(Date.UTC(today_year, today_month -
                        3, today_day));
                    var date_3_months_ago_string = formatDate(date_3_months_ago);
                    invoicesFilterExpression.push('AND', ["trandate", search.Operator.AFTER,
                        date_3_months_ago_string
                    ]);
                }

                invoicesSearch.filterExpression = invoicesFilterExpression;
                invoicesResultSet = invoicesSearch.run();

            }

            return invoicesResultSet;

        }

        function saveRecord() {
            var test_record = currentRecord.get();
            var customer = parseInt(test_record.getValue({
                fieldId: 'custpage_customer_id'
            }));

            var uploadFile = test_record.getValue({
                fieldId: 'upload_file_1'
            });

            console.log(uploadFile);

            var recCustomer = record.load({
                type: 'customer',
                id: customer
            });

            var partner = recCustomer.getValue({ fieldId: 'partner' });
            var customer_status = recCustomer.getValue({ fieldId: 'entitystatus' });



            var date_effective = $('#date_effective').val();
            var old_date_effective = $('#date_effective').attr('data-olddate');


            var comm_typeid = $('#commencementtype option:selected').val();
            var send_to = $('#send_to').val();

            console.log(send_to);
            // console.log($('#send_to').val());

            var firstName = $('#first_name').val();
            var lastName = $('#last_name').val();
            var email_address = $('#email').val();
            var phone = $('#phone').val();
            var position = $('#position').val();

            var alertMessage = '';

            console.log(alertMessage);

            if (isNullorEmpty(firstName)) {
                alertMessage += 'Please Enter First Name of Requester</br>';
                // return false;
            }
            console.log(alertMessage);
            if (isNullorEmpty(email_address)) {
                alertMessage += 'Please Enter email of Requester</br>';
                // return false;
            }
            console.log(alertMessage);
            if (isNullorEmpty(phone)) {
                alertMessage += 'Please enter phone of requester';
                // return false;
            }
            console.log(alertMessage);
            var saveDateEffective = null;
            if (isNullorEmpty(date_effective)) {
                alertMessage += 'Please Enter the Date Effective</br>';
                return false;
            } else {
                var resultDate = dateEffectiveCheck(date_effective);

                if (resultDate == false) {
                    alertMessage += 'Entered Date Effective should be greater than today</br>';
                    // return false;
                }
                var splitDate = date_effective.split('-');
                var dateEffective = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
                var dateEffectiveValue = date_effective;
                saveDateEffective = new Date(dateEffectiveValue);
                saveDateEffective = format.parse({ value: saveDateEffective, type: format.Type.DATE });
                var dateEffectiveValueArray = dateEffectiveValue.split('-');
                var dateEffectiveString = dateEffectiveValueArray[2] + '/' + dateEffectiveValueArray[1] + '/' + dateEffectiveValueArray[0];
                formatDate(dateEffectiveString)
            }
            console.log(alertMessage);
            if (isNullorEmpty(comm_typeid)) {
                alertMessage += 'Please Select Sale Type</br>';
                // return false;
            } else if (comm_typeid == 13 || comm_typeid == '13') {
                // if (isNullorEmpty($('#cancel_reason option:selected').val())) {
                //     alertMessage += 'Please Select Cancellation Reason</br>';
                //     // return false;
                // }
                // if (isNullorEmpty($('#cancel_notice option:selected').val())) {
                //     alertMessage += 'Please Select Cancellation Notice</br>';
                //     // return false;
                // }
            }
            console.log(alertMessage);
            if (isNullorEmpty(send_to)) {
                alertMessage += 'Please Select who needs to be Notified</br>';
                // return false;
            }
            console.log(alertMessage);
            // if (isNullorEmpty(uploadFile)) {
            //     alertMessage += 'Please Upload PDF of the cancellation email. </br>';
            //     // return false;
            // }
            console.log(alertMessage);


            if (alertMessage != '') {
                showAlert(alertMessage);
                return false;
            }

            if (comm_typeid == 13 || comm_typeid == '13') {
                var emailSubject = 'Service Cancellation Requested - ' + recCustomer.getValue({
                    fieldId: 'entityid'
                }) + ' ' + recCustomer.getValue({
                    fieldId: 'companyname'
                });

            } else if (comm_typeid == 21 || comm_typeid == '21') {
                var emailSubject = 'Service Surcharge Enquiry - ' + recCustomer.getValue({
                    fieldId: 'entityid'
                }) + ' ' + recCustomer.getValue({
                    fieldId: 'companyname'
                });
            } else {
                var emailSubject = 'Service Change Notification - ' + recCustomer.getValue({
                    fieldId: 'entityid'
                }) + ' ' + recCustomer.getValue({
                    fieldId: 'companyname'
                });

            }



            var emailBody = 'Customer Name: ' + recCustomer.getValue({
                fieldId: 'entityid'
            }) + ' ' + recCustomer.getValue({
                fieldId: 'companyname'
            });
            emailBody += '</br></br><u>Requester Details:</u>' + '</br>';
            emailBody += 'Name: ' + firstName + ' ' + lastName + '</br>';
            emailBody += 'Email: ' + email_address + '</br>';
            emailBody += 'Phone: ' + phone + '</br>';
            if (!isNullorEmpty(position)) {
                emailBody += 'Position: ' + position + '</br></br>';
            }

            if (comm_typeid == 21 || comm_typeid == '21') {
                if (!isNullorEmpty($('#new_surcharge').val())) { 
                    emailBody += 'New Surcharge Rate requested by customer. </br>New Surcharge: ' + $('#new_surcharge').val();
                }
            }

            emailBody += '</br></br>Notes: </br>' + $('#note').val();

            emailBody += '</br></br>Please click the below link to view the list of customers that have requested cancellation. </br><a href="https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1719&script=1719&deploy=1&deploy=1&compid=1048144"><b>Cancellation Request - Customer List</b></a>';

            if (!isNullorEmpty($('#note').val())) {
                var noteBody = $('#note').val().replace(new RegExp('</br>', 'g'), '\n');
            } else {
                var noteBody = '';
            }


            // test_record.setValue({
            //     fieldId: 'custpage_note',
            //     value: noteBody
            // });

            test_record.setValue({
                fieldId: 'custpage_email_body',
                value: emailBody
            });

            test_record.setValue({
                fieldId: 'custpage_email_subject',
                value: emailSubject
            });


            test_record.setValue({
                fieldId: 'custpage_send_to',
                value: send_to
            });
            test_record.setValue({
                fieldId: 'custpage_sale_type',
                value: comm_typeid
            });
            // 

            if (comm_typeid == 13 || comm_typeid == '13') {
                var customer_record = record.load({
                    type: record.Type.CUSTOMER,
                    id: parseInt(customer),
                    isDynamic: true
                });

                customer_record.setValue({
                    fieldId: 'custentity_hc_mailcon_name',
                    value: firstName + ' ' + lastName
                });

                customer_record.setValue({
                    fieldId: 'custentity_hc_mailcon_phone',
                    value: phone
                });

                customer_record.setValue({
                    fieldId: 'custentity_hc_mailcon_email',
                    value: email_address
                });



                customer_record.setValue({
                    fieldId: 'custentity_cancellation_requested',
                    value: 1
                });

                customer_record.setValue({
                    fieldId: 'custentity_cancellation_requested_date',
                    value: getDateStoreNS()
                });

                customer_record.setValue({
                    fieldId: 'custentity13',
                    value: saveDateEffective
                });

                customer_record.setValue({
                    fieldId: 'custentity_service_cancellation_notice',
                    value: $('#cancel_notice option:selected').val(),
                });

                customer_record.setValue({
                    fieldId: 'custentity_service_cancellation_reason',
                    value: $('#cancel_reason option:selected').val(),
                });

                customer_record.setValue({
                    fieldId: 'custentity14',
                    value: $('#cancel_comp option:selected').val(),
                });

                customer_record.save();
            } else if (comm_typeid == 21 || comm_typeid == '21') {
                if (!isNullorEmpty($('#new_surcharge').val())) {
                    var customer_record = record.load({
                        type: record.Type.CUSTOMER,
                        id: parseInt(customer),
                        isDynamic: true
                    });

                    customer_record.setValue({
                        fieldId: 'custentity_old_surcharge_rate',
                        value: $('#new_surcharge').val(),
                    });

                    customer_record.save();
                }

            }

            console.log(emailSubject);
            console.log(emailBody);
            email.send({
                author: 112209,
                recipients: [send_to],
                subject: emailSubject,
                body: emailBody,
                cc: ['luke.forbes@mailplus.com.au', runtime.getCurrentUser().email]
            });



            return true;
        }

        function getDateStoreNS() {
            var date = new Date();
            // if (date.getHours() > 6) {
            //     date.setDate(date.getDate() + 1);
            // }

            format.format({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            })

            return date;
        }

        function formatDate(testDate) {
            console.log('testDate: ' + testDate);
            var responseDate = format.format({
                value: testDate,
                type: format.Type.DATE
            });
            console.log('responseDate: ' + responseDate);
            return responseDate;
        }

        function onclick_back() {
            var test_record = currentRecord.get();
            var customer = parseInt(test_record.getValue({
                fieldId: 'custpage_customer_id'
            }));
            var sales_record = test_record.getValue({
                fieldId: 'custpage_salesrecordid'
            });

            var upload_url = baseURL + '/app/common/entity/custjob.nl?id=' + customer;
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
        }

        function onclick_reset() {
            var test_record = currentRecord.get();
            var customer = parseInt(test_record.getValue({
                fieldId: 'custpage_customer_id'
            }));
            var sales_record = test_record.getValue({
                fieldId: 'custpage_salesrecordid'
            });

            var upload_url = 'https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1717&deploy=1&compid=1048144&custid=' + customer;
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
        }

        function AddJavascript(jsname, pos) {
            var tag = document.getElementsByTagName(pos)[0];
            var addScript = document.createElement('script');
            addScript.setAttribute('type', 'text/javascript');
            addScript.setAttribute('src', jsname);
            tag.appendChild(addScript);
        }

        function AddStyle(cssLink, pos) {
            var tag = document.getElementsByTagName(pos)[0];
            var addLink = document.createElement('link');
            addLink.setAttribute('type', 'text/css');
            addLink.setAttribute('rel', 'stylesheet');
            addLink.setAttribute('href', cssLink);
            tag.appendChild(addLink);
        }

        function GetFormattedDate(stringDate) {
            var todayDate = nlapiStringToDate(stringDate);
            var month = pad(todayDate.getMonth() + 1);
            var day = pad(todayDate.getDate());
            var year = (todayDate.getFullYear());
            return year + "-" + month + "-" + day;
        }

        function pad(s) {
            return (s < 10) ? '0' + s : s;
        }

        function dateEffectiveCheck(dateEffective) {
            var date = new Date(dateEffective);

            var today = new Date();

            if (date <= today) {
                return false;
            } else {
                return true;
            }
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

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_back: onclick_back,
            onclick_reset: onclick_reset
        };
    });