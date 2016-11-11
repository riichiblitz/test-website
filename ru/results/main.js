
var delay = 5000;

function setRegStatus() {
	delay = 20000;
  $(".reg").show(500);
	$(".confirm").hide(500);
	$('.results_table').hide(0);
	$(".results").hide(0);
	$(".pause").hide(0);
	//$(".common").show(500);
	$(".info").show(500);
	$("#open_form").show(500);
	$(".register_form").hide(500);
	$(".footer").show(500);
	$(".registration_end").show(500);
	$(".registration_message_ok").hide(500);
	$(".registration_message_error").hide(500);
	$(".report_form").hide(0);
	$(".message_ok").hide(0);
	$(".end").hide(0);
	updateApplications();
}

function setConfirmStatus() {
	delay = 5000;
	$(".reg").hide(500);
	$(".common").show(0);
	$('.results_table').hide(0);
	$(".results").hide(0);
	$(".pause").hide(0);
	updateConfirmations();
	$(".info").hide(500);
	$("#open_form").hide(500);
	$(".register_form").hide(500);
	$(".footer").show(500);
	$(".registration_end").show(500);
	$(".registration_message_ok").hide(500);
	$(".registration_message_error").hide(500);
	$('.applications').hide(500);
	$('.confirmations').hide(500);
	$(".confirm").show(500);
	$(".report_form").hide(0);
	$(".message_ok").hide(0);
	$(".end").hide(0);
}

function setEndStatus() {
	delay = 1000000000;
	$(".results").hide(0);
	$(".pause").hide(0);
$(".common").show(0);
$(".results_table").show(500);
$(".confirm").hide(0);
$(".report_form").hide(0);
$(".message_ok").hide(0);
$(".end").show(500);
updateTotals();
}

function updateApplications() {
	$.ajax({
		url: "../api/players"
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

function updateConfirmations() {
	$.ajax({
		url: "../api/confirmed"
	}).done(function(data) {
		if (data.status === "ok") {
			$('.confirmations_count').text(data.data.count);
			$('.confirmations_names').text("");
			if (data.data.names.length > 0) {
				data.data.names.forEach(function(item, i, arr) {
					$('.confirmations_names').append(item);
					if (i < arr.length - 1) {
						$('.confirmations_names').append(' ');
					}
				});
			}
			$('.confirmations').show(500);
		}
	});
}


function updateTotals() {
	$.ajax({
		url: "../api/totals"
	}).done(function(data) {
		if (data.status === "ok") {
			$('.results_table tr').remove();
			//$item->player, $item->total,  $item->score, $item->place / $maxRounds
			var playersPerRound = data.data.length / maxRounds;
			var html = "<tr><td><table class=\"round_table\" border=\"1\">";
			for (var i = 0; i < data.data.length; i++) {
				var values = data.data[i];
				var name = values[0];
				var total = values[1];
				var score = values[2];
				var place = values[3];
				html+="<tr><td>";
				html+=(i+1);
			  html+="</td><td>" + name + "</td><td>" + total + "</td><td>" + score + "</td><td>" + place + "</td></tr>";
			}
			html+="</table></td></tr>";
			console.error(html);
			$(".results_table > tbody").append(html);
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
				nextTime = data.data.next;
				round = data.data.round;
				if (!knownStatuses.includes(status)) {
					window.location.reload(true);
				} else {
					switch (status) {
						case "reg": setRegStatus(); break;
						case "confirm": setConfirmStatus(); break;
						case "pause":
						case "play": setRunningStatus(); break;
						case "end": setEndStatus(); break;
					}
				}
			} else {
				switch (status) {
					case "reg": updateApplications(); break;
					case "confirm": updateConfirmations(); break;
					case "pause":
					case "play": updateResults(); break;
					case "end": updateTotals(); break;
				}
			}
		}
	}).always(function() {
		setTimeout(updateStatus, delay);
	});
}

function apply() {
	$.ajax({
		type: "POST",
		data: JSON.stringify({ name: $('#tenhou_nick').val(), contacts: $('#contacts').val(), notify: $('#notify').is(':checked') ? 1 : 0, anonymous: $('#anonymous').is(':checked') ? 1 : 0 }),
		url: "../api/apply"
	}).done(function(data) {
		if (data.status === "ok") {
			$(".registration_message_ok").show(500);
			$(".registration_message_error").hide(500);
			$(".register_form").hide(500);
			updateApplications();
		} else {
			$(".registration_message_error").show(500);
		}
	});
}

function report() {
	$.ajax({
		type: "POST",
		data: JSON.stringify({ name: $('#who_am_i').val(), message: $('#message').val() }),
		url: "../api/report"
	}).done(function(data) {
		if (data.status === "ok") {
			$(".message_ok").show(500);
		  $(".report_form").hide(500);
		}
	});
}

$(document).ready(function() {
	$(".reg").hide(0);
	$(".confirm").hide(0);
	$(".results").hide(0);
	//$(".common").hide(0);
	$(".report_form").hide(0);

	// $(".info").hide(0);
	// $("#open_form").hide(0);
	// $(".register_form").hide(0);
	// $(".applications").hide(0);
	// $(".footer").hide(0);
	// $(".registration_end").hide(0);
	// $(".registration_message_ok").hide(0);
	// $(".registration_message_error").hide(0);
	$('.confirmations').hide(0);
	$('.results_table').hide(0);
	$(".end").hide(0);


	$("#open_form").click(function(){
		$("#open_form").hide(500);
		$(".register_form").show(500);
	});

	$("#open_report").click(function(){
		$(".report_form").show(500);
		$(".message_ok").hide(500);
	});

	$("#submit_form").click(apply);
	$("#submit_report").click(report);

	updateStatus();
});
