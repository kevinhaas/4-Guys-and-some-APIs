
jQuery(document).ready(function(){
    var id = "";
    var url = "";
    var keyPress = 0;
    $("#submit").click(function(){
        var venue = $("#venueInput").val();
        if($(this).data("target") == "artist" && $("#artistInput").val() != ""){
            searchByArtist($("#artistInput").val(), $("#startDateInput").val(), $("#endDateInput").val());
        } else if($("#venueInput").val() != ""){
            findVenue(venue);
        } else {
            return;
        }
        return false;
    });
    function searchByArtist(band, start, end){
        if(band == "") return;
        $("#relatedShowBody").html("");
        $("#searchDivTitle").html("Recommended for "+band+" fans!");
        $("#topTracks").html("");
        $(".resultSection").css("display", "none");
        $("#spotifyDiv").attr("style", "");
        $("#spotifyDiv").html($("#spotifyDiv").html());
        findArtist(band);
        getTourDates(band, start, end);
        setTimeout(function(){
            $(".inputBox").val("")
        }, 1000);
    };
    $("#artistInput").on("focus", function(){
        keyPress = 0;
        $(window).keyup(artistOnKey);
    });
    function artistOnKey(event) {
        var artist = $("#artistInput").val();
        var start = $("#startDateInput").val();
        var end = $("#endDateInput").val();
        if(event.keyCode == 13){
            if(keyPress == 0){
                searchByArtist(artist, start, end);
            } else {
                searchByArtist($("#autoArt"+keyPress).data("artist"), start, end);
            };
            $("#artistDropDown").attr("style", "display: none");
        } else if(event.keyCode == 40){
            keyPress++;
            $(".dropDownItem").attr("style", "");
            $("#autoArt"+keyPress).attr("style", "background-color: white; color: purple");
        } else if(event.keyCode == 38){
            keyPress--;
            $(".dropDownItem").attr("style", "");
            $("#autoArt"+keyPress).attr("style", "background-color: white; color: purple");
        } else {
            if(artist.length > 1){
                keyPress = 0;
                url = "https://api.spotify.com/v1/search?q="+artist+"*&type=artist";
                $.ajax({url: url, method: "GET"})
                .done(function(response) { 
                    if(response.artists.items.length > 0){
                        $("#artistDropDown").attr("style", "display: initial");
                        $("#artistDropDown").html("");
                        $("#artistInput").addClass("panel-header");
                        for(var i=0; i<5 && i<response.artists.items.length; i++){
                           $("#artistDropDown").append("<div class='panel-footer dropDownItem dropThis' id='autoArt"+(i+1)+"' data-artist='"+response.artists.items[i].name+"'>"+response.artists.items[i].name+"</div>");
                        };
                    } else {
                        $("#artistDropDown").html("");
                        $("#artistInput").removeClass("panel-header");
                    };
                });
            } else {
                $("#artistDropDown").html("");  
            }
        };
    };
    $("#artistInput").on("focusout", function(){
        $("#artistInput").removeClass("panel-header");
        setTimeout(function(){
            $("#artistDropDown").attr("style", "display: none");
        }, 200); 
    });
    function findArtist(artist){
        url = "https://api.spotify.com/v1/search?q="+artist+"&type=artist";
        $.ajax({url: url, method: "GET"})
        .done(function(response) {
            id = response.artists.items[0].id;
            if(id != null){
                $("#bandInfo").attr("style", "display: initial");
                $("#searchContainer").attr("style", "display: none");
                $("#bandImage").html("<img class='mainBandImage img-responsive' style='margin-bottom: 40px' src='"+response.artists.items[0].images[0].url+"''>");
                $("#bandHeader").html("<h2 class='mainBandHeader'>"+response.artists.items[0].name+"</h2>");
                $("#bandGenreInfo").html(response.artists.items[0].genres[0]);
                $("#spotifyConnect").data("url", response.artists.items[0].href);
                $("#bandFollowers").html(response.artists.items[0].followers.total);
                $("#bandPopularity").html(response.artists.items[0].popularity);
            }
            url = "https://api.spotify.com/v1/artists/"+id+"/related-artists"
            $.ajax({url: url, method: "GET"})
            .done(function(response) {
                $("#spotArtists").html("");
                $("#artistsBadge").text(response.artists.length)
                for(var i=0; i<response.artists.length; i++){
                    $("#spotArtists").append("<div class='spotRes relatedArtist' data-artist='"+response.artists[i].name+"'><div class='thumbnail related'><div class='artistImg'><img src='"+response.artists[i].images[0].url+"' style='max-height: 100px; max-width: 100px;'></div><div class='artistTitle'><span class='relTitle'>Artist: </span>"+response.artists[i].name+"<div class='relTitle'>Genre: "+response.artists[i].genres[0]+"</div></div></div></div>");
                }
            });
            url = "https://api.spotify.com/v1/artists/"+id+"/top-tracks?country=US";
            $.ajax({url: url, method: "GET"})
            .done(function(ref) {
                $("#topBadge").text(ref.tracks.length)
                for(var j=0; j<ref.tracks.length; j++){
                    $("#topTracks").append("<div class='topTrackDiv thumbnail blackBack'><span class='purpleBack'><h2 style='color: white; font-size: 24px'>#"+(j+1)+" "+ref.tracks[j].name+"</h2></span>Album: "+ref.tracks[j].album.name+"<br><audio controls volume='false'><source src='"+ref.tracks[j].preview_url+"''></audio></div>")
                }
            });
            Relatedurl = "https://crossorigin.me/http://api.bandsintown.com/artists/"+artist+"/events/recommended?&location=New+York,NY&radius=150&app_id=muskick35&api_version=2.0&format=json";
            console.log(Relatedurl)
            $.ajax({
                type: 'GET',
                url: Relatedurl,
                dataType: 'JSON',
                success: function(data){
                    $("#showsBadge").text("0");
                    console.log(data);
                    for(var k=0; k<data.length; k++){
                        var dateArr = data[k].formatted_datetime.split(",");
                        console.log(data[k].artists[0].name)
                        if(data[k].artists[0].name.toLowerCase() != artist.toLowerCase()){    
                            console.log(true);                   
                            $("#relatedShowBody").append("<tr><td>"+data[k].artists[0].name+"</td><td>"+data[k].formatted_location+"</td><td>"+dateArr[1]+"</td></tr>");
                            $("#showsBadge").text(parseInt($("#showsBadge").text())+1);
                        };
                    };
                },
                error: function(errorObj){
                    console.log(errorObj);
                }
            });
        });
    };

    function getTourDates(artist, start, end){
        var date = "";
        if(start != "" && end != "") date = "date="+start+","+end+"&";
        if(start != "" && end == "") date = "date="+start+"&";
        $("#pageDirectory").attr("style", "display: none");
        var bandTownurl = "https://crossorigin.me/https://api.bandsintown.com/artists/"+artist+"/events.json?"+date+"callback=?&app_id=muskick35";
        $.ajax({
            type: 'GET',
            url: bandTownurl,
            dataType: 'JSON',
            success: function(data){
                $("#tableBody").html("");
                if(data.length > 0){
                    $("#resultDiv").css("display", "initial");
                    var concertNum = data.length;
                    var pageNum = (concertNum - (concertNum%5))/5;
                    if(concertNum%5 != 0) pageNum++;
                    var page = 1;
                    for(var i=0; i<concertNum; i++){
                        var ticketSpot;
                        if(i != 0 && i%5 == 0) page++;
                        if(data[i].ticket_status == "available"){
                            ticketSpot = "<button class='btn btn-info buyTixBtn buttonText' data-url='"+data[i].ticket_url+"'>Buy</button>";
                        } else {
                            ticketSpot = "Sold Out";
                        };
                        $("#tableBody").append("<tr class='pageNum"+page+" tourPage'><td>"+data[i].datetime.substring(5, 7)+"/"+data[i].datetime.substring(8, 10)+"/"+data[i].datetime.substring(2, 4)+"</td><td>"+data[i].venue.name+"</td><td>"+data[i].venue.region+"</td><td>"+data[i].venue.city+"</td><td>"+ticketSpot+"</td></tr>");
                    };
                    $(".tourPage").attr("style", "display: none");
                    $(".pageNum1").attr("style", "");
                    var pages = $(".pageNum1");
                    $("#tableBody").append(pages);
                    if(pageNum > 1){
                        $("#pageDirectory").attr("style", "display: initial");
                        $("#pageButtons").html("");
                        for(var j=1; j<=pageNum; j++){
                            $("#pageButtons").append("<span><button class='btn btn info pageIndexBtn' data-page='"+j+"'>"+j+"</button></span>");
                        };
                    };
                } else {
                    $("#resultInfo").css("display", "initial");
                    $("#resultInfo").html("This artist is not currently touring");
                };
            },
            error: function(errorObj){
                console.log(errorObj);
            }
        });
    }
    $("body").on("click", ".relatedArtist", function(){
        searchByArtist($(this).data("artist"), $("#startDateInput").val(), $("#endDateInput").val());
        
    }); 
    $("body").on("click", ".relatedTab", function(){
        $(".relatedTab").removeClass("active");
        $(this).addClass("active");
        $(".tabDisplay").attr("style", "display: none");
        var div = $(this).data("div");
        $("#"+div).attr("style", "display: initial");
    });
    $("body").on("click", ".searchTab", function(){
        var target = $(this).data("target");
        $("#submit").attr("data-target", target);
        if($(this).hasClass("active")) return;
        $(".searchTab").removeClass("active");
        $(this).addClass("active");
        $(".inputBox").val("");
        $(".inputBox").attr("style", "display: none");
        $(".inputLabel").attr("style", "display: none");
        $("."+target+"SI").attr("style", "display: initial");
    });
    $("body").on("click", "#submitVenue", submitVenue);
    function submitVenue(){
        var state = $("#stateInput").val();
        var city = $("#cityInput").val();
        if(state == "" || city == "") return;
        var radius = $("#radiusInput").val();
        var locale = city + "," + state;
        findVenueByLocation(locale, radius);
        $(".inputBox").val("");
        return false;
    };
    function findVenueByLocation(locale, radius){
        var rad = radius;
        if(radius == "") rad = "0";
        $("#addressStorage").html("");
        url = "https://crossorigin.me/http://api.bandsintown.com/events/search.json?page=1&per_page=100&location="+locale+"&radius="+rad+"&app_id=muskick35";
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'JSON',
            success: function(data){
                console.log(data);
                $(".resultSection").css("display", "none");
                if(data.length > 0){
                    $("#venueTableBody").html("");
                    $("#venueList").css("display", "initial");
                    var venueList = [];
                    for(var i=0; i<data.length && i<10; i++){
                        var bool = true;
                        for(var j=0; j<venueList.length; j++){
                            if(data[i].venue.name == venueList[j]) bool = false;
                        };
                        if(bool){
                            venueList.push(data[i].venue.name);
                            url = "https://crossorigin.me/"+data[i].venue.url;
                            console.log(url)
                            var streetAdd;
                            $.get(url, function(response) {
                                    var $response = $(response);
                                    console.log($response.find('.venue-location').html());
                                    $("#addressStorage").append($response.find('.venue-location').html()+",");
                            });
                            $("#venueTableBody").append("<tr><td>"+data[i].venue.name+"</td><td>"+data[i].venue.city+", "+data[i].venue.region+"</td><td><div id='address"+i+"'></div></td><td><button class='btn btn-info getEventsBtn' data-info='"+data[i].venue.id+"'>Events</button></td></tr>")
                        }
                    };
                    var limit = i;
                    setTimeout(function(){
                        var arr = ($("#addressStorage").html()).split(",");
                        var ind = 0;
                        for(var k=0; k<limit; k++){
                            if(arr[ind+1].length == 3){
                                ind += 2;
                            } else {
                                $("#address"+k).html(arr[ind]);
                                ind += 3;
                            }
                        };
                    }, 4000);
                } else {
                    $("#resultInfo").attr("style", "display: initial");
                    $("#resultInfo").html("No Venues found in this area.");
                }
            },
            error: function(error){
                console.log(error);
            }
        });
    };
    $(document).on("click", ".dropThis", function(){
        debugger;
        var bandName = $(this).data("artist");
        searchByArtist(bandName);
        $("#artistDropDown").attr("style", "display: none");
    });
    $("body").on("click", ".backToSearch", function(){
        $("#resultInfo").css("display", "none");
        $("#bandInfo").attr("style", "display: none");
        $("#searchContainer").attr("style", "display: initial");
        $(window).unbind("keyup", artistOnKey);
    });
    $("body").on("click", ".buyTixBtn", function(){
        window.location.href = $(this).data("url");
    });
    $("#lightSwitch").click(function(){
        if ($(this).attr("data-state") == "off"){
            $(".wrapper").attr("style", "background-image: url('light.jpg')");
            $(this).attr("data-state", "on");
            return;
        } else {
            $(".wrapper").attr("style", "background-image: url('dark.png')");
            $(this).attr("data-state", "off");
        }
    });
    $("#spotifyConnect").click(function(){
        window.location.href = $(this).data("url");
    });
    $("body").on("click", ".pageIndexBtn", function(){
        $(".tourPage").attr("style", "display: none");
        var page = $(".pageNum"+$(this).data("page"));
        page.attr("style", "");
        $("#tableBody").append(page);
    });
});

     
