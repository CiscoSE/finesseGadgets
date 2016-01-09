//
//  Created by Brad McAllister on 11/21/15.
//  Copyright © 2016 BDM Enterprises, Inc. All rights reserved.

////////////////////////////
///// API Keys Go Here /////
///////////////////////////
var parseAppKey = ""; // Enter your Parse Application Key
var parseJavaKey = ""; // Enter your Parse Java Key


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
    var user,

    render = function () {

      // build list of the supervisor's teams
      var myTeams = user.getSupervisedTeams();
      var teamArray = [];
  	  $.each(myTeams, function (i, item) {
  		  teamArray.push(item.id);
  	    $('#team').append($('<option>', { 
  	        value: item.id,
  	        text : item.name 
  	    }));
  	  });
      
      // setup empty variables for search
      var qTeam = "";
      var qAgent = "";
      var qMsg = "";
      var qNumber = "";

      
      function msgHistory(qTeam, qAgent, qNumber, qMsg) {
        var historyTable = "";
        var interaction = Parse.Object.extend("Interaction");
        var query = new Parse.Query(interaction);

        if (qTeam){
          query.equalTo("team", qTeam);
        }else{
        	query.containedIn("team", teamArray);
        };

        if (qAgent){
          query.equalTo("agent", qAgent);
        };

        if (qNumber){
          query.equalTo("to", qNumber);
        };

        if (qMsg){
          query.contains("msg", qMsg);
        };
        
        query.descending("createdAt");
        //query.limit(6); // limits this to the 6 most recent
        query.find({
          success: function(results) {
            for (var i = 0; i < results.length; i++) {
              var object = results[i];
              historyTable += "<tr><td>" + niceTime(object.createdAt + "") + "</td><td>"+object.get('teamName')+"</td><td>"+object.get('agent')+"</td><td>"+object.get('to')+"</td><td>" + object.get('msg') + "</td></tr>";
            }
            $("#history tbody").html(historyTable);
            gadgets.window.adjustHeight();
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });
      };

      function niceTime(inputDate) {
        var splitDate = inputDate.split(" ");
        var splitTime = splitDate[4].split(":");
        var cleanDate = splitDate[1]+"/"+splitDate[2]+"/"+splitDate[3]+" - "+splitTime[0]+":"+splitTime[1];
        return cleanDate;
      };

        msgHistory(qTeam, qAgent, qNumber, qMsg);


        $("#search").click(function(event){
          event.preventDefault;

          qTeam = $("#team").val();
          qAgent = $("#agent").val();
          qMsg = $("#msgBody").val();
          qNumber = $("#msgNumber").val();

          msgHistory(qTeam, qAgent, qNumber, qMsg);

        });

        $("#reset").click(function(event){
          event.preventDefault;
          $("#team").prop('selectedIndex',0);
          $("#agent").val("");
          $("#msgNumber").val("");   
          $("#msgBody").val("");       
        });

    },
     
    /**
     * Handler for the onLoad of a User object.  This occurs when the User object is initially read
     * from the Finesse server.  Any once only initialization should be done within this function.
     */
    handleUserLoad = function (userevent) {
      render();
    };
	    
	/** @scope finesse.modules.supTropoGadget */
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
			clientLogs.init(gadgets.Hub, "supTropoGadget"); //this gadget id will be logged as a part of the message
	       user = new finesse.restservices.User({
				id: id, 
                onLoad : handleUserLoad
            });
			
			// Initiate the ContainerServices and add a handler for when the tab is visible
			// to adjust the height of this gadget in case the tab was not visible
			// when the html was rendered (adjustHeight only works when tab is visible)
			
			containerServices = finesse.containerservices.ContainerServices.init();
            containerServices.addHandler(finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB, function(){
			    clientLogs.log("Supervisor Tropo Gadget is now visible");  // log to Finesse logger
			   // automatically adjust the height of the gadget to show the html
		         gadgets.window.adjustHeight();
				
				   
			   });
            containerServices.makeActiveTabReq();
	    }
    };
}(jQuery));
