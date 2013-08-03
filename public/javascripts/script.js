$(document).ready(function() {
	var serviceId = "1002";
  
  window.calls_ = [];

	$client = vline.Client.create(serviceId);

  if ($client.isLoggedIn()) {
    session = $client.getDefaultSession();
    successfulLogin(session);
  }

  function toggleLogText() {
    if ($('#log').text() == "Login") {
      $('#log').text("Logout");
    } else {
      $('#log').text("Login");
    }
  }

  function logout() {
    $session = null;

    $client.logout();
    toggleLogText();

    console.log("You've been logged out.");
  }

  function successfulLogin(session) {
    $session = session;
    localPersonId = $session.getLocalPersonId();

    toggleLogText();

    console.log("You've been logged in.");
    console.log("This session's id is " + localPersonId);
  }

  function login() {
    $client.login(serviceId).
      done(function(session) {
        successfulLogin(session);
      });
  }

	$("#log").on("click", function() {
		if ($client.isLoggedIn()) {
      logout();
		} else {
      login();
		}
	})

	$('#call').on("click", function() {
    if ($client.isLoggedIn()) {
  		var userId = prompt("Who would you like to call? Please give their ID.")
  		console.log("Attemping to call given userId.");
  		$session.startMedia(userId);
    } else {
      alert("Please login first.");
    }
	});

  $client.on('add:mediaSession', onAddMediaSession);

  function onAddMediaSession(event) {
    console.log("onAddMediaSession has been called.");
    var mediaSession = event.target;
    addMediaSession_(mediaSession);
  }

  function addMediaSession_(mediaSession) {
    console.log("addMediaSession_ has been called.");

    mediaSession.on('mediaSession:addRemoteStream', function(event) {
      var stream = event.stream;

      // create video or audio element
      var elem = $(event.stream.createMediaElement());
      id = stream.getId();
      elem.prop('id', id);

      console.log("Attempting to append remote stream to body.");
      $("#video_wrapper").append(elem);
    });

    mediaSession.on('mediaSession:removeLocalStream mediaSession:removeRemoteStream', function(event) {
      $('#' + event.stream.getId()).remove();
    });

    // The call object tracks the lifecycle of the mediaSession
    this.calls_.push(new Call(mediaSession));
  }

function Call(mediaSession) {
    this.mediaSession_ = mediaSession;

    mediaSession.
        on('enterState:pending', onEnterPending, this).
        on('enterState:incoming', onEnterIncoming, this).
        on('exitState:incoming', onExitIncoming, this).
        on('enterState:outgoing', onEnterOutgoing, this).
        on('enterState:connecting', onEnterConnecting, this).
        on('enterState:active', onEnterActive, this).
        on('enterState:closed', onEnterClosed, this);

    function onEnterPending() {
    }
    function onEnterIncoming() {
      mediaSession.start();
      userId = mediaSession.getChannel().getId();
      console.log("The remoteId for the localId of " + localPersonId + " is " + userId);
    }
    function onExitIncoming() {
    }
    function onEnterOutgoing() {
    }
    function onEnterConnecting() {
    }
    function onEnterActive() {
    }
    function onEnterClosed() {
    }
  }
})