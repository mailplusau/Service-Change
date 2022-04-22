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

     var cust_id = currRec.getValue({ fieldId: 'custpage_price_change_edit_cust_id' });
     var zee_id = currRec.getValue({ fieldId: 'custpage_price_change_edit_zee_id' });
     var comm_reg = currRec.getValue({ fieldId: 'custpage_price_change_edit_comm_reg' });

     var dataSet2 = [];
     var dataSet3 = [];

     /**
      * On page initialisation
      */
     function pageInit() {
         // Background-Colors
         $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
         $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
         $("#body").css("background-color", "#CFE0CE");

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

        var dataTable2 = $("#data_preview").DataTable({
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

        

        $(document).on("click", "#smc", function() {
            var params = { custid: cust_id }
            var upload_url =
                baseURL +
                url.resolveScript({
                    deploymentId: "customdeploy_sl_smc_summary",
                    scriptId: "customscript_sl_smc_summary",
                }) + '&custparams_params=' + params;

            window.open(upload_url, '_blank');
        });


        $('.tabSection').removeClass("hide");

        loadCommReg(630602)
        loadCustService(38111, 630602)
     }

     function createCommReg(customer,dateEffective,zee,state,sendemail,customer_status) {
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
            type: 'customrecord_service',
            id: 'customsearch_smc_services'
        });
        serviceSearch.filters.push(search.createFilter({
            name: 'custrecord_service_customer',
            join: null,
            operator: search.Operator.IS,
            values: cust_id
        }));

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

        var dataTable2 = $("#data_preview").DataTable();
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

// function saveRecord() {
//     //Load customer record
//     var recCustomer = record.load({
//         type: record.Type.CUSTOMER,
//         id: parseInt(
//             currentRecord.get().getValue({ fieldId: "custpage_customer_id" })
//         ),
//         isDynamic: true,
//     });

//     var partner = recCustomer.getValue({ fieldId: "partner" });
//     var customer_status = recCustomer.getValue({ fieldId: "entitystatus" });

//     //Load partner record
//     var partner_record = record.load({
//         type: record.Type.PARTNER,
//         id: partner,
//         isDynamic: true,
//     });
//     var state = partner_record.getValue({ fieldId: "location" });
//     var customer = parseInt(
//         currentRecord.get().getValue({ fieldId: "custpage_customer_id" })
//     );

//     //Page variables
//     var service_name_elem = document.getElementsByClassName("service_name");
//     var edit_class_elem = document.getElementsByClassName("edit_class");
//     var service_descp_class_elem = document.getElementsByClassName(
//         "service_descp_class"
//     );
//     var old_service_price_class_elem = document.getElementsByClassName(
//         "old_service_price_class"
//     );
//     var new_service_price_class_elem = document.getElementsByClassName(
//         "new_service_price_class"
//     );
//     var monday_class_elem = document.getElementsByClassName("monday_class");
//     var tuesday_class_elem = document.getElementsByClassName("tuesday_class");
//     var wednesday_class_elem =
//         document.getElementsByClassName("wednesday_class");
//     var thursday_class_elem = document.getElementsByClassName("thursday_class");
//     var friday_class_elem = document.getElementsByClassName("friday_class");
//     var adhoc_class_elem = document.getElementsByClassName("adhoc_class");
//     var created_by_class_elem =
//         document.getElementsByClassName("created_by_class");
//     var last_modified_class_elem = document.getElementsByClassName(
//         "last_modified_class"
//     );
//     var comm_type_class_elem =
//         document.getElementsByClassName("comm_type_class");
//     var date_effective = $("#date_effective").val();
//     var old_date_effective = $("#date_effective").attr("data-olddate");

//     var monthly_service_rate = 0.0;
//     var monthly_extra_service_rate = 0.0;

//     //Ensure date is not empty and date entered is greater than today's date
//     if (isNullorEmpty(date_effective)) {
//         alert("Please Enter the Date Effective");
//         return false;
//     } else {
//         var resultDate = dateEffectiveCheck(date_effective);

//         if (resultDate == false) {
//             alert("Entered Date Effective should be greater than today");
//             return false;
//         }
//         var splitDate = date_effective.split("-");
//         var dateEffective =
//             splitDate[2] + "/" + splitDate[1] + "/" + splitDate[0];
//     }

//     var commRegID = currentRecord
//         .get()
//         .getValue({ fieldId: "custpage_customer_comm_reg" });
//     console.log("commRegID " + commRegID);

//     //Load up service change
//     var searched_service_change = search.load({
//         type: "customrecord_servicechg",
//         id: "customsearch_smc_service_chg",
//     });

//     if (!isNullorEmpty(commRegID)) {
//         searched_service_change.filters.push(
//             search.createFilter({
//                 name: "custrecord_servicechg_comm_reg",
//                 join: null,
//                 operator: search.Operator.NONEOF,
//                 values: commRegID,
//             })
//         );
//     }

//     searched_service_change.filters.push(
//         search.createFilter({
//             name: "custrecord_servicechg_date_effective",
//             join: null,
//             operator: search.Operator.ON,
//             values: dateEffective,
//         })
//     );

//     searched_service_change.filters.push(
//         search.createFilter({
//             name: "custrecord_servicechg_status",
//             join: null,
//             operator: search.Operator.IS,
//             values: 1,
//         })
//     );

//     searched_service_change.filters.push(
//         search.createFilter({
//             name: "custrecord_service_customer",
//             join: "CUSTRECORD_SERVICECHG_SERVICE",
//             operator: search.Operator.IS,
//             values: customer,
//         })
//     );

//     var resultSet_service_change = searched_service_change.run();
//     var serviceResult_service_change = resultSet_service_change.getRange({
//         start: 0,
//         end: 1,
//     });
//     console.log(
//         "serviceResult_service_change: " + serviceResult_service_change
//     );
//     console.log("commRegID: " + commRegID);
//     if (
//         isNullorEmpty(serviceResult_service_change) &&
//         isNullorEmpty(commRegID)
//     ) {
//         console.log("edit_class_elem.length: " + edit_class_elem.length);
//         for (var i = 0; i < edit_class_elem.length; i++) {
//             console.log(service_name_elem[i].getAttribute("data-serviceid"));
//             var freqArray = [];
//             var sale_type = comm_type_class_elem[i].value;

//             if (monday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 1;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (tuesday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 2;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (wednesday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 3;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (thursday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 4;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (friday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 5;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (adhoc_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 6;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }

//             var row_service_change_id = edit_class_elem[i].getAttribute(
//                 "data-servicechangeid"
//             );
//             var row_service_id =
//                 service_name_elem[i].getAttribute("data-serviceid");
//             var user_id = created_by_class_elem[i].getAttribute("data-userid");

//             if (isNullorEmpty(row_service_id)) {
//                 if (isNullorEmpty(commRegID)) {
//                     commRegID = createCommReg(
//                         customer,
//                         dateEffective,
//                         partner,
//                         state,
//                         currentRecord.get().getValue({ fieldId: "custpage_sendemail" }),
//                         customer_status
//                     );
//                 }
//                 console.log("inside create of Service Change record for new service");

//                 var new_service_record = record.create({
//                     type: "customrecord_service",
//                     isDynamic: true,
//                 });

//                 var servicetype_id =
//                     service_name_elem[i].getAttribute("data-servicetypeid");
//                 var servicetype_text = service_name_elem[i].value;
//                 var new_service_price = new_service_price_class_elem[i].value;
//                 var new_service_descp = service_descp_class_elem[i].value;
//                 var created_by = created_by_class_elem[i].value;

//                 new_service_record.setField({
//                     fieldId: "custrecord_service",
//                     value: servicetype_id,
//                 });
//                 new_service_record.setField({
//                     fieldId: "name",
//                     value: servicetype_text,
//                 });
//                 new_service_record.setField({
//                     fieldId: "custrecord_service_price",
//                     value: new_service_price,
//                 });
//                 new_service_record.setField({
//                     fieldId: "custrecord_service_customer",
//                     value: customer,
//                 });
//                 new_service_record.setField({
//                     fieldId: "custrecord_service_description",
//                     value: new_service_descp,
//                 });

//                 if (!isNullorEmpty(commRegID)) {
//                     new_service_record.setField({
//                         fieldId: "custrecord_service_comm_reg",
//                         value: commRegID,
//                     });
//                 }
//                 if (monday_class_elem[i].checked == true) {
//                     new_service_record.setField({
//                         fieldId: "custrecord_service_day_mon",
//                         value: "T",
//                     });
//                 }

//                 if (tuesday_class_elem[i].checked == true) {
//                     new_service_record.setField({
//                         fieldId: "custrecord_service_day_tue",
//                         value: "T",
//                     });
//                 }
//                 if (wednesday_class_elem[i].checked == true) {
//                     new_service_record.setField({
//                         fieldId: "custrecord_service_day_wed",
//                         value: "T",
//                     });
//                 }
//                 if (thursday_class_elem[i].checked == true) {
//                     new_service_record.setField({
//                         fieldId: "custrecord_service_day_thu",
//                         value: "T",
//                     });
//                 }
//                 if (friday_class_elem[i].checked == true) {
//                     new_service_record.setField({
//                         fieldId: "custrecord_service_day_fri",
//                         value: "T",
//                     });
//                 }
//                 if (adhoc_class_elem[i].checked == true) {
//                     new_service_record.setField({
//                         fieldId: "custrecord_service_day_adhoc",
//                         value: "T",
//                     });
//                 }

//                 var new_service_id = new_service_record.save();
//                 if (!isNullorEmpty(new_service_id)) {
//                     var new_service_change_record = record.create({
//                         type: "customrecord_servicechg",
//                         isDynamic: true,
//                     });
//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_date_effective",
//                         value: dateEffective,
//                     });
//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_service",
//                         value: new_service_id,
//                     });
//                     if (
//                         currentRecord.get().getValue({ fieldId: "custpage_sendemail" }) ==
//                         "T"
//                     ) {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_status",
//                             value: 4,
//                         });
//                     } else {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_status",
//                             value: 1,
//                         });
//                     }

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_old_zee",
//                         value: partner,
//                     });

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_new_price",
//                         value: new_service_price,
//                     });

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_new_freq",
//                         value: freqArray,
//                     });

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_comm_reg",
//                         value: commRegID,
//                     });

//                     if (role != 1000) {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_created",
//                             value: user_id,
//                         });
//                     }
//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_type",
//                         value: comm_type_class_elem[i].value,
//                     });

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_default_servicechg_record",
//                         value: 1,
//                     });

//                     new_service_change_record.save();
//                     record.submitFields({
//                         type: "customrecord_service",
//                         id: new_service_id,
//                         fields: "isinactive",
//                         values: {
//                             customrecord_service: "T",
//                         },
//                     });
//                 }
//             } else if (!isNullorEmpty(row_service_change_id)) {
//                 var service_change_record = record.load({
//                     type: "customrecord_servicechg",
//                     id: row_service_change_id,
//                     isDynamic: true,
//                 });
//                 var service_change_new_price = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_new_price",
//                 });
//                 var service_change_old_freq = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_old_freq",
//                 });
//                 var service_change_new_freq = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_new_freq",
//                 });
//                 var service_change_date_effective = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_new_freq",
//                 });
//                 var service_change_comm_reg = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_comm_reg",
//                 });

//                 if (
//                     (!isNullorEmpty(new_service_price_class_elem[i].value) &&
//                         old_service_price_class_elem[i].value !=
//                         new_service_price_class_elem[i].value) ||
//                     (isNullorEmpty(service_change_old_freq) &&
//                         !arraysEqual(service_change_new_freq, freqArray)) ||
//                     (!isNullorEmpty(service_change_old_freq) &&
//                         !arraysEqual(service_change_old_freq, freqArray)) ||
//                     service_change_date_effective != dateEffective
//                 ) {
//                     console.log("inside update of Service Change record");

//                     if (isNullorEmpty(commRegID)) {
//                         commRegID = loadCommReg(service_change_comm_reg, dateEffective);
//                     }

//                     var service_id =
//                         service_name_elem[i].getAttribute("data-serviceid");
//                     if (!isNullorEmpty(service_id)) {
//                         service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_date_effective",
//                             value: getFormattedDate(dateEffective),
//                         });
//                         if (
//                             old_service_price_class_elem[i].value !=
//                             new_service_price_class_elem[i].value
//                         ) {
//                             service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_new_price",
//                                 value: new_service_price_class_elem[i].value,
//                             });
//                         } else {
//                             service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_old_price",
//                                 value: old_service_price_class_elem[i].value,
//                             });
//                         }

//                         if (isNullorEmpty(service_change_old_freq)) {
//                             if (service_change_new_freq != freqArray) {
//                                 service_change_record.setValue({
//                                     fieldId: "custrecord_servicechg_new_freq",
//                                     value: freqArray,
//                                 });
//                             } else {
//                                 service_change_record.setValue({
//                                     fieldId: "custrecord_servicechg_old_freq",
//                                     value: service_change_new_freq,
//                                 });
//                             }
//                         } else {
//                             if (service_change_old_freq != freqArray) {
//                                 service_change_record.setValue({
//                                     fieldId: "custrecord_servicechg_new_freq",
//                                     value: freqArray,
//                                 });
//                             } else {
//                                 service_change_record.setValue({
//                                     fieldId: "custrecord_servicechg_old_freq",
//                                     value: service_change_old_freq,
//                                 });
//                             }
//                         }

//                         service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_comm_reg",
//                             value: commRegID,
//                         });

//                         if (role != 1000) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_created",
//                                 value: user_id,
//                             });
//                         }
//                     }
//                     service_change_record.save();
//                 }
//             } else if (
//                 isNullorEmpty(row_service_change_id) &&
//                 !isNullorEmpty(row_service_id)
//             ) {
//                 var service_record = record.load({
//                     type: "customrecord_service",
//                     id: row_service_id,
//                     isDynamic: true,
//                 });
//                 var current_price = service_record.getValue({
//                     fieldId: "custrecord_service_price",
//                 });
//                 var current_freq_mon = service_record.getValue({
//                     fieldId: "custrecord_service_day_mon",
//                 });
//                 var current_freq_tue = service_record.getValue({
//                     fieldId: "custrecord_service_day_tue",
//                 });
//                 var current_freq_wed = service_record.getValue({
//                     fieldId: "custrecord_service_day_wed",
//                 });
//                 var current_freq_thu = service_record.getValue({
//                     fieldId: "custrecord_service_day_thu",
//                 });
//                 var current_freq_fri = service_record.getValue({
//                     fieldId: "custrecord_service_day_fri",
//                 });
//                 var current_freq_adhoc = service_record.getValue({
//                     fieldId: "custrecord_service_day_adhoc",
//                 });

//                 var current_freq_array = [];

//                 if (current_freq_mon == "T") {
//                     current_freq_array[current_freq_array.length] = 1;
//                 }
//                 if (current_freq_tue == "T") {
//                     current_freq_array[current_freq_array.length] = 2;
//                 }
//                 if (current_freq_wed == "T") {
//                     current_freq_array[current_freq_array.length] = 3;
//                 }
//                 if (current_freq_thu == "T") {
//                     current_freq_array[current_freq_array.length] = 4;
//                 }
//                 if (current_freq_fri == "T") {
//                     current_freq_array[current_freq_array.length] = 5;
//                 }
//                 if (current_freq_adhoc == "T") {
//                     current_freq_array[current_freq_array.length] = 6;
//                 }

//                 if (
//                     (!isNullorEmpty(new_service_price_class_elem[i].value) &&
//                         old_service_price_class_elem[i].value !=
//                         new_service_price_class_elem[i].value) ||
//                     !arraysEqual(current_freq_array, freqArray)
//                 ) {
//                     console.log(
//                         "inside create new Service Change record for existing Service"
//                     );
//                     if (isNullorEmpty(commRegID)) {
//                         commRegID = createCommReg(
//                             customer,
//                             dateEffective,
//                             partner,
//                             state,
//                             currentRecord.get().getValue({ fieldId: "custpage_sendemail" }),
//                             customer_status
//                         );
//                     }

//                     var new_service_change_record = record.create({
//                         type: "customrecord_servicechg",
//                         isDynamic: true,
//                     });

//                     var service_id =
//                         service_name_elem[i].getAttribute("data-serviceid");
//                     if (!isNullorEmpty(service_id)) {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_date_effective",
//                             value: getFormattedDate(dateEffective),
//                         });
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_service",
//                             value: service_id,
//                         });

//                         if (
//                             currentRecord
//                             .get()
//                             .getValue({ fieldId: "custpage_sendemail" }) == "T"
//                         ) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_status",
//                                 value: 4,
//                             });
//                         } else {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_status",
//                                 value: 1,
//                             });
//                         }

//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_old_zee",
//                             value: partner,
//                         });

//                         if (
//                             old_service_price_class_elem[i].value !=
//                             new_service_price_class_elem[i].value
//                         ) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_new_price",
//                                 value: new_service_price_class_elem[i].value,
//                             });
//                         }

//                         if (!arraysEqual(current_freq_array, freqArray)) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_new_freq",
//                                 value: freqArray,
//                             });
//                         }

//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_comm_reg",
//                             value: commRegID,
//                         });
//                         if (role != 1000) {
//                             // console.log('Line 832');
//                             // console.log('userid: ' +  userid);
//                             //TODO
//                             // new_service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value: user_id});
//                         }

//                         //COE - Service imported from old customer and edited - Link the commReg to the service
//                         if ($("#commencementtype option:selected").val() == 6) {
//                             var service_record = record.load({
//                                 type: "customrecord_service",
//                                 id: service_id,
//                                 isDynamic: true,
//                             });
//                             service_record.setField({
//                                 fieldId: "custrecord_service_comm_reg",
//                                 value: commRegID,
//                             });
//                             service_record.save();

//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_default_servicechg_record",
//                                 value: 1,
//                             });
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_new_price",
//                                 value: new_service_price_class_elem[i].value,
//                             });
//                         }
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_type",
//                             value: comm_type_class_elem[i].value,
//                         });
//                         new_service_change_record.save();
//                     }
//                 } else if ($("#commencementtype option:selected").val() == 6) {
//                     //COE - Service imported from old customer and not edited
//                     console.log(
//                         "inside create new Service Change record for existing Service - COE not edited"
//                     );

//                     if (isNullorEmpty(commRegID)) {
//                         commRegID = createCommReg(
//                             customer,
//                             dateEffective,
//                             partner,
//                             state,
//                             currentRecord.get().getValue({ fieldId: "custpage_sendemail" }),
//                             customer_status
//                         );
//                     }

//                     var new_service_change_record = ecord.create({
//                         type: "customrecord_servicechg",
//                         isDynamic: true,
//                     });
//                     var service_id =
//                         service_name_elem[i].getAttribute("data-serviceid");
//                     if (!isNullorEmpty(service_id)) {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_date_effective",
//                             value: getFormattedDate(dateEffective),
//                         });

//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_service",
//                             value: service_id,
//                         });

//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_status",
//                             value: 4,
//                         });

//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_old_zee",
//                             value: partner,
//                         });

//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_new_price",
//                             value: new_service_price_class_elem[i].value,
//                         });

//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_new_freq",
//                             value: current_freq_array,
//                         });

//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_comm_reg",
//                             value: commRegID,
//                         });

//                         if (role != 1000) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_created",
//                                 value: runtime.getCurrentUser(),
//                             });
//                         }
//                         var service_record = record.load({
//                             type: "customrecord_service",
//                             id: service_id,
//                             isDynamic: true,
//                         });
//                         service_record.setField({
//                             fieldId: "custrecord_service_comm_reg",
//                             value: commRegID,
//                         });
//                         service_record.save();
//                     }
//                 }
//             }
//         }

//         console.log(monthly_service_rate);
//         currentRecord
//             .get()
//             .setValue({ fieldId: "custpage_customer_comm_reg", value: commRegID });
//         recCustomer.setValue({
//             fieldId: "custentity_cust_monthly_service_value",
//             value: parseFloat(monthly_service_rate * 4.25),
//         });
//         recCustomer.setValue({
//             fieldId: "custentity_monthly_extra_service_revenue",
//             value: parseFloat(monthly_extra_service_rate * 4.25),
//         });
//         recCustomer.save();
//         console.log("Saving rec 896 ");
//         return true;
//     } else if (!isNullorEmpty(serviceResult_service_change) &&
//         !isNullorEmpty(commRegID)
//     ) {
//         console.log("2th IF");
//         console.log(service_change_delete);
//         console.log(comm_reg_delete);
//         var service_change_delete_string = service_change_delete.join();
//         var comm_reg_delete_string = comm_reg_delete.join();
//         currentRecord.get().setValue({
//             fieldId: "custpage_service_change_delete",
//             value: service_change_delete_string,
//         });
//         currentRecord.get().setValue({
//             fieldId: "custpage_comm_reg_delete",
//             value: comm_reg_delete_string,
//         });
//         return true;
//     } else if (
//         isNullorEmpty(serviceResult_service_change) &&
//         !isNullorEmpty(commRegID)
//     ) {
//         console.log("3rd IF");
//         var searched_service_change = search.load({
//             type: "customrecord_servicechg",
//             id: "customsearch_smc_service_chg",
//         });

//         if (!isNullorEmpty(commRegID)) {
//             searched_service_change.filters.push(
//                 search.createFilter({
//                     name: "custrecord_servicechg_comm_reg",
//                     join: null,
//                     operator: search.Operator.ANYOF,
//                     values: commRegID,
//                 })
//             );
//         }

//         searched_service_change.filters.push(
//             search.createFilter({
//                 name: "custrecord_service_customer",
//                 join: "CUSTRECORD_SERVICECHG_SERVICE",
//                 operator: search.Operator.IS,
//                 values: customer,
//             })
//         );

//         var resultSet_service_change = searched_service_change.run();
//         var serviceResult_service_change = resultSet_service_change.getRange({
//             start: 0,
//             end: 1,
//         });

//         console.log(serviceResult_service_change);

//         for (var i = 0; i < edit_class_elem.length; i++) {
//             console.log(service_name_elem[i].getAttribute("data-serviceid"));

//             var freqArray = [];
//             var sale_type = comm_type_class_elem[i].value;

//             if (monday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 1;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (tuesday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 2;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (wednesday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 3;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (thursday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 4;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (friday_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 5;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }
//             if (adhoc_class_elem[i].checked == true) {
//                 freqArray[freqArray.length] = 6;
//                 monthly_service_rate = parseFloat(
//                     monthly_service_rate +
//                     parseFloat(new_service_price_class_elem[i].value)
//                 );
//                 if (
//                     sale_type == "Extra Service" ||
//                     sale_type == "Increase of Frequency"
//                 ) {
//                     monthly_extra_service_rate = parseFloat(
//                         monthly_extra_service_rate +
//                         parseFloat(new_service_price_class_elem[i].value)
//                     );
//                 }
//             }

//             var row_service_change_id = edit_class_elem[i].getAttribute(
//                 "data-servicechangeid"
//             );
//             var row_service_id =
//                 service_name_elem[i].getAttribute("data-serviceid");
//             var user_id = created_by_class_elem[i].getAttribute("data-userid");

//             if (isNullorEmpty(row_service_id)) {
//                 if (isNullorEmpty(commRegID)) {
//                     commRegID = createCommReg(
//                         customer,
//                         dateEffective,
//                         partner,
//                         state,
//                         currentRecord.get().getValue({ fieldId: "custpage_sendemail" }),
//                         customer_status
//                     );
//                 } else {
//                     loadCommReg(commRegID, dateEffective);
//                 }

//                 console.log("inside create of Service Change record for new service");

//                 var new_service_record = record.create({
//                     type: "customrecord_service",
//                     isDynamic: true,
//                 });

//                 var servicetype_id =
//                     service_name_elem[i].getAttribute("data-servicetypeid");
//                 var servicetype_text = service_name_elem[i].value;
//                 var new_service_price = new_service_price_class_elem[i].value;
//                 var new_service_descp = service_descp_class_elem[i].value;
//                 var created_by = created_by_class_elem[i].value;

//                 new_service_record.setValue({
//                     fieldId: "custrecord_service",
//                     value: servicetype_id,
//                 });
//                 new_service_record.setValue({
//                     fieldId: "name",
//                     value: servicetype_text,
//                 });
//                 new_service_record.setValue({
//                     fieldId: "custrecord_service_price",
//                     value: new_service_price,
//                 });
//                 new_service_record.setValue({
//                     fieldId: "custrecord_service_customer",
//                     value: customer,
//                 });
//                 new_service_record.setValue({
//                     fieldId: "custrecord_service_description",
//                     value: new_service_descp,
//                 });

//                 if (!isNullorEmpty(commRegID)) {
//                     new_service_record.setValue({
//                         fieldId: "custrecord_service_comm_reg",
//                         value: commRegID,
//                     });
//                 }

//                 if (monday_class_elem[i].checked == true) {
//                     new_service_record.setValue({
//                         fieldId: "custrecord_service_day_mon",
//                         value: "T",
//                     });
//                 }

//                 if (tuesday_class_elem[i].checked == true) {
//                     new_service_record.setValue({
//                         fieldId: "custrecord_service_day_tue",
//                         value: "T",
//                     });
//                 }

//                 if (wednesday_class_elem[i].checked == true) {
//                     new_service_record.setValue({
//                         fieldId: "custrecord_service_day_wed",
//                         value: "T",
//                     });
//                 }

//                 if (thursday_class_elem[i].checked == true) {
//                     new_service_record.setValue({
//                         fieldId: "custrecord_service_day_thu",
//                         value: "T",
//                     });
//                 }

//                 if (friday_class_elem[i].checked == true) {
//                     new_service_record.setValue({
//                         fieldId: "custrecord_service_day_fri",
//                         value: "T",
//                     });
//                 }

//                 if (adhoc_class_elem[i].checked == true) {
//                     new_service_record.setValue({
//                         fieldId: "custrecord_service_day_adhoc",
//                         value: "T",
//                     });
//                 }

//                 var new_service_id = new_service_record.save();

//                 if (!isNullorEmpty(new_service_id)) {
//                     var new_service_change_record = record.create({
//                         type: "customrecord_servicechg",
//                     });

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_date_effective",
//                         value: dateEffective,
//                     });

//                     if (
//                         currentRecord.get().getValue({ fieldId: "custpage_sendemail" }) ==
//                         "T"
//                     ) {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_status",
//                             value: 4,
//                         });
//                     } else {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_status",
//                             value: 1,
//                         });
//                     }

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_old_zee",
//                         value: partner,
//                     });

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_new_price",
//                         value: new_service_price,
//                     });

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_new_freq",
//                         value: freqArray,
//                     });

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_comm_reg",
//                         value: commRegID,
//                     });

//                     if (role != 1000) {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_created",
//                             value: user_id,
//                         });
//                     }

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_type",
//                         value: comm_type_class_elem[i].value,
//                     });

//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_default_servicechg_record",
//                         value: 1,
//                     });

//                     new_service_change_record.save();

//                     currentRecord.get().submitFields({
//                         type: "customrecord_service",
//                         id: new_service_id,
//                         values: "isinactive",
//                     });
//                 }
//             } else if (!isNullorEmpty(row_service_change_id)) {
//                 var service_change_record = record.load({
//                     type: "customrecord_servicechg",
//                     id: row_service_change_id,
//                     isDynamic: true,
//                 });

//                 var service_change_new_price = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_new_price",
//                 });
//                 var service_change_old_freq = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_old_freq",
//                 });
//                 var service_change_new_freq = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_new_freq",
//                 });
//                 var service_change_date_effective = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_new_freq",
//                 });
//                 var service_change_comm_reg = service_change_record.getValue({
//                     fieldId: "custrecord_servicechg_comm_reg",
//                 });

//                 if (
//                     (!isNullorEmpty(new_service_price_class_elem[i].value) &&
//                         old_service_price_class_elem[i].value !=
//                         new_service_price_class_elem[i].value) ||
//                     (isNullorEmpty(service_change_old_freq) &&
//                         !arraysEqual(service_change_new_freq, freqArray)) ||
//                     (!isNullorEmpty(service_change_old_freq) &&
//                         !arraysEqual(service_change_old_freq, freqArray)) ||
//                     service_change_date_effective != dateEffective
//                 ) {
//                     console.log("inside update of Service Change record");

//                     if (isNullorEmpty(commRegID)) {
//                         commRegID = loadCommReg(service_change_comm_reg, dateEffective);
//                     }

//                     var service_id =
//                         service_name_elem[i].getAttribute("data-serviceid");

//                     if (!isNullorEmpty(service_id)) {
//                         console.log(dateEffective);
//                         service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_date_effective",
//                             value: getFormattedDate(dateEffective),
//                         });

//                         if (
//                             old_service_price_class_elem[i].value !=
//                             new_service_price_class_elem[i].value
//                         ) {
//                             console.log(new_service_price_class_elem[i].value);
//                             service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_new_price",
//                                 value: new_service_price_class_elem[i].value,
//                             });
//                         } else {
//                             console.log(old_service_price_class_elem[i].value);
//                             service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_old_price",
//                                 value: old_service_price_class_elem[i].value,
//                             });
//                         }

//                         if (isNullorEmpty(service_change_old_freq)) {
//                             if (service_change_new_freq != freqArray) {
//                                 console.log(freqArray);
//                                 service_change_record.setValue({
//                                     fieldId: "custrecord_servicechg_new_freq",
//                                     value: freqArray,
//                                 });
//                             } else {
//                                 console.log(service_change_new_freq);
//                                 service_change_record.setValue({
//                                     fieldId: "custrecord_servicechg_old_freq",
//                                     value: service_change_new_freq,
//                                 });
//                             }
//                         } else {
//                             if (service_change_old_freq != freqArray) {
//                                 console.log(freqArray);
//                                 service_change_record.setValue({
//                                     fieldId: "custrecord_servicechg_new_freq",
//                                     value: freqArray,
//                                 });
//                             } else {
//                                 console.log(service_change_old_freq);
//                                 service_change_record.setValue({
//                                     fieldId: "custrecord_servicechg_old_freq",
//                                     value: service_change_old_freq,
//                                 });
//                             }
//                         }
//                         console.log(commRegID);
//                         service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_comm_reg",
//                             value: commRegID,
//                         });
//                         if (role != 1000) {
//                             // console.log(user_id)
//                             // service_change_record.setValue({fieldId: 'custrecord_servicechg_created', value: user_id});
//                         }
//                     }
//                     console.log("submit");
//                     service_change_record.save();
//                 }
//             } else if (
//                 isNullorEmpty(row_service_change_id) &&
//                 !isNullorEmpty(row_service_id)
//             ) {
//                 var service_record = record.load({
//                     type: "customrecord_service",
//                     id: row_service_id,
//                     isDynamic: true,
//                 });

//                 var current_price = service_record.getValue({
//                     fieldId: "custrecord_service_price",
//                 });
//                 var current_freq_mon = service_record.getValue({
//                     fieldId: "custrecord_service_day_mon",
//                 });
//                 var current_freq_tue = service_record.getValue({
//                     fieldId: "custrecord_service_day_tue",
//                 });
//                 var current_freq_wed = service_record.getValue({
//                     fieldId: "custrecord_service_day_wed",
//                 });
//                 var current_freq_thu = service_record.getValue({
//                     fieldId: "custrecord_service_day_thu",
//                 });
//                 var current_freq_fri = service_record.getValue({
//                     fieldId: "custrecord_service_day_fri",
//                 });
//                 var current_freq_adhoc = service_record.getValue({
//                     fieldId: "custrecord_service_day_adhoc",
//                 });

//                 var current_freq_array = [];

//                 if (current_freq_mon == "T") {
//                     current_freq_array[current_freq_array.length] = 1;
//                 }
//                 if (current_freq_tue == "T") {
//                     current_freq_array[current_freq_array.length] = 2;
//                 }
//                 if (current_freq_wed == "T") {
//                     current_freq_array[current_freq_array.length] = 3;
//                 }
//                 if (current_freq_thu == "T") {
//                     current_freq_array[current_freq_array.length] = 4;
//                 }
//                 if (current_freq_fri == "T") {
//                     current_freq_array[current_freq_array.length] = 5;
//                 }
//                 if (current_freq_adhoc == "T") {
//                     current_freq_array[current_freq_array.length] = 6;
//                 }

//                 if (
//                     (!isNullorEmpty(new_service_price_class_elem[i].value) &&
//                         old_service_price_class_elem[i].value !=
//                         new_service_price_class_elem[i].value) ||
//                     !arraysEqual(current_freq_array, freqArray)
//                 ) {
//                     console.log(
//                         "inside create new Service Change record for existing Service"
//                     );
//                     if (isNullorEmpty(commRegID)) {
//                         commRegID = createCommReg(
//                             customer,
//                             dateEffective,
//                             partner,
//                             state,
//                             currentRecord.get().getValue({ fieldId: "custpage_sendemail" }),
//                             customer_status
//                         );
//                     }

//                     var new_service_change_record = record.create({
//                         type: "customrecord_servicechg",
//                     });

//                     var service_id =
//                         service_name_elem[i].getAttribute("data-serviceid");

//                     if (!isNullorEmpty(service_id)) {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_date_effective",
//                             value: dateEffective,
//                         });
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_service",
//                             value: service_id,
//                         });

//                         if (
//                             currentRecord
//                             .get()
//                             .getValue({ fieldId: "custpage_sendemail" }) == "T"
//                         ) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_status",
//                                 value: 4,
//                             });
//                         } else {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_status",
//                                 value: 1,
//                             });
//                         }
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_old_zee",
//                             value: partner,
//                         });

//                         if (
//                             old_service_price_class_elem[i].value !=
//                             new_service_price_class_elem[i].value
//                         ) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_new_price",
//                                 value: new_service_price_class_elem[i].value,
//                             });
//                         }

//                         if (!arraysEqual(current_freq_array, freqArray)) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_new_freq",
//                                 value: freqArray,
//                             });
//                         }
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_comm_reg",
//                             value: commRegID,
//                         });

//                         if (role != 1000) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_created",
//                                 value: user_id,
//                             });
//                         }
//                     }
//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_type",
//                         value: comm_type_class_elem[i].value,
//                     });
//                     //COE - Service imported from old customer and edited
//                     if ($("#commencementtype option:selected").val() == 6) {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_default_servicechg_record",
//                             value: 1,
//                         });
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_new_price",
//                             value: new_service_price_class_elem[i].value,
//                         });
//                     }
//                     new_service_change_record.save();
//                 } else if ($("#commencementtype option:selected").val() == 6) {
//                     //COE - Service imported from old customer and not edited
//                     console.log(
//                         "inside create new Service Change record for existing Service - COE not edited"
//                     );
//                     if (isNullorEmpty(commRegID)) {
//                         commRegID = createCommReg(
//                             customer,
//                             dateEffective,
//                             partner,
//                             state,
//                             currentRecord.get().getValue({ fieldId: "custpage_sendemail" }),
//                             customer_status
//                         );
//                     }

//                     var new_service_change_record = record.create({
//                         type: "customrecord_servicechg",
//                     });

//                     var service_id =
//                         service_name_elem[i].getAttribute("data-serviceid");

//                     if (!isNullorEmpty(service_id)) {
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_date_effective",
//                             value: dateEffective,
//                         });
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_service",
//                             value: service_id,
//                         });
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_status",
//                             value: 2,
//                         }); //status is
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_old_zee",
//                             value: partner,
//                         });
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_new_price",
//                             value: old_service_price_class_elem[i].value,
//                         }); //price remain the same
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_new_freq",
//                             value: current_freq_array,
//                         }); //frequency remain the same
//                         new_service_change_record.setValue({
//                             fieldId: "custrecord_servicechg_comm_reg",
//                             value: commRegID,
//                         });

//                         if (role != 1000) {
//                             new_service_change_record.setValue({
//                                 fieldId: "custrecord_servicechg_created",
//                                 value: runtime.getCurrentUser(),
//                             });
//                         }
//                     }
//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_servicechg_type",
//                         value: "Change of Entity",
//                     });
//                     new_service_change_record.setValue({
//                         fieldId: "custrecord_default_servicechg_record",
//                         value: 1,
//                     });
//                     new_service_change_record.save();
//                 }
//             }
//         }

//         console.log("2nd " + monthly_service_rate);
//         currentRecord
//             .get()
//             .setValue({ fieldId: "custpage_customer_comm_reg", value: commRegID });
//         var service_change_delete_string = service_change_delete.join();
//         var comm_reg_delete_string = comm_reg_delete.join();

//         currentRecord.get().setValue({
//             fieldId: "custpage_service_change_delete",
//             value: service_change_delete_string,
//         });
//         currentRecord.get().setValue({
//             fieldId: "custpage_comm_reg_delete",
//             value: comm_reg_delete_string,
//         });

//         console.log(monthly_service_rate);

//         recCustomer.setValue({
//             fieldId: "custentity_cust_monthly_service_value",
//             value: parseFloat(monthly_service_rate * 4.25),
//         });
//         recCustomer.setValue({
//             fieldId: "custentity_monthly_extra_service_revenue",
//             value: parseFloat(monthly_extra_service_rate * 4.25),
//         });
//         recCustomer.save();
//         return true;
//     } else if (!isNullorEmpty(serviceResult_service_change) &&
//         isNullorEmpty(commRegID)
//     ) {
//         console.log("4th IF");
//         alert("There has already been a scheduled change");
//         return false;
//     }
//     return true;
// }

     function isNullorEmpty(strVal) {
         return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
     }

     return {
         pageInit: pageInit,
         saveRecord: saveRecord,

     };
 }


);