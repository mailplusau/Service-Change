/**
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 *
 * Description:
 * @Last Modified by: Anesu Chakaingesu
 *
 */

define(["N/error", "N/runtime", "N/search", "N/url", "N/record", "N/format", "N/email", "N/currentRecord", ],
    function(error, runtime, search, url, record, format, email, currentRecord) {
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
        } else {
            zee_id = parseInt(zee_id);
        }

        var dataSet1 = [];

        console.log("Current User: " + ctx.id);

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

                state = $("#zee_filter_dropdown").val();

                loadCustomerList();
            }

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
             *  Customer List - JQuery
             */
            $(document).on("click", ".new_commreg", function() {
                var cust_id = $(this).attr("custid");

                var params = {
                    zeeid: zee_id,
                    custid: cust_id,
                    new: true
                };
                var upload_url =
                    baseURL +
                    url.resolveScript({
                        deploymentId: "customdeploy_sl_price_change_edit_2",
                        scriptId: "customscript_sl_price_change_edit_2",
                    }) +
                    "&custparam_params=" +
                    JSON.stringify(params) + "";

                window.open(upload_url);
            });
            $(document).on("click", ".edit_customer", function() {
                var cust_id = $(this).attr("custid");

                var params = {
                    zeeid: zee_id,
                    custid: cust_id,
                };
                var upload_url =
                    baseURL +
                    url.resolveScript({
                        deploymentId: "customdeploy_sl_price_change_edit_2",
                        scriptId: "customscript_sl_price_change_edit_2",
                    }) +
                    "&custparam_params=" +
                    JSON.stringify(params) + "";

                window.open(upload_url);
            });
            $(document).on("click", ".review_customer", function() {
                console.log("Cliced Review Customer");
                $(".commRegSection").removeClass("hide");

                cust_id = $(this).attr("custid");
                next_cust_id = $(this).next().attr("custid");

                loadCommReg(zee_id, cust_id);

                var params = { custid: cust_id, servicechange: 0 };
                var upload_url =
                    "https://1048144-sb3.app.netsuite.com/app/site/hosting/scriptlet.nl?script=628&deploy=1&compid=1048144&unlayered=T&custparam_params=" +
                    params +
                    "";

                window.open(upload_url, "_blank");
            });
            $(document).on("click", ".upload_scf", function() {
                console.log("Cliced Upload SCF");
                $(".commRegSection").removeClass("hide");

                cust_id = $(this).attr("custid");

                var params = {
                    zeeid: zee_id,
                    custid: cust_id,
                };
                var upload_url =
                    baseURL +
                    url.resolveScript({
                        deploymentId: "customdeploy_sl_salesbtns_upload_file",
                        scriptId: "customscript_sl_salesbtns_upload_file",
                    }) +
                    "&custparam_params=" +
                    JSON.stringify(params);

                window.open(upload_url, "_blank");
            });
        }

        function loadCustomerList() {
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

                //Search: CommReg
                var commRegSigned = false;
                var commRegSearch = search.load({ type: 'customrecord_commencement_register', id: 'customsearch_comm_reg_signed_2' });
                commRegSearch.filters.push(search.createFilter({
                    name: 'custrecord_customer',
                    operator: search.Operator.IS,
                    values: custid
                }))
                commRegSearch.run().getRange({ start: 0, end: 1 }).forEach(function(res) {
                    var sales_type = res.getValue({ name: 'custrecord_trial_status', summary: 'GROUP' });
                    // console.log('Sales type? ' + sales_type)
                    if (sales_type == 2) { // Sales Type == Signed
                        commRegSigned = true;
                    }
                });

                var inlineQty = "";
                //WS Edit: to Account for Duplicate CommReg
                if (commRegCount == 0) {
                    //   inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td ><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="UPLOAD SCF" onclick="commRegUpload(' + custid + ')" ></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                    dataSet1.push([
                        '',
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
                    // Duplicate CommReg
                    //   inlineQty += '<tr><td></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td ><p style="text-align:left;">' + companyname + '</p></td><td>' + last_price_increase + '</td><td><div class="row"><div class="col-sm-6"><input type="button" class="commRegUpload form-control btn-default" value="Duplicate COMMREG"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

                    dataSet1.push([
                        '',
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
                        '',
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
                } else if (commRegSigned == true) {
                    // New - Commencement Register is 
                    dataSet1.push([
                        '',
                        '<a href="' +
                        baseURL +
                        "/app/common/entity/custjob.nl?id=" +
                        custid +
                        '"><p style="text-align:left;">' +
                        entityid +
                        "</p></a>",
                        '<p style="text-align:left;">' + companyname + "</p>",
                        last_price_increase,
                        '<tr class="dynatable-editable"><td><div class="row"><div class="col-sm-6"><input type="button" class="new_commreg form-control btn-primary" value="NEW" custid="' +
                        custid +
                        '"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL"></div></div></td></tr>',
                    ]);
                } else {
                    //If service record is present for customer but latest commencement register is , Edit button is shown
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
                        '<tr class="dynatable-editable"><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-success" value="EDIT" custid="' +
                        custid +
                        '"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL"></div></div></td></tr>',
                    ]);
                }

                // dataSet1.push(['☑', custid, companyname, last_price_increase, inlineQty]);

                return true;
            });
        }

        function createCommReg(customer, dateEffective, zee, state, sendemail, customer_status) {
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

        function saveRecord() {}

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