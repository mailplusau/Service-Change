/**
 * Module Description
 * 
 * NSVersion    Date            		Author         
 * 1.00       	2018-05-14 09:34:51   		Ankith 
 *
 * Remarks:         
 * 
 * @Last Modified by:   mailplusar
 * @Last Modified time: 2019-05-07 10:24:42
 *
 */
var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();


if (role == 1000) {
	//Franchisee
	zee = ctx.getUser();
} else if (role == 3) { //Administrator
	zee = 6; //test
} else if (role == 1032) { // System Support
	zee = 425904; //test-AR
}

$(window).load(function() {
	// Animate loader off screen
	$(".se-pre-con").fadeOut("slow");;
});

var service_deleted = [];

function pageInit() {

	$('#alert').hide();
	var main_table = document.getElementsByClassName("uir-outside-fields-table");

	for (var i = 0; i < main_table.length; i++) {
		main_table[i].style.width = "100%";
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

/**
 * [description] - On click of the delete button
 */
$(document).on('click', '.remove_class', function(event) {

	if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

		var service_change_id = $(this).attr('data-servicechangeid');
		var service_id = $(this).attr('data-serviceid');

		service_deleted[service_deleted.length] = service_id;

		$(this).removeClass('glyphicon-trash');
		$(this).removeClass('btn-danger');


		$(this).addClass('btn-success');
		$(this).addClass('glyphicon-ok');
		$(this).addClass('unremove_class');

		$(this).removeClass('remove_class');

	}
});

/**
 * [description] - On click of the delete button
 */
$(document).on('click', '.unremove_class', function(event) {



	var service_change_id = $(this).attr('data-servicechangeid');
	var service_id = $(this).attr('data-serviceid');

	var index = service_deleted.indexOf(service_id);
	if (index !== -1) {
		service_deleted.splice(index, 1);
	}

	service_deleted[service_deleted.length] = service_id;

	$(this).removeClass('glyphicon-ok');
	$(this).removeClass('btn-success');


	$(this).addClass('btn-danger');
	$(this).addClass('glyphicon-trash');
	$(this).addClass('remove_class');

	$(this).removeClass('unremove_class');


});



function saveRecord() {
	var customer_id = parseInt(nlapiGetFieldValue('custpage_customer_id'));
	// var service_id = parseInt(nlapiGetFieldValue('custpage_service_id'));
	var partner = parseInt(nlapiGetFieldValue('custpage_customer_franchisee'));

	var partner_record = nlapiLoadRecord('partner', partner);
	var state = partner_record.getFieldValue('location');

	var commRegID = null;

	var cancellation_date = $('#cancel_date').val();
	var cancellation_reason = $('#cancel_reason option:selected').val();
	var cancellation_comp = $('#cancel_comp option:selected').val();
	var cancellation_notice = $('#cancel_notice option:selected').val();

	if (isNullorEmpty(cancellation_date)) {
		showAlert('Please Enter the Cancellation Date');
		return false;
	} else {
		var resultDate = dateEffectiveCheck(cancellation_date);

		if (resultDate == false) {
			alert('Entered Date Effective should be greater than today');
			return false;
		}
		var splitDate = cancellation_date.split('-');
		cancellation_date = splitDate[2] + '/' + splitDate[1] + '/' + splitDate[0];
	}

	if (isNullorEmpty(cancellation_reason)) {
		showAlert('Please Enter the Cancellation Reason');
		return false;
	}

	if (isNullorEmpty(cancellation_notice)) {
		showAlert('Please Enter the Cancellation Notice');
		return false;
	}

	if (!isNullorEmpty(service_deleted)) {

		for (var x = 0; x < service_deleted.length; x++) {
			if (isNullorEmpty(commRegID)) {
				commRegID = createCommReg(customer_id, cancellation_date, partner, state, cancellation_reason, cancellation_notice, cancellation_comp);
			}
			var new_service_change_record = nlapiCreateRecord('customrecord_servicechg');
			new_service_change_record.setFieldValue('custrecord_servicechg_date_effective', cancellation_date);
			new_service_change_record.setFieldValue('custrecord_servicechg_cancellation_date', cancellation_date);
			new_service_change_record.setFieldValue('custrecord_servicechg_cancellation_reas', cancellation_reason);
			new_service_change_record.setFieldValue('custrecord_servicechg_cancellation_not', cancellation_notice);
			new_service_change_record.setFieldValue('custrecord_servicechg_cancellation_comp', cancellation_comp);
			new_service_change_record.setFieldValue('custrecord_servicechg_service', service_deleted[x]);

			new_service_change_record.setFieldValue('custrecord_servicechg_status', 1);
			new_service_change_record.setFieldValue('custrecord_servicechg_old_zee', partner);
			new_service_change_record.setFieldValue('custrecord_servicechg_old_price', $('#service_price').val());

			new_service_change_record.setFieldValue('custrecord_servicechg_comm_reg', commRegID);
			new_service_change_record.setFieldValue('custrecord_servicechg_created', 109783);
			new_service_change_record.setFieldValue('custrecord_servicechg_type', 'Service Cancellation');

			nlapiSubmitRecord(new_service_change_record);
		}

	}

	return true;
}

function createCommReg(customer, dateEffective, zee, state, can_reason, can_notice, can_comp) {
	customer_comm_reg = nlapiCreateRecord('customrecord_commencement_register');
	customer_comm_reg.setFieldValue('custrecord_date_entry', getDate());
	customer_comm_reg.setFieldValue('custrecord_comm_date', dateEffective);
	customer_comm_reg.setFieldValue('custrecord_comm_date_signup', dateEffective);
	customer_comm_reg.setFieldValue('custrecord_customer', customer);

	customer_comm_reg.setFieldValue('custrecord_salesrep', 109783);

	//Franchisee
	customer_comm_reg.setFieldValue('custrecord_std_equiv', 1);
	customer_comm_reg.setFieldValue('custrecord_franchisee', zee);
	customer_comm_reg.setFieldValue('custrecord_wkly_svcs', '5');
	customer_comm_reg.setFieldValue('custrecord_in_out', 2); // Inbound
	//Scheduled
	customer_comm_reg.setFieldValue('custrecord_state', state);

	customer_comm_reg.setFieldValue('custrecord_trial_status', 9);
	// Price Increase
	customer_comm_reg.setFieldValue('custrecord_sale_type', 13)
	customer_comm_reg.setFieldValue('custrecord_commreg_cancel_notice', can_notice)
	customer_comm_reg.setFieldValue('custrecord_commreg_cancel_reason', can_reason)
	// customer_comm_reg.setFieldValue('custrecord_commreg_cancel_competitor', can_comp)

	var commRegID = nlapiSubmitRecord(customer_comm_reg);

	return commRegID;
}

function onclick_back() {
	var params = {
		custid: parseInt(nlapiGetFieldValue('custpage_customer_id'))
	}
	params = JSON.stringify(params);

	var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_service_change', 'customdeploy_sl_service_change') + '&custparam_params=' + params;
	window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
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