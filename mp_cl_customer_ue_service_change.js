/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2019-11-16 08:33:08         Ankith
 *
 * Description:         
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-01-09 15:49:26
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
    $('.send_to').selectator({
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
        alert('Please Enter the New Price');
        return false;
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


    var comm_typeid = $('#commencementtype option:selected').val();
    var send_to = $('#send_to').val();

    console.log(send_to);
    console.log($('#send_to').val());

    var firstName = $('#first_name').val();
    var lastName = $('#last_name').val();
    var email = $('#email').val();
    var phone = $('#phone').val();
    var position = $('#position').val();

    if (isNullorEmpty(firstName)) {
        alert('Please enter First Name of requester');
        return false;
    }

    if (isNullorEmpty(email)) {
        alert('Please enter email of requester');
        return false;
    }

    if (isNullorEmpty(phone)) {
        alert('Please enter phone of requester');
        return false;
    }

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

    if (isNullorEmpty(comm_typeid)) {
        alert('Please Select Sale Type');
        return false;
    }

    if (isNullorEmpty(send_to)) {
        alert('Please Select who needs to be Notified');
        return false;
    }

    var emailSubject = 'Service Change Notification - ' + recCustomer.getFieldValue('entityid') + ' ' + recCustomer.getFieldValue('companyname');
    var emailBody = 'Customer Name: ' + recCustomer.getFieldValue('entityid') + ' ' + recCustomer.getFieldValue('companyname');
    emailBody += '</br></br><u>Requester Details:</u>' + '</br>';
    emailBody += 'Name: ' + firstName + ' ' + lastName + '</br>';
    emailBody += 'Email: ' + email + '</br>';
    emailBody += 'Phone: ' + phone + '</br>';
    if (!isNullorEmpty(position)) {
        emailBody += 'Position: ' + position + '</br></br>';
    }

    emailBody += '</br></br><u>Service Change Details:</u></br>';
    emailBody += 'Date Effective: ' + dateEffective + '</br>';
    for (var i = 0; i < edit_class_elem.length; i++) {

        if (i > 0) {
            emailBody += '</br>';
        }

        var freqArray = [];

        var servicetype_text = service_name_elem[i].value;
        var old_service_price = old_service_price_class_elem[i].value;
        var new_service_price = new_service_price_class_elem[i].value;
        var new_service_descp = service_descp_class_elem[i].value;
        var comm_type = comm_type_class_elem[i].value;

        if (!isNullorEmpty(comm_type)) {

            emailBody += 'Service Name: ' + servicetype_text + '</br>';
            emailBody += 'Old Price: ' + old_service_price + '</br>';
            emailBody += 'New Price: ' + new_service_price + '</br>';
            emailBody += 'Change Type: ' + comm_type + '</br>';

            if (monday_class_elem[i].checked == true) {
                emailBody += 'Monday: YES</br>';
            }

            if (tuesday_class_elem[i].checked == true) {
                emailBody += 'Tuesday: YES</br>';
            }
            if (wednesday_class_elem[i].checked == true) {
                emailBody += 'Wednesday: YES</br>';
            }
            if (thursday_class_elem[i].checked == true) {
                emailBody += 'Thursday: YES</br>';
            }
            if (friday_class_elem[i].checked == true) {
                emailBody += 'Friday: YES</br>';
            }
            if (adhoc_class_elem[i].checked == true) {
                emailBody += 'Adhoc: YES</br>';
            }
        }


    }

    emailBody += '</br></br>Notes: </br>' + $('#note').val();


    var noteBody = emailBody.replace(new RegExp('</br>','g'), '\n');

    var userNoteRecord = nlapiCreateRecord('note');
    userNoteRecord.setFieldValue('title', 'Service Change Notification');
    userNoteRecord.setFieldValue('entity', parseInt(nlapiGetFieldValue('custpage_customer_id')));

    userNoteRecord.setFieldValue('direction', 1);
    userNoteRecord.setFieldValue('notetype', 7);
    userNoteRecord.setFieldValue('note', noteBody);
    userNoteRecord.setFieldValue('author', nlapiGetUser());
    userNoteRecord.setFieldValue('notedate', getDate());



    nlapiSubmitRecord(userNoteRecord);

    nlapiSendEmail(112209, send_to, emailSubject, emailBody, null);


    return true;

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