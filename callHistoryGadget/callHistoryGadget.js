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
var callCounter = {"inbound":{"count": 0, "duration": 0}, "outbound": {"count": 0, "duration": 0}};

var accessCode = config.accessCode;

//Agent state change preferences
var reasonID = config.reasonID;
var wasReady = false; // This allows the gadget to move the agent back into a ready state after a callback is made.

//Default Sorting order
var sortMethod = "date";
var sortDir = "D"; // Ascending

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
			clientLogs.log('Loading the following config parameters: ' + JSON.stringify(config));
		// Load history from local storage if present
		if (calls.length < 1){
			// Retrieve the object from storage
			var retrievedArray = JSON.parse(localStorage.getItem(user.getId() + "_calls"));

			// check to make sure localstorage contained calls
			if (retrievedArray){
				// check to make sure data isn't over a day old
				var currentDay = start.getDate();
				var currentMonth = start.getMonth();

				// sort calls so that the oldest call is first.
				var sortTime = sortObjectBy(retrievedArray, "date", "D");

				var retrievedDate = new Date(sortTime[0].date);
				var retrievedDay = retrievedDate.getDate();
				var retrievedMonth = retrievedDate.getMonth();

				if ((currentMonth == retrievedMonth && currentDay > retrievedDay) || (currentMonth > retrievedMonth && currentDay < retrievedDay)){
					clientLogs.log("Purging old data!");
					// Purge cached data
					localStorage.removeItem(user.getId() + "_calls");
					localStorage.removeItem(user.getId() + "_trackDialog");
					calls = [];
				}else{
					//creating date objects for cached data
					for(var i = 0; i < retrievedArray.length; i++) {
			    		retrievedArray[i].date = new Date(retrievedArray[i].date);
					};
					clientLogs.log("Using cached data");
					// Write cached calls to local array
					calls = retrievedArray;
					// Tally Existing Calls
					tallyCalls();
				};
			}; // end if retreived Array
		}; // end call length

		$(document).on('click', '#date, #direction, #duration, #number, #detail', function() {
			if(sortMethod == $(this).attr("id") && sortDir == "A"){
				sortBy($(this).attr("id"), "D");
				sortDir = "D";
			}else if (sortMethod == $(this).attr("id") && sortDir == "D"){
				sortBy($(this).attr("id"), "A");
				sortDir = "A";
			}else{
				sortBy($(this).attr("id"), "A");
				sortMethod = $(this).attr("id");
				sortDir = "A";
			}
			// Update calls in local storage
			localStorage.setItem(user.getId() + "_calls", JSON.stringify(calls));
		});

		// Loads call history on startup
	    loadHistory(user.getId());

        var currentState = user.getState();
        gadgets.window.adjustHeight('680');
    },

    tallyCalls = function (){
    	for(var i = 0; i < calls.length; i++){
    		if(calls[i].direction == "Outbound"){
    			callCounter.outbound.count++;
    			callCounter.outbound.duration += calls[i].seconds;
    		}else if(calls[i].direction == "Inbound" || calls[i].direction == "xfer in"){
    			callCounter.inbound.count++;
    			callCounter.inbound.duration += calls[i].seconds;
    		}
    	}
    },

    recordCall = function (agent, number, direction, counters, detail){
    	// capture the time difference in seconds
    	var seconds = timeDiff(counters.startTime, counters.stateChangeTime);
    	// format the seconds in a format for display
    	var duration = displayTime(seconds);
    	// number validation
    	if (number.length == 10){
    		number = "1"+number;
    	}else if(number.length == 12 && number[0] == accessCode){
    		// remove access code
    		number = number.slice(1);
    	};

		var callDate = new Date(counters.startTime);
		var myCall = new Object();

		myCall.date = callDate;
		myCall.agent = agent;
		myCall.number = number;
		myCall.direction = direction.desc;
		myCall.seconds = seconds;
		myCall.duration = duration;
		myCall.detail = detail; // set to the call Variable you would like displayed in the "detail" column of the call History

		// Increment call Tally and durations
		if(direction.dir == "in"){
			callCounter.inbound.count++;
			callCounter.inbound.duration += seconds;
		}else if(direction.dir == "out"){
			callCounter.outbound.count++;
			callCounter.outbound.duration += seconds;
		};

		// Add call information to the calls array
		clientLogs.log("Call added to local array");
		calls.push(myCall);
		sortBy(sortMethod, sortDir);

		// Save to localstorage as well
		localStorage.setItem(agent + "_calls", JSON.stringify(calls));


		//calculate call duration
		function timeDiff(start, stop){
			var a = new Date(start);
			var b = new Date(stop);
			var duration = "";

			// calculate call in seconds
			var seconds = Math.floor((b - a) / 1000);

			return seconds;
		}

		// load call history with the latest call
		loadHistory(agent);
	},

	displayTime = function (seconds){
		if(seconds <= 9){
			var duration = "00:00:0"+seconds;
		}else{
			var duration = "00:00:" + seconds;
		};

		// calculate call in minutes
		if (seconds > 60){
			var minutes = Math.floor(seconds / 60);
			// check to for single digits. If a single digit prepend a 0
			if(minutes <= 9){
				var minDisplay = "0"+minutes;
			}else{
				var minDisplay = minutes;
			};

			var sec = Math.floor(seconds - (minutes * 60));
			// check to for single digits. If a single digit prepend a 0
			if(sec <= 9){
				var secDisplay = "0"+sec;
			}else{
				var secDisplay = sec;
			}

			duration = "00:"+minDisplay+":"+secDisplay;
		};

		// calculate call in hours & minutes
		if (minutes !== "" && minutes > 60){
			var hours = Math.floor(minutes / 60);
			// check to for single digits. If a single digit prepend a 0
			if(hours <= 9){
				var hourDisplay = "0"+hours;
			}else{
				var hourDisplay = hours;
			};

			minutes = Math.floor(minutes - (hours * 60));
			// check to for single digits. If a single digit prepend a 0
			if(minutes <= 9){
				var minDisplay = "0"+minutes;
			}else{
				var minDisplay = minutes;
			};

			seconds = Math.floor(seconds - (hours * 60 + (minutes)) * 60);
			// check to for single digits. If a single digit prepend a 0
			if(sec <= 9){
				var secDisplay = "0"+sec;
			}else{
				var secDisplay = sec;
			}

			duration = hourDisplay+":"+minDisplay+":"+secDisplay;
		};

		return duration;
	},

	sortObjectBy = function(array, srtKey, srtOrder){
	    if (srtOrder =="A"){
	        if (srtKey == "direction" || srtKey == "number"){
	            return array.sort(function (a, b) {
	                var x = a[srtKey].toLowerCase(); var y = b[srtKey].toLowerCase();
	                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	            });
	        }else{
	        return array.sort(function (a, b) {
	            var x = a[srtKey]; var y = b[srtKey];
	            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	        });

	        }
	    }

	    if (srtOrder =="D"){
	        if (srtKey =="type" || srtKey =="number"){
	            return array.sort(function (a, b) {
	                var x = a[srtKey].toLowerCase(); var y = b[srtKey].toLowerCase();
	                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	            });
	        }else{
				return array.sort(function (a, b) {
	            var x = a[srtKey]; var y = b[srtKey];
	            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	        });

	        }
	    }
	},

	sortBy = function (srtValue, srtOrder){
		calls = sortObjectBy(calls,srtValue,srtOrder);
		loadHistory(user.getId());
	},

	loadHistory = function (agent) {
		var inTotal = displayTime(callCounter.inbound.duration);
		var outTotal = displayTime(callCounter.outbound.duration);
		var tallyTable = "";
		tallyTable += '<tr><td>Inbound</td><td>'+callCounter.inbound.count+'</td><td>'+inTotal+'</td></tr>';
		tallyTable += '<tr><td>Outbound</td><td>'+callCounter.outbound.count+'</td><td>'+outTotal+'</td></tr>';

		$("#tally tbody").html(tallyTable);

		//var myAgentId = user.getId();
		var historyTable = "";

		// Call history is pulled from the calls array. This is created when finesse loads
		for (var i in calls){
			if(calls[i].detail){
				var detail = calls[i].detail;
			}else{
				var detail = "N/A";
			}

			// Prepend Access Code on 11 digit numbers
			var num = calls[i].number;
	    	if (num.length == 11){
	    		num = accessCode+num;
	    	};
			historyTable += "<tr><td>"+ calls[i].date.toLocaleTimeString() +"</td><td>" + calls[i].direction +"</td><td>"+ calls[i].duration +"</td><td>"+ calls[i].number +"</td><td>"+ detail +"</td><td><button onClick=\"finesse.modules.callHistoryGadget.makeCall(" + num + ")\">Call Back</button></td></tr>";
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
			// Capture important details about the current call dialog
     	var currentCall = new Object();
     	currentCall.id = dialog._id;
     	currentCall.type = dialog.getMediaProperties().callType;
     	currentCall.to = dialog.getToAddress();
     	currentCall.from = dialog.getFromAddress();
     	currentCall.counters = dialog.getParticipantTimerCounters(user.getExtension());
			// Store this call information in the trackDiaglog array each new dialog update clear the dialog info.
     	trackDialog.push(currentCall);
			//Write the trackDiaglog to localStorage. this will be reloaded if the browser is closed or refreshed
			localStorage.setItem(user.getId() + "_trackDialog", JSON.stringify(trackDialog));
     	clientLogs.log("New call arrived");

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
			clientLogs.log("Handling End Dialog");
    	var number = "";
    	var direction = {};

			// If the trackDialog in memory is empty, load data from localStorage
			if(trackDialog.length < 1){
				clientLogs.log("Loading Track Dialog from localStorage");
				trackDialog = JSON.parse(localStorage.getItem(user.getId() + "_trackDialog"));
			};

		// determine call direction
		for (var i = 0; i < trackDialog.length; i++){
			if (trackDialog[i].id == dialog._id){
				switch(trackDialog[i].type){
		    		case "ACD_IN":
		    			number = dialog.getFromAddress();
		    			direction.desc = "Inbound";
              direction.dir = "in";
		    		break;
		    		case "TRANSFER":
		    			number = dialog.getFromAddress();
		    			direction.desc = "Transfer In";
              direction.dir = "in";
		    		break;
		    		case "OTHER_IN":
		    			number = dialog.getFromAddress();
		    			direction.desc = "Inbound";
              direction.dir = "in";
		    		break;
		    		case "OUT":
		    			number = dialog.getToAddress();
		    			direction.desc = "Outbound";
              direction.dir = "out";
		    		break;
		    		case "OUTBOUND":
		    			number = dialog.getToAddress();
		    			direction.desc = "Outbound";
              direction.dir = "out";
		    		break;
		    		case "OUTBOUND_PREVIEW":
		    			number = dialog.getToAddress();
		    			direction = "Preview Out";
              direction.dir = "out";
		    		break;
		    		case "CONSULT":
		    			if (dialog.getToAddress() == user.getExtension()){
		    				number = dialog.getFromAddress();
		    				direction.desc = "Consult From";
                direction.dir = "in";
		    			}else{
		    				number = dialog.getToAddress();
		    				direction.desc = "Consult To";
                direction.dir = "out";
		    			};
		    		break;
            case "CONFERENCE":
              number = dialog.getFromAddress();
              direction.desc = "Conference In";
              direction.dir = "in";
              clientLogs.log(dialog.getParticipants());
            break;
		    		case "SUPERVISOR_MONITOR":
		    			direction.desc = "SM";
              direction.dir = "SM";
		    		break;
		    		default:
		    			number = dialog.getFromAddress();
		    			direction.desc = "n/a";
              direction.dir = "n/a";
				};
			};
		};

    clientLogs.log("Classified calls as: "+ JSON.stringify(direction));

		// check for additional call dialogs
		for(var i = 0; i < trackDialog.length; i++) {
			if (direction.dir == "SM"){
				//do not write to history
			}else if(trackDialog[i].id == dialog._id) {
				var callVars = dialog.getMediaProperties();
        		trackDialog[i].counters.stateChangeTime = dialog.getParticipantTimerCounters(user.getExtension()).stateChangeTime;
       	 		// Save Call to callHistory Gadget
				recordCall(user.getId(), number, direction, trackDialog[i].counters, callVars[config.callDetail]);
				// remove call from trackDiaglog in memory and localstorage
				trackDialog.splice(i, 1);
				localStorage.removeItem(user.getId() + "_trackDialog");
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
