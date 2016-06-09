//
//  Created by Brad McAllister 
//  twitter: @bmcallister
//	email: bmcallis@cisco.com
//  Please check github for the latest version of this gadget. https://github.com/bdm1981/finesseGadgets
//	You can also post issues or requests at github. 
//

////////////////////////////
///// API Keys Go Here /////
///////////////////////////
var firebaseKey = "";	// Enter your Firebase secret here
var tropoToken = "";	// Enter your Tropo messaging API Key

// If set to false, SMS will not be attempted.
var isValid = true;

var finesse = finesse || {};
finesse.gadget = finesse.gadget || {};
finesse.container = finesse.container || {};
clientLogs = finesse.cslogger.ClientLogger || {};  // for logging

// Gadget Config needed for instantiating ClientServices
/** @namespace */
finesse.gadget.Config = (function () {
	var _prefs = new gadgets.Prefs();

	/** @scope finesse.gadget.Config */
	return {
		authorization: _prefs.getString("authorization"),
		country: _prefs.getString("country"),
		language: _prefs.getString("language"),
		locale: _prefs.getString("locale"),
		host: _prefs.getString("host"),
		hostPort: _prefs.getString("hostPort"),
		extension: _prefs.getString("extension"),
		mobileAgentMode: _prefs.getString("mobileAgentMode"),
		mobileAgentDialNumber: _prefs.getString("mobileAgentDialNumber"),
		xmppDomain: _prefs.getString("xmppDomain"),
		pubsubDomain: _prefs.getString("pubsubDomain"),
		restHost: _prefs.getString("restHost"),
		scheme: _prefs.getString("scheme"),
		localhostFQDN: _prefs.getString("localhostFQDN"),
		localhostPort: _prefs.getString("localhostPort"),
		clientDriftInMillis: _prefs.getInt("clientDriftInMillis")
	};
}());

/** @namespace */
finesse.modules = finesse.modules || {};
finesse.modules.TropoGadget = (function ($) {
  var user, states, dialogs, interactionData,

  render = function () {		
    $("#template").change(function(){
     var message = $("#template").val();
     $("#msg").val(message);
   });

    $("#toMobile").change(function(){
     var to = $("#toMobile").val();

     validate(to);
   });

    $("#submit").click(function(event){
     event.preventDefault();
     var to = $("#toMobile").val();

     var msg = $("#msg").val();
     sendSMS(to, msg);
   });

    msgHistory($("#toMobile").val());

    gadgets.window.adjustHeight();
  },

  sendSMS = function(to, msg) {
    if (isValid){
			// adds the agent and team ID to to the SMS form
      var myId = user.getId(); 
      var myTeamId = user.getTeamId();
      var myTeamName = user.getTeamName();

      $.ajax({
        url: "https://api.tropo.com/1.0/sessions?action=create&token=" + tropoToken + "&msg=" + msg + "&to=" + to, dataType: "xml",
        success: function(data) {
          var success = $(data).find('success').first().text();
          var token = $(data).find('token').first().text();
          var id = $(data).find('id').first().text();
          if (success) {
            $("#msgCenter").append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>Your message was sent!</div>");
            $("#msg").val("");

            clientLogs.log("SMS Message Sent");

		          // save to firebase
             var dateSent = new Date();

             interactionData.push({
               to: to,
               dateSent: dateSent.toString(),
               msg: msg,
               agent: myId,
               team: myTeamId,
               teamName: myTeamName,
               msgId: id
             });

		          // update message history
		          msgHistory(to);
            }else{
              $("#msgCenter").append("<div class=\"alert alert-danger alert-dismissible\" role=\"alert\">There was an error sending your message. Check the number and try again.</div>")
            };

          }
        });
    };
  },

  msgHistory = function (to){
  clientLogs.log("Saving Message to history");
   var historyTable = "";

   interactionData.orderByChild("to").equalTo(to).limitToLast(6).once('value', function(snapshot) {

    if (snapshot.exists()) {
      $.each(snapshot.val(), function(index, value) {
        var dateSent = new Date(value.dateSent);
        var dateSent = (dateSent.getMonth()+1)+ "-" +dateSent.getDay()+"-"+dateSent.getFullYear()+ " "+ dateSent.toLocaleTimeString();
        historyTable += "<tr><td>"+ dateSent +"</td><td>"+value.agent+"</td><td>" + value.msg + "</td></tr>";
      }); 
    } ;

    $("#history tbody").html(historyTable); 
    gadgets.window.adjustHeight();
  });
 },

 validate = function (to){
	        // Validate NANP Phone number: 1+XXX.XXX.XXXX This can be updated to reflect your regions numbering plan
	        if (to.length == 10){
	        	to = "1"+ to;
	        }else if (to.length < 10 || to.length > 11){
	        	isValid = false;
	        	$("#msgCenter").append("<div class=\"alert alert-danger alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>Please Enter a valid Mobile Number</div>");
	        	return;
	        };

	    	// if the number is valid the msgCenter alerts are cleared	        
       $('#msgCenter').empty();
       isValid = true;
       $("#toMobile").val(to);
	        //pull message history for valid number
	        msgHistory(to);
        },

        displayCall = function (dialog){
          var number = "";
          var direction = "";

    	// determine call direction
    	switch(dialog.getMediaProperties().callType){
    		case "ACD_IN":
       direction = "inbound";
       break;
       case "TRANSFER":
       direction = "inbound";
       break;
       case "OTHER_IN":
       direction = "inbound";
       break;
       case "OUT":
       direction = "outbound";
       break;
       case "OUTBOUND":
       direction = "outbound";
       break;
       case "OUTBOUND_PREVIEW":
       direction = "outbound";
       break;
       default:
       direction = "inbound";
     };

		// set number based off the direction of the call
   if (direction === "inbound"){
    number = dialog.getFromAddress();
  }else{
    number = dialog.getMediaProperties().dialedNumber;
  };

  var callVars = dialog.getMediaProperties();
  validate(number);    
},

_processCall = function (dialog) {
  displayCall(dialog);	
},
    /**
     *  Handler for additions to the Dialogs collection object.  This will occur when a new
     *  Dialog is created on the Finesse server for this user.
     */
     handleNewDialog = function(dialog) {

     	 // add a dialog change handler in case the callvars didn't arrive yet
        dialog.addHandler('change', _processCall);

	     // call the displayCall handler
      displayCall (dialog);


    },

    /**
     *  Handler for deletions from the Dialogs collection object for this user.  This will occur
     *  when a Dialog is removed from this user's collection (example, end call)
     */
     handleEndDialog = function(dialog) {
    	// Clear the fields when the call is ended
      $("#toMobile").val("");
      $("#history tbody").html("<tr><td></td><td></td></tr>");
      $('#msgCenter').empty();
    },

    /**
     * Handler for the onLoad of a User object.  This occurs when the User object is initially read
     * from the Finesse server.  Any once only initialization should be done within this function.
     */
     handleUserLoad = function (userevent) {
        // Get an instance of the dialogs collection and register handlers for dialog additions and
        // removals
        dialogs = user.getDialogs( {
          onCollectionAdd : handleNewDialog,
          onCollectionDelete : handleEndDialog
        });

        render();
      },
      
    /**
     *  Handler for all User updates
     */
     handleUserChange = function(userevent) {
     };

     /** @scope finesse.modules.agentTropoGadget */
     return {

	    /**
	     * Performs all initialization for this gadget
	     */
      init : function () {
       var prefs =  new gadgets.Prefs(),
       id = prefs.getString("id");
			var clientLogs = finesse.cslogger.ClientLogger;   // declare clientLogs

			// Initialize Firebase
			interactionData = new Firebase("https://your app name.firebaseio.com/"); // Enter your application URL here
			interactionData.authWithCustomToken(firebaseKey, function(error,result) {
       if (error) {
         clientLogs.log("Authentication Failed!", error);
       } else {
         clientLogs.log("Authenticated successfully");
       }
     });

     gadgets.window.adjustHeight();

	        // Initiate the ClientServices and load the user object.  ClientServices are
	        // initialized with a reference to the current configuration.
	        finesse.clientservices.ClientServices.init(finesse.gadget.Config);
			clientLogs.init(gadgets.Hub, "TropoGadget"); //this gadget id will be logged as a part of the message
     user = new finesse.restservices.User({
      id: id, 
      onLoad : handleUserLoad,
      onChange : handleUserChange
    });

     states = finesse.restservices.User.States;

			// Initiate the ContainerServices and add a handler for when the tab is visible
			// to adjust the height of this gadget in case the tab was not visible
			// when the html was rendered (adjustHeight only works when tab is visible)
			
			containerServices = finesse.containerservices.ContainerServices.init();
      containerServices.addHandler(finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB, function(){
			    clientLogs.log("Gadget is now visible");  // log to Finesse logger
			   // automatically adjust the height of the gadget to show the html
        gadgets.window.adjustHeight();


      });
      containerServices.makeActiveTabReq();
    }
  };
}(jQuery));