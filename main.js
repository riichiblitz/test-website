
var delay = 5000;

var filter = "";

var delay = 5000;
var status = "";
var lobby = "-";
var nextTime = 0;
var round = 0;
var knownStatuses = ["announce", "registration", "wait", "playpart", "playall", "pause"];

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

function wait() {
    $("div:not(.wait) , p:not(.wait) , table:not(.wait)").hide();
    $(".wait").show();
    $(".time").text(formatTime(nextTime / 1000));
    $(".lobby").text(lobby);
    $(".lobby").attr("href", "http://tenhou.net/0/?" + lobby);
	  updateConfirmations();
}

function pause() {
    $("div:not(.pause) , p:not(.pause) , table:not(.pause)").hide();
    $(".pause").show();
    $(".time").text(formatTime(nextTime / 1000));
    $(".lobby").text(lobby);
    $(".lobby").attr("href", "http://tenhou.net/0/?" + lobby);
	  updateUnconfirmations();
}

function playp() {
    $("div:not(.playp) , p:not(.playp) , table:not(.playp)").hide();
    $(".playp").show();
    $(".lobby").text(lobby);
    $(".lobby").attr("href", "http://tenhou.net/0/?" + lobby);
	  updateUnconfirmations();
    updateResults();
}

function playa() {
    $("div:not(.playa) , p:not(.playa) , table:not(.playa)").hide();
    $(".playa").show();
    $(".lobby").text(lobby);
    $(".lobby").attr("href", "http://tenhou.net/0/?" + lobby);
}

function end() {
    $("div:not(.end) , p:not(.end) , table:not(.end)").hide();
    $(".end").show();
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

function updateConfirmations() {
	$.ajax({
		url: "../api/confirmed"
	}).done(function(data) {
		if (data.status === "ok") {
			$('.applications_count').text(data.data.length);
			$('.applicant_names').text("");
			if (data.data.length > 0) {
				data.data.forEach(function(item, i, arr) {
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

function updateUnconfirmations() {
	$.ajax({
		url: "../api/unconfirmed"
	}).done(function(data) {
		if (data.status === "ok") {
			$('.applications_count').text(data.data.length);
			$('.applicant_names').text("");
			if (data.data.length > 0) {
				data.data.forEach(function(item, i, arr) {
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

function updateResults() {
  $.ajax({
    url: "../api/results"
  }).done(function(data) {
    if (data.status === "ok") {
      $('.results_table tr').remove();
      //$item->name, $item->start_points, $item->end_points
      var html = "<tr>";
      var deltaCounter = 0;
      for (var i = 0; i < maxRounds && deltaCounter < data.data.length; i++) {
        html+="<td><table class=\"round_table\"><tr><td>";
        html+=tours[i];
        html+="</td></tr>";
        html+="<tr><td><table border=\"1\">";
        var lastBoard = 1;
        var counter = 0;
 outer: while (deltaCounter + counter < data.data.length) {
          var found = filter == "";
          if (!found) {
            for (var k = 0; k < playerPerTable; k++) {
              var values = data.data[deltaCounter + counter + k];
              var name = values[1];
              if (name == filter) {
                found = true;
                break;
              }
            }
          }
          if (found) {
            var board = data.data[deltaCounter + counter][0];
            if (board < lastBoard) {
              break outer;
            }
            lastBoard = board;
            for (var k = 0; k < playerPerTable; k++) {
              var values = data.data[deltaCounter + counter + k];
              var name = values[1];
              var start = values[2];
              var score = values[3];
              html+="<tr>";
              if (k == 0) {
                html+="<td rowspan=\"4\">" + (counter / playerPerTable + 1) + "</td>";
              }
              html+="<td>"+winds[k]+"</td><td>";
              html += name;
              html+="</td><td>" + (start == null ? "—" : start) + "</td>";
              html+="</td><td>" + (score == null ? "—" : score) + "</td>";
              html+="</tr>";
            }
          }
          counter += playerPerTable;
        }
        deltaCounter += counter;
        html+="</table></td></tr>";
        html+="</table></td>";
      }
      html+="</tr>";
      //console.error(html);
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
            case "wait": wait(); break;
            case "playpart": playp(); break;
            case "playall": playa(); break;
            case "pause": pause(); break;
            case "end": end(); break;
					}
				}
			} else {
				switch (status) {
					case "announce": break;
					case "registration": updateApplications(); break;
          case "wait": updateConfirmations(); break;
          case "playpart": updateUnconfirmations();
          case "playall": updateResults(); break;
          case "pause": updateUnconfirmations(); break;
          case "end": break;
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

function updateFilter() {
  filter = $('#filter').val();
  updateResults();
}

function formatTime(time) {
    var sec_num = time % (3600*24); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

    hours = (hours + 3) % 24;
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    return hours+':'+minutes;
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

  $('#filter').on('input', function() {
    var input = $('#filter').val();
    if (input == "" && filter != "") {
      filter = "";
      updateResults();
    }
  });
  $('#filter').keyup(function(e){
    if(e.keyCode == 13) updateFilter();
  });
  $("#perform_filter").click(updateFilter);

	updateStatus();
});
