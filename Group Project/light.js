$(document).ready(function(){
	$("#lightswitch").change(function(){
		if ($(this).prop("checked") == true){
			$("body").css("background-image", "url('light.jpg')");
			// $("#main-header").text("MUSKICK OFF");
		} else {
			$("body").css("background-image", "url('dark.png')");
			// $("#main-header").text("MUSKICK ON");
		}
	});

});