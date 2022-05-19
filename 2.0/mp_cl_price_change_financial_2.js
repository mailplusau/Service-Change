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
 function(error, runtime, search, url, record, format, email, currentRecord) {
     var baseURL = 'https://1048144.app.netsuite.com';
     if (runtime.EnvType == "SANDBOX") {
         baseURL = 'https://1048144-sb3.app.netsuite.com';
     }
     var role = runtime.getCurrentUser().role;
     var currRec = currentRecord.get();

     var zee_id = parseInt(currRec.getValue({ fieldId: 'custpage_price_chng_fin_zee_id' }));
     if (!isNullorEmpty(zee_id)) {
         var zee_rec = record.load({ type: 'partner', id: zee_id });
         var zee_name = zee_rec.getValue({ fieldId: 'companyname' });
     }

     var dataSet = []

     // Load Service Record
     var serviceSea = search.load({ type: 'customrecord_service_type', id: 'customsearch_rta_service_types_2' })
     var serviceRes = serviceSea.run();
     serviceList = [];
     serviceRes.each(function(res) {
         var internalid = res.getValue({ name: 'internalid' });
         var name = res.getValue({ name: 'name' })
         serviceList.push({
             id: internalid,
             name: name
         });
         return true;
     });

     var savedList = [];
     var servSearch = search.load({
         id: 'customsearch_spc_finance_alloc',
         type: 'customrecord_spc_finance_alloc'
     });
     servSearch.filters.push(search.createFilter({
         name: 'custrecord_price_chg_fin_zee',
         operator: search.Operator.IS,
         values: zee_id
     }));
     servSearch.run().each(function(res) {
         var date_eff = res.getValue({ name: 'custrecord_price_chg_fin_date_eff' });
         var cust_id = res.getValue({ name: 'custrecord_price_chg_fin_cust_id' });
         var service_id = res.getValue({ name: 'custrecord_price_chg_fin_serv' });
         var inc_price = res.getValue({ name: 'custrecord_price_chg_fin_inc_am' });
         savedList.push({ custid: cust_id, zeeid: zee_id, servid: service_id, date: date_eff, incval: inc_price });
         return true;
     });
     console.log(savedList)

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
         $('#reset-all').removeClass('hide')
         $('#btn-show-all-children').removeClass('hide')
         $('#btn-hide-all-children').removeClass('hide')
         $('#submit').removeClass('hide');

         $(document).on("change", "#zee_filter_dropdown", function() {
             var zee_id_dropdown = $(this).find("option:selected").val();
             var params = {
                 zeeid: zee_id_dropdown,
             };
             params = JSON.stringify(params);
             var upload_url = baseURL + url.resolveScript({
                 deploymentId: "customdeploy_sl_price_change_financial_2",
                 scriptId: "customscript_sl_price_change_financial_2",
             }) + "&custparam_params=" + params;
             currRec.setValue({
                 fieldId: "custpage_price_chng_fin_zee_id",
                 value: zee_id,
             });
             window.location.href = upload_url;
         });

         $(document).on("click", "#spc_it_page", function() {
             var zee_id_dropdown = $(this).find("option:selected").val();
             var params = {
                 zeeid: zee_id_dropdown,
             };
             params = JSON.stringify(params);
             var upload_url = baseURL + url.resolveScript({
                 deploymentId: "customdeploy_sl_price_change_it_2",
                 scriptId: "customscript_sl_price_change_it_2",
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
                     { title: "Internal ID" }, // 0
                     { title: "Customer ID" }, // 1
                     { title: "Company Name" }, // 2
                     // { title: "Current Service Price" }, // 3,
                     // { title: "Scheduled Increase Amount" }, // 4,
                     // { title: 'Total Scheduled Increase Amount' }, // 5
                     // { title: "Date Effective" }, // 6
                     { title: "Franchisee" }, // 3,
                     { title: "Date Last Price Increase" }, // 4,,
                     { title: 'Completed?' } // 6 new
                 ],
                 columnDefs: [{
                         targets: [6],
                         visible: false,
                     },
                     // {
                     //     width: "25%",
                     //     targets: [4]
                     // }
                 ],
                 autoWidth: false,
             });

             // Load with All Child Cells Open
             dataTable.rows().every(function() {
                 // this.child(format(this.data())).show();
                 this.child(createChild(this)).show();
             });

             // Handle click on "Expand All" button
             $('#btn-show-all-children').on('click', function(){
                 // Enumerate all rows
                 dataTable.rows().every(function(){
                     // If row has details collapsed
                     if(!this.child.isShown()){
                         // Open this row
                         this.child.show();
                         $(this.node()).addClass('shown');
                     }
                 });
             });

             // Handle click on "Collapse All" button
             $('#btn-hide-all-children').on('click', function(){
                 // Enumerate all rows
                 dataTable.rows().every(function(){
                     // If row has details expanded
                     if(this.child.isShown()){
                         // Collapse row details
                         this.child.hide();
                         $(this.node()).removeClass('shown');
                     }
                 });
             });

             // Remove all Increase Amount Data
             $('#reset-all').on('click', function() {
                 // Set Values as Null
                 $('.total_amount').val('');
                 $('.increase_amount').text('$0.00')
                 $('.new_date_eff').val('');
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
         }

         // Submitter
         $('#submit').on('click', function() {
             saveRecord();
         });

         /** 
          *  Popup - Modal: Select Services
          */

         $(document).on('click', '#servicesAll', function() {
             onclick_listOfServices();
         });
         $(document).on('click', '#bulkUpdate', function() {
             onclick_bulkUpdate();
         });
         /* On click of the Add button */
         $(document).on('click', '.add_class', function(event) {
             console.log($(this).closest('tr').find('.service_name').val());

             if (!isNullorEmpty($(this).closest('tr').find('.service_name').val()) || !isNullorEmpty($(this).closest('tr').find('.inc_amount').val()) || !isNullorEmpty($(this).closest('tr').find('.date_eff_all').val())) {
                 var create_service_html = '';

                 create_service_html += '<tr><td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="' + $(this).closest('tr').find('.service_name').val() + '" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button><input type="hidden" class="delete_service" value="F" /></td>';
                 create_service_html += '<td><select class="form-control service_name" >';
                 create_service_html += '<option></option>'
                 serviceList.forEach(function(searchResult) {
                     var operator_internal_id = searchResult.id;
                     var operator_name = searchResult.name;
                     create_service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

                     return true;
                 })

                 create_service_html += '</select></td>';
                 // Increase Amount
                 create_service_html += '<td><input class="form-control inc_amount" placeholder="$" type="number"/></td>';
                 //Date Effective
                 create_service_html += '<td><input id="date_eff_all" class="form-control date_eff_all" type="date" value="' + $('#date_effective').val() + '"/></td>';

                 create_service_html += '</tr>';

                 $('#service_table tr:last').after(create_service_html);

                 $(this).closest('tr').find('.add_class').attr("data-serviceid", $(this).closest('tr').find('.service_name').val());

                 $(this).toggleClass('btn-warning btn-success')
                 $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                 $(this).toggleClass('edit_service_class add_class');
                 $(this).find('edit_class').prop('title', 'Edit Service');
                 $(this).closest('tr').find('.inc_amount').attr("disabled", "disabled");
                 $(this).closest('tr').find('.service_name').attr("disabled", "disabled");
                 $(this).closest('tr').find('.date_eff_all').attr("disabled", "disabled");

                 $(this).closest('tr').find('.first_col').append('<button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button>');
             } else {
                 if ($(this).closest('tr').find('.inc_amount').val()) {
                     alert('Invalid Increase Amount. Please add a valid Increase Amount to Proceed');
                 } else {
                     if (isNullorEmpty($(this).closest('tr').find('.date_eff_all').val())) {
                         alert('Please Add Valid Date to Proceed');
                     } else {
                         alert('No Service Selected. Please Selected a Service Amount to Proceed');
                     }

                 }
             }
         });


         $(document).on('click', '.edit_service_class', function(event) {

             $(this).closest('tr').find('.inc_amount').removeAttr("disabled");
             $(this).closest('tr').find('.service_name').removeAttr("disabled");
             $(this).closest('tr').find('.date_eff_all').removeAttr("disabled");

             $(this).toggleClass('btn-warning btn-success')
             $(this).toggleClass('glyphicon-pencil glyphicon-plus');
             $(this).toggleClass('edit_service_class save_edit_class');

         });


         $(document).on('click', '.save_edit_class', function(event) {

             $(this).closest('tr').find('.inc_amount').attr("disabled", "disabled");
             $(this).closest('tr').find('.service_name').attr("disabled", "disabled");
             $(this).closest('tr').find('.date_eff_all').attr("disabled", "disabled");

             var new_service_id = $(this).closest('tr').find('.service_name').val();
             $(this).attr('data-serviceid', new_service_id);

             $(this).toggleClass('btn-warning btn-success')
             $(this).toggleClass('glyphicon-pencil glyphicon-plus');
             $(this).toggleClass('edit_service_class save_edit_class');

         });

         /**
          * [description] - On click of the delete button
          */
         $(document).on('click', '.remove_class', function(event) {
             if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

                 $(this).closest('tr').find('.delete_service').val("T");
                 $(this).closest("tr").hide();
                 $(this).closest('tr').addClass('hidden')
             }
         });

         $(document).on('click', '.save_service', function(event) {

             var delete_service_elem = document.getElementsByClassName("delete_service");
             var edit_class_elem = document.getElementsByClassName("edit_service_class");
             var inc_amount_elem = document.getElementsByClassName("inc_amount");
             var service_name_elem = document.getElementsByClassName("service_name");
             var date_eff_elem = document.getElementsByClassName('date_eff_all');
             console.log(service_name_elem);
             console.log(service_name_elem[0]);
             for (var i = 0; i < edit_class_elem.length; ++i) {

                 var serviceID = edit_class_elem[i].getAttribute('data-zeeservid');
                 console.log('Service ID: ' + serviceID)

                 if (delete_service_elem[i].value == 'T') {
                     if (!isNullorEmpty(serviceID)) {
                         console.log('Deleted Record');
                         var zee_service_record = record.load({
                             type: 'customrecord_spc_zee_serv_list',
                             id: serviceID,
                         });
                         zee_service_record.setValue({ fieldId: 'isinactive', value: true });
                         zee_service_record.save({
                             enableSourcing: true,
                             ignoreMandatoryFields: true
                         });
                         console.log('Save ID: ' + zee_service_record)
                     }
                 } else {
                     if (isNullorEmpty(serviceID)) {
                         console.log('New');
                         var zee_service_record = record.create({ type: 'customrecord_spc_zee_serv_list' });
                     } else {
                         console.log('Edit Existing');
                         var zee_service_record = record.load({
                             type: 'customrecord_spc_zee_serv_list',
                             id: serviceID,
                         });
                     }
                     var serv_name_select = service_name_elem[i];
                     zee_service_record.setValue({ fieldId: 'name', value: serv_name_select.options[serv_name_select.selectedIndex].text })
                     zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_serv_inc_am', value: inc_amount_elem[i].value });
                     zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_serv_id', value: edit_class_elem[i].getAttribute('data-serviceid') });
                     zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_serv_zee', value: zee_id });
                     console.log('Date: ' + date_eff_elem[i].value)
                     var date_eff = new Date(date_eff_elem[i].value);
                     console.log('Date: ' + date_eff)
                     if (!isNullorEmpty(date_eff)) {
                         date_eff = date_eff.toISOString().split('T')[0];
                         zee_service_record.setValue({ fieldId: 'custrecord_spc_zee_date_eff', value: date_eff });
                     }
                     try {
                         zee_service_record.save({
                             enableSourcing: true,
                             ignoreMandatoryFields: true
                         });
                         console.log('Save ID: ' + zee_service_record)
                     } catch (e) {
                         alert(e)
                     }
                 }
             }
             // Update all Services Line Items
             var inc_amount_elem = document.getElementsByClassName("inc_amount");
             var service_name_elem = document.getElementsByClassName("service_name");
             var date_eff_elem = document.getElementsByClassName('date_eff_all')

             for (var x = 0; x < service_name_elem.length - 1; x++) {
                 var classLength = $('.' + service_name_elem[x].value).length;

                 var val = $('.' + service_name_elem[x].value).closest('td').prev().text();
                 var val_array = val.split('$');
                 console.log($('.' + service_name_elem[x].value).closest('td').prev().text())

                 var inv_price = val_array[x + 1];

                 var format_val = Number(inv_price.replace(/[^0-9.-]+/g, ""));
                 var total_val = (format_val + parseInt(inc_amount_elem[x].value));

                 $('.' + service_name_elem[x].value).val(total_val);

                 $('.new_date_eff_' + service_name_elem[x].value).val(date_eff_elem[x].value);
             };

             // Update Increase Amounts


             alert('All Service Increase Amounts have been Updated')
         });

         /**
          *  Functionality On Page
          */
         $(document).on('change', '.total_amount', function(){
             var tot_amount = $(this).val(); // Total Amount Integer | col 4
             var inv_amount = $(this).closest('td').prev().prev().text(); // Current invoice Amount | col 2
             var inv_amount_val = inv_amount.split('$')[1]; 
             inv_amount_val = Number(inv_amount_val.replace(/[^0-9.-]+/g, "")); // Current Invoice Amount Integer

             if (tot_amount != 0 && !isNullorEmpty(tot_amount)){
                 var increase_amount = tot_amount - inv_amount_val;
                 increase_amount = financial(increase_amount);
                 console.log($(this).closest('td').prev().text());
                 // var increase_amount_id = $(this).closest('td').prev().attr('id');
                 $(this).closest('td').prev().replaceWith('<td><label class="form-control increase_amount " disabled>' + increase_amount + '</label></td>');
             } else {
                 increase_amount = financial(0);
                 $(this).closest('td').prev().replaceWith('<td><label class="form-control increase_amount " disabled>' + increase_amount + '</label></td>');
             }
             
             console.log($(this).closest('tr').find('.date_effective').val())
             if (!isNullorEmpty($(this).closest('tr').find('.date_effective').val())){
                 $(this).parents('tr').attr('style','background-color: green');
             };
         });


     }

     function createChild(row) {
         // This is the table we'll convert into a DataTable
         var table = $('<table class="display" width="50%"/>');

         var childSet = [];
         row.data()[6].forEach(function(el) {
             childSet.push([el.item, '<label id="' + el.item + '" class="services" data-servid="' + el.id + '" data-custid="' + el.custid + '" type="text">' + el.curr_inv_price + '</label>', '<label id="' + el.id + '" class="form-control increase_amount ' + el.id + '"disabled>' + financial(el.inc_price) + '</label>', ' <input id="' + el.id + '" class="form-control total_amount ' + el.id + '" placeholder="$" type="number" value="' + el.tot_price + '"/>', '<input type="date" class="form-control new_date_eff new_date_eff_' + el.id + '" ' + el.date_eff + ' value="'+el.date_eff+'"/>', false]);
             //<input id= "' + el.item_id + '" class="form-control inc_price" ' + el.inc_price + ' disabled/>
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
                 { title: 'Current Invoice Price' }, //1
                 { title: 'Increase Amount' }, //2
                 { title: 'New Price' }, //3
                 { title: 'Date Effective' },//4
                 { title: 'Complete?' } //5
             ],
             columnDefs: [
                 {
                     targets: 5,
                     visible: false
                 },
             ],
             rowCallback: function(row, data) {
                 if (data[5] == true){
                     if ($(row).hasClass('odd')) {
                         $(row).css('background-color', 'rgba(144, 238, 144, 0.75)'); // LightGreen
                     } else {
                         $(row).css('background-color', 'rgba(152, 251, 152, 0.75)'); // YellowGreen
                     }
                 }
             }
         });
     }

     function destroyChild(row) {
         // var table = $("table", row.child());
         // table.detach();
         // table.DataTable().destroy();

         // And then hide the row
         row.child.hide();
     }

     function loadCustomers(zee_id) {
         var saveServQty = '';
         var serviceTot = 0;
         var service_count = 0;
         var prev_cust_id = [];
         var index = 0;
         var totalAmount = 0;

         var childObject = [];

         var saveInlineQty = '';

         //Search: SMC - Customer
         var customerSearch = search.load({
             type: "customer",
             id: "customsearch_smc_customer_4",
         });
         customerSearch.filters.push(search.createFilter({
             name: "partner",
             operator: search.Operator.ANYOF,
             values: zee_id,
         }));

         customerSearch.run().each(function(searchResult) {
             // console.log('Index: ' + index)
             var custid = searchResult.getValue({
                 name: "internalid",
                 summary: "GROUP"
             });
             if (index == 0) {
                 prev_cust_id.push(custid);
             }

             var entityid = searchResult.getValue({
                 name: "entityid",
                 summary: "GROUP"
             });
             var companyname = searchResult.getValue({
                 name: "companyname",
                 summary: "GROUP"
             });
             var last_price_increase = searchResult.getValue({
                 name: "custentity_date_of_last_price_increase",
                 summary: "GROUP"
             });

             /**
              *  List of Services
              */
             var service = searchResult.getText({
                 name: "custrecord_service",
                 join: 'CUSTRECORD_SERVICE_CUSTOMER',
                 summary: "GROUP"
             });
             var service_lower = service.toLowerCase();

             if (!isNullorEmpty(service)) {
                 /**
                  *  List of Current Service Inline HTML
                  */
                 var serviceQty = ''; // <div class="form-group container">

                 if (service_count == 2 || service_count == 4) {
                     saveServQty += '<div class="w-100"></div>'
                 }
                 var service_price = '$' + searchResult.getValue({
                     name: "custrecord_service_price",
                     join: 'CUSTRECORD_SERVICE_CUSTOMER',
                     summary: "GROUP"
                 });

                 var inv_price = '$' + searchResult.getValue({
                     name: "itempricingunitprice",
                     summary: "GROUP"
                 });

                 var service_id = serviceList.filter(function(el) { if (el.name == service) { return el } })[0].id;

                 if (!isNullorEmpty(savedList)) {
                     // console.log('List is not blank')
                     var savedListFiltered = savedList.filter(function(el) { if (el.custid == custid && el.servid == service_id) { return el } });
                     console.log(savedListFiltered);

                     if (savedListFiltered.length > 0) {
                         savedListFiltered.forEach(function(res) {
                             console.log('Result: ' + res.date)

                             var inv_price_val = inv_price.split('$')[1];
                             inv_price_val = Number(inv_price_val.replace(/[^0-9.-]+/g, ""));
                             console.log('Price: ' + inv_price_val)
                             // inv_price_val = financial(inv_price_val)

                             console.log(res.incval - inv_price_val);

                             childObject.push({ id: service_id, item: service, curr_inv_price: inv_price, inc_price: (parseInt(res.incval) - parseInt(inv_price_val)), tot_price: res.incval, date_eff: res.date, serv_price: service_price, custid: custid });

                             return true;
                         })
                     } else {
                         childObject.push({ id: service_id, item: service, curr_inv_price: inv_price, inc_price: '', tot_price: '', date_eff: '', serv_price: service_price, custid: custid });
                     }
                 } else {
                     childObject.push({ id: service_id, item: service, curr_inv_price: inv_price, inc_price: '', tot_price: '', date_eff: '', serv_price: service_price, custid: custid });
                 }
             }

             if (prev_cust_id.indexOf(custid) == -1) {


                 dataSet.push(['',
                     '<p id="internalID" class="internalID">' + custid + '</p>',
                     '<a href="' + baseURL + "/app/common/entity/custjob.nl?id=" + custid + '"><p class="entityid" style="text-align:left;">' + entityid + "</p></a>",
                     '<p internalid="companyname" class="companyname">' + companyname + '</p>',
                     zee_name,
                     last_price_increase,
                     childObject
                 ]);

                 service_count = 0;
                 saveServQty = '';
                 saveInlineQty = '';

                 childObject = [];
             }
             prev_cust_id.push(custid);

             totalAmount++;
             index++;

             return true;
         });
     }

     function onclick_listOfServices() {
         // Header Information
         var service_html = '<table id= "service_table" class="table table-responsive table-striped"><thead><tr class="info"><th><b>ACTION</b></th><th><b>SERVICE NAME</b></th><th><b>INCREASE AMOUNT</b></th><th><b>DATE EFFECTIVE</b></th>';
         service_html += '</thead><tbody>';

         // Load Zee Services
         var searchSet = search.load({ type: 'customrecord_spc_zee_serv_list', id: 'customsearch_spc_zee_serv_list' });
         searchSet.filters.push(search.createFilter({
             name: 'custrecord_spc_zee_serv_zee',
             operator: search.Operator.IS,
             values: zee_id
         }));
         var resultSet_Service = searchSet.run();

         /**
          *  Existing Services
          */
         resultSet_Service.each(function(searchResult_Service) {

             service_html += '<tr>';

             service_html += '<td class="first_col"><button class="btn btn-warning btn-sm edit_service_class glyphicon glyphicon-pencil" data-serviceid="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) + '" data-zeeservid="' + searchResult_Service.getValue({ name: "internalid" }) + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" data-serviceid="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) + '" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

             service_html += '<td><select class="form-control service_name" disabled>';
             serviceList.forEach(function(searchResult) {
                 var operator_internal_id = searchResult.id;
                 var operator_name = searchResult.name;

                 if (searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) == operator_internal_id) {
                     service_html += '<option selected value="' + operator_internal_id + '">' + operator_name + '</option>';
                 } else {
                     service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';
                 }

                 return true;
             })

             service_html += '<td><input id="inc_amount" class="form-control inc_amount" placeholder="$" type="number" value="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_inc_am' }) + '" disabled/></td>';

             service_html += '<td><input id="" class="form-control date_eff_all" type="date" value="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_date_eff' }) + '" disabled/></td>';

             service_html += '</select></td>';
             service_html += '</tr>';

             return true;
         });


         /**
          *  Add New Service
          */
         service_html += '<tr>';

         // Add Button
         service_html += '<td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="" data-zeeservid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button><input type="hidden" class="delete_service" value="F" /></td>';
         // Service Name
         service_html += '<td><select class="form-control service_name" >';
         service_html += '<option></option>';
         serviceList.forEach(function(searchResult) {
             var operator_internal_id = searchResult.id;
             var operator_name = searchResult.name;
             service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

             return true;
         })
         service_html += '</select></td>';
         // Increase Amount
         service_html += '<td><input class="form-control inc_amount" placeholder="$" type="number"/></td>';

         service_html += '<td><input class="form-control date_eff_all" type="date"/></td>';

         service_html += '</tr>';

         // Create Modal
         service_html += '</tbody></table>';
         $('#myModal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Add/Edit List of Services</label></h4></div>');
         $('#myModal .modal-body').html("");
         $('#myModal .modal-body').html(service_html);
         $('#myModal').modal("show");
     }

     function onclick_bulkUpdate(){
         // Header Information
         var service_html = '<table id= "service_table" class="table table-responsive table-striped"><thead><tr class="info"><th><b>ACTION</b></th><th><b>SERVICE NAME</b></th><th><b>INCREASE AMOUNT</b></th><th><b>DATE EFFECTIVE</b></th>';
         service_html += '</thead><tbody>';

         // Load Zee Services
         var searchSet = search.load({ type: 'customrecord_spc_zee_serv_list', id: 'customsearch_spc_zee_serv_list' });
         searchSet.filters.push(search.createFilter({
             name: 'custrecord_spc_zee_serv_zee',
             operator: search.Operator.IS,
             values: zee_id
         }));
         var resultSet_Service = searchSet.run();

         /**
          *  Existing Services
          */
         resultSet_Service.each(function(searchResult_Service) {

             service_html += '<tr>';

             service_html += '<td class="first_col"><button class="btn btn-warning btn-sm edit_service_class glyphicon glyphicon-pencil" data-serviceid="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) + '" data-zeeservid="' + searchResult_Service.getValue({ name: "internalid" }) + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" data-serviceid="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) + '" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

             service_html += '<td><select id="zee_bulk_dropdown" class="form-control ui search dropdown" multiple="">';
             service_html += '<option></option>';
             var zeesSearch = search.load({ type: 'partner', id: 'customsearch_smc_franchisee' });
             // zeesSearch.filters.push(search.createFilter({
             //     name: 'entityid',
             //     operator: search.Operator.DOESNOTSTARTWITH,
             //     values: 'Test'
             // }))
             var zeesSearchResults = zeesSearch.run();
             zeesSearchResults.each(function(zeesSearchResult) {
                 var zee_id = zeesSearchResult.getValue({ name: 'internalid', summmary: search.Summary.GROUP });
                 var zee_name = zeesSearchResult.getValue({ name: 'companyname', summmary: search.Summary.GROUP });
                 var zee_state = zeesSearchResult.getText({ name: 'location' });

                 service_html += '<option value="' + zee_id + '" state="' + zee_state + '">' + zee_name + '</option>';

                 return true;
             });
             service_html += '</select></td>';

             service_html += '<td><select class="form-control service_name" disabled>';
             serviceList.forEach(function(searchResult) {
                 var operator_internal_id = searchResult.id;
                 var operator_name = searchResult.name;

                 if (searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_id' }) == operator_internal_id) {
                     service_html += '<option selected value="' + operator_internal_id + '">' + operator_name + '</option>';
                 } else {
                     service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';
                 }

                 return true;
             })

             service_html += '<td><input id="inc_amount" class="form-control inc_amount" placeholder="$" type="number" value="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_serv_inc_am' }) + '" disabled/></td>';

             service_html += '<td><input id="" class="form-control date_eff_all" type="date" value="' + searchResult_Service.getValue({ name: 'custrecord_spc_zee_date_eff' }) + '" disabled/></td>';

             service_html += '</select></td>';
             service_html += '</tr>';

             return true;
         });

         /**
          *  Add New Service
          */
         service_html += '<tr>';

         // Add Button
         service_html += '<td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-serviceid="" data-zeeservid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Service"></button><input type="hidden" class="delete_service" value="F" /></td>';

         service_html += '<td><select id="zee_bulk_dropdown" class="form-control" multiple="">';
         service_html += '<option></option>';
         var zeesSearch = search.load({ type: 'partner', id: 'customsearch_smc_franchisee' });
         // zeesSearch.filters.push(search.createFilter({
         //     name: 'entityid',
         //     operator: search.Operator.DOESNOTSTARTWITH,
         //     values: 'Test'
         // }))
         var zeesSearchResults = zeesSearch.run();
         zeesSearchResults.each(function(zeesSearchResult) {
             var zee_id = zeesSearchResult.getValue({ name: 'internalid', summmary: search.Summary.GROUP });
             var zee_name = zeesSearchResult.getValue({ name: 'companyname', summmary: search.Summary.GROUP });
             var zee_state = zeesSearchResult.getText({ name: 'location' });

             service_html += '<option value="' + zee_id + '" state="' + zee_state + '">' + zee_name + '</option>';

             return true;
         });
         service_html += '</select></td>';

         // Service Name
         service_html += '<td><select class="form-control service_name" >';
         service_html += '<option></option>';
         serviceList.forEach(function(searchResult) {
             var operator_internal_id = searchResult.id;
             var operator_name = searchResult.name;
             service_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

             return true;
         })
         service_html += '</select></td>';
         // Increase Amount
         service_html += '<td><input class="form-control inc_amount" placeholder="$" type="number"/></td>';

         service_html += '<td><input class="form-control date_eff_all" type="date"/></td>';

         service_html += '</tr>';

         // Create Modal
         service_html += '</tbody></table>';
         $('#myModal2 .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Add/Edit List of Services</label></h4></div>');
         $('#myModal2 .modal-body').html("");
         $('#myModal2 .modal-body').html(service_html);
         $('#myModal2').modal("show");
     }

     function saveRecord(context) {
         var dataTable = $("#debt_preview").DataTable();
         dataTable.rows().every(function() {
             this.child.show();
         });

         /** 
          *  Data in Table 
          */
         var date_eff_elem = document.getElementsByClassName('new_date_eff');
         var inc_am_elem = document.getElementsByClassName('total_amount');
         var inv_price_elem = document.getElementsByClassName('services');

         for (var x = 0; x < inv_price_elem.length - 1; x++) {
             var serv_id_elem = inv_price_elem[x].getAttribute('data-servid');
             var cust_id_elem = inv_price_elem[x].getAttribute('data-custid');

             var inc_price_assigned = inc_am_elem[x].getAttribute('data-inc-amount');

             var date_eff = date_eff_elem[x].value;
             var inc_am = inc_am_elem[x].value;

             if (!isNullorEmpty(inc_am) && inc_am != 0) {
                 var cust_id = cust_id_elem;
                 var service_id = serv_id_elem;

                 console.log(cust_id + ' ServiceID ' + service_id + ' Date ' + date_eff);

                 /**
                  *  Customer ID
                  *  Franchisee
                  *  Date Effective
                  *  Service
                  *  New Price
                  */
                 // var servRec = record.load({ type: '', id: '' })
                 // servRec.getValue({ fieldId: '' })
                 // if () {

                 // } else {
                 var rec = record.create({
                     // type: 'customrecord_spc_zee_each_alloc', 
                     type: 'customrecord_spc_finance_alloc',
                     isDynamic: true
                 });
                 rec.setValue({ fieldId: 'name', value: zee_name });
                 rec.setValue({ fieldId: 'custrecord_price_chg_fin_cust_id', value: cust_id })
                 rec.setValue({ fieldId: 'custrecord_price_chg_fin_zee', value: zee_id })
                 rec.setValue({ fieldId: 'custrecord_price_chg_fin_date_eff', value: date_eff })
                 rec.setValue({ fieldId: 'custrecord_price_chg_fin_serv', value: service_id })
                 rec.setValue({ fieldId: 'custrecord_price_chg_fin_inc_am', value: inc_am })
                 rec.save();
                 // }
             }
             // else {
             //     if (isNullorEmpty(date_eff)) {
             //         alert('Date Effective is Missing');
             //     }
             // }
         }

         alert('Record has been Saved');

         location.reload();

         return true;
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