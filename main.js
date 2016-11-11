
var delay = 5000;

var filter = "";

var delay = 5000;
var status = "";
var lobby = "-";
var nextTime = 0;
var round = 0;
var knownStatuses = ["announce", "registration"];

var winds = ["東", "南", "西", "北"];
var tours = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
var maxRounds = 4;
var playerPerTable = 4;

function announce() {
    $("div:not(.ann) , p:not(.ann) , table:not(.ann)").hide();
    $(".ann").show();
}

function registration() {
    $("div:not(.reg) , p:not(.reg) , table:not(.reg)").hide();
    $(".reg").show();
	updateApplications();
}

function updateApplications() {
	$.ajax({
		url: "../api/registrations"
	}).done(function(data) {
		if (data.status === "ok") {
			$('.applications_count').text(data.data.count);
			$('.applicant_names').text("");
			if (data.data.names.length > 0) {
				data.data.names.forEach(function(item, i, arr) {
					$('.applicant_names').append(item);
					if (i < arr.length - 1) {
						$('.applicant_names').append(' ');
					}
				});
			}
			$('.applications').show(500);
		}
	});
}

function updateStatus() {
	$.ajax({
		url: "../api/status"
	}).done(function(data) {
		if (data.status === "ok") {
			if (status !== data.data.status) {
				status = data.data.status;
				nextTime = data.data.time;
				round = data.data.round;
				lobby = data.data.lobby;
				delay = data.data.delay;
				if (!knownStatuses.includes(status)) {
					window.location.reload(true);
				} else {
					switch (status) {
						case "announce": announce(); break;
						case "registration": registration(); break;
					}
				}
			} else {
				switch (status) {
					case "announce": break;
					case "registration": updateApplications(); break;
				}
			}
			updateViewport();
		}
	}).always(function() {
		setTimeout(updateStatus, delay);
	});
}

function updateViewport() {
	//$("#viewport").attr('content', 'initial-scale=1.0, maximum-scale=2.0, width=device-width, user-scalable=yes');
	$(window).trigger('resize');
}

function apply() {
	$.ajax({
		type: "POST",
		data: JSON.stringify({ name: $('#tenhou_nick').val(), contacts: $('#contacts').val(), notify: $('#notify').is(':checked') ? 1 : 0, anonymous: $('#anonymous').is(':checked') ? 1 : 0, news: $('#news').is(':checked') ? 1 : 0 }),
		url: "../api/apply"
	}).done(function(data) {
		$(".reg_message_network_error").hide(500);
		$(".register_form").hide(500);
		if (data.status === "ok") {
			$(".reg_message_ok").show(500);
		} else {
			$(".reg_message_error").show(500);
		}
		updateApplications();
	}).fail(function() {
	    $(".reg_message_error").hide(500);
		$(".reg_message_network_error").show(500);
    });
}

function report() {
	$.ajax({
		type: "POST",
		data: JSON.stringify({ name: $('#who_am_i').val(), message: $('#message').val() }),
		url: "../api/report"
	}).done(function(data) {
		if (data.status === "ok") {
		  $(".report_message_ok").show(500);
		  $(".report_form").hide(500);
		  $("#open_report").show(500);
		}
	});
}

$(document).ready(function() {
	$("div:not(.com) , p:not(.com) , table:not(.com)").hide(0);

	$("#open_form").click(function(){
		$("#open_form").hide(500);
		$(".register_form").show(500);
		$("#submit_form").show(500);
	});
	
	$("#open_report").click(function(){
	    $(".report_message_ok").hide(500);
		$("#open_report").hide(500);
		$(".report_form").show(500);
		$("#submit_report").show(500);
	});

	$("#submit_form").click(apply);
	$("#submit_report").click(report);

	updateStatus();
});
