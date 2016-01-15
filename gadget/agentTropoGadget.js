//
//  Created by Brad McAllister on 11/21/15.
//  Copyright © 2016 BDM Enterprises, Inc. All rights reserved.
//

////////////////////////////
///// API Keys Go Here /////
///////////////////////////
var parseAppKey = "";	// Enter your Parse Application Key
var parseJavaKey = "";	// Enter your Parse Java Key
var tropoToken = "";	// Enter your Tropo messaging API Key

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
    var user, states, dialogs, 

    render = function () {		
		  $("#template").change(function(){
	        var message = $("#template").val();
	        $("#msg").val(message);
	      });

	      $("#toMobile").change(function(){
	        var to = $("#toMobile").val();

	        // Validate NANP Phone number: 1+XXX.XXX.XXXX This can be updated to reflect your regions numbering plan
	        if (to.length == 10){
	        	to = "1"+ to;
	        	$("#toMobile").val(to);
	        }else if (to.length < 10 || to.length > 11){
	        	$("#msgCenter").append("<div class=\"alert alert-danger alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>Please Enter a valid Mobile Number</div>");
	        	return;
	        };
	        $('#msgCenter').empty();
	        msgHistory(to);
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
	            $("#msgCenter").append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>Your message was sent!</div>")
	          $("#msg").val("")
	          
	          // save to parse
	          var Interaction = Parse.Object.extend("Interaction");
	          var newSMS = new Interaction();
	          newSMS.save({to: to, msg: msg, agent: myId, team: myTeamId, teamName: myTeamName, msgId: id, msgToken: token}).then(function(object) {
	          });
	          // update message history
	          msgHistory(to);
	          }else{
	            $("#msgCenter").append("<div class=\"alert alert-danger alert-dismissible\" role=\"alert\">There was an error sending your message. Check the number and try again.</div>")
	          };

	      }
	    });
	},

    msgHistory = function (to){
	  var historyTable = "";
      var interaction = Parse.Object.extend("Interaction");
      var query = new Parse.Query(interaction);
      query.equalTo("to", to);
      query.descending("createdAt");
      query.limit(6); // limits this to the 6 most recent
      query.find({
        success: function(results) {
          $("#history tbody").html("<tr><td></td><td></td></tr>");
          for (var i = 0; i < results.length; i++) {
            var object = results[i];
            historyTable += "<tr><td>" + niceTime(object.createdAt + "") + "</td><td>"+object.get('agent')+"</td><td>" + object.get('msg') + "</td></tr>";
          }
          $("#history tbody").html(historyTable);
          gadgets.window.adjustHeight();
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });

      	// clean up the date/time format for the web view
      	function niceTime(inputDate) {
	      var splitDate = inputDate.split(" ");
	      var splitTime = splitDate[4].split(":");
	      var cleanDate = splitDate[1]+"/"+splitDate[2]+"/"+splitDate[3]+" - "+splitTime[0]+":"+splitTime[1];
	      return cleanDate;
	    };
    },
    
	displayCall = function (dialog){
	
	    var callVars = dialog.getMediaProperties();
        $("#toMobile").val("1" + dialog.getFromAddress());
        msgHistory($("#toMobile").val());
	    
	},
    
	_processCall = function (dialog) {
	     displayCall(dialog);
			
	},
    /**
     *  Handler for additions to the Dialogs collection object.  This will occur when a new
     *  Dialog is created on the Finesse server for this user.
     */
     handleNewDialog = function(dialog) {
	     // call the displayCall handler
		 displayCall (dialog);
        
		 // add a dialog change handler in case the callvars didn't arrive yet
		 dialog.addHandler('change', _processCall);
		
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

			// Initialize Parse
			Parse.initialize(parseAppKey, parseJavaKey);

	        gadgets.window.adjustHeight();
	        
	        // Initiate the ClientServices and load the user object.  ClientServices are
	        // initialized with a reference to the current configuration.
	        finesse.clientservices.ClientServices.init(finesse.gadget.Config);
			clientLogs.init(gadgets.Hub, "agentTropoGadget"); //this gadget id will be logged as a part of the message
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
			    clientLogs.log("Agent Tropo Gadget is now visible");  // log to Finesse logger
			   // automatically adjust the height of the gadget to show the html
		         gadgets.window.adjustHeight();
				
				   
			   });
            containerServices.makeActiveTabReq();
	    }
    };
}(jQuery));
