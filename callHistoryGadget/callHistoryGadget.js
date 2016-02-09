//
//  Created by Brad McAllister 
//  twitter: @bmcallister
//	email: bmcallis@cisco.com
//  Please check github for the latest version of this gadget. https://github.com/bdm1981/finesseGadgets
//	You can also post issues or requests at github. 
//

var start = new Date();
start.setHours(0,0,0,0);

// create array for tracking calls and one for tracking active dialogs
var calls = [];
var trackDialog = [];	

//Agent state change preferences
var reasonID = { id: '5' }; // This reasonID must be created in UCCX
var wasReady = false; // This allows the gadget to move the agent back into a ready state after a callback is made.

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
finesse.modules.callHistoryGadget = (function ($) {
    var user, states, dialogs, 
    
    render = function () {
		// Load history from local storage if present
		if (calls.length < 1){
			// Retrieve the object from storage
			var retrievedArray = JSON.parse(localStorage.getItem(user.getId() + "_calls"));

			// check to make sure localstorage contained calls
			if (retrievedArray){
				// check to make sure data isn't over a day old
				if ((start - new Date(retrievedArray[0].date)) < 36000000 ){ // 10 hours
					var delta = start - new Date(retrievedArray[0].date);
					for(var i = 0; i < retrievedArray.length; i++) {
			    		retrievedArray[i].date = new Date(retrievedArray[i].date);
					};
					// write calls to local array
					calls = retrievedArray;
				}else{
					// purge old data
					localStorage.removeItem(user.getId() + "_calls");
				};
			};
		};

		// Loads call history on startup
	    loadHistory(user.getId());

        var currentState = user.getState();
        gadgets.window.adjustHeight('680');
    },

    recordCall = function (agent, number, direction, counters){

    	var callDuration = duration(counters.startTime, counters.stateChangeTime);

    	// number validation
    	if (number.length == 10){
    		number = "1"+number;
    	};

		var callDate = new Date();
		var myCall = new Object();
		
		myCall.date = callDate;
		myCall.agent = agent;
		myCall.number = number;
		myCall.direction = direction;
		myCall.duration = callDuration;

		// Add call information to the calls array
		calls.push(myCall);

		// Save to localstorage as well
		localStorage.setItem(agent + "_calls", JSON.stringify(calls));


		//calculate call duration
		function duration(start, stop){
			var a = new Date(start);
			var b = new Date(stop);
			var duration = "";

			// calculate call in seconds
			var seconds = Math.floor((b - a) / 1000);
			var duration = "00:00:" + seconds;                     

			// calculate call in minutes
			if (seconds > 60){                                      
			var minutes = Math.floor(seconds / 60);
			var sec = Math.floor(seconds - (minutes * 60));
			duration = "00:"+minutes+":"+sec;
			};

			// calculate call in hours & minutes
			if (minutes !== "" && minutes > 60){
			var hours = Math.floor(minutes / 60);
			minutes = Math.floor(minutes - (hours * 60));
			seconds = Math.floor(seconds - (hours * 60 + (minutes)) * 60);
			duration = hours+":"+minutes+":"+seconds;
			};

			return duration;
		}
		// load call history with the latest call
		loadHistory(agent);
	},

	loadHistory = function (agent) {
		//var myAgentId = user.getId();
		var historyTable = "";

		// Call history is pulled from the calls array. This is created when finesse loads
		for (var i in calls){
			historyTable += "<tr><td>"+ calls[i].date.toLocaleTimeString() +"</td><td>" + calls[i].direction +"</td><td>"+ calls[i].duration +"</td><td>"+ calls[i].number +"</td><td><button onClick=\"finesse.modules.callHistoryGadget.makeCall(" + calls[i].number + ")\">Call Back</button></td></tr>";
		};
		$("#history tbody").html(historyTable);

	},
	displayCall = function (dialog){
		for(var i = 0; i < trackDialog.length; i++) {
    		if(trackDialog[i].id == dialog._id) {
        		trackDialog[i].to = dialog.getToAddress();
       	 		break;
    		};	
		};
	},

		_processCall = function (dialog) {
			 displayCall (dialog);
	},
    /**
     *  Handler for additions to the Dialogs collection object.  This will occur when a new
     *  Dialog is created on the Finesse server for this user.
     */
     handleNewDialog = function(dialog) {
     	var currentCall = new Object();
     	currentCall.id = dialog._id;
     	currentCall.type = dialog.getMediaProperties().callType;
     	currentCall.to = dialog.getToAddress();
     	currentCall.from = dialog.getFromAddress();
     	currentCall.counters = dialog.getParticipantTimerCounters(user.getExtension());
     	trackDialog.push(currentCall);

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
    	var number = "";
    	var direction = "";
		
		// determine call direction
		for (var i = 0; i < trackDialog.length; i++){
			if (trackDialog[i].id == dialog._id){
				switch(trackDialog[i].type){
		    		case "ACD_IN":
		    			number = dialog.getFromAddress();
		    			direction = "Inbound";
		    		break;
		    		case "TRANSFER":
		    			number = dialog.getToAddress();
		    			direction = "xfer in";
		    		break;
		    		case "OTHER_IN":
		    			number = dialog.getFromAddress();
		    			direction = "Inbound";
		    		break;
		    		case "OUT":
		    			number = dialog.getToAddress();
		    			direction = "Outbound";
		    		break;
		    		case "OUTBOUND":
		    			number = dialog.getToAddress();
		    			direction = "Outbound";
		    		break;
		    		case "OUTBOUND_PREVIEW":
		    			number = dialog.getToAddress();
		    			direction = "preview out";
		    		break;
		    		case "CONSULT":
		    			if (dialog.getToAddress() == user.getExtension()){
		    				number = dialog.getFromAddress();
		    				direction = "Consult From";
		    			}else{
		    				number = dialog.getToAddress();
		    				direction = "Consult To";
		    			};
		    		break;
		    		default:
		    			number = dialog.getFromAddress();
		    			direction = "n/a";
				};
			};
		};

		// check for additional call dialogs
		for(var i = 0; i < trackDialog.length; i++) {
    		if(trackDialog[i].id == dialog._id) {
        		trackDialog[i].counters.stateChangeTime = dialog.getParticipantTimerCounters(user.getExtension()).stateChangeTime;
       	 		// Save Call to callHistory Gadget
				recordCall(user.getId(), number, direction, trackDialog[i].counters);
				trackDialog.splice(i, 1);
    		};	
		};

		// Set agent ready if required
		if (wasReady === true){
			user.setState("READY");
			wasReady = false;
		};
    },
    
    /**
     * Handler for makeCall when successful.
     */
    makeCallSuccess = function(rsp) {
    },
    
    /**
     * Handler for makeCall when error occurs.
     */
    makeCallError = function(rsp) {
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
        render();
    };
	    
	/** @scope finesse.modules.SampleGadget */
	return {
	    /**
	     * Sets the user state
	     */
	    setUserState : function (state) {
	        if (state === 'READY') {
	            user.setState(states.READY);
	        } else if (state === 'NOT_READY') {
	            user.setState(states.NOT_READY);
	        }
	    },
	    
	    /**
	     * Make a call to the number
	     */
	    makeCall : function (number) {
	    	// automatically move agents into a not ready state with the reason code defined by "reasonID"
			var currentState = user.getState();
	     	if ( currentState == "READY" ) {
	          user.setState(states.NOT_READY, reasonID);
	          wasReady = true;
	      	};

        	user.makeCall(number, {
				success: makeCallSuccess,
				error: makeCallError
			});
	    },
	        
	    /**
	     * Performs all initialization for this gadget
	     */
	    init : function () {
			var prefs =  new gadgets.Prefs(),
			id = prefs.getString("id");
			var clientLogs = finesse.cslogger.ClientLogger;   // declare clientLogs

	        gadgets.window.adjustHeight('680');
	        
	        // Initiate the ClientServices and load the user object.  ClientServices are
	        // initialized with a reference to the current configuration.
	        finesse.clientservices.ClientServices.init(finesse.gadget.Config);
			clientLogs.init(gadgets.Hub, "Call History Gadget"); //this gadget id will be logged as a part of the message
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
			    clientLogs.log("Call History Gadget is now visible");  // log to Finesse logger
			   // automatically adjust the height of the gadget to show the html

		         gadgets.window.adjustHeight('680');
				
				   
			   });
            containerServices.makeActiveTabReq();
	    }
    };
}(jQuery));
