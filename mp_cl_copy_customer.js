var userName = "nnrNSdmAohfbhHXedDSyLxwA";
var passWord = "";

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {

});

var old_customer_id = null;
var new_customer_id = null;

// $(".nav-tabs").on("click", "a", function(e) {

// 	$(this).tab('show');
// });
$(window).load(function() {
	// Animate loader off screen
	$(".se-pre-con").fadeOut("slow");
});
$(document).on('click', '#alert .close', function(e) {
	$(this).parent().hide();
});

function showAlert(message) {
	$('#alert').html('<button type="button" class="close">&times;</button>' + message);
	$('#alert').show();
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0;
	// $(window).scrollTop($('#alert').offset().top);
}

$(document).on('click', '#alert .close', function(e) {
	$(this).parent().hide();
});

function pageInit() {
	old_customer_id = parseInt(nlapiGetFieldValue('custpage_customer'));
	$('#alert').hide();
}

function validate(status) {

	var callcenter = nlapiGetFieldValue('custpage_callcenter');

	var companyName = $('#company_name').val();
	var abn = $('#abn').val();
	var zee = $('#zee').val();
	var account_email = $('#account_email').val();
	var account_phone = $('#account_phone').val();
	var daytodayemail = $('#daytodayemail').val();
	var daytodayphone = $('#daytodayphone').val();
	var industry = $('#industry').val();

	// var survey1 = $('#survey1').val();
	// var survey2 = $('#survey2').val();
	// var survey3 = $('#survey3').val();


	var commencementtype = $('#commencementtype').val();
	var inoutbound = $('#inoutbound').val();
	var commencementdate = $('#commencementdate').val();
	var signupdate = $('#signupdate').val();

	var return_value = true;

	var alertMessage = ''

	if (isNullorEmpty(companyName)) {
		alertMessage += 'Please Enter the Company Name</br>';
		return_value = false;
	}


	if (isNullorEmpty(abn)) {
		alertMessage += 'Please Enter the ABN</br>';
		return_value = false;
	} else {
		var result = verify_abn(abn);
		if (result == false) {
			alertMessage += 'ABN entered is incorrect';
			return_value = false;
		}
	}

	if (isNullorEmpty(account_email) && isNullorEmpty(daytodayemail)) {
		alertMessage += 'Please Enter either Account Email or Day-To-Day Email</br>';
		return_value = false;
	}



	if (isNullorEmpty(industry)) {
		alertMessage += 'Please Select an Industry</br>';
		return_value = false;
	}
	// if (isNullorEmpty(survey1)) {
	// 	alertMessage += 'Please Answer Survey Information "Using AusPost for Mail & Parcel?" </br>';
	// 	return_value = false;
	// }
	// if (isNullorEmpty(survey2)) {
	// 	alertMessage += 'Please Answer Survey Information "Using AusPost Outlet?"</br>';
	// 	return_value = false;
	// }
	// if (isNullorEmpty(survey3)) {
	// 	alertMessage += 'Please Answer Survey Information "Is this Auspost outlet a LPO?"</br>';
	// 	return_value = false;
	// }

	if (isNullorEmpty(zee)) {
		alertMessage += 'Please select a Franchisee to which the customer Belongs</br>';
		return_value = false;
	}


	if (isNullorEmpty(account_phone) && isNullorEmpty(daytodayphone)) {
		alertMessage += 'Please Enter either Account Phone or Day-To-Day Phone</br>';
		return_value = false;
	} else {
		if (!isNullorEmpty(account_phone)) {
			var result = validatePhone(account_phone);
		}

		if (!isNullorEmpty(daytodayphone)) {
			var result = validatePhone(daytodayphone);
		}
	}

	if (return_value == false) {
		showAlert(alertMessage);

	}
	return return_value;
}

//On click of Review Addresses
$(document).on('click', '#reviewcontacts', function(event) {

	var result = validate('true');
	if (result == false) {
		return false;
	}
	new_customer_id = updateCustomerDetails();
	var sales_record_id = createSalesRecord(new_customer_id);
	// var params = {
	// 	custid: new_customer_id,
	// 	sales_record_id: null,
	// 	id: 'customscript_sl_lead_form',
	// 	deploy: 'customdeploy_sl_lead_form',
	// 	callcenter: null,
	// 	type: 'create'
	// };
	// params = JSON.stringify(params);
	var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_finalise_page', 'customdeploy_sl_finalise_page') + '&callcenter=T&recid=' + new_customer_id + '&sales_record_id=' + sales_record_id;
	window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

});

$(document).on('click', '#reviewaddress', function(event) {

	var result = validate('true');
	if (result == false) {
		return false;
	}
	new_customer_id = updateCustomerDetails();
	var sales_record_id = createSalesRecord(new_customer_id);
	// var params = {
	// 	custid: new_customer_id,
	// 	sales_record_id: null,
	// 	id: 'customscript_sl_lead_form',
	// 	deploy: 'customdeploy_sl_lead_form',
	// 	callcenter: null,
	// 	type: 'create'
	// };
	// params = JSON.stringify(params);
	var upload_url = baseURL + nlapiResolveURL('suitelet', 'customscript_sl_finalise_page', 'customdeploy_sl_finalise_page') + '&callcenter=T&recid=' + new_customer_id + '&sales_record_id=' + sales_record_id;
	window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
});


function updateCustomerDetails() {

	var update_required = false;

	if ($('#company_name').val() != $('#company_name').attr('data-oldvalue')) {
		update_required = true;
	}
	if ($('#abn').val() != $('#abn').attr('data-oldvalue')) {
		update_required = true;
	}
	if ($('#account_email').val() != $('#account_email').attr('data-oldvalue')) {
		update_required = true;
	}
	if ($('#account_phone').val() != $('#account_phone').attr('data-oldvalue')) {
		update_required = true;
	}
	if ($('#daytodayemail').val() != $('#daytodayemail').attr('data-oldvalue')) {
		update_required = true;
	}
	if ($('#daytodayphone').val() != $('#daytodayphone').attr('data-oldvalue')) {
		update_required = true;
	}

	var idSearch = nlapiLoadSearch('customer', 'customsearch2883');

	var resultSet = idSearch.runSearch();

	var result = resultSet.getResults(0, 1);

	var largestID = parseInt(result[0].getValue('entityid'));
	console.log(largestID);



	var initvalues = new Array();
	initvalues.customform = 26;
	initvalues.recordmode = 'dynamic';

	var suspectNewRecord = nlapiCopyRecord('customer', old_customer_id, {
		recordmode: 'dynamic'
	});
	var customerRecord = nlapiLoadRecord('customer', old_customer_id);
	// if (update_required == true) {

	console.log($('#company_name').val());
	suspectNewRecord.setFieldValue('companyname', $('#company_name').val());
	suspectNewRecord.setFieldValue('vatregnumber', $('#abn').val());
	suspectNewRecord.setFieldValue('partner', $('#zee').val());
	suspectNewRecord.setFieldValue('email', $('#account_email').val());
	suspectNewRecord.setFieldValue('altphone', $('#account_phone').val());
	suspectNewRecord.setFieldValue('custentity_email_service', $('#daytodayemail').val());
	suspectNewRecord.setFieldValue('phone', $('#daytodayphone').val());
	suspectNewRecord.setFieldValue('entitystatus', 6);
	suspectNewRecord.setFieldValue('leadsource', 217602);
	suspectNewRecord.setFieldValue('entityid', (largestID + 1));

	new_customer_id = nlapiSubmitRecord(suspectNewRecord);

	var searchedContacts = nlapiLoadSearch('contact', 'customsearch_salesp_contacts');

	var newFilters = new Array();
	newFilters[newFilters.length] = new nlobjSearchFilter('internalid', 'CUSTOMER', 'is', old_customer_id);

	searchedContacts.addFilters(newFilters);

	var resultSetContacts = searchedContacts.runSearch();

	resultSetContacts.forEachResult(function(searchResultContacts) {
		var contact_id = searchResultContacts.getValue('internalid');
		var salutation = searchResultContacts.getValue("salutation");
		var fname = searchResultContacts.getValue("firstname");
		var lname = searchResultContacts.getValue("lastname");
		var phone = searchResultContacts.getValue("phone");
		var email = searchResultContacts.getValue("email");
		var title = searchResultContacts.getValue("title");
		var contactrole = searchResultContacts.getValue("contactrole");

		var recContact = nlapiCreateRecord('contact')
		recContact.setFieldValue('salutation', salutation);
		recContact.setFieldValue('firstname', fname);
		recContact.setFieldValue('lastname', lname);
		recContact.setFieldValue('email', email);
		recContact.setFieldValue('phone', phone);
		recContact.setFieldValue('title', title);
		recContact.setFieldValue('company', new_customer_id);
		recContact.setFieldValue('entityid', fname + ' ' + lname);
		recContact.setFieldValue('contactrole', contactrole);

		nlapiSubmitRecord(recContact);
		return true;
	});

	// }
	// var multisite = $('#multisite option:selected').val();

	// if (isNullorEmpty(multisite)) {
	// 	multisite = 'F';
	// } else {
	// 	if (multisite == 1) {
	// 		multisite = 'T';
	// 	} else {
	// 		multisite = 'F';
	// 	}
	// }

	// suspectNewRecord.setFieldValue('custentity_category_multisite', multisite);
	// suspectNewRecord.setFieldValue('custentity_category_multisite_link', $('#website').val());
	// suspectNewRecord.setFieldValue('custentity_ap_mail_parcel', $('#survey1 option:selected').val());
	// suspectNewRecord.setFieldValue('custentity_ap_outlet', $('#survey2 option:selected').val());
	// suspectNewRecord.setFieldValue('custentity_ap_lpo_customer', $('#survey3 option:selected').val());
	// suspectNewRecord.setFieldValue('custentity_date_reviewed_sra', getDate());
	// suspectNewRecord.setFieldValue('custentity_customer_pricing_notes', $('#pricing_notes').val())

	// new_customer_id = nlapiSubmitRecord(suspectNewRecord);

	return new_customer_id;

	// if (!isNullorEmpty($('#sale_notes').val())) {
	// 	var sales_record_id = parseInt(nlapiGetFieldValue('sales_record_id'));
	// 	var sales_record = nlapiLoadRecord('customrecord_sales', sales_record_id);
	// 	var sales_campaign_id = sales_record.getFieldValue('custrecord_sales_campaign');
	// 	var sales_campaign_record = nlapiLoadRecord('customrecord_salescampaign', sales_campaign_id);
	// 	var sales_campaign_name = sales_campaign_record.getFieldValue('name');

	// 	var phonecall = nlapiCreateRecord('phonecall');
	// 	phonecall.setFieldValue('assigned', $('#zee').val());
	// 	phonecall.setFieldValue('custevent_organiser', nlapiGetContext().getUser());
	// 	phonecall.setFieldValue('startdate', getDate());
	// 	phonecall.setFieldValue('company', parseInt(nlapiGetFieldValue('customer')));
	// 	phonecall.setFieldValue('status', 'COMPLETE');
	// 	phonecall.setFieldValue('custevent_call_outcome', 16);

	// 	phonecall.setFieldValue('title', 'X Sale - ' + sales_campaign_name + ' - Call Notes');

	// 	phonecall.setFieldValue('message', $('#sale_notes').val());

	// 	nlapiSubmitRecord(phonecall);
	// }

}

function validatePhone(val) {

	var digits = val.replace(/[^0-9]/g, '');
	var australiaPhoneFormat = /^(\+\d{2}[ \-]{0,1}){0,1}(((\({0,1}[ \-]{0,1})0{0,1}\){0,1}[2|3|7|8]{1}\){0,1}[ \-]*(\d{4}[ \-]{0,1}\d{4}))|(1[ \-]{0,1}(300|800|900|902)[ \-]{0,1}((\d{6})|(\d{3}[ \-]{0,1}\d{3})))|(13[ \-]{0,1}([\d \-]{5})|((\({0,1}[ \-]{0,1})0{0,1}\){0,1}4{1}[\d \-]{8,10})))$/;
	var phoneFirst6 = digits.substring(0, 6);
	//Check if all phone characters are numerals
	if (val != digits) {
		showAlert('Phone numbers should contain numbers only.\n\nPlease re-enter the phone number without spaces or special characters.');
		return false;
	} else if (digits.length != 10) {
		//Check if phone is not blank, need to contains 10 digits
		showAlert('Please enter a 10 digit phone number with area code.');
		return false;
	} else if (!(australiaPhoneFormat.test(digits))) {
		//Check if valid Australian phone numbers have been entered
		showAlert('Please enter a valid Australian phone number.\n\nNote: 13 or 12 numbers are not accepted');
		return false;
	} else if (digits.length == 10) {
		//Check if all 10 digits are the same numbers using checkDuplicate function
		if (checkDuplicate(digits)) {
			showAlert('Please enter a valid 10 digit phone number.');
			return false;
		}
	}
}

function checkDuplicate(digits) {
	var digit01 = digits.substring(0, 1);
	var digit02 = digits.substring(1, 2);
	var digit03 = digits.substring(2, 3);
	var digit04 = digits.substring(3, 4);
	var digit05 = digits.substring(4, 5);
	var digit06 = digits.substring(5, 6);
	var digit07 = digits.substring(6, 7);
	var digit08 = digits.substring(7, 8);
	var digit09 = digits.substring(8, 9);
	var digit10 = digits.substring(9, 10);

	if (digit01 == digit02 && digit02 == digit03 && digit03 == digit04 && digit04 == digit05 && digit05 == digit06 && digit06 == digit07 && digit07 == digit08 && digit08 == digit09 && digit09 == digit10) {
		return true;
	} else {
		return false;
	}
}

function verify_abn(str) {

	if (!str || str.length !== 11) {
		alert('Invalid ABN');
		return false;
	}
	var weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
		checksum = str.split('').map(Number).reduce(
			function(total, digit, index) {
				if (!index) {
					digit--;
				}
				return total + (digit * weights[index]);
			},
			0
		);

	if (!checksum || checksum % 89 !== 0) {
		showAlert('Invalid ABN');
		return false;
	}

	return true;
}

function saveRecord() {
	var result = validate('true');
	if (result == false) {
		return false;
	}
	new_customer_id = updateCustomerDetails();
	var sales_record_id = createSalesRecord(new_customer_id);

}

function createSalesRecord(customerRecordId) {
	var recordtoCreate = nlapiCreateRecord('customrecord_sales');
	var date2 = new Date();
	var subject = '';
	var body = '';


	recordtoCreate.setFieldValue('custrecord_sales_campaign', 61);


	// Set customer, campaign, user, last outcome, callback date
	recordtoCreate.setFieldValue('custrecord_sales_customer', customerRecordId);
	recordtoCreate.setFieldValue('custrecord_sales_assigned', nlapiGetUser());
	recordtoCreate.setFieldValue('custrecord_sales_outcome', 5);
	recordtoCreate.setFieldValue('custrecord_sales_callbackdate', getDate());
	recordtoCreate.setFieldValue('custrecord_sales_callbacktime', nlapiDateToString(date2.addHours(19), 'timeofday'));

	var sales_record_id = nlapiSubmitRecord(recordtoCreate);

	return sales_record_id;

}


function getDate() {
	var date = new Date();
	// if (date.getHours() > 6) {
	//     date = nlapiAddDays(date, 1);
	// }
	date = nlapiDateToString(date);
	return date;
}

Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
}