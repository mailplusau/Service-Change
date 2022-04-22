/**
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 *
 * Description:
 * @Last Modified by: Anesu Chakaingesu
 *
 */

define([
    "N/error",
    "N/runtime",
    "N/search",
    "N/url",
    "N/record",
    "N/format",
    "N/email",
    "N/currentRecord",
], function(
    error,
    runtime,
    search,
    url,
    record,
    format,
    email,
    currentRecord
) {
    var baseURL = "https://1048144.app.netsuite.com";
    if (runtime.EnvType == "SANDBOX") {
        baseURL = "https://1048144-sb3.app.netsuite.com";
    }

    var role = runtime.getCurrentUser().role;

    var ctx = runtime.getCurrentUser();

    var currRec = currentRecord.get();

    var zee_id = currRec.getValue({ fieldId: "custpage_price_change_zee_id" });
    if (isNullorEmpty(zee_id)) {
        zee_id = 0;
    }

    var cust_id = 0;
    var next_cust_id = 0;

    var state = currRec.getValue({ fieldId: "custpage_price_change_state" });

    var commReg = currRec.getValue({ fieldId: "custpage_price_change_comm_reg" });
    if (isNullorEmpty(commReg)) {
        commReg = null;
    }

    var dataSet1 = [];
    var dataSet2 = [];
    var dataSet3 = [];

    /**
     * On page initialisation
     */
    function pageInit() {
        console.log(runtime.getCurrentUser());
        // Background-Colors
        $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
        $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
        $("#body").css("background-color", "#CFE0CE");

        if (zee_id != 0) {
            $("#table_preview").removeClass("hide");

            loadCustomerList();
        }

        console.log("Current User: " + ctx.id);

        state = $("#zee_filter_dropdown").val();

        var dataTable1 = $("#table_preview").DataTable({
            data: dataSet1,
            pageLength: 100,
            order: [],
            columns: [
                { title: "Review Complete" }, // 0
                { title: "ID" }, // 1
                { title: "Customer Name" }, // 2
                { title: "Date of Last Price Increase" }, // 3
                { title: "Action" }, // 4,
            ],
            // columnDefs: [{
            //     targets: 5,
            //     visible: false
            // }],
            autoWidth: false,
            rowCallback: function(row, data) {
                if (data[5] == "edit") {
                    $(row).css("background-color", "rgba(144, 238, 144, 0.75)"); // LightGreen
                } else if (data[5] == "new") {
                    $(row).css("background-color", "rgba(152, 251, 152, 0.75)"); // YellowGreen
                } else {
                    // Blank
                }
            },
        });

        var dataTable3 = $("#comm_reg_preview").DataTable({
            data: dataSet3,
            pageLength: 100,
            order: [],
            columns: [
                { title: "ID" }, // 0
                { title: "Sales Type" }, // 1
                { title: "Date Effective" }, // 2
                { title: "Action" }, // 3,
                { title: "Customer ID" }, // 4
            ],
            columnDefs: [{
                targets: [4],
                visible: false,
            }, ],
            autoWidth: false,
        });

        var dataTable2 = $("#data_preview_edit").DataTable({
            data: dataSet2,
            pageLength: 100,
            order: [],
            columns: [
                { title: "Action" }, // 0
                { title: "Service Name" }, // 1
                { title: "Service Description" }, // 2
                { title: "Old Price" }, // 3
                { title: "New Price" }, // 4
                { title: "Date Effective" }, // 5
                { title: "Created By" }, // 6
                { title: "Last Modified" }, // 7
                { title: "Type" }, // 8
                { title: "Frequency - M | T | W | T | F | Ad" }, // 9
            ],
            columnDefs: [],
            autoWidth: false,
        });

        $(".loading_section").addClass("hide");

        $(document).on("change", "#zee_filter_dropdown", function() {
            var zee_id_dropdown = $(this).find("option:selected").val();
            var params = {
                zeeid: zee_id_dropdown,
            };
            params = JSON.stringify(params);
            var upload_url =
                baseURL +
                url.resolveScript({
                    deploymentId: "customdeploy_sl_price_change_2",
                    scriptId: "customscript_sl_price_change_2",
                }) +
                "&custparam_params=" +
                params;
            currRec.setValue({
                fieldId: "custpage_price_change_zee_id",
                value: zee_id,
            });
            window.location.href = upload_url;
        });

        $(document).on("click", "#smc", function() {
            var upload_url =
                baseURL +
                url.resolveScript({
                    deploymentId: "customdeploy_sl_smc_summary",
                    scriptId: "customscript_sl_smc_summary",
                });

            window.location.href = upload_url;
        });

        /**
         *  Tab Section: Buttons
         */

        // Edit

        /**
         *  Customer List - JQuery
         */
        $(document).on("click", ".edit_customer", function() {
            $(".commRegSection").removeClass("hide");

            cust_id = $(this).attr("custid");
            //  next_cust_id = $(this).next().attr("custid");
            //  next_cust_id = $(this).nextAll("custid:first")
            next_cust_id = $(this).parent().parent().next().attr("custid");

            console.log("Cliced Edit Customer: " + cust_id);
            console.log("NExt Edit Customer: " + next_cust_id);

            var params = {
                zeeid: zee_id,
                custid: cust_id,
            };
            var upload_url =
                baseURL +
                url.resolveScript({
                    deploymentId: "customdeploy_sl_smc_summary",
                    scriptId: "customscript_sl_smc_summary",
                }) +
                "&custparams_params=" +
                params;

            window.open(upload_url, "_blank");
        });
        $(document).on("click", ".review_customer", function() {
            console.log("Cliced Review Customer");
            $(".commRegSection").removeClass("hide");

            cust_id = $(this).attr("custid");
            next_cust_id = $(this).next().attr("custid");

            loadCommReg(zee_id, cust_id);

            var params = { custid: cust_id, servicechange: 0 };
            var upload_url =
                "https://1048144-sb3.app.netsuite.com/app/site/hosting/scriptlet.nl?script=628&deploy=1&compid=1048144_SB3&unlayered=T&custparam_params=" +
                params +
                "";

            window.open(upload_url, "_blank");
        });
        $(document).on("click", ".upload_scf", function() {
            console.log("Cliced Upload SCF");
            $(".commRegSection").removeClass("hide");

            cust_id = $(this).attr("custid");
            next_cust_id = $(this).next().attr("custid");

            loadCommReg(zee_id, cust_id);
        });

        /**
         *  Comm Regg - JQuery
         */
        $(document).on("click", ".edit_class", function() {
            console.log("Cliced Edit Class");
            $(".tabSection").removeClass("hide");

            var comm_reg_table = $("#comm_reg_preview").DataTable();
            var tr = $(this).closest("tr");
            var row = comm_reg_table.row(tr);
            var index = row.data();
            var comm_reg_id = index[0];
            var cust_id = index[4];
            console.log("Comm Reg ID: " + comm_reg_id);
            console.log("Customer ID: " + cust_id);

            //  loadCustService(comm_reg_id, cust_id);
            loadCustService(37643, 718816);
            // asdasd
        });
        $(document).on("click", "#create_new", function() {
            var comm_reg_table = $("#comm_reg_preview").DataTable();
            var tr = $(this).closest("tr");
            var row = comm_reg_table.row(tr);
            var index = row.data();
            var cust_id = index[4];
            console.log("Customer ID: " + cust_id);

            var custRec = record.load({ type: "customrecord_customer", id: cust_id });
            var customer_status = custRec.getValue({ fieldId: "entitystatus" });

            // var comm_reg_id = createCommReg(cust_id, dateEffective, zee_id, state, sendemail, customer_status);

            loadCustService(comm_reg_id, cust_id);
        });
        $(document).on("click", "#cancel_service", function() {
            var comm_reg_table = $("#comm_reg_preview").DataTable();
            var tr = $(this).closest("tr");
            var row = comm_reg_table.row(tr);
            var index = row.data();
            var cust_id = index[4];
            console.log("Customer ID: " + cust_id);

            var custRec = record.load({ type: "customrecord_customer", id: cust_id });
            var customer_status = custRec.getValue({ fieldId: "entitystatus" });

            // var comm_reg_id = createCommReg(cust_id, dateEffective, zee_id, state, sendemail, customer_status);

            loadCustService(comm_reg_id, cust_id);
        });

        /**
         *  Customer Service
         */
        $(document).on("click", ".remove_class", function(event) {
            alert("Remove Service Name");

            if (
                confirm(
                    "Are you sure you want to delete this item?\n\nThis action cannot be undone."
                )
            ) {
                $(this).closest("tr").find(".delete_service").val("T");
                $(this).closest("tr").hide();
            }
        });
        $(document).on("click", ".edit_service", function() {
            if ($(".old_price").attr("disabled")) {
                $(".old_price").removeAttr("disabled");
            } else {
                $(".old_price").attr("disabled");
            }
            if ($(".new_price").attr("disabled")) {
                $(".new_price").removeAttr("disabled");
            } else {
                $(".new_price").attr("disabled");
            }
        });

        $(document).on("click", "#submit", function() {
            alert("Record Submitted");
        });

        $(document).on("click", "#next_customer", function() {
            loadCustService(zee_id, cust_id);
        });
    }

    function loadCustomerList() {
        // var zeeRecord = record.load({ type: 'partner', id: zee_id });
        // var name = zeeRecord.getValue('companyname');

        // var financeRec = record.load({ type: '', id: 4 });
        // financeRec.

        //Search: SMC - Customer
        var customerSearch = search.load({
            type: "customer",
            id: "customsearch_smc_customer",
        });
        customerSearch.filters.push(
            search.createFilter({
                name: "partner",
                operator: search.Operator.ANYOF,
                values: zee_id,
            })
        );
        customerSearch.run().each(function(searchResult) {
            var custid = searchResult.getValue({
                name: "internalid",
                join: null,
                summary: search.Summary.GROUP,
            });
            var entityid = searchResult.getValue({
                name: "entityid",
                join: null,
                summary: search.Summary.GROUP,
            });
            var companyname = searchResult.getValue({
                name: "companyname",
                join: null,
                summary: search.Summary.GROUP,
            });
            var last_price_increase = searchResult.getValue({
                name: "custentity_date_of_last_price_increase",
                join: null,
                summary: search.Summary.GROUP,
            });
            // var parent_maap_number = searchResult.getValue({ name: "custentity_maap_bankacctno_parent", join:sullSummary operatorsearch.Summary.GROUP});

            //WS Edit: Retrieve column values to Identify Reviewed Services and Correct CommReg
            var serviceCount = searchResult.getValue({
                name: "formulanumeric",
                join: null,
                summary: search.Summary.MAX,
            }); //Count of Reviewed Services
            var commRegCount = searchResult.getValue({
                name: "formulacurrency",
                join: null,
                summary: search.Summary.COUNT,
            }); //Count of Correct CommReg

            var inlineQty = "";
            //WS Edit: to Account for Duplicate CommReg
            if (commRegCount == 0) {
                //   inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td ><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="UPLOAD SCF" onclick="commRegUpload(' + custid + ')" ></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                dataSet1.push([
                    '<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">',
                    '<a href="' +
                    baseURL +
                    "/app/common/entity/custjob.nl?id=" +
                    custid +
                    '"><p style="text-align:left;">' +
                    entityid +
                    "</p></a>",
                    '<p style="text-align:left;">' + companyname + "</p>",
                    last_price_increase,
                    '<tr class="dynatable-editable"><td><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="UPLOAD SCF"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" ></div></div></td></tr>',
                ]);
            } else if (commRegCount > 1) {
                //   inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td ><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="Duplicate COMMREG"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                dataSet1.push([
                    '<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">',
                    '<a href="' +
                    baseURL +
                    "/app/common/entity/custjob.nl?id=" +
                    custid +
                    '"><p style="text-align:left;">' +
                    entityid +
                    "</p></a>",
                    '<p style="text-align:left;">' + companyname + "</p>",
                    last_price_increase,
                    '<tr class="dynatable-editable"><td><div class="row"><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="Duplicate COMMREG"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" ></div></div></td></tr>',
                ]); //onclick="onclick_cancel(' + custid + ')" |
            } else if (serviceCount == 0) {
                //If no service record present for customer, Review button will be shown
                //   inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="review_customer form-control btn-warning" value="REVIEW" onclick=" (' + custid + ')" ></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                dataSet1.push([
                    '<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">',
                    '<a href="' +
                    baseURL +
                    "/app/common/entity/custjob.nl?id=" +
                    custid +
                    '"><p style="text-align:left;">' +
                    entityid +
                    "</p></a>",
                    '<p style="text-align:left;">' + companyname + "</p>",
                    last_price_increase,
                    '<tr class="dynatable-editable"><td><div class="row"><div class="col-sm-6"><input type="button" class="review_customer form-control btn-warning" value="REVIEW" ></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL"></div></div></td></tr>',
                ]); //onclick="onclick_cancel(' + custid + ')" | onclick=" (' + custid + ')"
            } else {
                //If service record is present for customer, Edit button is shown
                //   inlineQty += '<tr class="dynatable-editable"><td style="text-align: center;"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25"></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-primary" value="EDIT" onclick="onclick_serviceChangePage(' + custid + ')"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                dataSet1.push([
                    '<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">',
                    '<a href="' +
                    baseURL +
                    "/app/common/entity/custjob.nl?id=" +
                    custid +
                    '"><p style="text-align:left;">' +
                    entityid +
                    "</p></a>",
                    '<p style="text-align:left;">' + companyname + "</p>",
                    last_price_increase,
                    '<tr class="dynatable-editable"><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-primary" value="EDIT" custid="' +
                    custid +
                    '"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL"></div></div></td></tr>',
                ]);
            }

            // dataSet1.push(['☑', custid, companyname, last_price_increase, inlineQty]);

            return true;
        });
    }

    function createCommReg(
        customer,
        dateEffective,
        zee,
        state,
        sendemail,
        customer_status
    ) {
        var newCommRegSet = [];

        var customer_comm_reg = record.create({
            type: "customrecord_commencement_register",
        });
        customer_comm_reg.setValue({
            fieldId: "custrecord_date_entry",
            value: getDate(),
        });
        customer_comm_reg.setValue({
            fieldId: "custrecord_comm_date",
            value: dateEffective,
        });
        customer_comm_reg.setValue({
            fieldId: "custrecord_comm_date_signup",
            value: dateEffective,
        });
        customer_comm_reg.setValue({
            fieldId: "custrecord_date_entry",
            value: customer,
        });
        if (sendemail == "T") {
            customer_comm_reg.setValue({
                fieldId: "custrecord_salesrep",
                value: ctx.id,
            });
        } else {
            customer_comm_reg.setValue({
                fieldId: "custrecord_salesrep",
                value: 109783,
            });
        }
        //Franchisee
        customer_comm_reg.setValue({ fieldId: "custrecord_std_equiv", value: 1 });
        if (role != 1000) {
            customer_comm_reg.setValue({
                fieldId: "custrecord_franchisee",
                value: zee,
            });
        }

        customer_comm_reg.setValue({ fieldId: "custrecord_wkly_svcs", value: "5" });
        customer_comm_reg.setValue({ fieldId: "custrecord_in_out", value: 2 }); // Inbound
        //Scheduled
        customer_comm_reg.setValue({ fieldId: "custrecord_state", value: state });
        if (sendemail == "T") {
            customer_comm_reg.setValue({
                fieldId: "custrecord_trial_status",
                value: 10,
            });
            if (!isNullorEmpty(currRec.getValue({ fieldId: "custpage_salesrecordid" }))) {
                customer_comm_reg.setValue({
                    fieldId: "custrecord_commreg_sales_record",
                    value: parseInt(
                        currRec.getValue({ fieldId: "custpage_salesrecordid" })
                    ),
                });
            }
        } else {
            customer_comm_reg.setValue({
                fieldId: "custrecord_trial_status",
                value: 9,
            });
        } // Price Increase

        // Can't Be Set Yet as Commencement Type hasn't been arranged.
        // if (customer_status != 13) {
        //     customer_comm_reg.setValue({ fieldId: 'custrecord_sale_type', value: $('#commencementtype option:selected').val()})
        // } else {
        //     customer_comm_reg.setValue({ fieldId: 'custrecord_sale_type', value: $('#commencementtype option:selected').val()})
        // }

        // var commRegID = record.submit(customer_comm_reg);

        return commRegID;
    }

    function loadCommReg(zee_id, cust_id) {
        var commRegSet = [];

        // var customer_comm_reg = record.load({ type: 'customrecord_commencement_register', id: commReg });
        // var customer_comm_reg = search.load({
        //     type: "customrecord_commencement_register",
        //     id: "customsearch_service_commreg_assign",
        // });
        // customer_comm_reg.filters.push(
        //     search.createFilter({
        //         name: "custrecord_franchisee",
        //         operator: search.Operator.IS,
        //         values: zee_id,
        //     })
        // );
        var serviceSearch = search.load({
            type: "customrecord_service",
            id: "customsearch_smc_services",
        });
        serviceSearch.filters.push(
            search.createFilter({
                name: "custrecord_service_customer",
                join: null,
                operator: search.Operator.IS,
                values: cust_id,
            })
        );

        serviceSearch.run().each(function(customer_comm_reg) {
            var comm_reg_id = customer_comm_reg.getValue({ name: "internalid" });
            var date_effective = customer_comm_reg.getValue({
                name: "custrecord_comm_date",
            });
            var sale_type = customer_comm_reg.getText({
                name: "custrecord_sale_type",
            });
            var cust_id = customer_comm_reg.getValue({ name: "custrecord_customer" });

            commRegSet.push([
                comm_reg_id,
                sale_type,
                date_effective,
                '<td><button class="btn btn-warning btn-xs edit_class glyphicon glyphicon-pencil" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button></td>',
                cust_id,
            ]);
        });
        // if (cust_id == 485842) {
        commRegSet.push([
            "17029",
            "Price Increase",
            "5/6/2018",
            '<td><button class="btn btn-warning btn-xs edit_class glyphicon glyphicon-pencil" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button></td>',
            "485842",
        ]);
        commRegSet.push([
            "17020",
            "Price Increase",
            "7/6/2018",
            '<td><button class="btn btn-warning btn-xs edit_class glyphicon glyphicon-pencil" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button></td>',
            "518583",
        ]);
        // }

        var commRegTable = $("#comm_reg_preview").DataTable();
        commRegTable.clear();
        commRegTable.rows.add(commRegSet);
        commRegTable.draw();

        return true;
    }

    function loadCustService(commReg, cust_id) {
        var customer_comm_reg = record.load({
            type: "customrecord_commencement_register",
            id: commReg,
        });

        // var comm_reg_id = customer_comm_reg.getValue({ fieldId: 'internalid' });
        var date_effective = customer_comm_reg.getValue({
            fieldId: "custrecord_comm_date",
        });
        var date_new = new Date(date_effective);
        date_new.setDate(date_new.getDate() + 1);
        date_new = date_new.toISOString().split("T")[0];
        console.log("Date Effective: " + date_effective);
        console.log(date_new);
        $("#date_effective").val(date_new);
        var sale_type_text = customer_comm_reg.getText({
            fieldId: "custrecord_sale_type",
        });
        var sale_type = customer_comm_reg.getValue({
            fieldId: "custrecord_sale_type",
        });
        console.log("Sale Type: " + sale_type);
        $("#commencementtype").val(sale_type);

        var serviceSearch = search.load({
            type: "customrecord_service",
            id: "customsearch_smc_services",
        });
        serviceSearch.filters.push(
            search.createFilter({
                name: "custrecord_service_customer",
                operator: search.Operator.IS,
                values: cust_id, // James Bond - Test
            })
        );
        // Filter for Service
        serviceSearch.run().each(function(resultSet_service) {
            var internalid = resultSet_service.getValue({ name: "internalid" });

            var serv_chg = search.load({
                type: "customrecord_servicechg",
                id: "customsearch_smc_service_chg",
            });
            serv_chg.filters.push(
                search.createFilter({
                    name: "custrecord_servicechg_service",
                    operator: search.Operator.IS,
                    values: internalid,
                })
            );
            serv_chg.filters.push(
                search.createFilter({
                    name: "custrecord_servicechg_status",
                    operator: search.Operator.NONEOF,
                    values: [2, 3],
                })
            );
            serv_chg.run().each(function(searchResult_service_change) {
                var internalid = searchResult_service_change.getValue({
                    name: "internalid",
                });

                var serv_name = searchResult_service_change.getText({
                    name: "custrecord_servicechg_service",
                });
                var serv_desc = searchResult_service_change.getValue({
                    name: "custrecord_service_description",
                    join: "CUSTRECORD_SERVICECHG_SERVICE",
                });
                var date_eff = searchResult_service_change.getValue({
                    name: "custrecord_servicechg_date_effective",
                });
                var new_price =
                    '<input id="new_price" class="form-control new_price" type="number" value="' +
                    financial(
                        searchResult_service_change.getValue({
                            name: "custrecord_servicechg_new_price",
                        })
                    ) +
                    '" disabled />';
                var old_price =
                    '<input id="old_price" class="form-control old_price" type="number" value="' +
                    searchResult_service_change.getValue({
                        name: "custrecord_service_price",
                        join: "CUSTRECORD_SERVICECHG_SERVICE",
                        summary: null,
                    }) +
                    '" disabled />';
                var last_mod = searchResult_service_change.getValue({
                    name: "lastmodified",
                });
                var type = searchResult_service_change.getValue({
                    name: "custrecord_servicechg_type",
                });
                var freq = searchResult_service_change.getText({
                    name: "custrecord_servicechg_new_freq",
                });

                var inlineQty = "";
                if (
                    searchResult_service_change.getValue({
                        name: "custrecord_service_day_mon",
                    }) == "T"
                ) {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Mon" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="monday_class"   type="checkbox"  checked/></span>';
                    inlineQty += "</div>";
                    // inlineQty += '<td><input class="monday_class"   type="checkbox"  checked/></td>'; // disabled
                } else {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Mon" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="monday_class"   type="checkbox"/></span>';
                    inlineQty += "</div>";
                    // inlineQty += '<td><input class="monday_class"   type="checkbox"  /></td>'; // disabled
                }

                if (
                    searchResult_service_change.getValue({
                        name: "custrecord_service_day_tue",
                    }) == "T"
                ) {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Tue" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="tuesday_class"   type="checkbox"  checked/></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                } else {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Tue" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="tuesday_class"   type="checkbox" /></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                }
                // inlineQty += '<div class="col-xs-2 ">';
                // inlineQty += '<div class="input-group col-md-6">'
                // inlineQty += '<input type="text" readonly value="UNLIMITED?" class="form-control input-group-addon"/>'
                // inlineQty += '<span class="input-group-addon"><input type="checkbox" aria-label="Checkbox for following text input" id="unlimited_ult_expiry_date"></span>'
                // inlineQty += '</div>';
                // inlineQty += '</div>';

                if (
                    searchResult_service_change.getValue({
                        name: "custrecord_service_day_wed",
                    }) == "T"
                ) {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Wed" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="wednesday_class"   type="checkbox"  checked/></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                } else {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Wed" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="wednesday_class"   type="checkbox"  /></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                }

                if (
                    searchResult_service_change.getValue({
                        name: "custrecord_service_day_thu",
                    }) == "T"
                ) {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Thu" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="thursday_class"   type="checkbox"  checked/></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                } else {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Thu" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="thursday_class"   type="checkbox"  /></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                }

                if (
                    searchResult_service_change.getValue({
                        name: "custrecord_service_day_fri",
                    }) == "T"
                ) {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Fri" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="friday_class"   type="checkbox"  checked/></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                } else {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Thu" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="friday_class"   type="checkbox"  /></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                }

                if (
                    searchResult_service_change.getValue({
                        name: "custrecord_service_day_adhoc",
                    }) == "T"
                ) {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Ad" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="adhoc_class"   type="checkbox"  checked /></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                } else {
                    inlineQty += '<div class="input-group col-md-6">';
                    inlineQty +=
                        '<input type="text" readonly value="Ad" class="form-control input-group-addon"/>';
                    inlineQty +=
                        '<span class="input-group-addon"><input class="adhoc_class"   type="checkbox"  /></span>'; // disabled inlineQty += '<td> </td>'
                    inlineQty += "</div>";
                }

                var created_by = searchResult_service_change.getText({
                    name: "custrecord_servicechg_created",
                });

                if (date_effective == date_eff) {
                    dataSet2.push([
                        '<td><button class="btn btn-warning btn-xs edit_service glyphicon glyphicon-pencil" data-dateeffective="' +
                        searchResult_service_change.getValue({
                            name: "custrecord_servicechg_date_effective",
                        }) +
                        '" data-commreg="' +
                        searchResult_service_change.getValue({
                            name: "custrecord_servicechg_comm_reg",
                        }) +
                        '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><button class="btn btn-danger btn-xs remove_class glyphicon glyphicon-trash" data-dateeffective="' +
                        searchResult_service_change.getValue({
                            name: "custrecord_servicechg_date_effective",
                        }) +
                        '" data-commreg="' +
                        searchResult_service_change.getValue({
                            name: "custrecord_servicechg_comm_reg",
                        }) +
                        '" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button></td>',
                        serv_name,
                        serv_desc,
                        old_price,
                        new_price,
                        date_eff,
                        created_by,
                        last_mod,
                        type,
                        inlineQty,
                    ]);
                } else {
                    dataSet2.push([
                        '<td><button class="btn btn-warning btn-xs edit_service glyphicon glyphicon-pencil" data-dateeffective="' +
                        searchResult_service_change.getValue({
                            name: "custrecord_servicechg_date_effective",
                        }) +
                        '" data-commreg="' +
                        searchResult_service_change.getValue({
                            name: "custrecord_servicechg_comm_reg",
                        }) +
                        '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><button class="btn btn-danger btn-xs remove_class glyphicon glyphicon-trash" data-dateeffective="' +
                        searchResult_service_change.getValue({
                            name: "custrecord_servicechg_date_effective",
                        }) +
                        '" data-commreg="' +
                        searchResult_service_change.getValue({
                            name: "custrecord_servicechg_comm_reg",
                        }) +
                        '" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button></td>',
                        serv_name,
                        serv_desc,
                        old_price,
                        new_price,
                        date_eff,
                        created_by,
                        last_mod,
                        type,
                        inlineQty,
                    ]);
                }

                return true;
            });
            return true;
        });

        var dataTable2 = $("#data_preview_edit").DataTable();
        dataTable2.clear();
        dataTable2.rows.add(dataSet2);
        dataTable2.draw();
    }

    function saveRecord() {
        //Page variables
        // var service_name_elem = document.getElementsByClassName("service_name");
        // var edit_class_elem = document.getElementsByClassName("edit_class");
        // var service_descp_class_elem = document.getElementsByClassName(
        //     "service_descp_class"
        // );
        // var old_price_class_elem = document.getElementsByClassName("old_price");
        var new_price_elem = document.getElementsByClassName("new_price");
        // var monday_class_elem = document.getElementsByClassName("monday_class");
        // var tuesday_class_elem = document.getElementsByClassName("tuesday_class");
        // var wednesday_class_elem =
        //     document.getElementsByClassName("wednesday_class");
        // var thursday_class_elem = document.getElementsByClassName("thursday_class");
        // var friday_class_elem = document.getElementsByClassName("friday_class");
        // var adhoc_class_elem = document.getElementsByClassName("adhoc_class");

        // var created_by_class_elem =
        //     document.getElementsByClassName("created_by_class");
        // var last_modified_class_elem = document.getElementsByClassName(
        //     "last_modified_class"
        // );
        // var comm_type_class_elem =
        //     document.getElementsByClassName("comm_type_class");
        // var date_effective = $("#date_effective").val();
        // var old_date_effective = $("#date_effective").attr("data-olddate");

        new_price_elem.forEach(function(res) {
            console.log(res.defaultValue);
        });
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

    /**
     * Function to reset all field values
     */
    function reset_all() {
        $(".row_service_type").addClass("hide");
        $(".service_descp_row").addClass("hide");
        $(".price_info").addClass("hide");
        $(".frequency_info").addClass("hide");
        // $('.service_change_type_section').addClass('hide');
        $(".row_button").addClass("hide");
        $(".old_price_section").addClass("hide");
        $(".create_new_service_button").removeClass("hide");
        $(".edit_service_section").addClass("hide");
        $("#service_type").val(0);
        $("#descp").val("");
        $("#new_price").val("");
        $("#old_price").val("");
        $("#daily").prop("checked", false);
        $("#monday").prop("checked", false);
        $("#tuesday").prop("checked", false);
        $("#wednesday").prop("checked", false);
        $("#thursday").prop("checked", false);
        $("#friday").prop("checked", false);
        $("#adhoc").prop("checked", false);
        $("#daily").prop("disabled", false);
        $("#monday").prop("disabled", false);
        $("#tuesday").prop("disabled", false);
        $("#wednesday").prop("disabled", false);
        $("#thursday").prop("disabled", false);
        $("#friday").prop("disabled", false);
        $("#adhoc").prop("disabled", false);
    }

    /**
     * Used to pass the values of `date_from` and `date_to` between the scripts and to Netsuite for the records and the search.
     * @param   {String} date_iso       "2020-06-01"
     * @returns {String} date_netsuite  "1/6/2020"
     */
    function dateISOToNetsuite(date_iso) {
        var date_netsuite = "";
        if (!isNullorEmpty(date_iso)) {
            var date_utc = new Date(date_iso);
            // var date_netsuite = nlapiDateToString(date_utc);
            var date_netsuite = format.format({
                value: date_utc,
                type: format.Type.DATE,
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
            timezone: format.Timezone.AUSTRALIA_SYDNEY,
        });

        return date;
    }

    function financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }

    function isNullorEmpty(strVal) {
        return (
            strVal == null ||
            strVal == "" ||
            strVal == "null" ||
            strVal == undefined ||
            strVal == "undefined" ||
            strVal == "- None -"
        );
    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
    };
});