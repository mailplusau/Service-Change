/**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: 
 * @Last Modified by: Anesu Chakaingesu
 * 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function (error, runtime, search, url, record, format, email, currentRecord) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;

        var currRec = currentRecord.get();

        var zee_id = currRec.getValue({ fieldId: "custpage_price_change_zee_id" })
        if (isNullorEmpty(zee_id)) {
            zee_id = 0;
        }
        var commReg = currRec.getValue({ fieldId: 'custpage_price_change_comm_reg' });
        if (isNullorEmpty(commReg)){
            commReg = null;
        }

        var dataSet1 = [];
        var dataSet2 = [];
        var dataSet3 = [];

        /**
         * On page initialisation
         */
        function pageInit() {

            if (zee_id != 0){
                $('#table_preview').removeClass('hide')

                loadCustomerList();
            }
            
            var dataTable1 = $('#table_preview').DataTable({
                data: dataSet1,
                pageLength: 100,
                order: [],
                columns: [
                    { title: 'Review Complete' }, // 0
                    { title: 'ID' }, // 1
                    { title: 'Customer Name' }, // 2
                    { title: 'Date of Last Price Increase' }, // 3
                    { title: 'Action' }, // 4
                ],
                columnDefs: [],
                autoWidth: false,
            });

            var dataTable3 = $('#comm_reg_preview').DataTable({
                data: dataSet3,
                pageLength: 100,
                order: [],
                columns: [
                    { title: 'ID' }, // 0
                    { title: 'Sales Type' }, // 1
                    { title: 'Date Effective' }, // 2
                    { title: 'Action' }, // 3,
                    { title: 'Customer ID' } // 4
                ],
                columnDefs: [{
                    targets: [4]
                }],
                autoWidth: false,
            });

            var dataTable2 = $('#data_preview_edit').DataTable({
                data: dataSet2,
                pageLength: 100,
                order: [],
                columns: [
                    { title: 'Action' }, // 0
                    { title: 'Service Name' }, // 1
                    { title: 'Service Description' }, // 2
                    { title: 'Old Price' }, // 3
                    { title: 'New Price' }, // 4
                    { title: 'Date Effective' }, // 5
                    { title: 'Created By' }, // 6
                    { title: 'Last Modified' }, // 7
                    { title: 'Type' }, // 8
                    { title: 'Frequency - M | T | W | T | F | Ad' }, // 9
                ],
                columnDefs: [],
                autoWidth: false,
            });

            

            $('.loading_section').addClass('hide');

            $(document).on('change', '#zee_filter_dropdown', function () {
                var zee_id_dropdown = $(this).find('option:selected').val();
                var params = {
                    zeeid: zee_id_dropdown,
                }
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_price_change_2', scriptId: 'customscript_sl_price_change_2' }) + '&custparam_params=' + params;
                currRec.setValue({ fieldId: 'custpage_price_change_zee_id', value: zee_id });
                window.location.href = upload_url;
            });

            /**
             * [description] - On click of the delete button
             */
            $(document).on('click', '.remove_class', function (event) {
                if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

                    $(this).closest('tr').find('.delete_service').val("T");
                    $(this).closest("tr").hide();
                }
            });

            /**
             *  Customer List - JQuery
             */
            $(document).on('click', ".edit_customer", function(){
                console.log('Cliced Edit Customer')
                $('.commRegSection').removeClass('hide');

                var cust_id = $(this).attr('custid');
                loadCommReg(cust_id);
            });
            $(document).on('click', ".review_customer", function(){
                console.log('Cliced Review Customer')
                $('.commRegSection').removeClass('hide');

                var cust_id = $(this).attr('custid');
                loadCommReg(cust_id);
            });
            $(document).on('click', ".edit_customer", function(){
                console.log('Cliced Upload SCF')
                $('.commRegSection').removeClass('hide');

                var cust_id = $(this).attr('custid');
                loadCommReg(cust_id);
            });


            /**
             *  Comm Regg - JQuery
             */
            $(document).on('click', '.edit_class', function(){
                console.log('Cliced Edit Class');
                $('.tabSection').removeClass('hide');

                var comm_reg_table = $('#comm_reg_preview').DataTable()

                var tr = $(this).closest('tr');
                var row = comm_reg_table.row(tr);
                var index = row.data();
                var comm_reg_id = index[1];
                console.log('Comm Reg ID: ' + comm_reg_id);

                loadCustService(17029, 485842);
            });
        }

        function loadCustomerList() {
            // var zeeRecord = record.load({ type: 'partner', id: zee_id });
            // var name = zeeRecord.getValue('companyname');

            //Search: SMC - Customer
            var customerSearch = search.load({ type: 'customer', id: 'customsearch_smc_customer' });
            customerSearch.filters.push(search.createFilter({
                name: 'partner',
                operator: search.Operator.ANYOF,
                values: zee_id
            }));
            customerSearch.run().each(function (searchResult) {
                var custid = searchResult.getValue({ name: 'internalid', join: null, summary: search.Summary.GROUP });
                var entityid = searchResult.getValue({ name: 'entityid', join: null, summary: search.Summary.GROUP });
                var companyname = searchResult.getValue({ name: 'companyname', join: null, summary: search.Summary.GROUP });
                var last_price_increase = searchResult.getValue({ name: 'custentity_date_of_last_price_increase', join: null, summary: search.Summary.GROUP });
                // var parent_maap_number = searchResult.getValue({ name: "custentity_maap_bankacctno_parent", join:sullSummary operatorsearch.Summary.GROUP});

                //WS Edit: Retrieve column values to Identify Reviewed Services and Correct CommReg
                var serviceCount = searchResult.getValue({ name: "formulanumeric", join: null, summary: search.Summary.MAX }); //Count of Reviewed Services
                var commRegCount = searchResult.getValue({ name: "formulacurrency", join: null, summary: search.Summary.COUNT }); //Count of Correct CommReg

                var inlineQty = '';
                //WS Edit: to Account for Duplicate CommReg
                if (commRegCount == 0) {
                    //   inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td ><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="UPLOAD SCF" onclick="commRegUpload(' + custid + ')" ></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                    dataSet1.push(['<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">', '<a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a>', '<p style="text-align:left;">' + companyname + '</p>', last_price_increase, '<tr class="dynatable-editable"><td><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="UPLOAD SCF"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" ></div></div></td></tr>'])
                } else if (commRegCount > 1) {
                    //   inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td ><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="Duplicate COMMREG"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                    dataSet1.push(['<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">', '<a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a>', '<p style="text-align:left;">' + companyname + '</p>', last_price_increase, '<tr class="dynatable-editable"><td><div class="row"><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="Duplicate COMMREG"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" ></div></div></td></tr>']) //onclick="onclick_cancel(' + custid + ')" | 

                } else if (serviceCount == 0) {
                    //If no service record present for customer, Review button will be shown
                    //   inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="review_customer form-control btn-warning" value="REVIEW" onclick=" (' + custid + ')" ></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                    dataSet1.push(['<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">', '<a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a>', '<p style="text-align:left;">' + companyname + '</p>', last_price_increase, '<tr class="dynatable-editable"><td><div class="row"><div class="col-sm-6"><input type="button" class="review_customer form-control btn-warning" value="REVIEW" ></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL"></div></div></td></tr>']) //onclick="onclick_cancel(' + custid + ')" | onclick=" (' + custid + ')"
                } else {
                    //If service record is present for customer, Edit button is shown
                    //   inlineQty += '<tr class="dynatable-editable"><td style="text-align: center;"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25"></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-primary" value="EDIT" onclick="onclick_serviceChangePage(' + custid + ')"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                    dataSet1.push(['<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">', '<a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a>', '<p style="text-align:left;">' + companyname + '</p>', last_price_increase, '<tr class="dynatable-editable"><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-primary" value="EDIT"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL"></div></div></td></tr>'])
                }

                // dataSet1.push(['☑', custid, companyname, last_price_increase, inlineQty]);

                return true;
            });
        }

        function loadCommReg(zee_id){
            var commRegSet = [];

            // var customer_comm_reg = record.load({ type: 'customrecord_commencement_register', id: commReg });
            var customer_comm_reg = search.load({ type: 'customrecord_commencement_register', id: 'customsearch_service_commreg_assign' });
            customer_comm_reg.filters.push(search.createFilter({
                name: 'custrecord_franchisee',
                operator: search.Operator.IS,
                values: zee_id
            }));

            customer_comm_reg.run().each(function(customer_comm_reg){
                // var comm_reg_id = customer_comm_reg.getValue({ fieldId: 'internalid' });
                var date_effective = customer_comm_reg.getValue({ name: 'custrecord_comm_date' });
                var sale_type = customer_comm_reg.getText({ name: 'custrecord_sale_type' });
                var cust_id = customer_comm_reg.getValue({ name: 'custrecord_customer'})

                commRegSet.push([commReg, sale_type, date_effective, '<td><button class="btn btn-warning btn-xs edit_class glyphicon glyphicon-pencil" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button></td>', cust_id]);
            });

            var commRegTable = $('#comm_reg_preview').DataTable();
            commRegTable.clear();
            commRegTable.rows.add(commRegSet)
            commRegTable.draw();

            return true;
        }

        function loadCustService(commReg, cust_id) {
            var customer_comm_reg = record.load({ type: 'customrecord_commencement_register', id: commReg });

            // var comm_reg_id = customer_comm_reg.getValue({ fieldId: 'internalid' });
            var date_effective = customer_comm_reg.getValue({ fieldId: 'custrecord_comm_date' });
            var sale_type = customer_comm_reg.getText({ fieldId: 'custrecord_sale_type' });

            var serviceSearch = search.load({ type: 'customrecord_service', id: 'customsearch_smc_services'})
            serviceSearch.filters.push(search.createFilter({
                name: 'custrecord_service_customer',
                operator: search.Operator.IS,
                values: cust_id // James Bond - Test
            }));
            serviceSearch.run().each(function(resultSet_service){
                var internalid = resultSet_service.getValue({ name: 'internalid' });

                var serv_chg = search.load({ type: 'customrecord_servicechg', id: 'customsearch_smc_service_chg' });
                serv_chg.filters.push(search.createFilter({
                    name: 'custrecord_servicechg_service',
                    operator: search.Operator.IS,
                    values: internalid
                }));
                serv_chg.filters.push(search.createFilter({
                    name: 'custrecord_servicechg_status',
                    operator: search.Operator.NONEOF,
                    values: [2,3]
                }));   
                serv_chg.run().each(function (searchResult_service_change) {
    
                    var internalid = searchResult_service_change.getValue({ name: 'internalid' });
    
                    var serv_name = searchResult_service_change.getText({ name: 'custrecord_servicechg_service'});
                    var serv_desc = searchResult_service_change.getValue({ name: "custrecord_service_description", join: "CUSTRECORD_SERVICECHG_SERVICE"})
                    var date_eff = searchResult_service_change.getValue({ name: 'custrecord_servicechg_date_effective'})
                    var new_price = '<input id="new_price" class="form-control new_price" type="number" value="' + searchResult_service_change.getValue({ name: 'custrecord_servicechg_new_price'}) + '"/>';
                    var old_price = '<input id="old_price" class="form-control old_price" type="number" value="' + searchResult_service_change.getValue({ name: 'custrecord_servicechg_old_price'}) + '"/>';
                    var last_mod = searchResult_service_change.getValue({ name: 'lastmodified'})
                    var type = searchResult_service_change.getValue({ name: 'custrecord_servicechg_type'})
                    var freq = searchResult_service_change.getText({ name: 'custrecord_servicechg_new_freq'});

                    var inlineQty = '';
                    if (searchResult_service_change.getValue({ name: 'custrecord_service_day_mon'}) == 'T') {
                        inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>';
                    } else {
                        inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>';
                    }
    
                    if (searchResult_service_change.getValue({ name: 'custrecord_service_day_tue'}) == 'T') {
                        inlineQty += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled checked/></div></td>';
                    } else {
                        inlineQty += '<td><div class="daily"><input class="tuesday_class"   type="checkbox" disabled/></div></td>';
                    }
    
                    if (searchResult_service_change.getValue({ name: 'custrecord_service_day_wed'}) == 'T') {
                        inlineQty += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled checked/></div></td>';
                    } else {
                        inlineQty += '<td><div class="daily"><input class="wednesday_class"   type="checkbox" disabled /></div></td>';
                    }
    
                    if (searchResult_service_change.getValue({ name: 'custrecord_service_day_thu'}) == 'T') {
                        inlineQty += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled checked/></div></td>';
                    } else {
                        inlineQty += '<td><div class="daily"><input class="thursday_class"   type="checkbox" disabled /></div></td>';
                    }
    
                    if (searchResult_service_change.getValue({ name: 'custrecord_service_day_fri'}) == 'T') {
                        inlineQty += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled checked/></div></td>';
                    } else {
                        inlineQty += '<td><div class="daily"><input class="friday_class"   type="checkbox" disabled /></div></td>';
                    }
    
                    if (searchResult_service_change.getValue({ name: 'custrecord_service_day_adhoc'}) == 'T') {
                        inlineQty += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled checked /></div></td>';
                    } else {
                        inlineQty += '<td><div class="daily"><input class="adhoc_class"   type="checkbox" disabled /></div></td>';
                    }

                    var created_by = searchResult_service_change.getText({ name: 'custrecord_servicechg_created' });
    
                    dataSet2.push(['<td><button class="btn btn-warning btn-xs edit_class glyphicon glyphicon-pencil" data-dateeffective="' + searchResult_service_change.getValue({ name: 'custrecord_servicechg_date_effective'}) + '" data-commreg="' + searchResult_service_change.getValue({ name: 'custrecord_servicechg_comm_reg'}) + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><button class="btn btn-danger btn-xs edit_class glyphicon glyphicon-trash" data-dateeffective="' + searchResult_service_change.getValue({ name: 'custrecord_servicechg_date_effective'}) + '" data-commreg="' + searchResult_service_change.getValue({ name: 'custrecord_servicechg_comm_reg'}) + '" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button></td>', serv_name, serv_desc, old_price, new_price, date_eff, created_by, last_mod, type, inlineQty])
    
                    return true;
                });
                return true;
            });
            
            var dataTable2 = $('#data_preview_edit').DataTable();
            dataTable2.clear();
            dataTable2.rows.add(dataSet2);
            dataTable2.draw();
        }

        function saveRecord(){

            var service_descp_elem = document.getElementsByClassName("service_descp");
        
            for (var i = 0; i < service_descp_elem.length; ++i) {
                var service_id = service_descp_elem[i].getAttribute('data-serviceid');
                var service_descp_value = service_descp_elem[i].value;
        
                if(!isNullorEmpty(service_descp_value)){
                    var service_record = nlapiLoadRecord('customrecord_service', service_id);
        
                    service_record.setFieldValue('custrecord_service_description', service_descp_value);
        
                    nlapiSubmitRecord(service_record);
                }
            }
        
            return true;
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,

        };
    }


);