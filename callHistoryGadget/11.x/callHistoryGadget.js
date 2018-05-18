/* 
Copyright (c) 2018 Cisco and/or its affiliates.

This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.0 (the "License"). You may obtain a copy of the
License at

               https://developer.cisco.com/docs/licenses

All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied. 
*/

var start = moment().startOf('day');

// create array for tracking calls and one for tracking active dialogs
var calls = [];
var trackDialog = [];
var callCounter = {"inbound":{"count": 0, "duration": 0}, "outbound": {"count": 0, "duration": 0}};

var accessCode = config.accessCode;

//Agent state change preferences
var reasonID = config.reasonID;
var wasReady = false; // This allows the gadget to move the agent back into a ready state after a callback is made.

//Default Sorting order
var sortMethod = localStorage.getItem('sortMethod') || "date";
var sortDir = localStorage.getItem('sortDir') || "D"; 

var finesse = finesse || {};
finesse.gadget = finesse.gadget || {};
finesse.container = finesse.container || {};
clientLogs = finesse.cslogger.ClientLogger || {};  // for logging

/** @namespace */
finesse.modules = finesse.modules || {};
finesse.modules.callHistoryGadget = (function ($) {
    var user, states, dialogs,

    render = function () {
			clientLogs.log('Loading the following config parameters: ' + JSON.stringify(config));
      clientLogs.log('sort Method on load: '+sortMethod);
  		
      // Load history from local storage if present
  		if (calls.length < 1){
  			// Retrieve the object from storage
  			var retrievedArray = JSON.parse(localStorage.getItem(user.getId() + "_calls"));

  			// check to make sure localstorage contained calls
  			if (retrievedArray){
  				// sort calls so that the oldest call is first.
          var sortTime;
  				sortObjectBy(retrievedArray, "date", "A")
          .then(function(calls){
            clientLogs.log('time sort: '+ calls);
            sortTime = calls;
          });

  				var retrievedDate = moment(sortTime[0].date).startOf('day');

  				if (!moment(start).isSame(retrievedDate)){
  					clientLogs.log("Purging old data!");
  					// Purge cached data
  					localStorage.removeItem(user.getId() + "_calls");
  					localStorage.removeItem(user.getId() + "_trackDialog");
  					calls = [];
  				}else{
  					//creating date objects for cached data
  					for(var i = 0; i < retrievedArray.length; i++) {
  			    		retrievedArray[i].date = moment(retrievedArray[i].date);
  					}
  					clientLogs.log("Using cached data");
  					// Write cached calls to local array
  					calls = retrievedArray;
  					// Tally Existing Calls
            clientLogs.log(calls);
  					tallyCalls();
  				}
  			} // end if retreived Array
  		} // end call length

		  // Loads call history on startup
      sortObjectBy(calls,sortMethod,sortDir)
      .then(function(sortedCalls){
        calls = sortedCalls;
        clientLogs.log('my calls: '+calls);
        loadHistory(user.getId());
      });
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
      var seconds = moment(counters.stateChangeTime).diff(counters.startTime, 'seconds');

    	// format the seconds in a format for display
    	var duration = displayTime(seconds);

			// remove + from +e164 formatted numbers
			if(number === null){
				number = 'n/a';
			}else if(number[0] === "+"){
        number = number.slice(1);
      }

    	// number validation
    	if (number.length == 10){
    		number = "1"+number;
    	}else if(number.length == 12 && number[0] == accessCode){
    		// remove access code
    		number = number.slice(1);
    	}

  		var myCall = {};
  		myCall.date = counters.startTime;
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
  		}

      // Add call information to the calls array
      clientLogs.log("Call added to local array");
      calls.push(myCall);

      // Save to localstorage as well
      localStorage.setItem(agent + "_calls", JSON.stringify(calls));

      // Convert date to moment object
      calls[calls.length-1].date = moment(calls[calls.length-1].date);

	},

	displayTime = function (seconds){
    var duration, minDisplay, secDisplay, hourDisplay, minutes, sec;
		if(seconds <= 9){
			duration = "00:00:0"+seconds;
		}else{
			duration = "00:00:" + seconds;
		}

		// calculate call in minutes
		if (seconds > 60){
			minutes = Math.floor(seconds / 60);
			// check to for single digits. If a single digit prepend a 0
			if(minutes <= 9){
				minDisplay = "0"+minutes;
			}else{
				minDisplay = minutes;
			}

			sec = Math.floor(seconds - (minutes * 60));
			// check to for single digits. If a single digit prepend a 0
			if(sec <= 9){
				secDisplay = "0"+sec;
			}else{
				secDisplay = sec;
			}
			duration = "00:"+minDisplay+":"+secDisplay;
		}

		// calculate call in hours & minutes
		if (minutes !== "" && minutes > 60){
			var hours = Math.floor(minutes / 60);
			// check to for single digits. If a single digit prepend a 0
			if(hours <= 9){
				hourDisplay = "0"+hours;
			}else{
				hourDisplay = hours;
			}

			minutes = Math.floor(minutes - (hours * 60));
			// check to for single digits. If a single digit prepend a 0
			if(minutes <= 9){
				minDisplay = "0"+minutes;
			}else{
				minDisplay = minutes;
			}

			seconds = Math.floor(seconds - (hours * 60 + (minutes)) * 60);
			// check to for single digits. If a single digit prepend a 0
			if(sec <= 9){
				secDisplay = "0"+sec;
			}else{
				secDisplay = sec;
			}

			duration = hourDisplay+":"+minDisplay+":"+secDisplay;
		}

		return duration;
	},

	sortObjectBy = function(array, srtKey, srtOrder){
    console.log(array);
    var _def = $.Deferred();
    var sorted;
    if (srtOrder =="A"){
      if (srtKey == "direction" || srtKey == "number"){
        sorted = array.sort(function (a, b) {
          var x = a[srtKey].toLowerCase(); var y = b[srtKey].toLowerCase();
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
      }else{
        sorted = array.sort(function (a, b) {
          var x = a[srtKey]; var y = b[srtKey];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
      }
    }else if(srtOrder =="D"){
      if (srtKey =="type" || srtKey =="number"){
        sorted = array.sort(function (a, b) {
          var x = a[srtKey].toLowerCase(); var y = b[srtKey].toLowerCase();
          return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
      }else{
        sorted = array.sort(function (a, b) {
          var x = a[srtKey]; var y = b[srtKey];
          return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
      }
    }

    return _def.resolve(sorted);
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
    var detail;

		// Call history is pulled from the calls array. This is created when finesse loads
		for (var i in calls){
			if(calls[i].detail){
				detail = calls[i].detail;
			}else{
				detail = "N/A";
			}

			// Prepend Access Code on 11 digit numbers
			var num = calls[i].number;
	    	if (num.length == 11){
	    		num = accessCode+num;
	    	}
			historyTable += "<tr><td>"+ moment(calls[i].date).format('LTS') +"</td><td>" + calls[i].direction +"</td><td>"+ calls[i].duration +"</td><td>"+ calls[i].number +"</td><td>"+ detail +"</td><td><button onClick=\"finesse.modules.callHistoryGadget.makeCall('" + num + "')\">Call Back</button></td></tr>";
		}
		$("#history tbody").html(historyTable);

    // apply sort identifier
    if(sortDir === "D"){
      $('.sort[data-sort="'+sortMethod+'"]').addClass('desc');
    }else{
      $('.sort[data-sort="'+sortMethod+'"]').addClass('asc');
    }

	},
	displayCall = function (dialog){
		for(var i = 0; i < trackDialog.length; i++) {
    		if(trackDialog[i].id == dialog._id) {
        		trackDialog[i].to = dialog.getToAddress();
       	 		break;
    		}
		}
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
    var currentCall = {};
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
    var i;

    // If the trackDialog in memory is empty, load data from localStorage
    if(trackDialog.length < 1){
      clientLogs.log("Loading Track Dialog from localStorage");
      trackDialog = JSON.parse(localStorage.getItem(user.getId() + "_trackDialog"));
    }

		// determine call direction
		for (i = 0; i < trackDialog.length; i++){
			if (trackDialog[i].id == dialog._id){
				switch(trackDialog[i].type){
					case "ACD_IN":
						// Fix for CCE calls to a route point
						if (dialog.getFromAddress() == user.getExtension()){
							number = dialog.getToAddress();
							direction.desc = "Outbound";
							direction.dir = "out";
						}else{
							number = dialog.getFromAddress();
							direction.desc = "Inbound";
							direction.dir = "in";
						}
					break;
					case "PREROUTE_ACD_IN":
						number = dialog.getFromAddress();
						direction.desc = "Inbound";
						direction.dir = "in";
					break;
					case "PREROUTE_DIRECT_AGENT":
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
						// fix for initial call type on internal calls showing as "OUT"
						if (dialog.getToAddress() == user.getExtension()){
							number = dialog.getFromAddress();
							direction.desc = "Inbound";
							direction.dir = "in";
						}else{
							number = dialog.getToAddress();
							direction.desc = "Outbound";
							direction.dir = "out";
						}
					break;
					case "AGENT_INSIDE":
						if (dialog.getToAddress() == user.getExtension()){
							number = dialog.getFromAddress();
							direction.desc = "Inbound";
							direction.dir = "in";
						}else{
							number = dialog.getToAddress();
							direction.desc = "Outbound";
							direction.dir = "out";
						}
					break;
					case "OUTBOUND":
						number = dialog.getToAddress();
						direction.desc = "Outbound";
						direction.dir = "out";
					break;
					case "OUTBOUND_PREVIEW":
						number = dialog.getToAddress();
						direction.desc = "Preview Out";
						direction.dir = "out";
					break;
					case "OUTBOUND_DIRECT_PREVIEW":
						direction.desc = "SM";
						direction.dir = "SM";
					break;
					case "CONSULT":
						if (dialog.getToAddress() == user.getExtension()){
							number = dialog.getFromAddress();
							direction.desc = "Consult From";
							direction.dir = "in";
						}else if(dialog.getFromAddress() == user.getExtension()){
							number = dialog.getToAddress();
							direction.desc = "Consult To";
							direction.dir = "out";
						}else if(dialog.getToAddress() != user.getExtension()){
							number = dialog.getToAddress();
							direction.desc = "Consult From";
							direction.dir = "in";
						}
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
				}
			}
		}

    clientLogs.log("Classified calls as: "+ JSON.stringify(direction));

		// check for additional call dialogs
		for(i = 0; i < trackDialog.length; i++) {
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
    	}
		}

		// Set agent ready if required
		if (wasReady === true){
			user.setState("READY");
			wasReady = false;
		}
    // load latest call info
    render();
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
	      	}

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

        // handle sort clicks
        $(document).on('click', '.sort', function(e) {
          e.preventDefault();
          sortMethod = $(this).attr('data-sort');
          if($(this).hasClass('desc')){
            clientLogs.log("selected column has desc class, switch to asc");
            sortDir = "A";
          }else if ($(this).hasClass('asc')){
            clientLogs.log("selected column has asc class, switch to desc");
            sortDir = "D";
          }else{
            clientLogs.log("selected column has no sort class, switch to desc");
            // $(this).addClass('desc');
            sortDir = "D";
          }
          // clear current indicator
          $('.sort').removeClass('desc');
          $('.sort').removeClass('asc');

          // store sort selections in localStorage
          localStorage.setItem('sortMethod', sortMethod);
          localStorage.setItem('sortDir', sortDir);

          render();
        });

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
