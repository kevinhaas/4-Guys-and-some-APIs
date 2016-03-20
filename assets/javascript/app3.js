var apiKey = "z974vrt6824meafa9gndeuhe";
var artist = "Phish";
var artistId = 2698;
var zip;
var venue;
var venueId;
var startDate;
var endDate;


    var queryURL = "http://api.jambase.com/events?band=" + artist + "&api_key=" + apiKey;

    $.ajax({
        url: queryURL, 
        method: 'GET'})
        
     .done(function(response) {
        console.log(response.Events);
        
        var results = response.Events;
        
        for (var i = 0; i < results.length; i++) {
            console.log(results[i]);

        document.onkeyup = function (playerInput) {
            if (playerInput.keyCode == 13) {
                console.log(results[i].Events);
            }
        }
        }
        
     });