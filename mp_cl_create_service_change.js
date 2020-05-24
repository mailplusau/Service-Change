/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2019-11-16 08:33:08         Ankith
 *
 * Description:         
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-02-26 10:56:29
 *
 */

var baseURL = 'https://system.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

var deleted_service_ids = [];
var deleted_job_ids = [];

if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
} else if (role == 3) { //Administrator
    zee = 6; //test
} else if (role == 1032) { // System Support
    zee = 425904; //test-AR
}


var service_change_delete = [];
var comm_reg_delete = [];

$(window).load(function() {
    // Animate loader off screen
    $(".se-pre-con").fadeOut("slow");
});

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {

});

$(document).on('change', '.input', function(e) {


    pdffile = document.getElementsByClassName("input");

    pdffile_url = URL.createObjectURL(pdffile[0].files[0]);
    $('#viewer').attr('src', pdffile_url);
});

function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $('#output').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

// $("#imgInp").change(function() {
//  readURL(this);
// // });

var item_array = new Array();
var item_price_array = [];
var item_price_count = 0;
var item_count = 0;

function pageInit() {

    $('#alert').hide();

    var scf_upload = document.getElementsByClassName('input');

    for (var i = 0; i < scf_upload.length; i++) {
        scf_upload[i].className += " form-control";
    }

    $(function() {
        $('[data-toggle="tooltip"]').tooltip()
    })

    AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');
    $('.services_selected_class').selectator({
        keepOpen: true,
        showAllOptionsOnFocus: true,
        selectFirstOptionOnSearch: false
    });


    var customer_id = parseInt(nlapiGetFieldValue('custpage_customer_id'));

    var customer_record = nlapiLoadRecord('customer', customer_id);

    var zeeLocation = nlapiLoadRecord('partner', customer_record.getFieldValue('partner')).getFieldValue('location');

    //Search: SMC - Services
    var searched_jobs = nlapiLoadSearch('customrecord_service', 'customsearch_smc_services');

    var newFilters = new Array();
    newFilters[0] = new nlobjSearchFilter('custrecord_service_customer', null, 'is', parseInt(nlapiGetFieldValue('custpage_customer_id')));

    searched_jobs.addFilters(newFilters);

    var resultSet = searched_jobs.runSearch();

    //Create the item_price_array and package_name_create arrays based on the existing service records
    resultSet.forEachResult(function(searchResult) {

        var item_description = searchResult.getValue('custrecord_service_description');
        if (isNullorEmpty(item_description)) {
            item_description = 0;
        } else {
            item_description = item_description.replace(/\s+/g, '-').toLowerCase()
        }

        if (item_price_array[searchResult.getValue('custrecord_service')] == undefined) {
            item_price_array[searchResult.getValue('custrecord_service')] = [];
            item_price_array[searchResult.getValue('custrecord_service')][0] = searchResult.getValue('custrecord_service_price') + '_' + item_description;
        } else {
            var size = item_price_array[searchResult.getValue('custrecord_service')].length;
            item_price_array[searchResult.getValue('custrecord_service')][size] = searchResult.getValue('custrecord_service_price') + '_' + item_description;
        }

        item_price_count++;
        return true;
    });

    if ($('#commencementtype option:selected').val() == 6) {
        $('.get_services_section').removeClass('hide');
    }


}

$(document).on('click', '#alert .close', function(e) {
    $(this).parent().hide();
});

function showAlert(message) {
    $('#alert').html('<button type="button" class="close">&times;</button>' + message);
    $('#alert').show();
}

$(document).on('click', '#alert .close', function(e) {
    $(this).parent().hide();
});



$('#exampleModal').on('show.bs.modal', function(event) {
    var button = $(event).relatedTarget // Button that triggered the modal
    var recipient = button.data('whatever') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    modal.find('.modal-title').text('New message to ' + recipient)
    modal.find('.modal-body input').val(recipient)
});

$(document).ready(function() {
    $(".modal_display").click(function() {
        var link = $(this).data("whatever");
        $('.modal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Information!!</label></h4></div>');
        $('.modal .modal-body').html("");
        $('.modal .modal-body').html(link);
        $('.modal').modal("show");


    });
});

$(document).on('click', '#create_new_service', function(e) {

    reset_all();
    $('.row_service_type').removeClass('hide');
    $('.service_descp_row').removeClass('hide');
    $('.price_info').removeClass('hide');
    // $('.service_change_type_section').removeClass('hide');
    $('.frequency_info').removeClass('hide');
    $('.row_button').removeClass('hide');
    $('.add_service').removeClass('hide');
    $('.old_price_section').addClass('hide');
    $('.create_new_service_button').addClass('hide');
    $('.edit_service_section').addClass('hide');
    $('#service_type').prop('disabled', false);
    $('.add_service_section').removeClass('hide');
});

function reset_all() {
    $('.row_service_type').addClass('hide');
    $('.service_descp_row').addClass('hide');
    $('.price_info').addClass('hide');
    $('.frequency_info').addClass('hide');
    // $('.service_change_type_section').addClass('hide');
    $('.row_button').addClass('hide');
    $('.old_price_section').addClass('hide');
    $('.create_new_service_button').removeClass('hide');
    $('.edit_service_section').addClass('hide');
    $('#service_type').val(0);
    $('#descp').val('');
    $('#new_price').val('');
    $('#old_price').val('');
    $('#daily').prop('checked', false);
    $('#monday').prop('checked', false);
    $('#tuesday').prop('checked', false);
    $('#wednesday').prop('checked', false);
    $('#thursday').prop('checked', false);
    $('#friday').prop('checked', false);
    $('#adhoc').prop('checked', false);
    $('#daily').prop('disabled', false);
    $('#monday').prop('disabled', false);
    $('#tuesday').prop('disabled', false);
    $('#wednesday').prop('disabled', false);
    $('#thursday').prop('disabled', false);
    $('#friday').prop('disabled', false);
    $('#adhoc').prop('disabled', false);

}


/**
 * [description] - On the click of the edit button
 */
$(document).on('click', '.edit_class', function(event) {

    reset_all();

    $('.create_new_service_button').addClass('hide');
    $('.edit_service_section').removeClass('hide');

    $('.row_service_type').removeClass('hide');
    // $('.service_change_type_section').removeClass('hide');
    $('.service_descp_row').removeClass('hide');
    $('.price_info').removeClass('hide');
    $('.frequency_info').removeClass('hide');
    $('.row_button').removeClass('hide');
    $('.old_price_section').removeClass('hide');
    $('.add_service_section').addClass('hide');

    var servicechangeidid = $(this).attr('data-servicechangeid');
    var rowid = $(this).attr('data-rowid');
    var service = $(this).closest('tr').find('.service_name').val();
    var servicetypeid = $(this).closest('tr').find('.service_name').attr('data-servicetypeid');
    var commtypeid = $(this).closest('tr').find('.service_name').attr('data-commtypeid');
    var serviceid = $(this).closest('tr').find('.service_name').attr('data-serviceid');
    var service_descp = $(this).closest('tr').find('.service_descp_class').val();
    var old_price = $(this).closest('tr').find('.old_service_price_class').val();
    var new_price = $(this).closest('tr').find('.new_service_price_class').val();
    // var date_effective = $(this).closest('tr').find('.date_effective_class').val();

    // var formattedDateEffective = GetFormattedDate(date_effective);

    // var service_type_search = serviceTypeSearch(null, [1]);

    $('#descp').val(service_descp);
    $('#new_price').val(new_price);
    $('#old_price').val(old_price);
    $('#service_type').val(servicetypeid);
    $('#commencementtype').val(commtypeid);
    $('#servicechange_id').val(servicechangeidid);
    $('#row_id').val(rowid);
    $('#service_id').val(serviceid);
    // $('#date_effective').val(formattedDateEffective);
    $('#service_type').prop('disabled', true);

    // alert($(this).closest('tr').find('input.monday_class').is(':checked'));


    if ($(this).closest('tr').find('input.monday_class').is(':checked')) {
        $('#monday').prop('checked', true);
    } else {
        $('#monday').prop('checked', false);
    }

    if ($(this).closest('tr').find('input.tuesday_class').is(':checked')) {
        $('#tuesday').prop('checked', true);
    } else {
        $('#tuesday').prop('checked', false);
    }
    if ($(this).closest('tr').find('input.wednesday_class').is(':checked')) {
        $('#wednesday').prop('checked', true);
    } else {
        $('#monday').prop('checked', false);
    }
    if ($(this).closest('tr').find('input.thursday_class').is(':checked')) {
        $('#thursday').prop('checked', true);
    } else {
        $('#thursday').prop('checked', false);
    }
    if ($(this).closest('tr').find('input.friday_class').is(':checked')) {
        $('#friday').prop('checked', true);
    } else {
        $('#friday').prop('checked', false);
    }
    if ($(this).closest('tr').find('input.adhoc_class').is(':checked')) {
        $('#adhoc').prop('checked', true);
    } else {
        $('#adhoc').prop('checked', false);
    }

});

$(document).on('click', '#edit_service', function(event) {

    var date_effective = $('#date_effective').val();
    var comm_typeid = $('#commencementtype option:selected').val();

    if (isNullorEmpty(date_effective)) {
        alert('Please Enter the Date Effective');
        return false;
    } else {
        var splitDate = date_effective.split('-');
        var dateEffective = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
    }

    if (isNullorEmpty(comm_typeid)) {
        alert('Please Select Sale Type');
        return false;
    }

    var servicechange_id = $('#servicechange_id').val();
    var rowid = $('#row_id').val();
    var service_id = $('#service_id').val();
    var service_typeid = $('#service_type').val();

    var service_typename = $('#service_type').text();
    var comm_typename = $('#commencementtype option:selected').text();
    var descp = $('#descp').val();
    var new_price = ($('#new_price').val());
    var old_price = parseFloat($('#old_price').val());

    if (isNullorEmpty(new_price) || new_price == 0) {
        alert('Please Enter the New Price');
        return false;
    }

    var service_name_elem = document.getElementsByClassName("service_name");
    var edit_class_elem = document.getElementsByClassName("edit_class");
    var remove_class_elem = document.getElementsByClassName("remove_class");
    var service_descp_class_elem = document.getElementsByClassName("service_descp_class");
    var old_service_price_class_elem = document.getElementsByClassName("old_service_price_class");
    var new_service_price_class_elem = document.getElementsByClassName("new_service_price_class");
    var date_effective_class = document.getElementsByClassName("date_effective_class");
    var created_by_class = document.getElementsByClassName("created_by_class");
    var last_modified_class = document.getElementsByClassName("last_modified_class");
    var comm_type_class = document.getElementsByClassName("comm_type_class");
    var monday_class_elem = document.getElementsByClassName("monday_class");
    var tuesday_class_elem = document.getElementsByClassName("tuesday_class");
    var wednesday_class_elem = document.getElementsByClassName("wednesday_class");
    var thursday_class_elem = document.getElementsByClassName("thursday_class");
    var friday_class_elem = document.getElementsByClassName("friday_class");
    var adhoc_class_elem = document.getElementsByClassName("adhoc_class");

    // if (!($('input.monday').is(':checked')) && !($('input.tuesday').is(':checked')) && !($('input.wednesday').is(':checked')) && !($('input.thursday').is(':checked')) && !($('input.friday').is(':checked')) && !($('input.adhoc').is(':checked'))) {
    //  alert('Please select the frequency');
    //  return false;
    // }


    if (!isNullorEmpty(service_id)) {
        for (var i = 0; i < edit_class_elem.length; i++) {
            var row_service_id = service_name_elem[i].getAttribute('data-serviceid');
            if (service_id == row_service_id) {
                if ($('input.monday').is(':checked')) {
                    monday_class_elem[i].checked = true;
                } else {
                    monday_class_elem[i].checked = false;
                }

                if ($('input.tuesday').is(':checked')) {
                    tuesday_class_elem[i].checked = true;
                } else {
                    tuesday_class_elem[i].checked = false;
                }
                if ($('input.wednesday').is(':checked')) {
                    wednesday_class_elem[i].checked = true;
                } else {
                    wednesday_class_elem[i].checked = false;
                }
                if ($('input.thursday').is(':checked')) {
                    thursday_class_elem[i].checked = true;
                } else {
                    thursday_class_elem[i].checked = false;
                }
                if ($('input.friday').is(':checked')) {
                    friday_class_elem[i].checked = true;
                } else {
                    friday_class_elem[i].checked = false;
                }
                if ($('input.adhoc').is(':checked')) {
                    adhoc_class_elem[i].checked = true;
                } else {
                    adhoc_class_elem[i].checked = false;
                }

                service_descp_class_elem[i].value = descp;
                old_service_price_class_elem[i].value = old_price;
                new_service_price_class_elem[i].value = parseFloat(new_price);
                date_effective_class[i].value = dateEffective;
                created_by_class[i].setAttribute('data-userid', ctx.getUser());
                last_modified_class[i].value = getDate();
                comm_type_class[i].value = comm_typename;
                comm_type_class[i].setAttribute('data-commtypeid', comm_typeid);
                remove_class_elem[i].classList.remove("hide");

            }
        }
    } else {
        if ($('input.monday').is(':checked')) {
            monday_class_elem[rowid - 1].checked = true;
        } else {
            monday_class_elem[rowid - 1].checked = false;
        }

        if ($('input.tuesday').is(':checked')) {
            tuesday_class_elem[rowid - 1].checked = true;
        } else {
            tuesday_class_elem[rowid - 1].checked = false;
        }
        if ($('input.wednesday').is(':checked')) {
            wednesday_class_elem[rowid - 1].checked = true;
        } else {
            wednesday_class_elem[rowid - 1].checked = false;
        }
        if ($('input.thursday').is(':checked')) {
            thursday_class_elem[rowid - 1].checked = true;
        } else {
            thursday_class_elem[rowid - 1].checked = false;
        }
        if ($('input.friday').is(':checked')) {
            friday_class_elem[rowid - 1].checked = true;
        } else {
            friday_class_elem[rowid - 1].checked = false;
        }
        if ($('input.adhoc').is(':checked')) {
            adhoc_class_elem[rowid - 1].checked = true;
        } else {
            adhoc_class_elem[rowid - 1].checked = false;
        }

        service_descp_class_elem[rowid - 1].value = descp;
        old_service_price_class_elem[rowid - 1].value = old_price;
        new_service_price_class_elem[rowid - 1].value = parseFloat(new_price);
        date_effective_class[rowid - 1].value = dateEffective;
        created_by_class[rowid - 1].setAttribute('data-userid', ctx.getUser());
        last_modified_class[rowid - 1].value = getDate();
        comm_type_class[rowid - 1].value = comm_typename;
        comm_type_class[rowid - 1].setAttribute('data-commtypeid', comm_typeid);
        remove_class_elem[rowid - 1].classList.remove("hide");

    }



    reset_all();


});

$(document).on('click', '#add_service', function(event) {

    var date_effective = $('#date_effective').val();
    var comm_typeid = $('#commencementtype option:selected').val();

    if (isNullorEmpty(date_effective)) {
        alert('Please Enter the Date Effective');
        return false;
    } else {
        var splitDate = date_effective.split('-');
        var dateEffective = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
    }

    if (isNullorEmpty(comm_typeid)) {
        alert('Please Select Sale Type');
        return false;
    }

    var servicechange_id = $('#servicechange_id').val();
    var service_typeid = $('#service_type option:selected').val();

    var service_typename = $('#service_type option:selected').text();
    var comm_typename = $('#commencementtype option:selected').text();
    var descp = $('#descp').val();
    var new_price = ($('#new_price').val());
    var old_price = $('#old_price').val();

    console.log(new_price);

    if (isNullorEmpty(new_price) || new_price == 0) {
        if (service_typeid != 24) {
            alert('Please Enter the New Price');
            return false;
        }
    }

    if (!($('input.monday').is(':checked')) && !($('input.tuesday').is(':checked')) && !($('input.wednesday').is(':checked')) && !($('input.thursday').is(':checked')) && !($('input.friday').is(':checked')) && !($('input.adhoc').is(':checked'))) {
        alert('Please select the frequency');
        return false;
    }

    if (isNullorEmpty(descp)) {
        descp = '';
    } else {
        descp = descp.replace(/\s+/g, '-').toLowerCase()
    }

    console.log(item_price_array);

    if (item_price_array[service_typeid] != undefined) {
        if (isNullorEmpty(item_price_array[service_typeid].length)) {
            return false;
        }

        var size = item_price_array[service_typeid].length;

        for (var x = 0; x < size; x++) {

            var price_desc = item_price_array[service_typeid][x];

            price_desc = price_desc.split('_');

            if (price_desc[0] == parseFloat(new_price) && price_desc[1] == descp) {
                alert('Duplicate Service with same price has been entered');
                // errorAlert('Error', 'Duplicate Service with same price has been entered'); 
                // nlapiCancelLineItem('new_services');
                return false;
            }
        }

        item_price_array[service_typeid][x] = parseFloat(new_price) + '_' + descp;

    } else {
        item_price_array[service_typeid] = [];
        item_price_array[service_typeid][0] = parseFloat(new_price) + '_' + descp;
    }

    // alert(dateEffective)
    var inlineQty = '';

    if (isNullorEmpty(servicechange_id)) {
        var rowCount = $('#services tr').length;
        inlineQty += '<tr>';
        inlineQty += '<td class="first_col"><button class="btn btn-warning btn-sm edit_class glyphicon glyphicon-pencil" data-rowid="' + (rowCount - 1) + '" data-servicechangeid="' + null + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><br/><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button><input type="hidden" class="delete_service" value="F" /></td>';

        inlineQty += '<td><div class="service_name_div"><input id="service_name" class="form-control service_name" data-serviceid="' + null + '" data-servicetypeid="' + service_typeid + '" readonly value="' + service_typename + '" /></div></td>';
        inlineQty += '<td><div class="service_descp_div"><input class="form-control service_descp_class" disabled value="' + descp + '"  type="text" /></div></td>';

        inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control old_service_price_class" disabled value=""  type="number" step=".01" /></div></td>';
        inlineQty += '<td><div class="service_price_div input-group"><span class="input-group-addon">$</span><input class="form-control new_service_price_class" disabled value="' + parseFloat(new_price) + '"  type="number" step=".01" /></div></td>';
        inlineQty += '<td><div class="date_effective_div input-group"><input class="form-control date_effective_class text-center" disabled value="' + dateEffective + '"  type="text" /></div></td>';

        inlineQty += '<td><div class="created_by_div input-group"><input class="form-control created_by_class text-center" disabled data-userid="' + ctx.getUser() + '" value="" type="text" /></div></td>';
        inlineQty += '<td><div class="last_modified_div input-group"><input class="form-control last_modified_class text-center" disabled value="' + getDate() + '"  type="text" /></div></td>';
        inlineQty += '<td><div class="comm_type_div input-group"><input class="form-control comm_type_class text-center" disabled value="' + comm_typename + '"  type="text" data-commtypeid="' + comm_typeid + '" /></div></td>';


        if ($('input.monday').is(':checked')) {
            inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled checked/></div></td>'
        } else {
            inlineQty += '<td><div class="daily"><input class="monday_class"   type="checkbox" disabled /></div></td>'
        }

        if ($('input.tuesday').is(':checked')) {
            inlineQty += '<td><div class="daily"><input class="tuesday_class" type="checkbox" disabled checked/></div></td>'
        } else {
            inlineQty += '<td><div class="daily"><input class="tuesday_class" type="checkbox" disabled /></div></td>'
        }
        if ($('input.wednesday').is(':checked')) {
            inlineQty += '<td><div class="daily"><input class="wednesday_class" type="checkbox" disabled checked/></div></td>'
        } else {
            inlineQty += '<td><div class="daily"><input class="wednesday_class" type="checkbox" disabled /></div></td>'
        }
        if ($('input.thursday').is(':checked')) {
            inlineQty += '<td><div class="daily"><input class="thursday_class" type="checkbox" disabled checked/></div></td>'
        } else {
            inlineQty += '<td><div class="daily"><input class="thursday_class" type="checkbox" disabled /></div></td>'
        }
        if ($('input.friday').is(':checked')) {
            inlineQty += '<td><div class="daily"><input class="friday_class" type="checkbox" disabled checked/></div></td>'
        } else {
            inlineQty += '<td><div class="daily"><input class="friday_class" type="checkbox" disabled /></div></td>'
        }
        if ($('input.adhoc').is(':checked')) {
            inlineQty += '<td><div class="daily"><input class="adhoc_class" type="checkbox" disabled checked/></div></td>'
        } else {
            inlineQty += '<td><div class="daily"><input class="adhoc_class" type="checkbox" disabled /></div></td>'
        }

        inlineQty += '</tr>';

        $('#services tr:last').after(inlineQty);

    }

    reset_all();

});

$(document).on('click', '#adhoc', function(event) {
    if ($('input.adhoc').is(':checked')) {
        $('#daily').prop('checked', false);
        $('#monday').prop('checked', false);
        $('#daily').prop('disabled', true);
        $('#monday').prop('disabled', true);
        $('#tuesday').prop('checked', false);
        $('#tuesday').prop('disabled', true);
        $('#wednesday').prop('checked', false);
        $('#wednesday').prop('disabled', true);
        $('#thursday').prop('checked', false);
        $('#thursday').prop('disabled', true);
        $('#friday').prop('checked', false);
        $('#friday').prop('disabled', true);
    } else {
        $('#daily').prop('checked', false);
        $('#monday').prop('checked', false);
        $('#daily').prop('disabled', false);
        $('#monday').prop('disabled', false);
        $('#tuesday').prop('checked', false);
        $('#tuesday').prop('disabled', false);
        $('#wednesday').prop('checked', false);
        $('#wednesday').prop('disabled', false);
        $('#thursday').prop('checked', false);
        $('#thursday').prop('disabled', false);
        $('#friday').prop('checked', false);
        $('#friday').prop('disabled', false);
    }
});

$(document).on('click', '#daily', function(event) {
    if ($('input.daily').is(':checked')) {
        $('#monday').prop('checked', true);
        $('#monday').prop('disabled', true);
        $('#tuesday').prop('checked', true);
        $('#tuesday').prop('disabled', true);
        $('#wednesday').prop('checked', true);
        $('#wednesday').prop('disabled', true);
        $('#thursday').prop('checked', true);
        $('#thursday').prop('disabled', true);
        $('#friday').prop('checked', true);
        $('#adhoc').prop('checked', false);
        $('#friday').prop('disabled', true);
        $('#adhoc').prop('disabled', true);
    } else {
        $('#monday').prop('checked', false);
        $('#monday').prop('disabled', false);
        $('#tuesday').prop('checked', false);
        $('#tuesday').prop('disabled', false);
        $('#wednesday').prop('checked', false);
        $('#wednesday').prop('disabled', false);
        $('#thursday').prop('checked', false);
        $('#thursday').prop('disabled', false);
        $('#friday').prop('checked', false);
        $('#adhoc').prop('checked', false);
        $('#friday').prop('disabled', false);
        $('#adhoc').prop('disabled', false);
    }
});



function saveRecord() {

    var recCustomer = nlapiLoadRecord('customer', parseInt(nlapiGetFieldValue('custpage_customer_id')));

    var partner = recCustomer.getFieldValue('partner');
    var customer_status = recCustomer.getFieldValue('entitystatus');

    var partner_record = nlapiLoadRecord('partner', partner);

    var state = partner_record.getFieldValue('location');

    var customer = parseInt(nlapiGetFieldValue('custpage_customer_id'));

    var service_name_elem = document.getElementsByClassName("service_name");
    var edit_class_elem = document.getElementsByClassName("edit_class");
    var service_descp_class_elem = document.getElementsByClassName("service_descp_class");
    var old_service_price_class_elem = document.getElementsByClassName("old_service_price_class");
    var new_service_price_class_elem = document.getElementsByClassName("new_service_price_class");
    var monday_class_elem = document.getElementsByClassName("monday_class");
    var tuesday_class_elem = document.getElementsByClassName("tuesday_class");
    var wednesday_class_elem = document.getElementsByClassName("wednesday_class");
    var thursday_class_elem = document.getElementsByClassName("thursday_class");
    var friday_class_elem = document.getElementsByClassName("friday_class");
    var adhoc_class_elem = document.getElementsByClassName("adhoc_class");
    var created_by_class_elem = document.getElementsByClassName("created_by_class");
    var last_modified_class_elem = document.getElementsByClassName("last_modified_class");
    var comm_type_class_elem = document.getElementsByClassName("comm_type_class");


    var date_effective = $('#date_effective').val();
    var old_date_effective = $('#date_effective').attr('data-olddate');

    var monthly_service_rate = 0.0;
    var monthly_extra_service_rate = 0.0;


    if (isNullorEmpty(date_effective)) {
        alert('Please Enter the Date Effective');
        return false;
    } else {
        var resultDate = dateEffectiveCheck(date_effective);

        if (resultDate == false) {
            alert('Entered Date Effective should be greater than today');
            return false;
        }
        var splitDate = date_effective.split('-');
        var dateEffective = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
    }

    var commRegID = nlapiGetFieldValue('custpage_customer_comm_reg');

    console.log('commRegID ' + commRegID);

    var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_smc_service_chg');

    // alert(dateEffective);
    // alert(commRegID);

    var newFilters = new Array();
    if (!isNullorEmpty(commRegID)) {
        newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_comm_reg', null, 'noneof', commRegID);
    }
    newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_date_effective', null, 'on', dateEffective);
    newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_status', null, 'is', 1);
    newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_customer', 'CUSTRECORD_SERVICECHG_SERVICE', 'is', customer);


    searched_service_change.addFilters(newFilters);

    var resultSet_service_change = searched_service_change.runSearch();

    var serviceResult_service_change = resultSet_service_change.getResults(0, 1);

    console.log('serviceResult_service_change ' + serviceResult_service_change);

    if (isNullorEmpty(serviceResult_service_change) && isNullorEmpty(commRegID)) {

        for (var i = 0; i < edit_class_elem.length; i++) {

            console.log(service_name_elem[i].getAttribute('data-serviceid'));

            var freqArray = [];
            var sale_type = comm_type_class_elem[i].value;


            if (monday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 1;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }

            }

            if (tuesday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 2;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }
            if (wednesday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 3;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }
            if (thursday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 4;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }
            if (friday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 5;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }
            if (adhoc_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 6;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }

            var row_service_change_id = edit_class_elem[i].getAttribute('data-servicechangeid');
            var row_service_id = service_name_elem[i].getAttribute('data-serviceid');
            var user_id = created_by_class_elem[i].getAttribute('data-userid');

            // alert(row_service_id);
            // alert(row_service_change_id);

            if (isNullorEmpty(row_service_id)) {

                if (isNullorEmpty(commRegID)) {
                    commRegID = createCommReg(customer, dateEffective, partner, state, nlapiGetFieldValue('custpage_sendemail'), customer_status);
                }

                console.log('inside create of Service Change record for new service');

                var new_service_record = nlapiCreateRecord('customrecord_service', {
                    recordmode: 'dynamic'
                });

                var servicetype_id = service_name_elem[i].getAttribute('data-servicetypeid');
                var servicetype_text = service_name_elem[i].value;
                var new_service_price = new_service_price_class_elem[i].value;
                var new_service_descp = service_descp_class_elem[i].value;
                var created_by = created_by_class_elem[i].value;

                new_service_record.setFieldValue('custrecord_service', servicetype_id);
                new_service_record.setFieldValue('name', servicetype_text);
                new_service_record.setFieldValue('custrecord_service_price', new_service_price);
                new_service_record.setFieldValue('custrecord_service_customer', customer);
                new_service_record.setFieldValue('custrecord_service_description', new_service_descp);
                if (!isNullorEmpty(commRegID)) {
                    new_service_record.setFieldValue('custrecord_service_comm_reg', commRegID);

                }
                if (monday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_mon', 'T');

                }

                if (tuesday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_tue', 'T');

                }
                if (wednesday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_wed', 'T');

                }
                if (thursday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_thu', 'T');

                }
                if (friday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_fri', 'T');
                }
                if (adhoc_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_adhoc', 'T');

                }

                var new_service_id = nlapiSubmitRecord(new_service_record);

                if (!isNullorEmpty(new_service_id)) {
                    var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');
                    new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', dateEffective);
                    new_service_change_record.setFieldValue('custrecord_servicechg_service', new_service_id);
                    if (nlapiGetFieldValue('custpage_sendemail') == 'T') {
                        new_service_change_record.setFieldValue('custrecord_servicechg_status', 4);
                    } else {
                        new_service_change_record.setFieldValue('custrecord_servicechg_status', 1);
                    }

                    new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', partner);

                    new_service_change_record.setFieldValue('custrecord_servicechg_new_price', new_service_price);

                    new_service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);

                    new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);
                    if (role != 1000) {
                        new_service_change_record.setFieldValue('custrecord_servicechg_created', user_id);
                    }
                    new_service_change_record.setFieldValue('custrecord_servicechg_type', comm_type_class_elem[i].value);
                    new_service_change_record.setFieldValue('custrecord_default_servicechg_record', 1);
                    nlapiSubmitRecord(new_service_change_record);

                    nlapiSubmitField('customrecord_service', new_service_id, 'isinactive', 'T');
                }

            } else if (!isNullorEmpty(row_service_change_id)) {

                var service_change_record = nlapiLoadRecord('customrecord_servicechg', row_service_change_id);
                var service_change_new_price = service_change_record.getFieldValue('custrecord_servicechg_new_price');
                var service_change_old_freq = service_change_record.getFieldValues('custrecord_servicechg_old_freq');
                var service_change_new_freq = service_change_record.getFieldValues('custrecord_servicechg_new_freq');
                var service_change_date_effective = service_change_record.getFieldValues('custrecord_servicechg_new_freq');
                var service_change_comm_reg = service_change_record.getFieldValues('custrecord_servicechg_comm_reg');

                if ((!isNullorEmpty(new_service_price_class_elem[i].value) && old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) || (isNullorEmpty(service_change_old_freq) && !arraysEqual(service_change_new_freq, freqArray)) || (!isNullorEmpty(service_change_old_freq) && !arraysEqual(service_change_old_freq, freqArray)) || (service_change_date_effective != dateEffective)) {

                    console.log('inside update of Service Change record');

                    if (isNullorEmpty(commRegID)) {
                        commRegID = loadCommReg(service_change_comm_reg, dateEffective);
                    }

                    var service_id = service_name_elem[i].getAttribute('data-serviceid');

                    if (!isNullorEmpty(service_id)) {
                        service_change_record.setFieldValue('custrecord_servicechg_date_effective', dateEffective);

                        if (old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) {
                            service_change_record.setFieldValue('custrecord_servicechg_new_price', new_service_price_class_elem[i].value);
                        } else {
                            service_change_record.setFieldValue('custrecord_servicechg_old_price', old_service_price_class_elem[i].value);

                        }

                        if (isNullorEmpty(service_change_old_freq)) {
                            if (service_change_new_freq != freqArray) {
                                service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);
                            } else {
                                service_change_record.setFieldValues('custrecord_servicechg_old_freq', service_change_new_freq);
                            }
                        } else {
                            if (service_change_old_freq != freqArray) {
                                service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);
                            } else {
                                service_change_record.setFieldValues('custrecord_servicechg_old_freq', service_change_old_freq);
                            }
                        }
                        service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);
                        if (role != 1000) {
                            new_service_change_record.setFieldValue('custrecord_servicechg_created', user_id);
                        }

                    }
                    nlapiSubmitRecord(service_change_record);
                }

            } else if (isNullorEmpty(row_service_change_id) && !isNullorEmpty(row_service_id)) {
                var service_record = nlapiLoadRecord('customrecord_service', row_service_id);

                var current_price = service_record.getFieldValue('custrecord_service_price');
                var current_freq_mon = service_record.getFieldValue('custrecord_service_day_mon');
                var current_freq_tue = service_record.getFieldValue('custrecord_service_day_tue');
                var current_freq_wed = service_record.getFieldValue('custrecord_service_day_wed');
                var current_freq_thu = service_record.getFieldValue('custrecord_service_day_thu');
                var current_freq_fri = service_record.getFieldValue('custrecord_service_day_fri');
                var current_freq_adhoc = service_record.getFieldValue('custrecord_service_day_adhoc');

                var current_freq_array = [];

                if (current_freq_mon == 'T') {
                    current_freq_array[current_freq_array.length] = 1;
                }
                if (current_freq_tue == 'T') {
                    current_freq_array[current_freq_array.length] = 2;
                }
                if (current_freq_wed == 'T') {
                    current_freq_array[current_freq_array.length] = 3;
                }
                if (current_freq_thu == 'T') {
                    current_freq_array[current_freq_array.length] = 4;
                }
                if (current_freq_fri == 'T') {
                    current_freq_array[current_freq_array.length] = 5;
                }
                if (current_freq_adhoc == 'T') {
                    current_freq_array[current_freq_array.length] = 6;
                }


                if ((!isNullorEmpty(new_service_price_class_elem[i].value) && old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) || (!arraysEqual(current_freq_array, freqArray))) {

                    console.log('inside create new Service Change record for existing Service');
                    if (isNullorEmpty(commRegID)) {
                        commRegID = createCommReg(customer, dateEffective, partner, state, nlapiGetFieldValue('custpage_sendemail'), customer_status);
                    }
                    var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');

                    var service_id = service_name_elem[i].getAttribute('data-serviceid');

                    if (!isNullorEmpty(service_id)) {
                        new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', dateEffective);
                        new_service_change_record.setFieldValue('custrecord_servicechg_service', service_id);
                        if (nlapiGetFieldValue('custpage_sendemail') == 'T') {
                            new_service_change_record.setFieldValue('custrecord_servicechg_status', 4);
                        } else {
                            new_service_change_record.setFieldValue('custrecord_servicechg_status', 1);
                        }

                        new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', partner);

                        if (old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) {
                            new_service_change_record.setFieldValue('custrecord_servicechg_new_price', new_service_price_class_elem[i].value);
                        }


                        if (!arraysEqual(current_freq_array, freqArray)) {

                            new_service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);
                        }
                        new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);
                        if (role != 1000) {
                            new_service_change_record.setFieldValue('custrecord_servicechg_created', user_id);
                        }

                        //COE - Service imported from old customer and not edited - Link the commReg to the service
                        if ($('#commencementtype option:selected').val() == 6) {
                            var service_record = nlapiLoadRecord('customrecord_service', service_id);
                            service_record.setFieldValue('custrecord_service_comm_reg', commRegID);
                            nlapiSubmitRecord(service_record);

                            new_service_change_record.setFieldValue('custrecord_default_servicechg_record', 1);
                        }
                    }
                    new_service_change_record.setFieldValue('custrecord_servicechg_type', comm_type_class_elem[i].value);
                    nlapiSubmitRecord(new_service_change_record);
                } else if ($('#commencementtype option:selected').val() == 6) { //COE - Service imported from old customer and not edited
                    console.log('inside create new Service Change record for existing Service - COE not edited');
                    if (isNullorEmpty(commRegID)) {
                        commRegID = createCommReg(customer, dateEffective, partner, state, nlapiGetFieldValue('custpage_sendemail'), customer_status);
                    }
                    var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');

                    var service_id = service_name_elem[i].getAttribute('data-serviceid');

                    if (!isNullorEmpty(service_id)) {
                        new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', dateEffective);
                        new_service_change_record.setFieldValue('custrecord_servicechg_service', service_id);
                        new_service_change_record.setFieldValue('custrecord_servicechg_status', 2); //status is active
                        new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', partner);
                        new_service_change_record.setFieldValue('custrecord_servicechg_new_price', old_service_price_class_elem[i].value); //price remain the same                  
                        new_service_change_record.setFieldValues('custrecord_servicechg_new_freq', current_freq_array); //frequency remain the same
                        new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);
                        if (role != 1000) {
                            new_service_change_record.setFieldValue('custrecord_servicechg_created', ctx.getUser());
                        }

                        var service_record = nlapiLoadRecord('customrecord_service', service_id);
                        service_record.setFieldValue('custrecord_service_comm_reg', commRegID);
                        nlapiSubmitRecord(service_record);

                    }
                    new_service_change_record.setFieldValue('custrecord_servicechg_type', 'Change of Entity');
                    new_service_change_record.setFieldValue('custrecord_default_servicechg_record', 1);
                    nlapiSubmitRecord(new_service_change_record);

                }
            }
        }
        console.log(monthly_service_rate);
        nlapiSetFieldValue('custpage_customer_comm_reg', commRegID);
        recCustomer.setFieldValue('custentity_cust_monthly_service_value', parseFloat(monthly_service_rate * 4.25));
        recCustomer.setFieldValue('custentity_monthly_extra_service_revenue', parseFloat(monthly_extra_service_rate * 4.25));
        nlapiSubmitRecord(recCustomer);

        return true;
    } else if (!isNullorEmpty(serviceResult_service_change) && !isNullorEmpty(commRegID)) {

        console.log('2nd IF');
        // if (isNullorEmpty(service_change_delete) && isNullorEmpty(comm_reg_delete)) {
        //  alert('There has already been a scheduled change');
        //  return false;
        // } else {
        console.log(service_change_delete);
        console.log(comm_reg_delete);
        var service_change_delete_string = service_change_delete.join();
        var comm_reg_delete_string = comm_reg_delete.join();

        nlapiSetFieldValue('custpage_service_change_delete', service_change_delete_string);
        nlapiSetFieldValue('custpage_comm_reg_delete', comm_reg_delete_string);

        return true;
        // }
    } else if (isNullorEmpty(serviceResult_service_change) && !isNullorEmpty(commRegID)) {

        console.log('3rd IF');
        var searched_service_change = nlapiLoadSearch('customrecord_servicechg', 'customsearch_smc_service_chg');

        var newFilters = new Array();
        if (!isNullorEmpty(commRegID)) {
            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_servicechg_comm_reg', null, 'anyof', commRegID);
        }
        newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_customer', 'CUSTRECORD_SERVICECHG_SERVICE', 'is', customer);


        searched_service_change.addFilters(newFilters);

        var resultSet_service_change = searched_service_change.runSearch();

        var serviceResult_service_change = resultSet_service_change.getResults(0, 1);

        console.log(serviceResult_service_change)

        // if (!isNullorEmpty(serviceResult_service_change) && !isNullorEmpty(commRegID)) {
        for (var i = 0; i < edit_class_elem.length; i++) {

            console.log(service_name_elem[i].getAttribute('data-serviceid'));

            var freqArray = [];
            var sale_type = comm_type_class_elem[i].value;

            if (monday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 1;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }
            if (tuesday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 2;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }
            if (wednesday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 3;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }
            if (thursday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 4;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }
            if (friday_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 5;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }
            if (adhoc_class_elem[i].checked == true) {
                freqArray[freqArray.length] = 6;
                monthly_service_rate = parseFloat(monthly_service_rate + parseFloat(new_service_price_class_elem[i].value));
                if (sale_type == 'Extra Service' || sale_type == 'Increase of Frequency') {
                    monthly_extra_service_rate = parseFloat(monthly_extra_service_rate + parseFloat(new_service_price_class_elem[i].value));
                }
            }

            var row_service_change_id = edit_class_elem[i].getAttribute('data-servicechangeid');
            var row_service_id = service_name_elem[i].getAttribute('data-serviceid');
            var user_id = created_by_class_elem[i].getAttribute('data-userid');

            // alert(row_service_id);
            // alert(row_service_change_id);

            if (isNullorEmpty(row_service_id)) {

                if (isNullorEmpty(commRegID)) {
                    commRegID = createCommReg(customer, dateEffective, partner, state, nlapiGetFieldValue('custpage_sendemail'), customer_status);
                } else {
                    loadCommReg(commRegID, dateEffective);
                }

                console.log('inside create of Service Change record for new service');

                var new_service_record = nlapiCreateRecord('customrecord_service', {
                    recordmode: 'dynamic'
                });

                var servicetype_id = service_name_elem[i].getAttribute('data-servicetypeid');
                var servicetype_text = service_name_elem[i].value;
                var new_service_price = new_service_price_class_elem[i].value;
                var new_service_descp = service_descp_class_elem[i].value;
                var created_by = created_by_class_elem[i].value;

                new_service_record.setFieldValue('custrecord_service', servicetype_id);
                new_service_record.setFieldValue('name', servicetype_text);
                new_service_record.setFieldValue('custrecord_service_price', new_service_price);
                new_service_record.setFieldValue('custrecord_service_customer', customer);
                new_service_record.setFieldValue('custrecord_service_description', new_service_descp);
                if (!isNullorEmpty(commRegID)) {
                    new_service_record.setFieldValue('custrecord_service_comm_reg', commRegID);

                }
                if (monday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_mon', 'T');
                }

                if (tuesday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_tue', 'T');
                }
                if (wednesday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_wed', 'T');

                }
                if (thursday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_thu', 'T');

                }
                if (friday_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_fri', 'T');

                }
                if (adhoc_class_elem[i].checked == true) {
                    new_service_record.setFieldValue('custrecord_service_day_adhoc', 'T');

                }

                var new_service_id = nlapiSubmitRecord(new_service_record);

                if (!isNullorEmpty(new_service_id)) {
                    var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');
                    new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', dateEffective);
                    new_service_change_record.setFieldValue('custrecord_servicechg_service', new_service_id);
                    if (nlapiGetFieldValue('custpage_sendemail') == 'T') {
                        new_service_change_record.setFieldValue('custrecord_servicechg_status', 4);
                    } else {
                        new_service_change_record.setFieldValue('custrecord_servicechg_status', 1);
                    }

                    new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', partner);

                    new_service_change_record.setFieldValue('custrecord_servicechg_new_price', new_service_price);

                    new_service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);

                    new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);
                    if (role != 1000) {
                        new_service_change_record.setFieldValue('custrecord_servicechg_created', user_id);
                    }
                    new_service_change_record.setFieldValue('custrecord_servicechg_type', comm_type_class_elem[i].value);
                    new_service_change_record.setFieldValue('custrecord_default_servicechg_record', 1);
                    nlapiSubmitRecord(new_service_change_record);

                    nlapiSubmitField('customrecord_service', new_service_id, 'isinactive', 'T');
                }

            } else if (!isNullorEmpty(row_service_change_id)) {

                var service_change_record = nlapiLoadRecord('customrecord_servicechg', row_service_change_id);
                var service_change_new_price = service_change_record.getFieldValue('custrecord_servicechg_new_price');
                var service_change_old_freq = service_change_record.getFieldValues('custrecord_servicechg_old_freq');
                var service_change_new_freq = service_change_record.getFieldValues('custrecord_servicechg_new_freq');
                var service_change_date_effective = service_change_record.getFieldValues('custrecord_servicechg_new_freq');
                var service_change_comm_reg = service_change_record.getFieldValues('custrecord_servicechg_comm_reg');

                if ((!isNullorEmpty(new_service_price_class_elem[i].value) && old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) || (isNullorEmpty(service_change_old_freq) && !arraysEqual(service_change_new_freq, freqArray)) || (!isNullorEmpty(service_change_old_freq) && !arraysEqual(service_change_old_freq, freqArray)) || (service_change_date_effective != dateEffective)) {

                    console.log('inside update of Service Change record');

                    if (isNullorEmpty(commRegID)) {
                        commRegID = loadCommReg(service_change_comm_reg, dateEffective);
                    }

                    var service_id = service_name_elem[i].getAttribute('data-serviceid');

                    if (!isNullorEmpty(service_id)) {
                        console.log(dateEffective)
                        service_change_record.setFieldValue('custrecord_servicechg_date_effective', dateEffective);

                        if (old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) {
                            console.log(new_service_price_class_elem[i].value)
                            service_change_record.setFieldValue('custrecord_servicechg_new_price', new_service_price_class_elem[i].value);
                        } else {
                            console.log(old_service_price_class_elem[i].value)
                            service_change_record.setFieldValue('custrecord_servicechg_old_price', old_service_price_class_elem[i].value);

                        }

                        if (isNullorEmpty(service_change_old_freq)) {
                            if (service_change_new_freq != freqArray) {
                                console.log(freqArray)
                                service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);
                            } else {
                                console.log(service_change_new_freq)
                                service_change_record.setFieldValues('custrecord_servicechg_old_freq', service_change_new_freq);
                            }
                        } else {
                            if (service_change_old_freq != freqArray) {
                                console.log(freqArray)
                                service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);
                            } else {
                                console.log(service_change_old_freq)
                                service_change_record.setFieldValues('custrecord_servicechg_old_freq', service_change_old_freq);
                            }
                        }
                        console.log(commRegID)
                        service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);
                        if (role != 1000) {
                            console.log(user_id)
                            service_change_record.setFieldValue('custrecord_servicechg_created', user_id);
                        }

                    }
                    console.log('submit')
                    nlapiSubmitRecord(service_change_record);
                }

            } else if (isNullorEmpty(row_service_change_id) && !isNullorEmpty(row_service_id)) {
                var service_record = nlapiLoadRecord('customrecord_service', row_service_id);

                var current_price = service_record.getFieldValue('custrecord_service_price');
                var current_freq_mon = service_record.getFieldValue('custrecord_service_day_mon');
                var current_freq_tue = service_record.getFieldValue('custrecord_service_day_tue');
                var current_freq_wed = service_record.getFieldValue('custrecord_service_day_wed');
                var current_freq_thu = service_record.getFieldValue('custrecord_service_day_thu');
                var current_freq_fri = service_record.getFieldValue('custrecord_service_day_fri');
                var current_freq_adhoc = service_record.getFieldValue('custrecord_service_day_adhoc');

                var current_freq_array = [];

                if (current_freq_mon == 'T') {
                    current_freq_array[current_freq_array.length] = 1;
                }
                if (current_freq_tue == 'T') {
                    current_freq_array[current_freq_array.length] = 2;
                }
                if (current_freq_wed == 'T') {
                    current_freq_array[current_freq_array.length] = 3;
                }
                if (current_freq_thu == 'T') {
                    current_freq_array[current_freq_array.length] = 4;
                }
                if (current_freq_fri == 'T') {
                    current_freq_array[current_freq_array.length] = 5;
                }
                if (current_freq_adhoc == 'T') {
                    current_freq_array[current_freq_array.length] = 6;
                }


                if ((!isNullorEmpty(new_service_price_class_elem[i].value) && old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) || (!arraysEqual(current_freq_array, freqArray))) {

                    console.log('inside create new Service Change record for existing Service');
                    if (isNullorEmpty(commRegID)) {
                        commRegID = createCommReg(customer, dateEffective, partner, state, nlapiGetFieldValue('custpage_sendemail'), customer_status);
                    }
                    var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');

                    var service_id = service_name_elem[i].getAttribute('data-serviceid');

                    if (!isNullorEmpty(service_id)) {
                        new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', dateEffective);
                        new_service_change_record.setFieldValue('custrecord_servicechg_service', service_id);
                        if (nlapiGetFieldValue('custpage_sendemail') == 'T') {
                            new_service_change_record.setFieldValue('custrecord_servicechg_status', 4);

                        } else {
                            new_service_change_record.setFieldValue('custrecord_servicechg_status', 1);
                        }

                        new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', partner);

                        if (old_service_price_class_elem[i].value != new_service_price_class_elem[i].value) {
                            new_service_change_record.setFieldValue('custrecord_servicechg_new_price', new_service_price_class_elem[i].value);
                        }


                        if (!arraysEqual(current_freq_array, freqArray)) {

                            new_service_change_record.setFieldValues('custrecord_servicechg_new_freq', freqArray);
                        }
                        new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);
                        if (role != 1000) {
                            new_service_change_record.setFieldValue('custrecord_servicechg_created', user_id);
                        }

                    }
                    new_service_change_record.setFieldValue('custrecord_servicechg_type', comm_type_class_elem[i].value);

                    //COE - Service imported from old customer and edited
                    if ($('#commencementtype option:selected').val() == 6) {
                        new_service_change_record.setFieldValue('custrecord_default_servicechg_record', 1);
                    }
                    nlapiSubmitRecord(new_service_change_record);
                } else if ($('#commencementtype option:selected').val() == 6) { //COE - Service imported from old customer and not edited
                    console.log('inside create new Service Change record for existing Service - COE not edited');
                    if (isNullorEmpty(commRegID)) {
                        commRegID = createCommReg(customer, dateEffective, partner, state, nlapiGetFieldValue('custpage_sendemail'), customer_status);
                    }
                    var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');

                    var service_id = service_name_elem[i].getAttribute('data-serviceid');

                    if (!isNullorEmpty(service_id)) {
                        new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', dateEffective);
                        new_service_change_record.setFieldValue('custrecord_servicechg_service', service_id);
                        new_service_change_record.setFieldValue('custrecord_servicechg_status', 2); //status is active
                        new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', partner);
                        new_service_change_record.setFieldValue('custrecord_servicechg_new_price', old_service_price_class_elem[i].value); //price remain the same                  
                        new_service_change_record.setFieldValues('custrecord_servicechg_new_freq', current_freq_array); //frequency remain the same
                        new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);
                        if (role != 1000) {
                            new_service_change_record.setFieldValue('custrecord_servicechg_created', ctx.getUser());
                        }

                    }
                    new_service_change_record.setFieldValue('custrecord_servicechg_type', 'Change of Entity');
                    new_service_change_record.setFieldValue('custrecord_default_servicechg_record', 1);
                    nlapiSubmitRecord(new_service_change_record);

                }
            }
        }
        console.log('2nd ' + monthly_service_rate);
        nlapiSetFieldValue('custpage_customer_comm_reg', commRegID);
        var service_change_delete_string = service_change_delete.join();
        var comm_reg_delete_string = comm_reg_delete.join();

        nlapiSetFieldValue('custpage_service_change_delete', service_change_delete_string);
        nlapiSetFieldValue('custpage_comm_reg_delete', comm_reg_delete_string);

        console.log(monthly_service_rate);

        recCustomer.setFieldValue('custentity_cust_monthly_service_value', parseFloat(monthly_service_rate * 4.25));
        recCustomer.setFieldValue('custentity_monthly_extra_service_revenue', parseFloat(monthly_extra_service_rate * 4.25));
        nlapiSubmitRecord(recCustomer);


        return true;
        // } else {
        //  //Delete Comm Reg
        // }

    } else if (!isNullorEmpty(serviceResult_service_change) && isNullorEmpty(commRegID)) {

        console.log('4th IF');
        alert('There has already been a scheduled change');
        return false;
    }


}


/**
 * [description] - On click of the delete button
 */
$(document).on('click', '.remove_class', function(event) {

    var service_change_id = $(this).attr('data-servicechangeid');

    if (!isNullorEmpty(service_change_id)) {
        var service_change_record = nlapiLoadRecord('customrecord_servicechg', service_change_id);

        var date_email = service_change_record.getFieldValue('custrecord_servicechg_date_emailed');
    } else {
        var date_email = null;
    }


    if (isNullorEmpty(date_email)) {
        if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

            var service_change_id = $(this).attr('data-servicechangeid');

            var commRegId = nlapiGetFieldValue('custpage_customer_comm_reg');

            if (!isNullorEmpty(service_change_id)) {
                service_change_delete[service_change_delete.length] = service_change_id;

                console.log(service_change_delete)
                    // nlapiDeleteRecord('customrecord_servicechg', service_change_id);

                $(this).closest("tr").hide();
            } else {
                $(this).closest("tr").hide();
            }

        }
    } else {
        alert('Notification of Price Increase Email already sent out to Customer.\n\n Please contact Head Office');
        return false;
    }
});

$(document).on('click', '#clear', function(event) {
    reset_all();
});

function onclick_back() {
    var params = {
        custid: nlapiGetFieldValue('custpage_customer_id'),
        sales_record_id: nlapiGetFieldValue('custpage_salesrecordid')

    }
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('SUITELET', nlapiGetFieldValue('custpage_scriptid'), nlapiGetFieldValue('custpage_deployid')) + '&unlayered=T&custparam_params=' + params;
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

/*
    [Description] : USers need to Fill in 
    Commencement Date
    Sign Up Date
    Sales Rep
    Inbound/Outbound (custrecord_in_out)
    
 */

function createCommReg(customer, dateEffective, zee, state, sendemail, customer_status) {
    customer_comm_reg = nlapiCreateRecord('customrecord_commencement_register');
    customer_comm_reg.setFieldValue('custrecord_date_entry', getDate());
    customer_comm_reg.setFieldValue('custrecord_comm_date', dateEffective);
    customer_comm_reg.setFieldValue('custrecord_comm_date_signup', dateEffective);
    customer_comm_reg.setFieldValue('custrecord_customer', customer);
    if (sendemail == 'T') {
        customer_comm_reg.setFieldValue('custrecord_salesrep', nlapiGetUser());
    } else {
        customer_comm_reg.setFieldValue('custrecord_salesrep', 109783);
    }
    //Franchisee
    customer_comm_reg.setFieldValue('custrecord_std_equiv', 1);
    if (role != 1000) {
        customer_comm_reg.setFieldValue('custrecord_franchisee', zee);
    }

    customer_comm_reg.setFieldValue('custrecord_wkly_svcs', '5');
    customer_comm_reg.setFieldValue('custrecord_in_out', 2); // Inbound
    //Scheduled
    customer_comm_reg.setFieldValue('custrecord_state', state);
    if (sendemail == 'T') {
        customer_comm_reg.setFieldValue('custrecord_trial_status', 10);
        if (!isNullorEmpty(nlapiGetFieldValue('custpage_salesrecordid'))) {
            customer_comm_reg.setFieldValue('custrecord_commreg_sales_record', parseInt(nlapiGetFieldValue('custpage_salesrecordid')));
        }

    } else {
        customer_comm_reg.setFieldValue('custrecord_trial_status', 9);
    }; // Price Increase
    if (customer_status != 13) {
        customer_comm_reg.setFieldValue('custrecord_sale_type', $('#commencementtype option:selected').val())
    } else {
        customer_comm_reg.setFieldValue('custrecord_sale_type', $('#commencementtype option:selected').val())
    }

    var commRegID = nlapiSubmitRecord(customer_comm_reg);

    return commRegID;
}

function loadCommReg(id, dateEffective) {
    customer_comm_reg = nlapiLoadRecord('customrecord_commencement_register', id);
    customer_comm_reg.setFieldValue('custrecord_date_entry', getDate());
    customer_comm_reg.setFieldValue('custrecord_comm_date', dateEffective);
    customer_comm_reg.setFieldValue('custrecord_sale_type', $('#commencementtype option:selected').val())
        // customer_comm_reg.setFieldValue('custrecord_comm_date_signup', dateEffective);
    var commRegID = nlapiSubmitRecord(customer_comm_reg);

    return commRegID;
}
/**
 * [getDate description] - Get the current date
 * @return {[String]} [description] - return the string date
 */
function getDate() {
    var date = new Date();
    // if (date.getHours() > 6)
    // {
    //     date = nlapiAddDays(date, 1);
    // }
    date = nlapiDateToString(date);

    return date;
}

$(document).on('change', '#commencementtype', function(event) {
    if ($('#commencementtype option:selected').val() == 6) {
        $('.get_services_section').removeClass('hide');
    }
});

function onclick_GetServices(customer_id, old_customer_id, commRegID) {
    var servicesSearch = nlapiLoadSearch('customrecord_service', 'customsearch_move_digit_services');
    var filterExpression = [
        ["custrecord_service_customer", "is", old_customer_id],
        "AND", ["isinactive", "is", 'F'],
    ];
    console.log('old_customer_id', old_customer_id);
    servicesSearch.setFilterExpression(filterExpression);
    var servicesResult = servicesSearch.runSearch();

    var old_package;
    var service_count = 0;

    servicesResult.forEachResult(function(serviceResult) {
        var package = serviceResult.getValue('custrecord_service_package');
        var service = serviceResult.getValue("internalid");

        if (service_count == 0) {
            if (!isNullorEmpty(package)) {
                console.log('package', package);
                var package_record = nlapiLoadRecord('customrecord_service_package', package);
                package_record.setFieldValue('custrecord_service_package_customer', customer_id);
                package_record.setFieldValue('custrecord_service_package_comm_reg', commRegID);
                nlapiSubmitRecord(package_record);
            }
        } else if (!isNullorEmpty(package) && old_package != package) {
            console.log('package', package);
            var package_record = nlapiLoadRecord('customrecord_service_package', package);
            package_record.setFieldValue('custrecord_service_package_customer', customer_id);
            package_record.setFieldValue('custrecord_service_package_comm_reg', commRegID);
            nlapiSubmitRecord(package_record);
        }
        console.log('service', service);
        var service_record = nlapiLoadRecord('customrecord_service', service);
        service_record.setFieldValue('custrecord_service_customer', customer_id);
        service_record.setFieldValue('custrecord_service_package', package);
        service_record.setFieldValue('custrecord_service_comm_reg', commRegID);
        nlapiSubmitRecord(service_record);

        service_count++;
        return true;
    })
    window.location.reload();
}