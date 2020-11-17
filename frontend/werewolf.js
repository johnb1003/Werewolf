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
        $('#landing-username-invalid-error').css('display', 'none');
        $('#landing-code-invalid-error').css('display', 'none');
        $('#landing-lobby-full-error').css('display', 'none')
        $('#landing-game-does-not-exist-error').css('display', 'none')

        if(username.length < 1 || username.length > 10) {
            valid = false;
            $('#landing-username-invalid-error').css('display', 'inline');
        }

        if(gameCode.length != 8) {
            valid = false;
            $('#landing-code-invalid-error').css('display', 'inline');
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

    $('#pregame-update-num-input').change( () => {
        pregameUpdateGameValidate();
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

function pregameUpdateGameValidate() {
    if(globalActiveCharacters.length === parseInt($('#pregame-update-num-input').val()) + 3) {
        $('#pregame-update-characters-warning').css('display', 'none');
        $('#pregame-update-game-button').css('display', 'block');
        // Valid create game button
    }
    else {
        $('#pregame-update-characters-warning').text(`Must select ${parseInt($('#pregame-update-num-input').val())+3} characters`);
        $('#pregame-update-characters-warning').css('display', 'inline');
        $('#pregame-update-game-button').css('display', 'none');
    }
}

function renderPregameSettings(myGame) {
    let chars = myGame?.characters;
    let characterMap = {};

    $('#pregame-update-characters-container').html(createCharacterContainerHTML('pregame-update'));
    $('#pregame-view-characters-container').html(createCharacterContainerHTML('pregame-view'));

    $('.pregame-update-character-image').click( (e) => {
        let classes = $(e.target).attr('class').split(/\s+/);
        if($(e.target).hasClass('active-pregame-update-character')) {
            // Deselect character
            $(e.target).removeClass('active-pregame-update-character');
            globalActiveCharacters.splice(globalActiveCharacters.indexOf(classes[1]), 1);
        }
        else {
            // Select character
            globalActiveCharacters.push(classes[1]);
            $(e.target).addClass('active-pregame-update-character');
        }
        pregameUpdateGameValidate();
    });
    
    for(let i=0; i<chars.length; i++) {
        if(chars[i] in characterMap) {
            characterMap[chars[i]] = characterMap[chars[i]] + 1;
        }
        else {
            characterMap[chars[i]] = 1;
        }

        $(`#pregame-update-${chars[i].toLowerCase()}-${characterMap[chars[i]]}`).addClass('active-pregame-update-character');
        $(`#pregame-view-${chars[i].toLowerCase()}-${characterMap[chars[i]]}`).addClass('active-pregame-view-character');
    }

    let updateNumSelectorHTML = '';
    let selected = '';
    for(let i=Math.max(3, myGame?.players.length); i<=13; i++) {
        selected = chars.length-3 === i ? ' selected' : '';
        updateNumSelectorHTML += `<option value="${i}" id="pregame-update-num-${i}"${selected}>${i}</option>`;
    }
    $('#pregame-update-num-input').html(updateNumSelectorHTML);

    pregameUpdateGameValidate();
}

function createOrJoinGame(newGame, username, characters, joinCode) {

    var personalSub, gameSub, sessionID, gameCode;
    var currGame = newGame;
    var currCharacter;
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
            'cardsDealt': false,
            'isLive': false
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
                case 'joinGameError': {
                    joinGameError(response['errorType']);
                    break;
                }

                case 'pregameUpdate': {
                    let myGame = response['game'];
                    pregameUpdate(myGame);
                    break;
                }

                case 'hostDisconnected': {
                    hostDisconnected();
                    break;
                }

                case 'playerDisconnected': {
                    let myGame = response['game'];
                    playerDisconnected(myGame);
                    break;
                }

                case 'dealCards': {
                    let character = response['character'];
                    dealCards(character);
                    break;
                }
            }
        
        }

        function joinGameError(errorType) {
            if(errorType === 'lobbyFull') {
                $('#landing-lobby-full-error').css('display', 'block');
            }
            else if(errorType === 'gameDoesNotExist') {
                $('#landing-game-does-not-exist-error').css('display', 'block');
            }
            stompClient.disconnect();
            $pregameLobby.css('display', 'none');
            $landing.css('display', 'flex');
        }

        function pregameUpdate(myGame) {
            $createGame.css('display', 'none');
            $landing.css('display', 'none');
            $pregameLobby.css('display', 'flex');
            renderPregameSettings(myGame);
            $('#landing-join-game-input').val('');
            console.log('Pregame Update');
            currGame = myGame;
            let code = myGame['gameCode'];
            let total = myGame['characters'].length - 3;
            let players = myGame['players'];
            let numPlayers = players.length;
            let gameFull = false;

            if(currGame?.players.length === currGame?.characters.length - 3) {
                gameFull = true;
            }

            if(sessionID === myGame?.host?.sessionID) {
                $('.pregame-nonhost-button').css('display', 'none');
                $('.pregame-host-button').css('display', 'block');
                if(gameFull) {
                    $('#pregame-host-start-button').addClass('active-pregame-start-button');
                }
                else {
                    $('#pregame-host-start-button').removeClass('active-pregame-start-button');
                }
            }
            else {
                $('.pregame-host-button').css('display', 'none');
                $('.pregame-nonhost-button').css('display', 'block');
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

        function playerDisconnected(myGame) {
            if(myGame?.isLive === true) {
                alert('Another player unexpectedly disconnected.');
                $createGame.css('display', 'none');
                $game.css('display', 'none');
                $night.css('display', 'none');
                $landing.css('display', 'none');
                $pregameLobby.css('display', 'none');
            }
            pregameUpdate(myGame);
        }

        function hostDisconnected() {
            $createGame.css('display', 'none');
            $game.css('display', 'none');
            $night.css('display', 'none');
            $pregameLobby.css('display', 'none');
            stompClient.disconnect();
            alert('Host disconnected.');
            $landing.css('display', 'flex');
        }

        function dealCards(character) {
            currCharacter = character;
            console.log(`My character: ${currCharacter}`);
        }

        function nightTime() {
            $createGame.css('display', 'none');
            $game.css('display', 'none');
            $landing.css('display', 'none');
            $pregameLobby.css('display', 'none');
            $night.css('display', 'flex');
        }

        $('#pregame-nonhost-settings-button').click( () => {
            renderPregameSettings(currGame);
            $('#pregame-view-settings-container').css('display', 'flex');
            $('#pregame-leave-button').css('display', 'none');
            $('#pregame-back-to-lobby-button').css('display', 'block');
        });

        $('#pregame-host-settings-button').click( () => {
            renderPregameSettings(currGame);
            $('#pregame-update-settings-container').css('display', 'flex');
            $('#pregame-leave-button').css('display', 'none');
            $('#pregame-back-to-lobby-button').css('display', 'block');
        });

        $('#pregame-update-game-button').click( async() => {
            await stompClient.send(`/app/game/update/${currGame.gameCode}`, {}, JSON.stringify(globalActiveCharacters));
            renderPregameSettings(currGame);
            $('#pregame-update-settings-container').css('display', 'none');
            $('#pregame-leave-button').css('display', 'block');
            $('#pregame-back-to-lobby-button').css('display', 'none');
        });

        $('#pregame-host-start-button').click( (e) => {
            if($(e.target).hasClass('active-pregame-start-button')) {
                // Start game
                console.log('START GAME');
                stompClient.send(`/app/game/start/${sessionID}`, {}, {});
            }
        });

        $('#pregame-leave-button').click( () => {
            stompClient.disconnect();
            $pregameLobby.css('display', 'none');
            $landing.css('display', 'flex');
        });

        $('#pregame-back-to-lobby-button').click( () => {
            $('#pregame-view-settings-container').css('display', 'none');
            $('#pregame-update-settings-container').css('display', 'none');
            $('#pregame-leave-button').css('display', 'block');
            $('#pregame-back-to-lobby-button').css('display', 'none');
        });
    },
    (error) => {
        //alert(error);
        $pregameLobby.css('display', 'none');
        $createGame.css('display', 'none');
        $game.css('display', 'none');
        $night.css('display', 'none');
        $landing.css('display', 'flex');
    });
}

function createCharacterContainerHTML(containerPrefix) {
    return `<img src="resources/characters/werewolf.png" alt="Werewolf character image" class="${containerPrefix}-character-image WEREWOLF" id="${containerPrefix}-werewolf-1">
    <img src="resources/characters/werewolf.png" alt="Werewolf character image" class="${containerPrefix}-character-image WEREWOLF" id="${containerPrefix}-werewolf-2">
    <img src="resources/characters/villager.png" alt="Villager character image" class="${containerPrefix}-character-image VILLAGER" id="${containerPrefix}-villager-1">
    <img src="resources/characters/villager.png" alt="Villager character image" class="${containerPrefix}-character-image VILLAGER" id="${containerPrefix}-villager-2">
    <img src="resources/characters/villager.png" alt="Villager character image" class="${containerPrefix}-character-image VILLAGER" id="${containerPrefix}-villager-3">
    <img src="resources/characters/doppelganger.png" alt="Doppelganger character image" class="${containerPrefix}-character-image DOPPELGANGER" id="${containerPrefix}-doppelganger-1">
    <img src="resources/characters/minion.png" alt="Minion character image" class="${containerPrefix}-character-image MINION" id="${containerPrefix}-minion-1">
    <img src="resources/characters/mason.png" alt="Mason character image" class="${containerPrefix}-character-image MASON" id="${containerPrefix}-mason-1">
    <img src="resources/characters/mason.png" alt="Mason character image" class="${containerPrefix}-character-image MASON" id="${containerPrefix}-mason-2">
    <img src="resources/characters/seer.png" alt="Seer character image" class="${containerPrefix}-character-image SEER" id="${containerPrefix}-seer-1">
    <img src="resources/characters/robber.png" alt="Robber character image" class="${containerPrefix}-character-image ROBBER" id="${containerPrefix}-robber-1">
    <img src="resources/characters/troublemaker.png" alt="Troublemaker character image" class="${containerPrefix}-character-image TROUBLEMAKER" id="${containerPrefix}-troublemaker-1">
    <img src="resources/characters/drunk.png" alt="Drunk character image" class="${containerPrefix}-character-image DRUNK" id="${containerPrefix}-drunk-1">
    <img src="resources/characters/insomniac.png" alt="Insomniac character image" class="${containerPrefix}-character-image INSOMNIAC" id="${containerPrefix}-insomniac-1">
    <img src="resources/characters/hunter.png" alt="Hunter character image" class="${containerPrefix}-character-image HUNTER" id="${containerPrefix}-hunter-1">
    <img src="resources/characters/tanner.png" alt="Tanner character image" class="${containerPrefix}-character-image TANNER" id="${containerPrefix}-tanner-1">`
}