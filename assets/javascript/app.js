
jQuery(document).ready(function(){
    var id = "";
    var url = "";
    $("#artistInput").focus();
    $("#artistInput").select();
    $("#submit").click(function(){
        if($(this).data("target") == "artist" && $("#artistInput").val() != ""){
            searchByArtist($("#artistInput").val(), $("#startDateInput").val(), $("#endDateInput").val());
        } else if($(this).data("target") == "venue" && $("#venueInput").val() != ""){
            findVenue($("#venueInput").val());
        } else {
            return;
        }
        console.log($("#startDateInput").val())
        return false;

    });
    function searchByArtist(band, start, end){
        if(band == "") return;
        $("#topTracks").html("");
        $("#relatedShowBody").html("");

        findArtist(band);
        getTourDates(band, start, end);
        $("#resultDiv").attr("style", "display: initial");
        setTimeout(function(){
            $(".inputBox").val("")
        }, 1000);
    };
    $("#artistInput").on("focus", function(){
        var keyPress = 0;
        $(window).keyup(function(event) {
            if(event.keyCode == 13){
                if(keyPress == 0){
                    searchByArtist($("#artistInput").val(), $("#startDateInput").val(), $("#endDateInput").val());
                } else {
                    searchByArtist($("#autoArt"+keyPress).data("artist"), $("#startDateInput").val(), $("#endDateInput").val());
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
                               $("#artistDropDown").append("<div class='panel-footer dropDownItem dropThis' id='autoArt"+(i+1)+"' data-artist='"+response.artists.items[i].name+"'>"+response.artists.items[i].name+"</div>");
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
        setTimeout(function(){
            $("#artistDropDown").attr("style", "display: none");
        }, 200); 
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
                    $("#spotArtists").append("<div class='spotRes relatedArtist' data-artist='"+response.artists[i].name+"'><div class='thumbnail related'><div class='artistImg'><img src='"+response.artists[i].images[0].url+"' class='img-responsive' style='max-height: 100px; max-width: 100px;'></div><div class='artistTitle'><span class='relTitle'>Artist: </span>"+response.artists[i].name+"<div class='relTitle'>Genre: "+response.artists[i].genres[0]+"</div></div></div></div>");
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
            url = "https://crossorigin.me/http://api.bandsintown.com/artists/"+artist+"/events/recommended?&location=New+York,NY&radius=150&app_id=muskick3&api_version=2.0&format=json";
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

    function getTourDates(artist, start, end){
        var date = "";
        if(start != "" && end != "") date = "date="+start+","+end+"&";
        if(start != "" && end == "") date = "date="+start+"&";
        var bandTownurl = "https://crossorigin.me/https://api.bandsintown.com/artists/"+artist+"/events.json?"+date+"callback=?&app_id=muskick3";
        console.log(bandTownurl);
        $.ajax({
            type: 'GET',
            url: bandTownurl,
            dataType: 'JSON',
            success: function(data){
                console.log(data);
                $("#tableBody").html("");
                var concertNum = data.length;
                var pageNum = (concertNum - (concertNum%5))/5;
                if(concertNum%5 != 0) pageNum++;
                var page = 1;
                for(var i=0; i<concertNum; i++){
                    var ticketSpot;
                    console.log(page);
                    if(i != 0 && i%5 == 0) page++;
                    if(data[i].ticket_status == "available"){
                        ticketSpot = "<button class='btn btn-info buyTixBtn buttonText' data-url='"+data[i].ticket_url+"'>Buy</button>";
                    } else {
                        ticketSpot = "Sold Out";
                    }
                    debugger
                    $("#tableBody").append("<tr class='pageNum"+page+" tourPage'><td>"+data[i].datetime.substring(5, 7)+"/"+data[i].datetime.substring(8, 10)+"/"+data[i].datetime.substring(2, 4)+"</td><td>"+data[i].venue.name+"</td><td>"+data[i].venue.region+"</td><td>"+data[i].venue.city+"</td><td>"+ticketSpot+"</td></tr>");
                };
                $("#pageDirectory").attr("style", "display: none");
                $(".tourPage").attr("style", "display: none");
                $(".pageNum1").attr("style", "");
                var pages = $(".pageNum1");
                console.log(pages);
                $("#tableBody").append(pages);
                if(pageNum > 1){
                    $("#pageDirectory").attr("style", "display: initial");
                    $("#pageButtons").html("");
                    for(var j=1; j<=pageNum; j++){
                        $("#pageButtons").append("<span><button class='btn btn info pageIndexBtn' data-page='"+j+"'>"+j+"</button></span>");
                    };
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
        return;
    };
    $(document).on("click", ".dropThis", function(){
        debugger;
        var bandName = $(this).data("artist");
        console.log(bandName)
        searchByArtist(bandName);
        $("#artistDropDown").attr("style", "display: none");
    });
    $("body").on("click", ".backToSearch", function(){
        $("#bandInfo").attr("style", "display: none");
        $("#searchContainer").attr("style", "display: initial");
    });
    $("body").on("click", ".buyTixBtn", function(){
        window.location.href = $(this).data("url");
    });
    $("#lightSwitch").click(function(){
        debugger;
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

     
