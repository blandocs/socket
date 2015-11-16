$(document).ready(function(){

    $("#sendButton").click(sendData);
    $("#dataChannelSend").keypress(function(e) { // Attach the form handler to the keypress event
        if (e.keyCode == 13) { // If the the enter key was pressed.
            $('#sendButton').click(); // Trigger the button(elementId) click event.
            return e.preventDefault(); // Prevent the form submit.
          }
    });

});





var ws = new WebSocket(location.href.replace('http', 'ws').replace('room', 'ws'));

var initiator;
var pc;   
var sendChannel;
var receiveChannel;
var pcConstraint;

pcConstraint = null;



function initiatorCtrl(event) {
    console.log(event.data);
    if (event.data == "fullhouse") {
        alert("full house");
    }
    if (event.data == "initiator") {
        initiator = false;
        init();
    }
    if (event.data == "not initiator") {
        initiator = true;
        init();
    }
}

ws.onmessage = initiatorCtrl;

function init() {
    var constraints = {
        audio: true,
        video: true
    };
    getUserMedia(constraints, connect, fail);
}


var servers = {
iceServers: [
     {url: "stun:23.21.150.121"},
     {url: "stun:stun.1.google.com:19302"}
    ]   
};

function connect(stream) {

    pc = new RTCPeerConnection(servers, pcConstraint);
    if (stream) {
        pc.addStream(stream);
        $('#local').attachStream(stream);
    }

    sendChannel = pc.createDataChannel('sendDataChannel',
      pcConstraint);
     log('Created send data channel');


    pc.onaddstream = function(event) {
        $('#remote').attachStream(event.stream);
        logStreaming(true);
    };
    pc.onicecandidate = function(event) {
        if (event.candidate) {
            ws.send(JSON.stringify(event.candidate));
        }
    };

    sendChannel.onopen = onSendChannelStateChange;
    sendChannel.onclose = onSendChannelStateChange;


    ws.onmessage = function (event) {
        log('onmessage called!');
        var signal = JSON.parse(event.data);
        if (signal.sdp) {
            if (initiator) 
            {
                receiveAnswer(signal);
                 pc.ondatachannel = receiveChannelCallback;
            } 
            else 
            {
                receiveOffer(signal);
                 pc.ondatachannel = receiveChannelCallback;
            }
        } else if (signal.candidate) {
            pc.addIceCandidate(new RTCIceCandidate(signal));
        }
    } 

    if (initiator) {
        createOffer();
    } else {
        log('waiting for offer...');
    }
    logStreaming(false);
    
}


function createOffer() {
    log('creating offer...');
    pc.createOffer(function(offer) {
        log('created offer...');
        pc.setLocalDescription(offer, function() {
            log('sending to remote...');
            ws.send(JSON.stringify(offer));
        }, fail);
    }, fail);
}


function receiveOffer(offer) {
    log('received offer...');
    pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
        log('creating answer...');
      
        pc.createAnswer(function(answer) {
            log('created answer...');
            pc.setLocalDescription(answer, function() {
                log('sent answer');
                ws.send(JSON.stringify(answer));
            }, fail);
        }, fail);
    }, fail);
}

function sendData() {
    log('Sent Data: start');
    var data = $("#dataChannelSend").val();
     log('Sent Data: value');
    sendChannel.send(data);
     log('Sent Data: ' + data);

     $('#chat-area').append("나 : "+data+"\n");
     $("#chat_area").scrollTop = $("#chat_area").scrollHeight;
     $("#dataChannelSend").val("")
     //채팅을 보내는 경우


}



function receiveAnswer(answer) {
    log('received answer');
    pc.setRemoteDescription(new RTCSessionDescription(answer));
}


function log() {
    $('#status').text(Array.prototype.join.call(arguments, ' '));
    console.log.apply(console, arguments);
}

function logStreaming(streaming) {
    $('#streaming').text(streaming ? '[streaming]' : '[..]');
}


function fail() {
    $('#status').text(Array.prototype.join.call(arguments, ' '));
    $('#status').addClass('error');
    console.error.apply(console, arguments);
}

jQuery.fn.attachStream = function(stream) {
    this.each(function() {
        this.src = URL.createObjectURL(stream);
        this.play();
    });
};


function receiveChannelCallback(event) {
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  log('Received Message');
  log(event.data);
        
  $('#chat-area').append("상대 : "+ event.data+"\n");
  $("#chat_area").scrollTop = $("#chat_area").scrollHeight;
//채팅 메시지가 도착한 경우

}

function onSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  log('Send channel state is: ' + readyState);
  if (readyState === 'open') {

  } 
  else {

  }
}

function onReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState;
  log('Receive channel state is: ' + readyState);
}