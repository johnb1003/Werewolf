const baseAPIURL = 'http://localhost:8080/';
var globalUsername = '';
var globalActiveCharacters = [];
var globalPersonalCharacter;

var $landing;
var $createGame;
var $pregameLobby;
var $game;
var $night;

$(document).ready( () => {

    $landing = $('#landing-container');
    $createGame = $('#create-game-container');
    $pregameLobby = $('#pregame-lobby-container');
    $game = $('#game-container');
    $night = $('#night-container');

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

        if(gameCode.length != 8) {
            valid = false;
            $('#landing-code-invalid-error').css('display', 'inline');
        }
        else {
            $('#landing-code-invalid-error').css('display', 'none')
        }

        if(valid) {
            createOrJoinGame(false, username, null, gameCode);
        }
    });

    $('#landing-create-game-button').click( () => {
        let username = $('#landing-username-input').val().trim();
        let valid = true;
        if(username.length < 1 || username.length > 10) {
            valid = false;
            $('#landing-username-invalid-error').css('display', 'inline');
        }
        else {
            $('#landing-username-invalid-error').css('display', 'none')
        }

        if(valid) {
            $($landing).css('display', 'none');
            createGameSettings(username);
        }
    });

    $('#create-num-input').change( () => {
        createGameValidate();
    });

    $('.create-character-image').click( (e) => {
        let classes = $(e.target).attr('class').split(/\s+/);
        if($(e.target).hasClass('active-create-character')) {
            // Deselect character
            $(e.target).removeClass('active-create-character');
            globalActiveCharacters.splice(globalActiveCharacters.indexOf(classes[1]), 1);
        }
        else {
            // Select character
            globalActiveCharacters.push(classes[1]);
            $(e.target).addClass('active-create-character');
        }
        createGameValidate();
    });

    $('#create-game-button').click( () => {
        let characters = globalActiveCharacters;
        let username = globalUsername;
        createOrJoinGame(true, username, characters, null);
    });

    $(window).resize( () => {
        resizeLanding();
    });
});

function resizeLanding() {
    $('#landing-connect-container').outerHeight($('#landing-container').height() - $('#werewolf-title').outerHeight(true));
}

function createGameSettings(username) {
    console.log('here');
    $($createGame).css('display', 'flex');
    globalUsername = username;
}

function createGameValidate() {
    if(globalActiveCharacters.length === parseInt($('#create-num-input').val()) + 3) {
        $('#create-characters-warning').css('display', 'none');
        $('#create-game-button').css('display', 'block');
        // Valid create game button
    }
    else {
        $('#create-characters-warning').text(`Must select ${parseInt($('#create-num-input').val())+3} characters`);
        $('#create-characters-warning').css('display', 'inline');
        $('#create-game-button').css('display', 'none');
    }
}

function createOrJoinGame(newGame, username, characters, joinCode) {

    var personalSub, gameSub, sessionID, gameCode;
    let socket = new SockJS(baseAPIURL+'game');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, async (frame) => {
        sessionID = /\/([^\/]+)\/websocket/.exec(socket._transport.url)[1];
        console.log(`Connected with sessionID: ${sessionID}`);

        let game = {
            'host': {
                'sessionID': sessionID,
                'username': username,
                'isReady': false
            },
            'players': [],
            'chat': [],
            'characters': characters, 
            'pregame': true,
            'cardsDealt': false
        }

        personalSub = stompClient.subscribe(`/user/topic/player`, async (response) => {
            response = JSON.parse(response.body);
            console.log(`Player response received: ${response}`);
            if(response['type'] == 'createGame') {
                gameSub = joinGame(response['gameCode']);
            }
            processResponse(response);
            console.log(response);
        });

        if(newGame) {
            stompClient.send(`/app/game/create`, {}, JSON.stringify(game));
        }
        else {
            joinGame(joinCode);
        }

        async function joinGame(code) {
            let player = {
                'sessionID': sessionID,
                'username': username,
                'isReady': false
            };
            gameCode = code;
            gameSub = stompClient.subscribe(`/topic/game/${code}`, (response) => {
                response = JSON.parse(response.body);
                console.log(`Game response received: ${JSON.stringify(response)}`);
                processResponse(response);
            });
            stompClient.send(`/app/game/join/${code}`, {}, JSON.stringify(player));
        }
        
        function processResponse(response) {
            console.log(`Processing: \n${JSON.stringify(response)}`);
            let responseType = response['type'];
            switch(responseType) {
                case 'pregameUpdate': {
                    $createGame.css('display', 'none');
                $landing.css('display', 'none');
                $pregameLobby.css('display', 'flex');
                    let myGame = response['game'];
                    pregameUpdate(myGame);
                    break;
                }

                case 'dealCards': {
                    break;
                }
            }
        
        }

        function pregameUpdate(myGame) {
            $createGame.css('display', 'none');
            $landing.css('display', 'none');
            $pregameLobby.css('display', 'flex');
            console.log('Pregame Update');
            let code = myGame['gameCode'];
            let total = myGame['characters'].length;
            let players = myGame['players'];
            let numPlayers = players.length;

            if(sessionID === myGame?.host?.sessionID) {
                $('#pregame-start-button').css('display', 'block');
            }
            else {
                $('#pregame-start-button').css('display', 'none');
            }

            $('#pregame-code').text(`Code: ${code}`);
            $('#pregame-num-players').text(`${numPlayers} / ${total}`);

            let playersHTML = '';
            for(let i=0; i<players.length; i++) {
                let user = players[i].username;
                playersHTML += `<p class="pregame-player">${user}</p>`;
            }
            $('#pregame-players-container').html(playersHTML);
        }

        function dealCards() {
            
        }

        $('#pregame-ready-button').click( (e) => {
            if(!$(e.target).hasClass('ready')) {
                stompClient.send(`/app/game/${gameCode}/ready`, {}, {});
                $('#pregame-ready-button').addClass('ready')
            }
        });

        $('#pregame-leave-button').click( () => {
            stompClient.disconnect();
            $pregameLobby.css('display', 'none');
            $landing.css('display', 'flex');
        });
    },
    (error) => {
        alert('Connection error - Lobby may be full.');
    });
}