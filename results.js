
var delay = 5000;

var filter = "";

var delay = 5000;
var status = "";
var lobby = "-";
var nextTime = 0;
var round = 0;
var knownStatuses = ["announce", "registration", "wait", "playpart", "playall", "pause", "end"];

var winds = ["東", "南", "西", "北"];
var tours = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
var maxRounds = 4;
var playerPerTable = 4;

function updateResults() {
  $.ajax({
    url: "../api/results"
  }).done(function(data) {
    if (data.status === "ok") {
      $('.results_table tr').remove();
      //$item->name, $item->start_points, $item->end_points
      var html = "<tr>";
      var deltaCounter = 0;
      for (var i = 0; i < maxRounds && deltaCounter < data.data.results.length; i++) {
        html+="<td><table class=\"round_table\"><tr><td>";
        html+=tours[i];
        html+="</td></tr>";
        html+="<tr><td><table border=\"1\">";
        var lastBoard = 1;
        var counter = 0;
        var currentRound = i + 1;
 outer: while (deltaCounter + counter < data.data.results.length) {
          var found = filter == "";
          if (!found) {
            for (var k = 0; k < playerPerTable; k++) {
              var values = data.data.results[deltaCounter + counter + k];
              var name = values[2];
              if (name == filter) {
                found = true;
                break;
              }
            }
          }
          if (found) {
            var round = data.data.results[deltaCounter + counter][0];
            var board = data.data.results[deltaCounter + counter][1];
            if (round != currentRound) {
              break outer;
            }
            lastBoard = board;
            for (var k = 0; k < playerPerTable; k++) {
              var values = data.data.results[deltaCounter + counter + k];
              var name = values[2];
              var start = values[3];
              var score = values[4];
              var url = data.data.replays[round] != null ? data.data.replays[round][board] : null;
              html+="<tr>";
              if (k == 0) {
                html+="<td rowspan=\"4\">" + board + "</td>";
              }
              html+="<td>"+winds[k]+"</td><td>";
              if (url != null && name != null) html += "<a target=\"_blank\" href=\"http://tenhou.net/0/?log=" + url + "&tw=" + k + "\">";
              html += name == null ? "—" : name;
              if (url != null && name != null) html += "</a>";

              html+="</td><td>";
              if (start == null) {
                html+="—";
              } else if (score == null) {
                html+="<font color=\"#909090\">" + start + "</font>";
              } else {
                html+=score;
              }
              html+="</td>";

              //html+="</td><td>" + (start == null ? "—" : start) + "</td>";
              //html+="</td><td>" + (score == null ? "—" : score) + "</td>";
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


function updateViewport() {
	//$("#viewport").attr('content', 'initial-scale=1.0, maximum-scale=2.0, width=device-width, user-scalable=yes');
	$(window).trigger('resize');
}


function replay() {
	$.ajax({
		type: "POST",
		data: JSON.stringify({ url: $('#replay_url').val(), cheat: $('#cheat').is(':checked') ? 1 : 0}),
		url: "../api/replay"
	}).done(function(data) {
		if (data.status === "ok") {
		  $(".replay_message_ok").show(500);
		  $(".replay_form").hide(500);
		  $("#open_replay").show(500);
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

$(document).ready(function() {
	$("div:not(.com) , p:not(.com) , table:not(.com)").hide(0);

	$("#open_report").click(function(){
	    $(".report_message_ok").hide(500);
		$("#open_report").hide(500);
		$(".report_form").show(500);
		$("#submit_report").show(500);
	});

  $("#open_replay").click(function(){
	    $(".replay_message_ok").hide(500);
		$("#open_replay").hide(500);
		$(".replay_form").show(500);
		$("#submit_replay").show(500);
	});

	$("#submit_report").click(report);
	$("#submit_replay").click(replay);

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

	updateResults();
});
