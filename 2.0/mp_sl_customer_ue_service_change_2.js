/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * Author:               Ankith Ravindran
 * Created on:           Fri Apr 11 2023
 * Modified on:          Fri Apr 14 2023 11:18:57
 * SuiteScript Version:  2.0
 * Description:          Service Change page to notify team memebrs about service changes like Cancellations/Price Changes/Frequency Changes and more.
 *
 * Copyright (c) 2023 MailPlus Pty. Ltd.
 */

define(['N/ui/serverWidget', 'N/runtime', 'N/search', 'N/record', 'N/log', 'N/redirect', 'N/error', 'N/currentRecord', 'N/file', 'N/http', 'N/email', 'N/format'],
    function (ui, runtime, search, record, log, redirect, error, currentRecord, file, http, email, format) {
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }

        role = runtime.getCurrentUser().role;

        if (role == 1000) {
            zee = runtime.getCurrentUser().id;
        } else if (role == 3) { //Administrator
            zee = 6; //test
        } else if (role == 1032) { // System Support
            zee = 425904; //test-AR
        }

        function onRequest(context) {
            var type = 'create';

            if (context.request.method === 'GET') {
                var customer_id = null;
                var ticket_id = null;
                var customer_record;
                var entityid;
                var companyName = '';
                var abn = '';
                var zeeText = '';
                var accounts_email = '';
                var accounts_phone = '';
                var daytodayemail = '';
                var daytodayphone = '';
                var ap_mail_parcel = '';
                var ap_outlet = '';
                var lpo_customer = '';
                var customer_status = '';
                var customer_status_id = '';
                var lead_source = '';
                var lead_source_text = '';
                var old_zee = '';
                var old_zee_text = '';
                var old_customer = '';
                var customer_industry = '';
                var multisite = '';
                var website = '';
                var pricing_notes = '';
                var zee_visit_notes = '';
                var zee_visit = '';
                var savedNoteSearch = null;
                var ampo_price;
                var ampo_time;
                var pmpo_price;
                var pmpo_time;
                var maap_bank_account_number = null;
                var maap_parent_bank_account_number = null;
                var franchisee_name = '';
                var zee_main_contact_name = '';
                var zee_email = '';
                var zee_main_contact_phone = '';
                var zee_abn = '';
                var selector_type = 'invoice_number';
                var selected_invoice_method_id = null;
                var accounts_cc_email = '';
                var mpex_po_number = '';
                var customer_po_number = '';
                var terms = null;
                var customer_terms = '';
                var selected_invoice_cycle_id = null;
                var status_value = null;
                var account_manager = null;

                type = context.request.parameters.type;
                customer_id = context.request.parameters.custid;

                var recCustomer = record.load({
                    type: 'customer',
                    id: customer_id
                });

                var customer_status = recCustomer.getValue({ fieldId: 'entitystatus' });

                entityid = recCustomer.getValue({
                    fieldId: 'entityid'
                });

                companyname = recCustomer.getValue({
                    fieldId: 'companyname'
                });

                zee = recCustomer.getValue({
                    fieldId: 'partner'
                });

                var form = ui.createForm({
                    title: 'Service Change Notification: <a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + customer_id + '">' + entityid + '</a> ' + companyname
                });

                var customer_record = record.load({
                    type: record.Type.CUSTOMER,
                    id: customer_id,
                    isDynamic: true
                });
                var zee_id = customer_record.getValue({
                    fieldId: 'partner'
                });

                if (!isNullorEmpty(zee_id)) {
                    var zeeRecord = record.load({
                        type: record.Type.PARTNER,
                        id: zee_id,
                        isDynamic: true
                    });
                    var franchisee_name = zeeRecord.getValue({
                        fieldId: 'companyname'
                    });

                    zee_main_contact_name = zeeRecord.getValue({
                        fieldId: 'custentity3'
                    });
                    zee_email = zeeRecord.getValue({
                        fieldId: 'email'
                    });
                    zee_main_contact_phone = zeeRecord.getValue({
                        fieldId: 'custentity2'
                    });
                    zee_abn = zeeRecord.getValue({
                        fieldId: 'custentity_abn_franchiserecord'
                    });
                }
                //Customer Status
                customer_status_id = customer_record.getValue({
                    fieldId: 'entitystatus'
                });

                // Customer ID
                entityid = customer_record.getValue({
                    fieldId: 'entityid'
                });

                // Customer Name
                companyName = customer_record.getValue({
                    fieldId: 'companyname'
                });

                // Customer ABN
                abn = customer_record.getValue({
                    fieldId: 'vatregnumber'
                });

                if (isNullorEmpty(abn)) {
                    abn = '';
                }

                // Customer Franchisee ID
                zee = customer_record.getValue({
                    fieldId: 'partner'
                });

                // Customer Franchisee Text
                zeeText = customer_record.getText({
                    fieldId: 'partner'
                });

                // Customer Accounts Email
                accounts_email = customer_record.getValue({
                    fieldId: 'email'
                });

                if (isNullorEmpty(accounts_email)) {
                    accounts_email = '';
                }

                // Customer Accounts Phone
                accounts_phone = customer_record.getValue({
                    fieldId: 'altphone'
                });

                if (isNullorEmpty(accounts_phone)) {
                    accounts_phone = '';
                }

                // Customer Day-to-day Email
                daytodayemail = customer_record.getValue({
                    fieldId: 'custentity_email_service'
                });

                if (isNullorEmpty(daytodayemail)) {
                    daytodayemail = '';
                }

                // Customer Day-to-day Phone
                daytodayphone = customer_record.getValue({
                    fieldId: 'phone'
                });

                if (isNullorEmpty(daytodayphone)) {
                    daytodayphone = '';
                }

                // Customer Using AusPost for Mail & Parcel
                ap_mail_parcel = customer_record.getValue({
                    fieldId: 'custentity_ap_mail_parcel'
                });

                // Customer Using Express Post
                using_express_post = customer_record.getValue({
                    fieldId: 'custentity_customer_express_post'
                })

                // Customer Using Local Couriers
                using_local_couriers = customer_record.getValue({
                    fieldId: 'custentity_customer_local_couriers'
                })

                // Customer Using PO Box
                using_po_box = customer_record.getValue({
                    fieldId: 'custentity_customer_po_box'
                })

                // Customer Bank Visit
                bank_visit = customer_record.getValue({
                    fieldId: 'custentity_customer_bank_visit'
                })

                // Customer Using AusPost Outlet
                ap_outlet = customer_record.getValue({
                    fieldId: 'custentity_ap_outlet'
                });

                // Customer AusPost LPO Customer
                lpo_customer = customer_record.getValue({
                    fieldId: 'custentity_ap_lpo_customer'
                });

                // Customer Lead Type
                classify_lead = customer_record.getValue({
                    fieldId: 'custentity_lead_type'
                })

                // Customer Status Text
                customer_status = customer_record.getText({
                    fieldId: 'entitystatus'
                });

                // Customer Status ID
                customer_status_id = customer_record.getValue({
                    fieldId: 'entitystatus'
                });

                // Customer Lead Source ID
                lead_source = customer_record.getValue({
                    fieldId: 'leadsource'
                });

                /// Customer Lead Source Text
                lead_source_text = customer_record.getValue({
                    fieldId: 'leadsource'
                });

                // Customer Old Franchisee ID
                old_zee = customer_record.getValue({
                    fieldId: 'custentity_old_zee'
                });

                // Customer Old Franchisee Text
                old_zee_text = customer_record.getText({
                    fieldId: 'custentity_old_zee'
                })

                // Old Customer ID
                old_customer = customer_record.getValue({
                    fieldId: 'custentity_old_customer'
                })

                // Customer Category
                customer_industry = customer_record.getValue({
                    fieldId: 'custentity_industry_category'
                });

                // Customer Multisite
                multisite = customer_record.getValue({
                    fieldId: 'custentity_category_multisite'
                });

                // Customer Pricing Notes
                pricing_notes = customer_record.getValue({
                    fieldId: 'custentity_customer_pricing_notes'
                });

                // Customer Franchisee Visit Memo
                zee_visit_notes = customer_record.getValue({
                    fieldId: 'custentity_mp_toll_zeevisit_memo'
                });

                //Customer Visited by Franchisee
                zee_visit = customer_record.getValue({
                    fieldId: 'custentity_mp_toll_zeevisit'
                });

                // Customer AMPO Price
                ampo_price = customer_record.getValue({
                    fieldId: 'custentity_ampo_service_price'
                });

                // Customer AMPO Time
                ampo_time = customer_record.getValue({
                    fieldId: 'custentity_ampo_service_time'
                });

                // Customer PMPO Price
                pmpo_price = customer_record.getValue({
                    fieldId: 'custentity_pmpo_service_price'
                });

                // Customer PMPO Time
                pmpo_time = customer_record.getValue({
                    fieldId: 'custentity_pmpo_service_time'
                });

                /**
                 * MPEX SECTION
                 */

                // Customer Min DL Float
                min_dl = customer_record.getValue({
                    fieldId: 'custentity_mpex_dl_float'
                });

                // Customer Min B4 Float
                min_b4 = customer_record.getValue({
                    fieldId: 'custentity_mpex_b4_float'
                });

                // Customer Min C5 Float
                min_c5 = customer_record.getValue({
                    fieldId: 'custentity_mpex_c5_float'
                });

                // Customer Min 1Kg Float
                min_1kg = customer_record.getValue({
                    fieldId: 'custentity_mpex_1kg_float'
                });

                // Customer Min 3kg Float
                min_3kg = customer_record.getValue({
                    fieldId: 'custentity_mpex_3kg_float'
                });

                // Customer Min 5Kg Float
                min_5kg = customer_record.getValue({
                    fieldId: 'custentity_mpex_5kg_float'
                });

                // Customer Total 1Kg Stock at customer location
                total_1kg = customer_record.getValue({
                    fieldId: 'custentity_mpen'
                });

                // Customer Total 3Kg Stock at customer location
                total_3kg = customer_record.getValue({
                    fieldId: 'custentity_mpet'
                });

                // Customer Total 5Kg Stock at customer location
                total_5kg = customer_record.getValue({
                    fieldId: 'custentity_mpef'
                });

                // Customer Total B4 Stock at customer location
                total_b4 = customer_record.getValue({
                    fieldId: 'custentity_mpeb'
                });

                // Customer Total C5 Stock at customer location
                total_c5 = customer_record.getValue({
                    fieldId: 'custentity_mpec'
                });

                //Customer Total DL Stock at customer location
                total_dl = customer_record.getValue({
                    fieldId: 'custentity_mped'
                });

                // Customer Franchisee Notified
                mpex_drop_notified = customer_record.getValue({
                    fieldId: 'custentity_mpex_drop_notified'
                });

                var mpex_1kg = customer_record.getText({
                    fieldId: 'custentity_mpex_1kg_price_point'
                });

                var mpex_3kg = customer_record.getText({
                    fieldId: 'custentity_mpex_3kg_price_point'
                });

                var mpex_5kg = customer_record.getText({
                    fieldId: 'custentity_mpex_5kg_price_point'
                });

                var mpex_500g = customer_record.getText({
                    fieldId: 'custentity_mpex_500g_price_point'
                });

                var mpex_b4 = customer_record.getText({
                    fieldId: 'custentity_mpex_b4_price_point'
                });

                var mpex_c5 = customer_record.getText({
                    fieldId: 'custentity_mpex_c5_price_point'
                });

                var mpex_dl = customer_record.getText({
                    fieldId: 'custentity_mpex_dl_price_point'
                });

                var mpex_1kg_new = customer_record.getValue({
                    fieldId: 'custentity_mpex_1kg_price_point_new'
                });

                var mpex_3kg_new = customer_record.getValue({
                    fieldId: 'custentity_mpex_3kg_price_point_new'
                });

                var mpex_5kg_new = customer_record.getValue({
                    fieldId: 'custentity_mpex_5kg_price_point_new'
                });

                var mpex_500g_new = customer_record.getValue({
                    fieldId: 'custentity_mpex_500g_price_point_new'
                });

                var mpex_b4_new = customer_record.getValue({
                    fieldId: 'custentity_mpex_b4_price_point_new'
                });

                var mpex_c5_new = customer_record.getValue({
                    fieldId: 'custentity_mpex_c5_price_point_new'
                });

                var mpex_dl_new = customer_record.getValue({
                    fieldId: 'custentity_mpex_dl_price_point_new'
                });

                var mpex_start_date = customer_record.getValue({
                    fieldId: 'custentity_mpex_price_point_start_date'
                });
                var mpex_customer = customer_record.getValue({
                    fieldId: 'custentity_mpex_customer'
                });
                var expected_usage = customer_record.getValue({
                    fieldId: 'custentity_exp_mpex_weekly_usage'
                });

                var expected_usage_per_week = customer_record.getValue({
                    fieldId: 'custentity_form_mpex_usage_per_week'
                });

                var expected_usage_per_week_text = customer_record.getText({
                    fieldId: 'custentity_form_mpex_usage_per_week'
                });

                //If empty, set field to 0
                if (isNullorEmpty(min_dl)) {
                    min_dl = 0
                }
                if (isNullorEmpty(min_b4)) {
                    min_b4 = 0
                }
                if (isNullorEmpty(min_c5)) {
                    min_c5 = 0
                }
                if (isNullorEmpty(min_1kg)) {
                    min_1kg = 0
                }
                if (isNullorEmpty(min_3kg)) {
                    min_3kg = 0
                }
                if (isNullorEmpty(min_5kg)) {
                    min_5kg = 0
                }

                if (isNullorEmpty(total_dl)) {
                    total_dl = 0
                }
                if (isNullorEmpty(total_b4)) {
                    total_b4 = 0
                }
                if (isNullorEmpty(total_c5)) {
                    total_c5 = 0
                }
                if (isNullorEmpty(total_1kg)) {
                    total_1kg = 0
                }
                if (isNullorEmpty(total_3kg)) {
                    total_3kg = 0
                }
                if (isNullorEmpty(total_5kg)) {
                    total_5kg = 0
                }

                if (multisite) {
                    multisite = 1;
                } else {
                    multisite = 2;
                }

                if (zee_visit) {
                    zee_visit = 1;
                } else {
                    zee_visit = 2;
                }

                if (isNullorEmpty(ampo_price)) {
                    ampo_price = '';
                }

                if (isNullorEmpty(pmpo_price)) {
                    pmpo_price = '';
                }

                maap_bank_account_number = customer_record.getValue({
                    fieldId: 'custentity_maap_bankacctno'
                });

                maap_parent_bank_account_number = customer_record.getValue({
                    fieldId: 'custentity_maap_bankacctno_parent'
                });

                selected_invoice_method_id = customer_record.getValue({
                    fieldId: 'custentity_invoice_method'
                });

                accounts_cc_email = customer_record.getValue({
                    fieldId: 'custentity_accounts_cc_email'
                });
                mpex_po_number = customer_record.getValue({
                    fieldId: 'custentity_mpex_po'
                });
                customer_po_number = customer_record.getValue({
                    fieldId: 'custentity11'
                });

                selected_invoice_cycle_id = customer_record.getValue({
                    fieldId: 'custentity_mpex_invoicing_cycle'
                });

                terms = customer_record.getValue({
                    fieldId: 'terms'
                });
                customer_terms = customer_record.getValue({
                    fieldId: 'custentity_finance_terms'
                });

                /**
                 * Description = To get all the user note searches associated with this custoemr
                 * NetSuite Search: User Note Search
                 */
                website = customer_record.getValue({
                    fieldId: 'custentity_category_multisite_link'
                });

                account_manager = customer_record.getValue({
                    fieldId: 'custentity_mp_toll_salesrep'
                });

                var savedNoteSearch = search.load({
                    id: 'customsearch_user_note',
                    type: 'note'
                });

                savedNoteSearch.filters.push(search.createFilter({
                    name: 'internalid',
                    join: 'CUSTOMER',
                    operator: search.Operator.IS,
                    values: customer_id
                }));

                var resultSet_note = savedNoteSearch.run();

                /**
                 * Description - To get all the services associated with this customer
                 * NetSuite Search: SALESP - Services
                 */

                var serviceSearch = search.load({
                    id: 'customsearch_salesp_services',
                    type: 'customrecord_service'
                });

                serviceSearch.filters.push(search.createFilter({
                    name: 'custrecord_service_customer',
                    operator: search.Operator.IS,
                    values: customer_id
                }));

                var resultSet_service = serviceSearch.run();

                var serviceResult = resultSet_service.getRange({
                    start: 0,
                    end: 1
                });

                var resultSet_service_change = null;
                var resultServiceChange = [];

                /**
                 * Description - To get all the service changes
                 * NetSuite Search: SALESP - Service Change
                 * CHECK THIS ONE!!! --> 2 filters?? && check the get range fn is = to get results
                 */

                var searched_service_change = search.load({
                    id: 'customsearch_salesp_service_chg',
                    type: 'customrecord_servicechg'
                });

                searched_service_change.filters.push(search.createFilter({
                    name: 'custrecord_service_customer',
                    join: 'CUSTRECORD_SERVICECHG_SERVICE',
                    operator: search.Operator.IS,
                    values: customer_id
                }));

                searched_service_change.filters.push(search.createFilter({
                    name: 'custrecord_servicechg_status',
                    operator: search.Operator.NONEOF,
                    values: [2, 3]
                }));

                resultSet_service_change = searched_service_change.run();
                resultServiceChange = resultSet_service_change.getRange({
                    start: 0,
                    end: 1
                })

                /**
                 * Description - To add all the API's to the begining of the page
                 */

                var inlineHtml =
                    '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml +=
                    '<div class="container" style="padding-top: 3%;"><div id="alert" class="alert alert-danger fade in"></div></div>';

                // Load DataTables
                inlineHtml +=
                    '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml +=
                    '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

                inlineHtml +=
                    '<div class="form-group container open_invoices requester_header">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12 heading2">';
                inlineHtml +=
                    '<h4><span class="label label-default col-xs-12" style="background-color: #095c7b;">REQUESTER DETAILS</span></h4>';
                inlineHtml += '</div></div></div>';


                inlineHtml += '<div class="form-group container row_salutation ">';
                inlineHtml += '<div class="row">'

                inlineHtml += '<div class="col-xs-12 first_name_section"><div class="input-group"><span class="input-group-addon">FIRST NAME <span class="mandatory" style="color:red">*</span></span><input type="text" id="first_name" class="form-control " /></div></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                inlineHtml += '<div class="form-group container row_salutation ">';
                inlineHtml += '<div class="row">'
                inlineHtml += '<div class="col-xs-12 last_name_section"><div class="input-group"><span class="input-group-addon">LAST NAME</span><input type="text" id="last_name" class="form-control" /></div></div>';

                inlineHtml += '</div>';
                inlineHtml += '</div>';

                inlineHtml += '<div class="form-group container row_details ">';
                inlineHtml += '<div class="row">'

                inlineHtml += '<div class="col-xs-12 email_section"><div class="input-group"><span class="input-group-addon">EMAIL <span class="mandatory" style="color:red">*</span></span><input type="email" id="email" class="form-control " /></div></div>';

                inlineHtml += '</div>';
                inlineHtml += '</div>';

                inlineHtml += '<div class="form-group container row_category ">';
                inlineHtml += '<div class="row">'

                inlineHtml += '<div class="col-xs-6 position_section"><div class="input-group"><span class="input-group-addon">POSITION</span><input type="text" id="position" class="form-control " /></div></div>';
                inlineHtml += '<div class="col-xs-6 phone_section"><div class="input-group"><span class="input-group-addon">PHONE <span class="mandatory" style="color:red">*</span></span><input type="number" id="phone" class="form-control " /></div></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                inlineHtml += '<div class="form-group container note_section">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12 note"><div class="input-group"><span class="input-group-addon" id="note_text">NOTE </span><textarea id="note" class="form-control note" rows="4" cols="50"  /></textarea></div></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                form.addField({
                    id: 'upload_file_1',
                    label: 'SERVICE CHANGE PDF UPLOAD',
                    type: ui.FieldType.FILE
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.OUTSIDEBELOW
                }).isMandatory = true;

                inlineHtml +=
                    '<div class="form-group container open_invoices requester_header">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12 heading2">';
                inlineHtml +=
                    '<h4><span class="label label-default col-xs-12" style="background-color: #095c7b;">SERVICE CHANGE DETAILS</span></h4>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';


                inlineHtml += '<div class="form-group container date_effective_section">';
                inlineHtml += '<div class="row">';

                inlineHtml += '<div class="col-xs-12 "><div class="input-group"><span class="input-group-addon">DATE EFFECTIVE <span class="mandatory" style="color:red">*</span></span><input type="date" id="date_effective" value="" class="form-control date_effective"/></div></div>';

                inlineHtml += '</div>';
                inlineHtml += '</div>';

                inlineHtml += '<div class="form-group container service_change_type_section ">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12 commencementtype"><div class="input-group"><span class="input-group-addon" id="commencementtype_text">SALE TYPE <span class="mandatory" style="color:red">*</span></span><select id="commencementtype" class="form-control commencementtype" ><option></option>';

                var results = search.create({
                    type: 'customlist_sale_type',
                    columns: [{
                        name: 'name'
                    }, {
                        name: 'internalId'
                    }]
                });
                var resResult = results.run().getRange({
                    start: 0,
                    end: 20
                });
                resResult.forEach(function (res) {
                    var listValue = res.getValue({ name: 'name' });
                    var listID = res.getValue({ name: 'internalId' });
                    if (listID == 13) {
                        inlineHtml += '<option value="' + listID + '" selected>' + listValue + '</option>';
                    }
                    
                });

                inlineHtml += '</select></div></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                inlineHtml += '<div class="form-group container cancel_reason_div ">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-4 cancel_reason"><div class="input-group"><span class="input-group-addon" id="cancel_reason_text">CANCELATION REASON <span class="mandatory" style="color:red">*</span></span><select id="cancel_reason" class="form-control cancel_reason" ><option></option>';

                var industry_search = search.create({
                    type: 'customlist58',
                    columns: [{
                        name: 'name'
                    }, {
                        name: 'internalId'
                    }],
                    filters: ['isinactive', 'is', 'false']
                });


                industry_search.run().each(function (searchResult) {

                    var listValue = searchResult.getValue('name');
                    var listID = searchResult.getValue('internalId');
                    inlineHtml += '<option value="' + listID + '">' + listValue + '</option>';

                    return true;
                });
                inlineHtml += '</select></div></div>';

                inlineHtml += '<div class="col-xs-4 cancel_notice"><div class="input-group"><span class="input-group-addon" id="cancel_notice_text">CANCELATION NOTICE <span class="mandatory" style="color:red">*</span></span><select id="cancel_notice" class="form-control cancel_notice" ><option></option>';

                var industry_search = search.create({
                    type: 'customlist_cancellation_notice',
                    columns: [{
                        name: 'name'
                    }, {
                        name: 'internalId'
                    }],
                    filters: ['isinactive', 'is', 'false']
                });

                industry_search.run().each(function (searchResult) {

                    var listValue = searchResult.getValue('name');
                    var listID = searchResult.getValue('internalId');
                    inlineHtml += '<option value="' + listID + '">' + listValue + '</option>';

                    return true;
                });
                inlineHtml += '</select></div></div>';

                inlineHtml += '<div class="col-xs-4 cancel_comp"><div class="input-group"><span class="input-group-addon" id="cancel_comp_text">CANCELLATION COMPETITOR</span><select id="cancel_comp" class="form-control cancel_comp" ><option></option>';

                var industry_search = search.create({
                    type: 'customlist33',
                    columns: [{
                        name: 'name'
                    }, {
                        name: 'internalId'
                    }],
                    filters: ['isinactive', 'is', 'false']
                });

                industry_search.run().each(function (searchResult) {

                    var listValue = searchResult.getValue('name');
                    var listID = searchResult.getValue('internalId');
                    inlineHtml += '<option value="' + listID + '">' + listValue + '</option>';

                    return true;
                });
                inlineHtml += '</select></div></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';


                inlineHtml += '<div class="form-group container send_to_section ">';
                inlineHtml += '<div class="row">'
                inlineHtml += '<div class="col-xs-12 send_to_section"><div class="input-group"><span class="input-group-addon">NOTIFY <span class="mandatory" style="color:red">*</span></span><select class="form-control send_to" id="send_to"><option></option>';

                var searchedActiveEmployees = search.load({
                    id: 'customsearch_active_employees',
                    type: 'employee'
                });
                var resultSetActiveEmployees = searchedActiveEmployees.run();
                resultSetActiveEmployees.each(function (searchResultActiveEmployees) {
                    var id = searchResultActiveEmployees.getValue({ name: 'internalid' });
                    var firstName = searchResultActiveEmployees.getValue({ name: 'firstname' });
                    var lastName = searchResultActiveEmployees.getValue({ name: 'lastname' });
                    var email = searchResultActiveEmployees.getValue({ name: 'email' });
                    var title = searchResultActiveEmployees.getValue({ name: 'title' });
                    inlineHtml += '<option value="' + email + '" >' + firstName + ' ' + lastName + '</option>';
                    return true;
                });

                inlineHtml += '</select></div></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                inlineHtml += '</div>';
                inlineHtml += '</div>';

                // inlineHtml += openInvoicesSection(ticket_id, selector_type);
                // inlineHtml +=
                //     '<div class="container"><div class="tabs" style="font-size: xx-small;"><ul class="nav nav-tabs nav-justified" style="padding-top: 3%;border-bottom: 1px solid white;">';
                // var tab_content = '';
                // inlineHtml +=
                //     '<li role="presentation" class="active"><a href="#services"><b>SERVICES / PRICING NOTES</b></a></li>';
                // inlineHtml +=
                //     '<li role="presentation" class=""><a href="#mpex"><b>MP EXPRESS & STANDARD</b></a></li>';

                // //If User Role is not Franchisee
                // if (role != 1000) {
                //     inlineHtml +=
                //         '<li role="presentation" class=""><a href="#notes"><b>USER NOTES</b></a></li>';
                // }
                // inlineHtml += '</ul>';

                // //For the MPEX Tab
                // tab_content +=
                //     '<div role="tabpanel" class="tab-pane" id="mpex">';
                // tab_content += mpexTab(customer_id,
                //     mpex_customer, expected_usage, expected_usage_per_week, expected_usage_per_week_text);
                // tab_content += '</div>';

                // //Service Details Tab Contenet
                // tab_content +=
                //     '<div role="tabpanel" class="tab-pane active" id="services">';
                // tab_content += serviceDetailsSection(pricing_notes, null, null, null, null, customer_id);
                // tab_content += '</div>';

                // //If role is not a Franchisee
                // if (role != 1000) {
                //     tab_content +=
                //         '<div role="tabpanel" class="tab-pane" id="notes">';
                //     //User Notes Tab
                //     tab_content += userNote(resultSet_note);
                //     tab_content += '</div>';
                // }

                // inlineHtml +=
                //     '<div class="tab-content" style="padding-top: 3%;">';
                // inlineHtml += tab_content;
                // inlineHtml += '</div></div></div>';




                form.addField({
                    id: 'custpage_customer_id',
                    type: ui.FieldType.TEXT,
                    label: 'Customer ID'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = parseInt(customer_id);


                form.addField({
                    id: 'custpage_customer_entityid',
                    type: ui.FieldType.TEXT,
                    label: 'Customer ID'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = entityid;

                form.addField({
                    id: 'custpage_customer_franchisee',
                    type: ui.FieldType.TEXT,
                    label: 'Franchisee ID'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = zee;

                form.addField({
                    id: 'custpage_note',
                    type: ui.FieldType.TEXT,
                    label: 'Note'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                })

                form.addField({
                    id: 'custpage_email_body',
                    type: ui.FieldType.TEXT,
                    label: 'Email Body'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                })


                form.addField({
                    id: 'custpage_email_subject',
                    type: ui.FieldType.TEXT,
                    label: 'Email Body'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                })

                form.addField({
                    id: 'custpage_sale_type',
                    type: ui.FieldType.TEXT,
                    label: 'Email Body'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                })

                form.addField({
                    id: 'custpage_send_to',
                    type: ui.FieldType.TEXT,
                    label: 'Email Body'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                })

                form.addSubmitButton({
                    label: 'Submit'
                });

                form.addField({
                    id: 'preview_table',
                    label: 'inlinehtml',
                    type: 'inlinehtml'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW
                }).defaultValue = inlineHtml;

                form.addResetButton({
                    id: 'reset',
                    label: 'Reset',
                    functionName: 'onclick_reset()'
                });

                form.addButton({
                    id: 'back',
                    label: 'Back',
                    functionName: 'onclick_back()'
                });

                form.clientScriptFileId = 6323832;

                context.response.writePage(form);
            } else {
                var customerId = context.request.parameters.custpage_customer_id;
                var fileObj = context.request.files.upload_file_1;
                var note = context.request.parameters.custpage_note;
                var emailBody = context.request.parameters.custpage_email_body;
                var emailSubject = context.request.parameters.custpage_email_subject;

                var saleType = context.request.parameters.custpage_sale_type;
                var sendTo = context.request.parameters.custpage_send_to;

                log.debug({
                    title: 'customerId',
                    details: customerId
                });
                log.debug({
                    title: 'emailBody',
                    details: emailBody
                });
                log.debug({
                    title: 'emailSubject',
                    details: emailSubject
                });
                log.debug({
                    title: 'saleType',
                    details: saleType
                });
                log.debug({
                    title: 'sendTo',
                    details: sendTo
                });

                var proofid = null;

                if (!isNullorEmpty(fileObj)) {
                    fileObj.folder = 3630868;
                    var file_type = fileObj.fileType;
                    if (file_type == 'PDF') {
                        file_type == 'pdf';
                        var file_name = getDatePDF() + '_' + parseInt(customerId) + '.' + file_type;
                        var file_name = getDatePDF() + '_service_change_notification_' + parseInt(customerId) + '.' + file_type;
                    }
                    fileObj.name = file_name;

                    if (file_type == 'PDF') {
                        // Create file and upload it to the file cabinet.
                        proofid = fileObj.save();
                    } else {
                        error.create({
                            message: 'Must be in PDF format',
                            name: 'PDF_ERROR',
                            notifyOff: true
                        });
                    }

                }

                if (saleType == 13 || saleType == '13') {
                    var customer_record = record.load({
                        type: record.Type.CUSTOMER,
                        id: parseInt(customerId),
                        isDynamic: true
                    });
    
                   

                    if (!isNullorEmpty(proofid)) {
                        customer_record.setValue({
                            fieldId: 'custentity_cancel_proof',
                            value: proofid
                        });
                    }
    
                    customer_record.save();
                }
    
                context.response.sendRedirect({
                    type: http.RedirectType.RECORD,
                    identifier: record.Type.CUSTOMER,
                    id: parseInt(customerId)
                });

            }
        }

        /**
         * A Datatable displaying the open invoices of the customer
         * @param   {Number}    ticket_id
         * @param   {String}    selector_type
         * @return  {String}    inlineHtml
         */
        function openInvoicesSection(ticket_id, selector_type) {
            if (isNullorEmpty(ticket_id)) {
                ticket_id = ''
            }

            //var hide_class_section = (isNullorEmpty(ticket_id) || selector_type != 'invoice_number') ? 'hide' : '';
            var hide_class_section = '';
            // Open invoices header
            var inlineHtml =
                '<div class="form-group container open_invoices open_invoices_header ' +
                hide_class_section + '">';
            inlineHtml += '<div class="row">';
            inlineHtml += '<div class="col-xs-12 heading2">';
            inlineHtml +=
                '<h4><span class="label label-default col-xs-12" style="background-color: #095c7b;">OPEN INVOICES</span></h4>';
            inlineHtml += '</div></div></div>';

            // Open invoices dropdown field
            inlineHtml +=
                '<div class="form-group container open_invoices invoices_dropdown ' +
                hide_class_section + '">';
            inlineHtml += '<div class="row">';
            inlineHtml += '<div class="col-xs-12 invoices_dropdown_div">';
            inlineHtml += '<div class="input-group">';
            inlineHtml +=
                '<span class="input-group-addon" id="invoices_dropdown_text">INVOICE STATUS</span>';
            inlineHtml += '<select id="invoices_dropdown" class="form-control">';
            inlineHtml += '<option value="open" selected>Open</option>';
            inlineHtml +=
                '<option value="paidInFull">Paid In Full (last 3 months)</option>';
            inlineHtml += '</select>';
            inlineHtml += '</div></div></div></div>';

            // Open Invoices Datatable
            inlineHtml +=
                '<div class="form-group container open_invoices open_invoices_table ' +
                hide_class_section + '">';
            inlineHtml += '<div class="row">';
            inlineHtml += '<div class="col-xs-12" id="open_invoice_dt_div">';
            // It is inserted as inline html in the script mp_cl_open_ticket
            inlineHtml += '</div></div></div>';

            return inlineHtml;
        }
        /*
            Create MPEX Tab
        */
        function mpexTab(customer_id, mpex_customer,
            expected_usage, expected_usage_per_week, expected_usage_per_week_text) {

            var yes_no_search = search.create({
                type: 'customlist107_2',
                columns: [{
                    name: 'name'
                }, {
                    name: 'internalId'
                }]
            });


            var resultSetYesNo = yes_no_search.run();

            var weekly_usage_search = search.create({
                type: 'customlist_form_mpex_usage_per_week',
                columns: [{
                    name: 'name'
                }, {
                    name: 'internalId'
                }]
            });


            var resultWeeklyUsage = weekly_usage_search.run();


            var inlineHtml =
                '<div class="form-group container mpex_customer_section">';
            inlineHtml += '<div class="row">';
            inlineHtml +=
                '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #095c7b;">IS MPEX CUSTOMER</span></h4></div>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';
            inlineHtml +=
                '<div class="form-group container mpex_customer2_section">';
            inlineHtml += '<div class="row">';
            inlineHtml +=
                '<div class="col-xs-4 mpex_customer"><div class="input-group"><span class="input-group-addon" id="mpex_customer_text">Is MPEX Customer? </span><select id="mpex_customer" class="form-control mpex_customer_dropdown" ><option></option>';

            resultSetYesNo.each(function (searchResult) {

                var listValue = searchResult.getValue('name');
                var listID = searchResult.getValue('internalId');
                if (!isNullorEmpty(mpex_customer)) {
                    if (mpex_customer == listID) {
                        inlineHtml += '<option value="' + listID + '" selected>' +
                            listValue + '</option>';
                    } else {
                        inlineHtml += '<option value="' + listID + '">' + listValue +
                            '</option>';
                    }
                } else {
                    inlineHtml += '<option value="' + listID + '">' + listValue +
                        '</option>';
                }
                return true;
            });



            inlineHtml += '</select></div></div>';

            inlineHtml += '</div>';
            inlineHtml += '</div>';

            inlineHtml += '<div class="form-group container exp_usage_section">';
            inlineHtml += '<div class="row">';
            inlineHtml +=
                '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #095c7b;">EXPECTED USAGE</span></h4></div>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';
            inlineHtml += '<div class="form-group container exp_usage2_section">';
            inlineHtml += '<div class="row">';
            inlineHtml +=
                '<div class="col-xs-6 mp_weekly_usage"><div class="input-group"><span class="input-group-addon" id="mp_weekly_usage_text">MP WEEKLY USAGE </span><select id="mp_weekly_usage_dropdown" class="form-control mp_weekly_usage_dropdown" ><option></option>';

            resultWeeklyUsage.each(function (searchResult) {

                var listValue = searchResult.getValue('name');
                var listID = searchResult.getValue('internalId');

                if (expected_usage_per_week == listID) {
                    inlineHtml += '<option value="' + listID + '" selected>' +
                        listValue + '</option>';
                } else {
                    inlineHtml += '<option value="' + listID + '">' + listValue +
                        '</option>';
                }

                return true;
            });

            inlineHtml += '</select></div></div>';

            inlineHtml +=
                '<div class="col-xs-6 exp_usage"><div class="input-group"><span class="input-group-addon" id="exp_usage_text">MP EXPECTED USAGE</span><input id="exp_usage" class="form-control exp_usage"  value="' +
                expected_usage + '"  /></div></div>';

            inlineHtml += '</div>';
            inlineHtml += '</div>';

            //NetSuite Search: Product Pricing - Customer Level
            var searchProductPricing = search.load({
                id: 'customsearch_prod_pricing_customer_level',
                type: 'customrecord_product_pricing'
            });

            searchProductPricing.filters.push(search.createFilter({
                name: 'custrecord_prod_pricing_customer',
                join: null,
                operator: 'anyof',
                values: customer_id,
            }));

            inlineHtml += '<div class="form-group container mpex_pricing">';
            inlineHtml += '<div class="row">';
            inlineHtml +=
                '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #095c7b;">PRICING STRUCTURE</span></h4></div>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';

            inlineHtml += '<div class="form-group container mpex_pricing_section">';
            inlineHtml += '<div class="row">';
            inlineHtml +=
                '<br><br><style>table#mpex_pricing {font-size:12px; border-color: #24385b;} </style><table border="0" cellpadding="15" id="mpex_pricing" class="tablesorter table table-striped" cellspacing="0" style="">';
            inlineHtml += '<thead style="color: white;background-color: #095c7b;">';
            inlineHtml += '<tr>';
            inlineHtml += '<th>DELIVERY SPEEDS</th><th>PRICING PLAN</th><th>B4</th><th>250G</th><th>500G</th><th>1KG</th><th>3KG</th><th>5KG</th><th>10KG</th><th>20KG</th><th>25KG</th>'
            inlineHtml += '</tr>';
            inlineHtml += '</thead>';

            searchProductPricing.run().each(function (
                searchProductPricingResultSet) {

                var internalID = searchProductPricingResultSet.getValue({
                    name: 'internalid'
                });

                var dateEffective = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_last_update"
                });

                var deliverySpeeds = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_delivery_speeds"
                });
                var deliverySpeedsID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_delivery_speeds"
                });

                var pricingPlans = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_pricing_plan"
                });
                var pricingPlansID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_pricing_plan"
                });

                var defaultProdType = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_def_prod_type"
                });
                var defaultProdTypeID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_def_prod_type"
                });

                var pricingB4 = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_b4"
                });
                var pricingB4ID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_b4"
                });

                var pricing250g = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_250g"
                });
                var pricing250gID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_250g"
                });

                var pricing500g = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_500g"
                });
                var pricing500gID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_500g"
                });

                var pricing1kg = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_1kg"
                });
                var pricing1kgID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_1kg"
                });

                var pricing3kg = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_3kg"
                });
                var pricing3kgID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_3kg"
                });

                var pricing5kg = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_5kg"
                });
                var pricing5kgID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_5kg"
                });

                var pricing10kg = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_10kg"
                });
                var pricing10kgID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_10kg"
                });

                var pricing20kg = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_20kg"
                });
                var pricing20kgID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_20kg"
                });

                var pricing25kg = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_25kg"
                });
                var pricing25kgID = searchProductPricingResultSet.getValue({
                    name: "custrecord_prod_pricing_25kg"
                });

                var status = searchProductPricingResultSet.getText({
                    name: "custrecord_prod_pricing_status"
                });

                var sync = searchProductPricingResultSet.getValue({
                    name: "custrecord_sycn_complete"
                });
                var syncText = searchProductPricingResultSet.getText({
                    name: "custrecord_sycn_complete"
                });

                inlineHtml += '<tr class="dynatable-editable">';
                inlineHtml += '<td>' + dateEffective + '</td>';
                inlineHtml += '<td>' + pricingPlans + '</td>';
                inlineHtml += '<td>' + pricingB4 + '</td>';
                inlineHtml += '<td>' + pricing250g + '</td>';
                inlineHtml += '<td>' + pricing500g + '</td>';
                inlineHtml += '<td>' + pricing1kg + '</td>';
                inlineHtml += '<td>' + pricing3kg + '</td>';
                inlineHtml += '<td>' + pricing5kg + '</td>';
                inlineHtml += '<td>' + pricing10kg + '</td>';
                inlineHtml += '<td>' + pricing20kg + '</td>';
                inlineHtml += '<td>' + pricing25kg + '</td>';
                inlineHtml += '</tr>';


                return true;
            });

            inlineHtml += '</tbody>';
            inlineHtml += '</table><br/>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';



            inlineHtml += '<div class="form-group container mpex_weekly_section">';
            inlineHtml += '<div class="row">';
            inlineHtml +=
                '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #095c7b;">MPEX - WEEKLY USAGE</span></h4></div>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';

            inlineHtml += '<div class="form-group container mpex_weekly_section">';
            inlineHtml += '<div class="row">';
            inlineHtml +=
                '<br><br><style>table#customer_weekly_usage {font-size:12px; font-weight:bold; border-color: #24385b;} </style><table border="0" cellpadding="15" id="customer_weekly_usage" class="tablesorter table table-striped" cellspacing="0" style="width: 50%;margin-left: 25%;"><thead style="color: white;background-color: #095c7b;"><tr><th style="text-align: center;">WEEK USED</th><th style="text-align: center;">USAGE COUNT</th></tr></thead><tbody>';

            //Search: MPEX Usage - Per Week (Updated Customer)
            var customerSearch = search.load({
                id: 'customsearch_customer_mpex_weekly_usage',
                type: 'customer'
            });

            customerSearch.filters.push(search.createFilter({
                name: 'internalid',
                operator: search.Operator.IS,
                values: customer_id
            }));

            var resultSetCustomer = customerSearch.run();


            resultSetCustomer.each(function (searchResult) {

                var custid = searchResult.getValue('internalid');
                var entityid = searchResult.getValue('entityid');
                var companyname = searchResult.getValue('companyname');
                var zee = searchResult.getValue('partner');
                var weeklyUsage = searchResult.getValue(
                    'custentity_actual_mpex_weekly_usage');

                var parsedUsage = JSON.parse(weeklyUsage);

                for (var x = 0; x < parsedUsage['Usage'].length; x++) {
                    var parts = parsedUsage['Usage'][x]['Week Used'].split('/');

                    inlineHtml += '<tr class="dynatable-editable">';
                    inlineHtml += '<td>' + parts[2] + '-' + ('0' + parts[1]).slice(-
                        2) + '-' + ('0' + parts[0]).slice(-2) + '</td><td>' +
                        parsedUsage['Usage'][x]['Count'] + '</td>';
                    inlineHtml += '</tr>';
                }


                return true;
            });

            inlineHtml += '</tbody>';
            inlineHtml += '</table><br/>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';

            return inlineHtml;
        }

        /*
            Create the Service Details Tab
        */
        function serviceDetailsSection(pricing_notes, ampo_price, ampo_time,
            pmpo_price, pmpo_time, customer_id) {

            var inlineHtml = '';

            var customer_record = record.load({
                type: record.Type.CUSTOMER,
                id: customer_id,
                isDynamic: true
            });

            inlineHtml += '<div class="form-group container pricing_notes">';
            inlineHtml += '<div class="row">';

            if (isNullorEmpty(pricing_notes)) {
                pricing_notes = "";
            }
            inlineHtml +=
                '<div class="col-xs-6 pricing_notes"><div class="input-group"><span class="input-group-addon" id="pricing_notes_text">PRICING NOTES </span><textarea id="pricing_notes" class="form-control pricing_notes" style="margin: 0px; height: 122px; width: 444px;">' +
                pricing_notes + '</textarea></div></div>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';

            /**
               * Description - To get all the services associated with this customer
               */

            var serviceSearch = search.load({
                id: 'customsearch_salesp_services',
                type: 'customrecord_service'
            });

            serviceSearch.filters.push(search.createFilter({
                name: 'custrecord_service_customer',
                operator: search.Operator.ANYOF,
                values: customer_id
            }));

            var resultSetServices = serviceSearch.run();

            inlineHtml += '<div class="form-group container service_section">';
            inlineHtml += '<div class="row">';
            inlineHtml += '<div class="col-xs-6 heading3"><h4><span class="label label-default col-xs-12" style="background-color: #095c7b;">SERVICES PERFORMED</span></h4></div>';
            inlineHtml += '<div class="col-xs-6 heading3"><h4><span class="label label-default col-xs-12" style="background-color: #095c7b;">FINANCIAL TAB</span></h4></div>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';
            inlineHtml += '<div class="form-group container service_section">';
            inlineHtml += '<div class="row">';
            inlineHtml += '<div class="col-xs-6 service_div">';
            inlineHtml += '<table border="0" cellpadding="15" id="service" class="table table-responsive table-striped service tablesorter" cellspacing="0" style="width: 100%;font-size: 10px;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>SERVICE NAME</b></th><th style="vertical-align: middle;text-align: center;"><b>SERVICE DESCRIPTION</b></th><th style="vertical-align: middle;text-align: center;"><b>SERVICE PRICE</b></th></tr></thead><tbody>';

            resultSetServices.each(function (searchResult_service) {
                var serviceId = searchResult_service.getValue('internalid');
                var serviceTypeId = searchResult_service.getText("internalid", "CUSTRECORD_SERVICE", null);
                var serviceText = searchResult_service.getText('custrecord_service');
                var serviceDescp = searchResult_service.getValue('custrecord_service_description');
                var servicePrice = searchResult_service.getValue('custrecord_service_price');

                inlineHtml += '<tr>';

                inlineHtml += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name_current" data-serviceid="' + serviceId + '" data-servicetypeid="' + serviceTypeId + '" readonly value="' + serviceText + '" /></div></td>';

                inlineHtml += '<td><div class="service_descp_div"><input class="form-control service_descp_class_current" disabled value="' + serviceDescp + '"  type="text" /></div></td>';

                inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + servicePrice + '"  type="number" step=".01" /></div></td>';


                inlineHtml += '</tr>';
                return true;
            });
            inlineHtml += '</tbody></table>';
            inlineHtml += '</div>';

            inlineHtml += '<div class="col-xs-6 financial_tab_div">';
            inlineHtml += '<table border="0" cellpadding="15" id="financial_tab" class="table table-responsive table-striped financial_tab tablesorter" cellspacing="0" style="width: 100%;font-size: 10px;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>ITEM NAME</b></th><th style="vertical-align: middle;text-align: center;"><b>ITEM PRICE</b></th></tr></thead><tbody>';



            if (customer_record.getLineCount({ sublistId: 'itempricing' }) > 0) {
                for (var i = 0; i < customer_record.getLineCount({ sublistId: 'itempricing' }); i++) {

                    log.debug({
                        title: 'i',
                        details: i
                    })

                    var itemText = customer_record.getSublistText({
                        sublistId: 'itempricing',
                        fieldId: 'item',
                        line: i
                    })

                    var itemPrice = customer_record.getSublistValue({
                        sublistId: 'itempricing',
                        fieldId: 'price',
                        line: i
                    })

                    inlineHtml += '<tr>';

                    inlineHtml += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name_current" readonly value="' + itemText + '" /></div></td>';
                    inlineHtml += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value="' + itemPrice + '"  type="number" step=".01" /></div></td>';
                    inlineHtml += '</tr>';


                }
            }

            inlineHtml += '</tbody></table>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';
            inlineHtml += '</div>';

            return inlineHtml;
        }
        /*
            Create the User Notes Tab
        */
        function userNote(savedNoteSearch) {

            var inlineHtml =
                '<div class="form-group container reviewaddress_section">';
            inlineHtml += '<div class="row">';
            inlineHtml +=
                '<div class="col-xs-3 create_note"><input type="button" value="CREATE USER NOTE" class="form-control btn btn-primary" id="create_note" /></div>';

            inlineHtml += '</div>';
            inlineHtml += '</div>';

            if (!isNullorEmpty(savedNoteSearch)) {

                inlineHtml += '<div class="form-group container contacts_section">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12 address_div">';
                inlineHtml +=
                    '<table border="0" cellpadding="15" id="address" class="table table-responsive table-striped address tablesorter" cellspacing="0" style="width: 100%;font-size: 10px;"><thead style="color: white;background-color: #607799;"><tr><th style="vertical-align: middle;text-align: center;"><b>CREATED DATE</b></th><th style="vertical-align: middle;text-align: center;"><b>ORGANISER</b></th><th style="vertical-align: middle;text-align: center;"><b>MESSAGE</b></th></tr></thead><tbody>';

                savedNoteSearch.each(function (searchResult) {

                    var note_date = searchResult.getValue('notedate');

                    var author = searchResult.getText("author");

                    var message = searchResult.getValue('note');

                    inlineHtml += '<tr><td>' + note_date + '</td><td>' + author +
                        '</td><td>' + message + '</td></tr>';

                    return true;
                });

                inlineHtml += '</tbody></table>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';
            }

            return inlineHtml;
        }

        function getDateStoreNS() {
            var date = new Date();
            if (date.getHours() > 6) {
                date.setDate(date.getDate() + 1);
            }

            format.format({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            })

            return date;
        }

        function getDatePDF() {
            var date = (new Date());
            // if (date.getHours() > 6) {
            //     date = nlapiAddDays(date, 1);

            // }
            // date.setHours(date.getHours() + 17);
            var date_string = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate() + '_' + date.getHours() + '' + date.getMinutes();

            return date_string;
        }

        function pad(s) {
            return (s < 10) ? '0' + s : s;
        }

        function GetFormattedDate(stringDate) {

            var todayDate = nlapiStringToDate(stringDate);
            var month = pad(todayDate.getMonth() + 1);
            var day = pad(todayDate.getDate());
            var year = (todayDate.getFullYear());
            return year + "-" + month + "-" + day;
        }

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        return {
            onRequest: onRequest
        };

    });