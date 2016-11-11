var filter = "";

var delay = 5000;
var status = "";
var nextTime = 0;
var round = 0;
var knownStatuses = ["reg", "confirm", "pause", "play", "end"];

var winds = ["東", "南", "西", "北"];
var tours = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
var maxRounds = 4;
var playerPerTable = 4;


function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

function setRunningStatus() {
  delay = 10000;
  $(".results").show(500);
  $(".results_table").show(500);
  $(".confirm").hide(0);
  $(".reg").hide(0);
  $(".common").show(0);
  $(".lobby").show(0);
  $(".report_form").hide(0);
  $(".message_ok").hide(0);
  $(".end").hide(0);
  if (status == "pause") {
    $('.pause').show(500);
    $('.play').hide(500);
    var date = new Date(Number(nextTime));
    $('.next_time').text(zeroPad(date.getHours(),2) + ':' + zeroPad(date.getMinutes(),2));
  } else {
    $('.pause').hide(500);
    $('.play').show(500);
  }
  updateResults();
}

function updateResults() {
  $.ajax({
    url: "results.json"
  }).done(function(data) {
    if (data.status === "ok") {
      $('.results_table tr').remove();
      //$item->player, $item->state, $item->place, $item->score, $item->id, $item->url
      var playersPerRound = data.data.length / maxRounds;
      var html = "<tr>";
      for (var i = 0; i < maxRounds; i++) {
        html+="<td><table class=\"round_table\"><tr><td>";
        html+=tours[i];
        html+="</td></tr>";
        console.log(playersPerRound);
        html+="<tr><td><table border=\"1\">";
        for (var j = 0; j < playersPerRound; j+=playerPerTable) {
          var found = filter == "";
          if (!found) {
            for (var k = 0; k < playerPerTable; k++) {
              var values = data.data[i*playersPerRound + j + k];
              var name = values[0];
              if (name == filter) {
                found = true;
                break;
              }
            }
          }
          if (found) {
            for (var k = 0; k < playerPerTable; k++) {
              var values = data.data[i*playersPerRound + j + k];
              var name = values[0];
              var state = values[1];
              var score = values[3];
              html+="<tr>";
              if (k == 0) {
                html+="<td rowspan=\"5\">" + (j / playerPerTable + 1) + "</td>";
              }
              html+="<td>"+winds[k]+"</td><td>";
              if (state == "no") {
                html += "<font color=\"#FF0000\">"
              }
              html += name;
              if (state == "no") {
                html += "</font>"
              }
              html+="</td><td>" + (score == null ? "—" : score) + "</td>";
              html+="</tr>";
            }
            var replay = data.data[i*playersPerRound + j][5];
            html+="<tr><td colspan=\"3\">"
            html+=replay == null ? "No replay" : "<a href=\"" + replay + "\">REPLAY</a>";
            html+="</td></tr>";
          }
        }
        html+="</table></td></tr>";
        html+="</table></td>";
      }
      html+="</tr>";
      console.error(html);
      $(".results_table > tbody").append(html);
    }
  });
}

function updateFilter() {
  filter = $('#filter').val();
  updateResults();
}

function sendReplay() {
  $.ajax({
    type: "POST",
    data: JSON.stringify({ url: $('#replay').val() }),
    url: "../api/replay"
  }).done(function(data) {
    if (data.status === "ok") {
      $('#replay').val('');
    }
  });

}

$(document).ready(function() {
  $('#filter').on('input', function() {
    // do your stuff
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
  $('#replay').keyup(function(e){
    if(e.keyCode == 13) sendReplay();
  });
  $("#send_replay").click(sendReplay);
});
