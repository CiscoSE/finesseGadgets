//
//  Created by Brad McAllister 
//  twitter: @bmcallister
//  email: bmcallis@cisco.com
//  Please check github for the latest version of this gadget. https://github.com/bdm1981/finesseGadgets
//  You can also post issues or requests at github. 
//

////////////////////////////
///// API Keys Go Here /////
///////////////////////////
var firebaseKey = ""; // Enter your Firebase secret


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
    var user, interactionData,

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
        var queryString = "";

        if(qTeam){
          queryString += "value.team === qTeam";
        }else{
          var myTeam = "";
          var teamsArray = user.getSupervisedTeams()
          var i = teamsArray.length;
          for (t = 0; t < i; t++){
            if (t == 1 && i > 1){
              queryString += "value.team === \"" + teamsArray[t].id + "\" || ";
            }else if (t < i - 1) {
              queryString += "value.team === \"" + teamsArray[t].id + "\" || ";
            }else{
              queryString += "value.team === \"" + teamsArray[t].id + "\"";
            };
          };
        };

        if(qAgent){
          if (queryString.length > 1){
            queryString += " && ";
          }
          queryString += "value.agent === qAgent";
        };

        if(qNumber){
          if (queryString.length > 1){
            queryString += " && ";
          }
          queryString += "value.to === qNumber";
        };

        if(qMsg){
          if (queryString.length > 1){
            queryString += " && ";
          }
          // convert message text to lowercase for searching
          qMsg = qMsg.toLowerCase();
          queryString += "(value.msg.toLowerCase().indexOf(qMsg) > -1)";
        };

        interactionData.limitToLast(1000).once('value', function(snapshot) {
        
          if (snapshot.exists()) {
            $.each(snapshot.val(), function(index, value) {
              if(eval(queryString)){
                showResults(value);
              };

            }); 
          };
              function showResults(value){
                var dateSent = new Date(value.dateSent);
                var dateSent = (dateSent.getMonth()+1)+ "-" +dateSent.getDate()+"-"+dateSent.getFullYear()+ " "+ dateSent.toLocaleTimeString();
                historyTable += "<tr><td>" + dateSent + "</td><td>"+value.teamName+"</td><td>"+value.agent+"</td><td>"+value.to+"</td><td>"+value.msg+"</td></tr>";
              };

          $("#history tbody").html(historyTable); 
          gadgets.window.adjustHeight();
        });
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
