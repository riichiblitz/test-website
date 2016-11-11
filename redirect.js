var delays = [1000, 3000, 5000];
var retries = 0;

function poll() {
	$('.message').text("");
	$.ajax({
        url: "api/language"
    }).done(function(data) {
		if (data.data.length > 0 && data.data[0].includes("ru")) {
			window.location = "ru/index.html";
		} else {
			window.location = "en/index.html";
		}
    }).fail(function() {
		if (retries > 0) {
			if (retries == delays.length) {
				$('.message').append(" <br>No more retries. Please try again later.");
			    return;
			}
			$('.message').append(" Retrying...");
		} else {
            $('.message').text("Could not connect to server. Retrying...");
		}
	    setTimeout(poll, delays[retries]);
		retries++;
	});
}

$(document).ready(poll);
