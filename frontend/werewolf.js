const baseAPIURL = 'http://localhost:8080/';
$(document).ready( () => {
    resizeLanding();

    $('#landing-join-game-button').click( () => {
        let username = $('#landing-username-input').val().trim();
        let gameCode = $('#landing-join-game-input').val().trim();
        let valid = true;
        if(username.length < 1 || username.length > 10) {
            valid = false;
            $('#landing-username-invalid-error').css('display', 'inline');
        }
        else {
            $('#landing-username-invalid-error').css('display', 'none')
        }

        if(gameCode.length != 6) {
            valid = false;
            $('#landing-code-invalid-error').css('display', 'inline');
        }
        else {
            $('#landing-code-invalid-error').css('display', 'none')
        }

        if(valid) {
            //connect(username, gameCode);
        }
    });

    $('#landing-create-game-button').click( () => {
        let username = $('#landing-join-game-input').val().trim();
        let valid = true;
        if(username.length < 1 || username.length > 10) {
            valid = false;
            $('#landing-code-invalid-error').css('display', 'inline');
        }
        else {
            $('#landing-code-invalid-error').css('display', 'none')
        }

        if(valid) {
            createGame(username);
        }
    });

    $(window).resize( () => {
        resizeLanding();
    });
});

function resizeLanding() {
    $('#landing-connect-container').outerHeight($('#landing-container').height() - $('#werewolf-title').outerHeight(true));
}

function createGame(username) {
    let game = {
        'host': {
            'username': username,
            'isReady': false
        },
        'players': [],
        'chat': [],
        'characters': []
    }

    let socket = new SockJS(baseAPIURL+'game');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, (frame) => {
        console.log(`Connected to: ${frame}`);
        // Subscribe to proper chat room
        
        let groupChat = stompClient.subscribe(`/topic/messages/${code}`, (response) => {
            let data = JSON.parse(response.body);
            displayChat(data);
            //console.log(data);
        });


    });
}