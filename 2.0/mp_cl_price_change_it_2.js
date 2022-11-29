/**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: ID: 1572
 * @Last Modified by: Anesu Chakaingesu
 * 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function(error, runtime, search, url, record, format, email, currentRecord) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.envType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;
        var user_id = runtime.getCurrentUser().id;

        var currRec = currentRecord.get();
        var ctx = runtime.getCurrentScript();

        var zee_id = parseInt(currRec.getValue({ fieldId: 'custpage_price_chng_fin_zee_id' }));
        if (!isNullorEmpty(zee_id)) {
            var zee_rec = record.load({ type: 'partner', id: zee_id });
            var zee_name = zee_rec.getValue({ fieldId: 'companyname' });
            var zee_state = zee_rec.getValue({ fieldId: 'location' });
        }

        var dataSet = [];

        // Load Service Record
        var serviceTypeSea = search.load({ type: 'customrecord_service_type', id: 'customsearch_rta_service_types_2' })
        var serviceTypeRes = serviceTypeSea.run();
        var serviceTypeList = [];
        serviceTypeRes.each(function(res) {
            var internalid = res.getValue({ name: 'internalid' });
            var name = res.getValue({ name: 'name' })
            serviceTypeList.push({
                id: internalid,
                name: name
            });
            return true;
        });

        var savedList = [];
        var currAllocatedSearch = search.load({
            id: 'customsearch_spc_finance_alloc',
            type: 'customrecord_spc_finance_alloc'
        });
        currAllocatedSearch.filters.push(search.createFilter({
            name: 'custrecord_price_chg_fin_zee',
            operator: search.Operator.IS,
            values: zee_id
        }));
        currAllocatedSearch.run().each(function(res) {
            var internalid = res.getValue({ name: 'internalid' });
            var date_eff = res.getValue({ name: 'custrecord_price_chg_fin_date_eff' });
            var cust_id = res.getValue({ name: 'custrecord_price_chg_fin_cust_id' });
            var service_id = res.getValue({ name: 'custrecord_price_chg_fin_serv' });
            var service_type_id = res.getValue({ name: 'custrecord_price_chg_fin_serv_type_id' });
            // console.log(service_type_id)
            var inc_price = res.getValue({ name: 'custrecord_price_chg_fin_inc_am' });

            /** IT Page List */
            var approved = res.getValue({ name: 'custrecord_price_chg_it_approve' });
            var emailed = res.getValue({ name: 'custrecord_price_chg_it_email_sent' });
            var serv_chg_id = res.getValue({ name: 'custrecord_price_chg_it_serv_chg_id' });

            savedList.push({ id: internalid, custid: cust_id, zeeid: zee_id, servid: service_id, servtypeid: service_type_id, date: date_eff, incval: inc_price, approved: approved, emailed: emailed, serv_chg_id: serv_chg_id });
            return true;
        });
        console.log(savedList);

        // List of Customer IDs who have an active Allocated Price Increase Value from Finance Team Page. 
        var cust_finAllocatedList = savedList.map(function(el){return el.custid});
        console.log(cust_finAllocatedList);

        // Date Today n Date Tomorrow
        var today_date = new Date(); // Test Time 6:00pm - '2022-06-29T18:20:00.000+10:00'
        today_date.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })
        var hour_time = today_date.getHours();

        if (hour_time < 17){ // If Current Time is Before 5:00pm
            today_date = today_date.toISOString().split('T')[0];
        } else { // If Current Time is After 5:00pm, Change Date as Tomorrow.
            var today_year = today_date.getFullYear();
            var today_month = today_date.getMonth();
            var today_day = today_date.getDate();
            var today_in_day = new Date(Date.UTC(today_year, today_month, today_day + 1));
            today_date = today_in_day.toISOString().split('T')[0]; 
        }
        console.log(today_date)

        // Maximum Invoice Search
        var maxInvID = []; // Max Invoice ID
        var maxInvItem = [];
        var cust_index = 0;
        var maxInvCust = [];
        var maxInvSearch = search.load({
            id: 'customsearch_smc_customer_5_2',
            type: 'customer'
        });
        if (cust_finAllocatedList.length > 0){
            maxInvSearch.filters.push(search.createFilter({
                name: 'internalid',
                operator: search.Operator.ANYOF,
                values: cust_finAllocatedList
            }))
            maxInvSearch.filters.push(search.createFilter({
                name: 'partner',
                operator: search.Operator.ANYOF,
                values: zee_id
            }))
            maxInvSearch.run().each(function(res){
                var companyname = res.getValue({
                    name: 'internalid',
                    summary: 'GROUP'
                });
                var netSuiteItem = res.getValue({
                    name: 'item',
                    join: 'transaction',
                    summary: 'GROUP'
                }); 
                if (cust_index == 0){
                    maxInvCust.push(companyname);
                }
                if (maxInvCust.indexOf(companyname) == -1){
                    maxInvCust.push(companyname);
                    maxInvItem = [];
                }
                if (maxInvItem.indexOf(netSuiteItem) == -1){
                    maxInvItem.push(netSuiteItem);

                    var internalid = res.getValue({
                        name: 'internalid',
                        join: 'transaction',
                        summary: 'MAX'
                    });
                    maxInvID.push(internalid);
                    cust_index++;
                    return true;
                } else {
                    cust_index++;
                    return true;
                }
            });
        }
        console.log(maxInvID);

        /**
         * On page initialisation
         */
        function pageInit() {
            // Background-Colors
            $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
            $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
            $("#body").css("background-color", "#CFE0CE");

            // Hide/UnHide Elements
            $('.loading_section').hide();
            // $('#reset-all').removeClass('hide')
            $('#btn-show-all-children').removeClass('hide')
            $('#btn-hide-all-children').removeClass('hide')
            $('#submit').removeClass('hide');

            // Bulk Update Zee Dropdown
            $('select').selectpicker();

            // Define URL
            var resolvedURL = baseURL + url.resolveScript({
                deploymentId: "customdeploy_sl_price_change_it_2",
                scriptId: "customscript_sl_price_change_it_2",
            })

            $(document).on("change", "#zee_filter_dropdown", function() {
                var zee_id_dropdown = $(this).find("option:selected").val();
                var params = {
                    zeeid: zee_id_dropdown,
                };
                params = JSON.stringify(params);
                

                var upload_url = resolvedURL + "&custparam_params=" + params;
                currRec.setValue({
                    fieldId: "custpage_price_chng_fin_zee_id",
                    value: zee_id,
                });
                window.location.href = upload_url;
            });

            $(document).on("click", "#spc_finance_page", function() {
                var zee_id_dropdown = $(this).find("option:selected").val();
                var params = {
                    zeeid: zee_id_dropdown,
                };
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({
                    deploymentId: "customdeploy_sl_price_change_financial_2",
                    scriptId: "customscript_sl_price_change_financial_2",
                }) + "&custparam_params=" + params;
                window.location.href = upload_url;
            });

            if (!isNullorEmpty(zee_id)) {
                loadCustomers(zee_id);

                var dataTable = $("#debt_preview").DataTable({
                    data: dataSet,
                    pageLength: 100,
                    order: [],
                    columns: [{
                            title: 'Expand',
                            className: 'dt-control',
                            orderable: false,
                            data: null,
                            defaultContent: '',
                        },
                        { title: "Internal ID" }, // 1
                        { title: "Customer ID" }, // 2
                        { title: "Company Name" }, // 3
                        { title: "Franchisee" }, // 4
                        { title: "Date Last Price Increase" }, // 5
                    ],
                    autoWidth: false,
                    "language": {
                        "emptyTable": '<div>There are Currently No Customers Allocated with a Price Increase. Please fill Data via Finance Team Page<div><div style="margin: 20px;"><form action="'+resolvedURL+'"><input style="background-color: #FBEA51; color: #103D39; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="submit" value="Finance Team Page"/></form><div>'
                    },
                });

                // Load with All Child Cells Open
                dataTable.rows().every(function() {
                    // this.child(format(this.data())).show();
                    this.child(createChild(this)).show();
                });
                // Handle click on "Expand All" button
                $('#btn-show-all-children').on('click', function() {
                    // Enumerate all rows
                    dataTable.rows().every(function() {
                        // If row has details collapsed
                        if (!this.child.isShown()) {
                            // Open this row
                            this.child.show();
                            $(this.node()).addClass('shown');
                        }
                    });
                });
                // Handle click on "Collapse All" button
                $('#btn-hide-all-children').on('click', function() {
                    // Enumerate all rows
                    dataTable.rows().every(function() {
                        // If row has details expanded
                        if (this.child.isShown()) {
                            // Collapse row details
                            this.child.hide();
                            $(this.node()).removeClass('shown');
                        }
                    });
                });

                // Add event listener for opening and closing child table details on button.
                $('#debt_preview tbody').on('click', 'td.dt-control', function() {
                    var tr = $(this).closest('tr');
                    var row = dataTable.row(tr);

                    if (row.child.isShown()) {
                        // This row is already open - close it
                        destroyChild(row);
                        tr.removeClass('shown');
                        tr.removeClass('parent');
                    } else {
                        // Open this row
                        row.child.show();
                        tr.addClass('shown');
                        tr.addClass('parent');
                    }
                });
                
                /**
                 *  Functionality On Page
                 */
                $(document).on("click", ".edit_smc", function() {
                    var cust_id = $(this).attr('data-custid');
                    var params = {
                        custid: cust_id,
                        itpage: 'T'
                    }

                    var upload_url =
                        baseURL +
                        url.resolveScript({
                            deploymentId: "customdeploy_sl_smc_main",
                            scriptId: "customscript_sl_smc_main",
                        }) + '&custparam_params=' + JSON.stringify(params);

                    window.open(upload_url, '_blank');
                });

                // Create New Price Increase Value for Finance Allocate Record.
                $(document).on("click", ".miss_inc", function() {
                    var date_eff = $(this).closest('tr').find('.new_date_eff').val();
                    var inc_am = $(this).closest('tr').find('.total_amount').val();

                    if (!isNullorEmpty(inc_am) && inc_am != 0 && !isNullorEmpty(date_eff)) {
                        if (confirm('Are you sure you would like to process this Price Increase?') == true){
                            var service_type_id = $(this).attr('data-servtypeid');
                            var cust_id = $(this).attr('data-custid');
                            var service_id = $(this).attr('data-servid');

                            console.log('Customer ID: ' + cust_id + ' Service Type ID ' + service_type_id + ' Service ID ' + service_id + ' Date ' + date_eff + ' Increase Amount ' + inc_am);
                            /**
                             *  Customer ID
                             *  Franchisee
                             *  Date Effective
                             *  Service
                             *  New Price
                             */
                            var savedListFiltered = savedList.filter(function(el) { if (el.custid == cust_id && el.servtypeid == service_type_id) { return el } });
                            console.log('Saved List: ' + JSON.stringify(savedListFiltered))
                            if (savedListFiltered.length > 0) {
                                savedListFiltered.forEach(function(res) {
                                    var recID = res.id;

                                    var rec = record.load({
                                        type: 'customrecord_spc_finance_alloc',
                                        id: recID
                                    });
                                    rec.setValue({ fieldId: 'custrecord_price_chg_fin_date_eff', value: date_eff })
                                    rec.setValue({ fieldId: 'custrecord_price_chg_fin_inc_am', value: inc_am })
                                    rec.setValue({ fieldId: 'custrecord_price_chg_fin_serv', value: service_id })
                                    rec.setValue({ fieldId: 'custrecord_price_chg_fin_serv_type_id', value: service_type_id })
                                    rec.save();

                                    return true;
                                });
                            } else {
                                var rec = record.create({
                                    type: 'customrecord_spc_finance_alloc',
                                    isDynamic: true
                                });
                                rec.setValue({ fieldId: 'name', value: zee_name });
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_cust_id', value: cust_id })
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_zee', value: zee_id })
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_date_eff', value: date_eff })
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_serv', value: service_id })
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_serv_type_id', value: service_type_id })
                                rec.setValue({ fieldId: 'custrecord_price_chg_fin_inc_am', value: inc_am })
                                rec.save();
                            }
                            
                            // Run Email Script to notify IT Team
                            email.send({
                                author: 112209, // 25537
                                body: '<html><body><p1><strong>Hi IT Team,</strong><br><br>New Scheduled Price Increase Submitted for ' + zee_name + ' . Please visit <a href="https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1448&deploy=1&custparam_params={%22zeeid%22:%22' + zee_id + '%22}">Scheduled Price Change: IT Page</a> to view/edit/process changes.</p1>\n<p1>List of Customer IDs: ' + cust_id + '</p1></body></html>',
                                subject: 'Scheduled Price Increase (Updated) for ' + zee_name,
                                recipients: ['anesu.chakaingesu@mailplus.com.au'],
                                cc: ['popie.popie@mailplus.com.au', 'ankith.ravindran@mailplus.com.au']
                            });
                            alert('Record have been Saved');
                            location.reload();
                        } else {
                            alert('Scheduled Increase Cancelled')
                        }
                    } else if (isNullorEmpty(inc_am) && isNullorEmpty(date_eff)) {
                        var service_type_id = inv_price_elem[x].getAttribute('data-servtypeid');
                        var cust_id = inv_price_elem[x].getAttribute('data-custid');
                        var service_id = inv_price_elem[x].getAttribute('data-servid');

                        var savedListFiltered = savedList.filter(function(el) { if (el.custid == cust_id && el.servtypeid == service_type_id) { return el } });
                        if (savedListFiltered.length > 0) {
                            savedListFiltered.forEach(function(res) {
                                var recID = res.id;
                                record.delete({
                                    type: 'customrecord_spc_finance_alloc',
                                    id: recID
                                });
                            });
                        }
                    } else {
                        alert('Please fill out all fields');
                        return false;
                    }
                });

                /** Save Record */
                $(document).on("click", ".save_inc", function() {
                    /* Schedule Service Change */
                    var cust_id = $(this).attr("data-custid"); // Customer ID
                    var prev_commRegID = $(this).attr('data-commreg'); // Load Previus Comm Reg ID
                    var inc_id = $(this).attr('data-incid'); // Finance Allocate Record ID

                    /** Load Finance Allocate (Increase Total) Record Information */
                    var incRecord = savedList.filter(function(el) { if (el.custid == cust_id && el.id == inc_id) { return el } })[0];
                    console.log(incRecord)
                    var internalid = incRecord.id;
                    var service_id = incRecord.servid;

                    var date_eff = incRecord.date;
                    date_eff = dateISOToNetsuite(date_eff);
                    var date_eff_netsuite = date_eff
                    date_eff = format.parse({ value: date_eff, type: format.Type.DATE });
                    console.log(date_eff)

                    var inc_price = incRecord.incval;

                    

                    // Load/Create New Comm Reg
                    var commRegSearch = search.load({ type: 'customrecord_commencement_register', id: 'customsearch_comm_reg_signed_2' });
                    commRegSearch.filters.push(search.createFilter({
                        name: 'custrecord_customer',
                        operator: search.Operator.IS,
                        values: cust_id // 517563
                    }));
                    var commRegRes = commRegSearch.run().getRange({ start: 0, end: 1 });
                    console.log(commRegRes);
                    console.log(commRegRes.length);

                    if (commRegRes.length > 0){
                        console.log('Commencement Date: ' + commRegRes[0].getValue('custrecord_comm_date'));
                        if (date_eff_netsuite == commRegRes[0].getValue('custrecord_comm_date')){
                            commRegID = loadCommReg(commRegRes[0].getValue('internalid'), date_eff);
                            console.log('Load Existing Comm Reg: ' + commRegID)
                        } else {
                            commRegID = createCommReg(cust_id, date_eff, zee_id, zee_state);
                            console.log('Create New Comm Reg. Existing Increase But Old Date: ' + commRegID)
                        }
                        
                    } else {
                        commRegID = createCommReg(cust_id, date_eff, zee_id, zee_state);
                        console.log('Create New Comm Reg: ' + commRegID)
                    }
                    
                    /**
                     *  Create Service Change Record.
                     */
                    var servChgRecord = record.create({
                        type: 'customrecord_servicechg',
                        isDynamic: true
                    });
                    servChgRecord.setValue({ fieldId: 'custrecord_servicechg_date_effective', value: date_eff });
                    servChgRecord.setValue({ fieldId: 'custrecord_servicechg_service', value: service_id });
                    servChgRecord.setValue({ fieldId: 'custrecord_servicechg_status', value: 1 }); // Scheduled
                    servChgRecord.setValue({ fieldId: 'custrecord_servicechg_old_zee', value: zee_id });
                    servChgRecord.setValue({ fieldId: 'custrecord_servicechg_new_price', value: inc_price });
                    // servChgRecord.setValue({ fieldId: 'custrecord_servicechg_new_freq', value:  });
                    servChgRecord.setValue({ fieldId: 'custrecord_servicechg_comm_reg', value: commRegID });
                    if (role != 1000) {
                        servChgRecord.setValue({ fieldId: 'custrecord_servicechg_created', value: user_id });
                    }
                    servChgRecord.setValue({ fieldId: 'custrecord_servicechg_type', value: 'Price Increase' });
                    // servChgRecord.setValue({ fieldId: 'custrecord_default_servicechg_record', value: 1 });
                    servChgRecord.setValue({ fieldId: 'custrecord_servicechg_fin_alloc', value: inc_id }); // Store Finance Allocate Record ID
                    var servChgRecordSaveID = servChgRecord.save();
                    // var servChgRecordSaveID = 72212; // Test with Servce Chg
                    console.log('Service Chg Record Created: ' + servChgRecordSaveID);

                    /**
                     *  Load Finance Allocate (Price Increase) Record
                     */
                    var incRecLoad = record.load({ type: 'customrecord_spc_finance_alloc', id: internalid });
                    var approved = incRecLoad.getValue({ fieldId: 'custrecord_price_chg_it_approve' });
                    if (approved == true){
                        console.log('Price Increase Already Scheduled')
                        return true;
                    }
                    incRecLoad.setValue({ fieldId: 'custrecord_price_chg_it_approve', value: true }) // Tick Approved By IT
                    incRecLoad.setValue({ fieldId: 'custrecord_price_chg_it_serv_chg_id', value: servChgRecordSaveID })
                    var incSaveID = incRecLoad.save();
                    console.log('Updated Finance Allocate Record: ' + incSaveID);

                    // Change HTML of Line Item
                    $(this).closest('tr').css('background-color', '');
                    $(this).closest('td').replaceWith('<td><button class="remove_check btn btn-sm glyphicon glyphicon-minus" title="Price Increase Scheduled" type="button"/></td>') //eq(6).

                    // Run Email Script to notify IT Team
                    // email.send({
                    //     author: 924435, // 112209 - Customer Service , // 25537 , 409635 - Ankith . 924435 - Anesu
                    //     body: '<html><body><p1><strong>Hi IT Team,</strong><br><br>Email Scripts are being generated for ' + zee_name + ' list of customers. Please visit <a href="https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1452&deploy=1&custparam_params={%22zeeid%22:%22' + zee_id + '%22}">Scheduled Price Change: IT Team</a> to view/ the list of customers.</p1></body></html>',
                    //     subject: 'Scheduled Price Increase: Emails being Generated | ' + zee_name,
                    //     recipients: ['anesu.chakaingesu@mailplus.com.au'],
                    //     cc: ['popie.popie@mailplus.com.au', 'ankith.ravindran@mailplus.com.au']
                    // });
                    alert('Price Increase Scheduled');
                });

                $(document).on("click", ".remove_check", function() {
                    alert('Service Line Item has Already Been Scheduled for Price Increase. Please Contact Ankith or Anesu to review Sechduled Service Change Record')
                });
            }

            console.log(ctx.getRemainingUsage())
        }

        function loadCustomers(zee_id) {
            var index = 0;

            var prev_cust_id = [];
            var prev_entity_id = [];
            var prev_comp_name = [];

            var childObject = [];
            var serv_id_list = [];

            //Search: SMC - Customer
            var customerSearch = search.load({
                type: "customer",
                id: "customsearch_smc_customer_5",
            });
            customerSearch.filters.push(search.createFilter({
                name: "partner",
                operator: search.Operator.ANYOF,
                values: zee_id,
            }));
            if (maxInvID.length > 0){
                customerSearch.filters.push(search.createFilter({
                    name: "internalid",
                    operator: search.Operator.ANYOF,
                    join: 'transaction',
                    values: maxInvID,
                }));
            } else {
                console.log('Missing Invoices. Maximum Invoice Length: ' + maxInvID.length)
            }
            if (cust_finAllocatedList.length > 0){
                customerSearch.filters.push(search.createFilter({
                    name: "internalid",
                    operator: search.Operator.ANYOF,
                    values: cust_finAllocatedList,
                }));
                var customerSearchResLength = customerSearch.runPaged().count;
                customerSearch.run().each(function(searchResult) {
                    // console.log('Index: ' + index)
                    var custid = searchResult.getValue({
                        name: "internalid",
                        summary: "GROUP"
                    });
                    var entityid = searchResult.getValue({
                        name: "entityid",
                        summary: "GROUP"
                    });
                    var companyname = searchResult.getValue({
                        name: "companyname",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                    });
                    if (index == 0) {
                        prev_cust_id.push(custid) // Push First Iteration of Customer ID.
                        prev_entity_id.push(entityid);
                        prev_comp_name.push(companyname);
                    }
                    var last_price_increase = searchResult.getValue({
                        name: "custentity_date_of_last_price_increase",
                        summary: "GROUP"
                    });

                    /**
                     *  List of Services
                     */
                    var service_id = searchResult.getValue({
                        name: "internalid",
                        join: 'CUSTRECORD_SERVICE_CUSTOMER',
                        summary: "GROUP"
                    });
                    if (serv_id_list.indexOf(service_id) != -1){ // If Service ID has already been pushed, Skip
                        return true;
                    }
                    serv_id_list.push(service_id);
                    var service = searchResult.getText({
                        name: "custrecord_service",
                        join: 'CUSTRECORD_SERVICE_CUSTOMER',
                        summary: "GROUP"
                    });
                    var service_lower = service.toLowerCase();

                    /**
                     *  List of Current Service Inline HTML
                     */
                    var service_price = '$' + searchResult.getValue({
                        name: "custrecord_service_price",
                        join: 'CUSTRECORD_SERVICE_CUSTOMER',
                        summary: "GROUP"
                    });
                    var inv_id = searchResult.getValue({
                        name: "internalid",
                        join: "transaction",
                        summary: search.Summary.GROUP
                    });
                    var inv_price = '$' + searchResult.getValue({
                        name: "rate",
                        join: "transaction",
                        summary: search.Summary.GROUP
                    });
                    var inv_date = searchResult.getValue({
                        name: "trandate",
                        join: "transaction",
                        summary: search.Summary.GROUP
                    });
                    var comm_reg_id = searchResult.getValue({
                        name: "custrecord_service_comm_reg",
                        join: 'CUSTRECORD_SERVICE_CUSTOMER',
                        summary: "GROUP"
                    });

                    var service_type_id = serviceTypeList.filter(function(el) { if (el.name == service) { return el } })[0].id;

                    if (!isNullorEmpty(savedList)) {
                        var savedListFiltered = savedList.filter(function(el) { if (el.custid == custid && el.servtypeid == service_type_id) { return el } });

                        if (savedListFiltered.length > 0) {
                            savedListFiltered.forEach(function(res) {
                                var inv_price_val = inv_price.split('$')[1];
                                inv_price_val = Number(inv_price_val.replace(/[^0-9.-]+/g, ""));

                                var approved = res.approved;
                                var fin_alloc_record_id = res.id;

                                childObject.push({ internalid: fin_alloc_record_id, id: service_id, type_id: service_type_id, item: service, curr_inv_price: inv_price, inc_price: (parseFloat(res.incval) - parseFloat(inv_price_val)), tot_price: res.incval, date_eff: res.date, serv_price: service_price, custid: custid, commreg: comm_reg_id, approved: approved, serv_chg_id: res.serv_chg_id, inv_date:inv_date, inv_id: inv_id  });

                                return true;
                            })
                        } else {
                            childObject.push({ internalid: 0, id: service_id, type_id: service_type_id, item: service, curr_inv_price: inv_price, inc_price: '', tot_price: '', date_eff: '', serv_price: service_price, custid: custid, commreg: comm_reg_id, approved: false, serv_chg_id: null, inv_date:inv_date, inv_id: inv_id  });
                        }
                    } else {
                        childObject.push({ internalid: 0, id: service_id, type_id: service_type_id, item: service, curr_inv_price: inv_price, inc_price: '', tot_price: '', date_eff: '', serv_price: service_price, custid: custid, commreg: comm_reg_id, approved: false, serv_chg_id: null, inv_date:inv_date, inv_id: inv_id });
                    }

                    console.log('Index: ' + index)
                    console.log(prev_cust_id)
                    console.log('Cust ID ' + custid)
                    console.log('Service ' + service_id)
                    console.log(childObject)

                    if (prev_cust_id.indexOf(custid) == -1) {
                        console.log('New Customer. Save Child Object and Reset')

                        const tempChildObj = childObject[childObject.length - 1];
                        console.log(tempChildObj)
                        childObject.pop();

                        dataSet.push(['',
                            '<p id="internalID" class="internalID">' + prev_cust_id[prev_cust_id.length-1] + '</p>',
                            '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + prev_cust_id[prev_cust_id.length-1] + '"><p class="entityid">' +  prev_entity_id[prev_entity_id.length-1] + "</p></a>",
                            '<p internalid="companyname" class="companyname">' +  prev_comp_name[prev_comp_name.length-1] + '</p>',
                            zee_name,
                            last_price_increase,
                            childObject
                        ]);

                        childObject = [tempChildObj];

                        prev_cust_id.push(custid);
                        prev_entity_id.push(entityid);
                        prev_comp_name.push(companyname);
                    }
                    if (index == (customerSearchResLength - 1)){
                        console.log('Last Index')
                        dataSet.push(['',
                            '<p id="internalID" class="internalID">' + custid + '</p>',
                            '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + custid + '"><p class="entityid">' + entityid + "</p></a>",
                            '<p internalid="companyname" class="companyname">' + companyname + '</p>',
                            zee_name,
                            last_price_increase,
                            childObject
                        ]);
                    } 
                    index++;

                    return true;
                });
            }
        }

        function createChild(row) {
            // This is the table we'll convert into a DataTable
            var table = $('<table class="display" width="50%"/>');
            var childSet = [];
            row.data()[6].forEach(function(el) {
                if (el.approved == true){
                    childSet.push([el.item,
                        '<a href="' + baseURL + "/app/accounting/transactions/custinvc.nl?id=" + el.inv_id + '" target="_blank"><p class="entityid">' + el.inv_date + '</p></a>', //1
                        '<label id="' + el.item + '" class="services" data-custid="' + el.custid + '" type="text">' + el.curr_inv_price + '</label>',
                        '<label id="' + el.id + '" class="form-control increase_amount ' + el.id + '"disabled>' + financial(el.inc_price) + '</label>',
                        ' <input id="' + el.id + '" class="form-control total_amount ' + el.id + '" placeholder="$" type="number" data-inv-price="' + el.curr_inv_price + '" data-custid="' + el.custid + '" value="' + el.tot_price + '" disabled/>',
                        '<input type="date" min="'+today_date+'" class="form-control new_date_eff new_date_eff_' + el.id + '" ' + el.date_eff + ' value="' + el.date_eff + '" disabled/>',
                        '<label id="' + el.item + '" class="services" data-custid="' + el.custid + '" type="text">' + el.serv_price + '</label>',
                        '',
                        el.internalid,
                        el.custid,
                        el.tot_price,
                        el.date_eff,
                        el.approved, // Approved
                        el.commreg,
                        el.serv_chg_id,
                        el.id, // Service ID
                        el.type_id, // Service Type ID
                    ]);
                } else {
                    childSet.push([el.item,
                        '<a href="' + baseURL + "/app/accounting/transactions/custinvc.nl?id=" + el.inv_id + '" target="_blank"><p class="entityid">' + el.inv_date + '</p></a>', //1
                        '<label id="' + el.item + '" class="services" data-custid="' + el.custid + '" type="text">' + el.curr_inv_price + '</label>',
                        '<label id="' + el.id + '" class="form-control increase_amount ' + el.id + '"disabled>' + financial(el.inc_price) + '</label>',
                        ' <input id="' + el.id + '" class="form-control total_amount ' + el.id + '" placeholder="$" type="number" data-inv-price="' + el.curr_inv_price + '" data-custid="' + el.custid + '" value="' + el.tot_price + '"/>',
                        '<input type="date" min="'+today_date+'" class="form-control new_date_eff new_date_eff_' + el.id + '" ' + el.date_eff + ' value="' + el.date_eff + '"/>',
                        '<label id="' + el.item + '" class="services" data-custid="' + el.custid + '" type="text">' + el.serv_price + '</label>',
                        '',
                        el.internalid,
                        el.custid,
                        el.tot_price,
                        el.date_eff,
                        el.approved, // Approved
                        el.commreg,
                        el.serv_chg_id,
                        el.id, // Service ID
                        el.type_id, // Service Type ID
                    ]);
                }
            });

            // Display it the child row
            row.child(table).show();

            // Initialise as a DataTable
            var usersTable = table.DataTable({
                "bPaginate": false,
                "bLengthChange": false,
                "bFilter": false,
                "bInfo": false,
                "bAutoWidth": false,
                data: childSet,
                columns: [
                    { title: 'Item' }, //0
                    { title: 'Latest Invoice Date'}, // 1
                    { title: 'Latest Invoice Price' }, //2
                    { title: 'Increase Amount' }, //3
                    { title: 'New Price' }, //4
                    { title: 'Date Effective' }, //5
                    { title: 'Current Service Price' }, //6
                    { title: 'Action' }, // 7,
                    { title: 'Internal ID'}, // 8
                    { title: 'Customer ID' }, // 9
                    { title: 'New Price Val' }, // 10
                    { title: 'Date Val' }, //11
                    { title: 'Status'}, // 12,
                    { title: 'Comm Reg ID'}, //13
                    { title: 'Service Change ID'}, // 14
                    { title: 'Service ID' }, // 15
                    { title: 'Service Type ID' }, // 16
                ],
                columnDefs: [
                    { 
                        targets: [8, 9, 10, 11, 12, 13, 14, 15, 16],
                        visible: false
                    }
                ],
                rowCallback: function(row, data) {
                    if (data[2] == data[6]) { // Service Price and Invoice rice Equal
                        if (isNullorEmpty(data[10]) && isNullorEmpty(data[11])){ // Default to Yellow. This states service line item does not have a new price.
                            if ($(row).hasClass('odd')) {
                                $(row).css('background-color', 'rgba(250, 250, 210, 1)'); // LightGoldenRodYellow
                            } else {
                                $(row).css('background-color', 'rgba(255, 255, 240, 1)'); // Ivory
                            }

                            $(row).find("td").eq(7).replaceWith('<td><button class="miss_inc btn btn-sm btn-warning glyphicon glyphicon-plus" data-custid="'+data[9]+'" data-servid="'+data[15]+'" data-servtypeid="'+data[16]+'" title="New Price Increase" type="button"/></td>') // Yellow Minus
                        } else { // Set to Green if New Price & Date Exist, and Current Service / Invoice Prices Match
                            if ($(row).hasClass('odd')) {
                                $(row).css('background-color', 'rgba(144, 238, 144, 0.75)'); // LightGreen
                            } else {
                                $(row).css('background-color', 'rgba(152, 251, 152, 0.75)'); // YellowGreen
                            }

                            $(row).find("td").eq(7).replaceWith('<td><button class="miss_inc btn btn-sm btn-warning glyphicon glyphicon-plus" data-custid="'+data[9]+'" data-servid="'+data[15]+'" data-servtypeid="'+data[16]+'" title="New Price Increase" type="button"/><button class="save_inc btn btn-sm btn-success glyphicon glyphicon-ok" data-custid="'+data[9]+'" data-incid="'+data[8]+'" data-commreg="'+data[13]+'" title="Schedule Email" type="button"/></td>') // Green Tick
                        }
                        if (data[12] == true){ // If Approved.
                            $(row).css('background-color', '');

                            $(row).find("td").eq(7).replaceWith('<td><button class="remove_check btn btn-sm glyphicon glyphicon-minus" data-custid="'+data[9]+'" data-incid="'+data[8]+'" data-commreg="'+data[13]+'" data-servchgid="'+data[14]+'" title="Price Increase Scheduled" type="button"/></td>') // 
                        }
                    } else if (data[2] != data[6]) { // If Current Service Price and Invoice Price Don't Match
                        if ($(row).hasClass('odd')) {
                            $(row).css('background-color', 'rgba(250, 128, 114, 0.65)'); // Salmon
                        } else {
                            $(row).css('background-color', 'rgba(255, 0, 0, 0.4)'); // Red
                        }
                        $(row).find("td").eq(7).replaceWith('<td><button class="edit_smc btn btn-sm btn-danger glyphicon glyphicon-pencil" data-custid="'+data[9]+'" data-incid="'+data[8]+'" data-commreg="'+data[13]+'" data-servchgid="'+data[14]+'" title="Edit Service Price" type="button"/></td>') // Edit Button - Redirect to SMC
                    }
                }
            });
        }

        function destroyChild(row) {
            // And then hide the row
            row.child.hide();
        }

        function saveRecord(context) {
            location.reload();
            return true;
        }

         /*
            [Description] : USers need to Fill in 
            Commencement Date
            Sign Up Date
            Sales Rep
            Inbound/Outbound (custrecord_in_out)
            
        */
        
        function createCommReg(customer, dateEffective, zee, state) {
            var customer_comm_reg = record.create({
                type: 'customrecord_commencement_register',
                isDynamic: true
            });

            var today = format.parse({ value: getDate(), type: format.Type.DATE });

            customer_comm_reg.setValue({ fieldId: 'custrecord_date_entry', value: today });
            customer_comm_reg.setValue({ fieldId: 'custrecord_comm_date', value: dateEffective });
            customer_comm_reg.setValue({ fieldId: 'custrecord_comm_date_signup', value: dateEffective });
            customer_comm_reg.setValue({ fieldId: 'custrecord_customer', value: customer });
            customer_comm_reg.setValue({ fieldId: 'custrecord_salesrep', value: 109783 });
            customer_comm_reg.setValue({ fieldId: 'custrecord_std_equiv', value:1 });
            if (role != 1000) {
                customer_comm_reg.setValue({ fieldId: 'custrecord_franchisee', value: zee });//Franchisee
            }
            customer_comm_reg.setValue({ fieldId: 'custrecord_wkly_svcs', value:'5' });
            customer_comm_reg.setValue({ fieldId: 'custrecord_in_out', value: 2 }); // Inbound
            customer_comm_reg.setValue({ fieldId: 'custrecord_state', value:state });
            customer_comm_reg.setValue({ fieldId: 'custrecord_trial_status', value:9 }); //Scheduled
            customer_comm_reg.setValue({ fieldId: 'custrecord_sale_type', value: 10 }) // Price Increase
            var commRegID = customer_comm_reg.save();
            // var commRegID = '1' //Test

            return commRegID;
        }

        function loadCommReg(id, dateEffective) {
            var today = format.parse({ value: getDate(), type: format.Type.DATE });

            customer_comm_reg = record.load({ type: 'customrecord_commencement_register', id: id });
            customer_comm_reg.setValue({ fieldId: 'custrecord_date_entry', value: today });
            customer_comm_reg.setValue({ fieldId: 'custrecord_comm_date', value: dateEffective });
            customer_comm_reg.setValue({ fieldId: 'custrecord_sale_type', value: 10 })
            // customer_comm_reg.setValue({ fieldId: 'custrecord_comm_date_signup', value:dateEffective);
            var commRegID = customer_comm_reg.save();
            // var commRegID = '0' //Test
    
            return commRegID;
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

        function altPackageName(str) {
            if (str.includes('Package')) {
                str.replace(/[^A-Z0-9]+/ig, "_");
            }
            return str;
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