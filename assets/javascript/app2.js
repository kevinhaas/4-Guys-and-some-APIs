
    "use strict";
    //chatbox
    var chatbase = new Firebase("https://ek1.firebaseio.com/Chat");

    var chatuser = "Anonymous";
    var authservice = false;
    var authurl = false;
    function submitChatMessage(){
        let message = $("#chatmessage").val().trim().substring(0,200);//remove spaces, limit to 200 characters, no server-side check
        if(message)//check if message is empty
        {
            chatbase.push({"chatuser": chatuser,
                "chattime": moment().format("MMM Do h:mm a"),
                "message": message,
                "authservice":authservice,
                "authurl":authurl
            }).setPriority(Firebase.ServerValue.TIMESTAMP);

            $("#chatmessage").val("");//clear message
        }
    }

    //load last 50 messages, limited to last day
    //http://stackoverflow.com/questions/24312783/firebase-child-added-without-loading-all-data-first
    chatbase.startAt(moment().subtract(1,"day").unix()).limitToLast(50).on('child_added',function(childSnapshot){
        var authelement="";
        if(childSnapshot.val().authservice != false){
            authelement = $("<sup/>").append($("<a/>").text("(" + childSnapshot.val().authservice +")")
                    .attr({"href":childSnapshot.val().authurl})
                    .css({"font-size":".8em",
                        "text-decoration":"none"}));
            console.log(childSnapshot.val().authurl);
        }

        $("#chatbox").append($("<div/>").append("<hr/>")
                .append($("<span/>").text("(" + childSnapshot.val().chattime + ")")
                        .css({"font-size":".8em"}))

                .append($("<span/>").text(" " + childSnapshot.val().chatuser)
                        .css({"font-weight":"bold"}))
                .append(authelement)
                .append($("<span/>").text(":"))
                .append($("<span/>").text(childSnapshot.val().message)));
        var chatBox = $("#chatbox");

        chatBox[0].scrollTop = chatBox[0].scrollHeight;
    });

    //For calculating number of users online
    //http://stackoverflow.com/questions/15982215/firebase-count-online-users
    //http://stackoverflow.com/questions/391979/get-client-ip-using-just-javascript
    var listRef = new Firebase("https://ek1.firebaseio.com/ActiveUsers");
    //http://stackoverflow.com/questions/11351689/detect-if-firebase-connection-is-lost-regained
    var userRef = null;
    var connectedRef = new Firebase("https://ek1.firebaseio.com/.info/connected");
    connectedRef.on("value", function(snap) {
        if (snap.val() === true) {
            userRef = listRef.push("me");
            userRef.onDisconnect().remove();
        }
    });

    // Number of online users is the number of objects in the presence list.
    listRef.on("value", function(snap) {
        $("#numberofusers").text(snap.numChildren().toString());
    });

    function usernamedialog(){
        $("#dialog").dialog({ // Set the settings for the jquery-ui dialog here.
            autoOpen: false, // Don't open the dialog instantly. Let an event such as a button press open it. Optional.
            position: {my: "center", at: "center", of: "#chatbox-container"} // Set the position to center of the div.
        }).parent().resizable({ // Settings that will execute when resized.
            containment: "#chatbox-container" // Constrains the resizing to the div.
        }).draggable({ // Settings that execute when the dialog is dragged. If parent isn't used the text content will have dragging enabled.
            containment: "#chatbox-container", // The element the dialog is constrained to.
            opacity: 0.70 // Fancy opacity. Optional.
        });
        $( "#dialog" ).dialog("open");
    }

    function setusername(username,service=false,url=false){
        chatuser = username.trim() || "Anonymous";
        authservice=service || false;
        authurl=url || false;
        $("#username").text(chatuser);
        if(service)
            $("#authentication").text("(" + authservice + ")").attr({"href":authurl});
        $("#dialog").dialog("close");
        $("#dialogerror").text("");
    }

    function twitter(){
        //Using popup (option 1)
        OAuth.initialize('aocVSQwE3wVEJxoS4QAu9HB7-qU');
        OAuth.popup('twitter')
                .done(function(result) {
                    result.me()
                            .done(function(user) {
                                setusername(user.alias,'Twitter',user.url);
                            })
                            .fail(function(err) {
                                $("#dialogerror").text("Authentication failed.")
                            })
                })
                .fail(function (err) {
                    //handle error with err
                    $("#dialogerror").text("Authentication failed.")
                });
    }


// poll box

"use strict";
    //voting part
    var votebase = new Firebase("https://ek1.firebaseio.com/Poll");

    function vote(votevalue){
        var votevalues= {"up":0,
            "down":0};

        //record vote in firebase
        votebase.child(votevalue).transaction(function(currentvalue) {
            return currentvalue + 1;
        });

        //get vote values from firebase
        votebase.once('value',function(snap){
            votevalues.down = snap.val().Down;
            votevalues.up = snap.val().Up;

            //datta for vote chart
            var data = {
                labels: $.map(votevalues, function(value, key) { return key }),//flatten object get keys
                datasets: [
                    {
                        label: "My First dataset",
                        fillColor: "rgba(220,220,220,0.5)",
                        strokeColor: "rgba(220,220,220,0.8)",
                        highlightFill: "rgba(220,220,220,0.75)",
                        highlightStroke: "rgba(220,220,220,1)",
                        data: $.map(votevalues, function(value, key) { return value })//flatten object get values
                    }]};

            //initialize dialog for poll
            $("#poll-dialog").dialog({ // Set the settings for the jquery-ui dialog here.
                modal:true,
                autoOpen: false, // Don't open the dialog instantly. Let an event such as a button press open it. Optional.
                position: {my: "center", at: "center", of: "body"} // Set the position to center of the div.
            }).parent().resizable({ // Settings that will execute when resized.
                containment: "window" // Constrains the resizing to the div.
            }).draggable({ // Settings that execute when the dialog is dragged. If parent isn't used the text content will have dragging enabled.
                containment: "window", // The element the dialog is constrained to.
                opacity: 0.70 // Fancy opacity. Optional.
            });

            $("#poll-dialog").dialog("open"); //jquery ui dialog must be set up prior to modifying canvas

            //set up bar chart
            var ctx = $("#pollChart").get(0).getContext("2d");
            var myBarChart = new Chart(ctx).Bar(data);

        });
    }

     
