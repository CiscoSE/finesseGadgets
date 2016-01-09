incoming = currentCall
if (incoming === null){
	message(msg, {network: "SMS", to: to});
}else{
	say("This number does not accept SMS. Please call us at (###) ###-####");
}