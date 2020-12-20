const baseAPIURL = 'http://localhost:8080/';
var globalUsername = '';
var globalActiveCharacters = [];
var globalPersonalCharacter;

var $landing;
var $createGame;
var $pregameLobby;
var $game;
var $night;

var cards = {
    'DOPPELGANGER': {
        'picture': 'resources/characters/doppelganger.png',
        'nightAbility': `Look at another player's card and become that character`,
        'special': 'N/A',
        'turn': doppelgangerTurn(),
        'secondTurn': doppelgangerSecondTurn()
    },
    'WEREWOLF': {
        'picture': 'resources/characters/werewolf.png',
        'nightAbility': 'View other werewolves',
        'special': 'N/A',
        'turn': werewolfTurn()
    },
    'MINION': {
        'picture': 'resources/characters/minion.png',
        'nightAbility': 'View the werewolves',
        'special': 'If Minion dies and no Werewolves die, Minion wins',
        'turn': minionTurn()
    },
    'MASON': {
        'picture': 'resources/characters/mason.png',
        'nightAbility': 'View other Mason',
        'special': 'N/A',
        'turn': masonTurn()
    },
    'SEER': {
        'picture': 'resources/characters/seer.png',
        'nightAbility': `Look at one player's card or two center cards`,
        'special': 'N/A',
        'turn': seerTurn()
    },
    'ROBBER': {
        'picture': 'resources/characters/robber.png',
        'nightAbility': 'Swap cards with another player and view new card',
        'special': 'Becomes team of new card',
        'turn': robberTurn()
    },
    'TROUBLEMAKER': {
        'picture': 'resources/characters/troublemaker.png',
        'nightAbility': `Swap two player's cards`,
        'special': 'N/A',
        'turn': troublemakerTurn()
    },
    'DRUNK': {
        'picture': 'resources/characters/drunk.png',
        'nightAbility': 'Swap with a center card without viewing new card',
        'special': 'N/A',
        'turn': drunkTurn()
    },
    'INSOMNIAC': {
        'picture': 'resources/characters/insomniac.png',
        'nightAbility': 'Views own card',
        'special': 'N/A',
        'turn': insomniacTurn()
    },
    'HUNTER': {
        'picture': 'resources/characters/hunter.png',
        'nightAbility': 'N/A',
        'special': 'If Hunter dies, the player they point at also dies',
        'turn': hunterTurn()
    },
    'TANNER': {
        'picture': 'resources/characters/tanner.png',
        'nightAbility': 'N/A',
        'special': 'Tanner only wins if they die',
        'turn': tannerTurn()
    },
    'VILLAGER': {
        'picture': 'resources/characters/villager.png',
        'nightAbility': 'N/A',
        'special': 'N/A',
        'turn': villagerTurn()
    }
}

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

    //generateCardHTML('WEREWOLF');
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
            'isLive': false,
            'turnNum': 0
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

                case 'playersReadyUpdate': {
                    let numReady = response['numReady'];
                    playersReadyUpdate(numReady);
                    break;
                }

                case 'nightTime': {
                    nightTime();
                    break;
                }

                case 'doTurn': {
                    doTurn(currGame, response);
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
            $pregameLobby.css('display', 'none');
            generateCardHTML(character);
            $game.css('display', 'flex')
            console.log(`My character: ${currCharacter}`);
        }

        function playersReadyUpdate(numReady) {
            $('#game-view-card-ready-waiting').text(`${numReady}/${currGame.players.length} players ready`);
        }

        function nightTime() {
            $createGame.css('display', 'none');
            $game.css('display', 'none');
            $landing.css('display', 'none');
            $pregameLobby.css('display', 'none');
            $night.css('display', 'flex');
        }

        function doTurn(game, turn) {
            
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

        $('.game-card').click( (e) => {
            $(e.target).parent().toggleClass('is-flipped');
            if(currGame.pregame === true) {
                $('#game-view-card-ready-tap-to-view').css('display', 'none');
                $('#game-view-card-ready-button').css('display', 'block');
                currGame.pregame = false;
            }
        });

        $('#game-view-card-ready-button').click( () => {
            console.log("Click");
            console.log();
            if(currGame.live === false) {
                $('#game-view-card-ready-button').css('display', 'none');
                $('#game-view-card-ready-waiting').css('display', 'block');
                stompClient.send(`/app/game/${currGame.gameCode}/ready`, {}, {});
                currGame.live = true;
            }
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

function generateCardHTML(character) {
    $('#game-view-card-owner').text(`John's card`);
    $('.game-card-face-front').attr('src', `resources/characters/${character.toLowerCase()}.png`);
}

function doppelgangerTurn() {

}

function doppelgangerSecondTurn() {
    
}

function werewolfTurn() {
    
}

function minionTurn() {
    
}

function masonTurn() {
    
}

function seerTurn() {
    
}

function robberTurn() {
    
}

function troublemakerTurn() {
    
}

function drunkTurn() {
    
}

function insomniacTurn() {
    
}

function hunterTurn() {
    
}

function tannerTurn() {
    
}

function villagerTurn() {
    
}