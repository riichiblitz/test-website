
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


function updateTotals() {
  $.ajax({
    url: "../api/totals"
  }).done(function(data) {
    if (data.status === "ok") {
      $('.results_table').addClass("totals_table").attr("border", 1);
      $('.results_table tr').remove();
      //$item->name, $item->score, $item->place
      var html = "";
      for (var i = 0; i < data.data.length; i++) {
        var values = data.data[i];
        html += "<tr>";
        var name = values[0];
        var score = values[1];
        var place = parseFloat(values[2]);

        html+="<td>";
        html+=(i+1);
        html+="</td><td>";
        html+=name;
        html+="</td><td>";
        html+=score;
        html+="</td><td>";
        html+=place;
        html+="</td></tr>";
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

	$("#open_report").click(function(){
	    $(".report_message_ok").hide(500);
		$("#open_report").hide(500);
		$(".report_form").show(500);
		$("#submit_report").show(500);
	});

	updateTotals();
});
