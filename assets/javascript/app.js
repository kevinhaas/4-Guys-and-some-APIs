
jQuery(document).ready(function(){
    var id = "";
    var url = "";
    $("#submit").click(function(){
        if($(this).data("target") == "artist" && $("#artistInput").val() != ""){
            debugger;
            searchByArtist($("#artistInput").val());
        } else if($(this).data("target") == "venue" && $("#venueInput").val() != ""){
            findVenue($("#venueInput").val());
        }
        return false;
    });
    function searchByArtist(band){
        findArtist(band);
        getTourDates(band);
        $("#resultDiv").attr("style", "display: initial");
        setTimeout(function(){
            $(".inputBox").val("")
        }, 1000)
    };
    $("#artistInput").on("focus", function(){
        var keyPress = 0;
        $(window).keyup(function(event) {
            if(event.keyCode == 13){
                if(keyPress == 0){
                    searchByArtist($("#artistInput").val());
                } else {
                    searchByArtist($("#autoArt"+keyPress).data("artist"));
                };
                $("#artistDropDown").attr("style", "display: none");
            } else if(event.keyCode == 40){
                keyPress++;
                $(".dropDownItem").attr("style", "");
                $("#autoArt"+keyPress).attr("style", "background-color: white");
            } else if(event.keyCode == 38){
                keyPress--;
                $(".dropDownItem").attr("style", "");
                $("#autoArt"+keyPress).attr("style", "background-color: white");
            } else {
                if($("#artistInput").val().length > 1){
                    keyPress = 0;
                    var searchState = $("#artistInput").val();
                    url = "https://api.spotify.com/v1/search?q="+searchState+"*&type=artist";
                    $.ajax({url: url, method: "GET"})
                    .done(function(response) { 
                        if(response.artists.items.length > 0){
                            $("#artistDropDown").attr("style", "display: initial");
                            $("#artistDropDown").html("");
                            $("#artistInput").addClass("panel-header");
                            for(var i=0; i<5 && i<response.artists.items.length; i++){
                               $("#artistDropDown").append("<div class='panel-footer dropDownItem' id='autoArt"+(i+1)+"' data-artist='"+response.artists.items[i].name+"'>"+response.artists.items[i].name+"</div>");
                            };
                        } else {
                            $("#artistDropDown").html("");
                            $("#artistInput").removeClass("panel-header");
                        };
                    });
                } else {
                    $("#artistDropDown").html("");
                    $("#artistInput").removeClass("panel-header");   
                }
            };
        });
    });
    $("#artistInput").on("focusout", function(){
        $("#artistInput").removeClass("panel-header");
        $("#artistDropDown").attr("style", "display: none");
    });
    function findArtist(artist){
        $("#searchDivTitle").html("<h3>Recommended for "+artist+" fans!</h3>");
        url = "https://api.spotify.com/v1/search?q="+artist+"&type=artist";
        $.ajax({url: url, method: "GET"})
        .done(function(response) {
            console.log(response);
            id = response.artists.items[0].id;
            if(id != null){
                $("#bandInfo").attr("style", "display: initial");
                $("#searchContainer").attr("style", "display: none");
                $("#bandImage").html("<img class='mainBandImage' style='margin-bottom: 40px' src='"+response.artists.items[0].images[0].url+"''>");
                $("#bandHeader").html("<h2 class='mainBandHeader'>"+response.artists.items[0].name+"</h2>");
                $("#bandDiscription").html("<h3>Band Info</h3><br><button class='btn btn-warning backToSearch'>Search New Artist</button>")
            }
            url = "https://api.spotify.com/v1/artists/"+id+"/related-artists"
            $.ajax({url: url, method: "GET"})
            .done(function(response) {
                $("#spotArtists").html("");
                $("#artistsBadge").text(response.artists.length)
                for(var i=0; i<response.artists.length; i++){
                    $("#spotArtists").append("<div class='spotRes relatedArtist'><div class='thumbnail related'><div class='artistImg'><img src='"+response.artists[i].images[0].url+"' class='img-responsive' style='max-height: 100px; max-width: 100px;'></div><div class='artistTitle'>Artist: <b class='relTitle'>"+response.artists[i].name+"</b><br>Genre: <b class='relTitle'>"+response.artists[i].genres[0]+"</b><br><button data-artist='"+response.artists[i].name+"' class='relatedSearchBtn btn btn-primary'>Search Shows <span class='glyphicon glyphicon-search' aria-hidden='true'></span></button></div></div><div>");
                }
            });
            url = "https://api.spotify.com/v1/artists/"+id+"/top-tracks?country=US"
            $.ajax({url: url, method: "GET"})
            .done(function(ref) {
                $("#topBadge").text(ref.tracks.length)
                for(var j=0; j<ref.tracks.length; j++){
                    $("#topTracks").append("<div class='topTrackDiv thumbnail'><span><h2 style='background-color: #337ab7; color: white'>#"+(j+1)+" "+ref.tracks[j].name+"</h2></span>Album: "+ref.tracks[j].album.name+"<br><audio controls volume='false'><source src='"+ref.tracks[j].preview_url+"''></audio></div>")
                }
            });
            url = "https://crossorigin.me/http://api.bandsintown.com/artists/"+artist+"/events/recommended?&location=New+York,NY&radius=150&app_id=muskick&api_version=2.0&format=json";
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'JSON',
                success: function(data){
                    $("#showsBadge").text("0");
                    for(var k=0; k<data.length; k++){
                        var dateArr = data[k].formatted_datetime.split(",");
                        if(data[k].artists[0].name.toLowerCase() != artist.toLowerCase()){                       
                            $("#relatedShowBody").append("<tr><td>"+data[k].artists[0].name+"</td><td>"+data[k].formatted_location+"</td><td>"+dateArr[1]+"</td></tr>");
                            $("#showsBadge").text(parseInt($("#showsBadge").text())+1);
                        }
                    }
                },
                error: function(errorObj){
                    console.log(errorObj);
                }
            });
        });
    };

    function getTourDates(artist){
        var bandTownurl = "https://crossorigin.me/https://api.bandsintown.com/artists/"+artist+"/events.json?callback=?&app_id=muskick"
        console.log(bandTownurl);
        $.ajax({
            type: 'GET',
            url: bandTownurl,
            dataType: 'JSON',
            success: function(data){
                console.log(data);
                $("#tableBody").html("");
                for(var i=0; i<10; i++){
                    var ticketSpot;
                    if(data[i].ticket_status == "available"){
                        ticketSpot = "<button class='btn btn-success buyTixBtn' data-url='"+data[i].ticket_url+"'>Buy</button>";
                    } else {
                        ticketSpot = "Sold Out";
                    }
                    $("#tableBody").append("<tr><td>"+data[i].datetime.substring(5, 7)+"/"+data[i].datetime.substring(8, 10)+"/"+data[i].datetime.substring(2, 4)+"</td><td>"+data[i].venue.name+"</td><td>"+data[i].venue.region+"</td><td>"+data[i].venue.city+"</td><td>"+ticketSpot+"</td></tr>");
                }
            },
            error: function(errorObj){
                console.log(errorObj);
            }
        });
    }
    $("body").on("click", ".relatedSearchBtn", function(){
        searchByArtist($(this).data("artist"));
    }); 
    $(".relatedTab").click(function(){
        $(".relatedTab").removeClass("active");
        $(this).addClass("active");
        $(".tabDisplay").attr("style", "display: none");
        var div = $(this).data("div");
        $("#"+div).attr("style", "display: initial");
    });
    $(".searchTab").click(function(){
        var target = $(this).data("target")
        if($(this).hasClass("active")) return;
        $(".searchTab").removeClass("active");
        $(this).addClass("active");
        $(".inputBox").attr("style", "display: none");
        $(".inputLabel").attr("style", "display: none");
        $("#submit").data("target", target);
        $("."+target+"SI").attr("style", "display: initial");
        $(".inputBox").attr("required", "");
        $("#"+target+"Input").attr("required", "required");
    });
    function findVenue(){

    };
    $("body").on("click", ".backToSearch", function(){
        $("#bandInfo").attr("style", "display: none");
        $("#searchContainer").attr("style", "display: initial");
    });
    $("body").on("click", ".buyTixBtn", function(){
        window.location.href($(this).data("url"));
    });
});

     
