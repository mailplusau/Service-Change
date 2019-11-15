var baseURL = 'https://system.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

$(window).load(function() {
	// Animate loader off screen
	$(".se-pre-con").fadeOut("slow");;
});

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
	// $scope.showSelectValue = function(serviceSelected) {
	//   var result = getNSItem(serviceSelected);
	//    $(event.target).parent().parent().find('.nsItemName').val(result[1]);

	// }
});

function pageInit() {

	$('#alert').hide();

	$(function() {
		$('[data-toggle="tooltip"]').tooltip()
	})

	AddStyle('https://system.na2.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');
	$('.services_selected_class').selectator({
		keepOpen: true,
		showAllOptionsOnFocus: true,
		selectFirstOptionOnSearch: false
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

$(document).on('click', '.create_new', function(event) {

	var params = {
		custid: parseInt(nlapiGetFieldValue('custpage_customer_id')),
		customid: 'customscript_sl_service_change',
		customdeploy: 'customdeploy_sl_service_change'
	}
	params = JSON.stringify(params);
	var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_create_service_change', 'customdeploy_sl_create_service_change') + '&custparam_params=' + params;
	window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
});

$(document).on('click', '.cancel_service', function(event) {

	var service_id = $(this).attr('data-serviceid');

	var params = {
		custid: parseInt(nlapiGetFieldValue('custpage_customer_id'))
	}
	params = JSON.stringify(params);
	var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_cancel_service_change', 'customdeploy_sl_cancel_service_change') + '&custparam_params=' + params;
	window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
});

/**
 * [description] - On the click of the edit button
 */
$(document).on('click', '.edit_class', function(event) {

	var commregid = $(this).attr('data-commreg');
	var dateEffective = $(this).attr('data-dateeffective');


	var params = {
		custid: parseInt(nlapiGetFieldValue('custpage_customer_id')),
		salesrep: null,
		commreg: commregid,
		customid: 'customscript_sl_service_change',
		customdeploy: 'customdeploy_sl_service_change',
		date: dateEffective
	}
	params = JSON.stringify(params);
	var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_create_service_change', 'customdeploy_sl_create_service_change') + '&custparam_params=' + params;
	window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
});

/**
 * [description] - On click of the delete button
 */
$(document).on('click', '.remove_class', function(event) {

	if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

		$(this).closest('tr').find('.delete_service').val("T");
		$(this).closest("tr").hide();
	}



});

function onclick_back() {
	var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_servchg_customer_list', 'customdeploy_sl_servchg_customer_list');
	window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
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

function firstDayofMonth() {

	var date = new Date();

	var month = date.getMonth(); //Months 0 - 11
	var day = date.getDate();
	var year = date.getFullYear();

	var firstDay = new Date(year, (month), 1);
	// var lastDay = new Date(year, (month + 1), 0);

	return GetFormattedDate(nlapiDateToString(firstDay));
}