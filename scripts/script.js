"use strict";

const TIME_MULTIPLAYER = 20000;
const TIME_EASY = 180000;
const TIME_MEDIUM = 120000;
const TIME_HARD = 60000;

const MODE_STANDARD = "standard";
const MODE_TIME = "time";

const LEVEL_EASY = "easy";
const LEVEL_MED = "medium";
const LEVEL_HARD = "hard";

const TOT_CARD_NUM_EASY = 30;
const TOT_CARD_NUM_MED = 40;
const TOT_CARD_NUM_HARD = 50;
const TOT_CARD_NUM_TIME = 40;

const CARD_LAYOUT_EASY = "cards_30";
const CARD_LAYOUT_MED = "cards_40";
const CARD_LAYOUT_HARD = "cards_50";

const CARDPATH_JAPAN = "./images/cards_japan/"
const CARDSET_JAPAN_EASY = ["bonsai", "bonsai" , "daruma", "daruma", "fan", "fan", "geisha", "geisha", "geta", "geta", "hannya", "hannya", "hatsuhinode", "hatsuhinode", "japan", "japan", "koinobori", "koinobori", "lantern", "lantern", "maneki-neko", "maneki-neko", "onigiri", "onigiri", "sake", "sake", "sakura", "sakura", "temple", "temple"];

const CARDSET_JAPAN_MED = ["bonsai", "bonsai" , "daruma", "daruma", "fan", "fan", "geisha", "geisha", "geta", "geta", "hannya", "hannya", "hatsuhinode", "hatsuhinode", "japan", "japan", "koinobori", "koinobori", "lantern", "lantern", "maneki-neko", "maneki-neko", "onigiri", "onigiri", "sake", "sake", "sakura", "sakura", "temple", "temple", "gourd", "gourd", "itsukushima-shrine", "itsukushima-shrine", "omikuji", "omikuji", "toshikoshi-soba", "toshikoshi-soba", "turtle", "turtle",];

const CARDSET_JAPAN_HARD = ["bonsai", "bonsai" , "daruma", "daruma", "fan", "fan", "geisha", "geisha", "geta", "geta", "hannya", "hannya", "hatsuhinode", "hatsuhinode", "japan", "japan", "koinobori", "koinobori", "lantern", "lantern", "maneki-neko", "maneki-neko", "onigiri", "onigiri", "sake", "sake", "sakura", "sakura", "temple", "temple", "gourd", "gourd", "itsukushima-shrine", "itsukushima-shrine", "omikuji", "omikuji", "toshikoshi-soba", "toshikoshi-soba", "turtle", "turtle", "fukubukuro", "fukubukuro", "hama-yumi", "hama-yumi", "omamori", "omamori", "onsen", "onsen", "osechi", "osechi"];

let game = {
    title: "Photographic Memory",
    isRunning: false,
    currentScreen: "splash-screen",
    players: [],
    playerNum: 1,
    playerCounter: 1,
    mode: MODE_STANDARD,
    level: LEVEL_EASY,

    loopDuration: 100,
    totalTime: 0,
    timeRemaining: 0,
    timeRef: null,
    min: $("#min"),
    sec: $("#sec"),
    tenth: $("#tenth"),
    timeBar: $(".base-bar"),

    currentCard: "",
    currentCardId: "",
    totalCardNum: TOT_CARD_NUM_EASY,
    pairedCardNum: 0,
    clickDisabled: false,

    switchScreen(currentScreen) {
        this.currentScreen = currentScreen;
        $(".screen").hide();
        $(`#${currentScreen}`).show();

        if (currentScreen === "game-screen") {
            $(".pause-btn").show();
            this.isRunning = true;
        } else {
            $(".pause-btn").hide();
            this.isRunning = false;
        }
    },

    toggleDialogue(dialogue) {
        $(`#${dialogue}`).toggle();
    },

    // ---------------------------------------- //
    // -------------- Game Setup -------------- //
    // ---------------------------------------- //
    
    // reset game
    reset() {
        this.isRunning = false;
        this.players = [];
        this.playerNum = 1;
        this.playerCounter = 1;
        this.mode = MODE_STANDARD;
        this.level = LEVEL_EASY;

        this.totalTime = 0;
        this.timeRemaining = 0;
        this.timeRef = null;

        this.currentCard = "";
        this.currentCardId = "";
        this.totalCardNum = TOT_CARD_NUM_EASY;
        this.pairedCardNum = 0;
        this.clickDisabled = false;
        $(".sb-player-row").remove();
        $(".card-item").remove();
        $("#result-time").remove();
        $(".star").remove();
        $("#result-rank h3").remove();
        $(".result-player-row").remove();
    },

    setPlayerNum(playerNum) {
        this.playerNum = playerNum;
    },

    setMode(mode) {
        this.mode = mode;
    },

    setLevel(level) {
        this.level = level;
    },


    // ---------------------------------------- //
    // ---------- Timer or Stopwatch ---------- //
    // ---------------------------------------- //

    setTimer() {
        let setTime = 0;
        if (game.mode === MODE_STANDARD) {
            setTime = 0;
        } else if (game.mode === MODE_TIME) {
            if (this.playerNum === 1) {
                if(game.level === LEVEL_EASY) {
                    setTime = TIME_EASY;
                } else if (game.level === LEVEL_MED) {
                    setTime = TIME_MEDIUM;
                } else {
                    setTime = TIME_HARD;
                }
            }
            else {
                setTime = TIME_MULTIPLAYER;
            }
        }

        this.totalTime = setTime;
        this.timeRemaining = setTime;
        this.updateTimer(setTime);
        game.updateTimeBar(game.timeRemaining, game.totalTime);
    },

    startTimer() {
        this.isRunning = true;

        let timerType;
        if (game.mode === MODE_STANDARD) {
            timerType = this.stopwatchLoop;
            // $("#timer-display").addClass("not-visible");
            // $("#timer-display").removeClass("visible");
            $("#timer-display").hide();
        } else {
            timerType = this.timerLoop;
            // $("#timer-display").addClass("visible");
            // $("#timer-display").removeClass("not-visible");
            $("#timer-display").show();
        }

        this.timeRef = window.setInterval(timerType, this.loopDuration);
    },

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timeRef);
    },

    stopwatchLoop() {
        game.timeRemaining += game.loopDuration;
    },

    timerLoop() {
        game.timeRemaining -= game.loopDuration;
        game.updateTimer(game.timeRemaining);
        game.updateTimeBar(game.timeRemaining, game.totalTime);
        if(game.timeRemaining < game.loopDuration) {
            if (game.playerNum == 1) {
                game.pauseTimer();
                game.gameoverInfo();
                game.switchScreen("gameover-screen");
            } else {
                game.pauseTimer();
                game.switchPlayers();
                $("#switch-username").text(game.players[game.playerCounter-1].name);
                $("#switch-title").css("visibility", "visible");
                $(".flip-card").removeClass("flip-card");

                setTimeout( ()=> {
                    game.currentCard = "";
                    game.currentCardId = "";
                    $("#switch-title").css("visibility", "hidden");
                    game.setTimer();
                    game.startTimer();
                }, 1000)
                
            }
        }
    },

    calculateTime(time) {
        let timeArr = [];
        let minutes = Math.floor(time / 1000 / 60);
        if (minutes < 10) {
            minutes = `0${minutes}`;
        }
        let seconds = Math.floor(time / 1000 % 60);

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        let tenth = Math.floor(time / 100 % 10);

        timeArr = [minutes, seconds, tenth];
        return timeArr;
    },

    // update time displays
    updateTimer(time) {
        let timeArr = this.calculateTime(time);
        game.min.html(timeArr[0]);
        game.sec.html(timeArr[1]);
        game.tenth.html(timeArr[2]);
    },

    updateTimeBar(timeRemaining, totalTime) {
        const totalWidth = $("#base-bar").css("width").match(/(\d+)/);
        const timeRemainingPercentage = timeRemaining / totalTime;
        const progressBarWidth = Math.round(timeRemainingPercentage * totalWidth[0]);
        $("#progress-bar").css("width", `${progressBarWidth}px`);
    },


    // ---------------------------------------- //
    // -------- Usernames & Scoreboard -------- //
    // ---------------------------------------- //
    
    namePromptController(action) {
        if (action === "selectPNum") {
            this.namePrompt();

        } else if (action === "submit") {
            console.log("clicked");
            let player = new Player($("#userName").val());
            game.addUserName(player);

            if (this.playerNum == this.playerCounter) {
                $(".name-prompt").hide(); 
                this.switchScreen("mode-screen");
                this.switchPlayers();

            } else {
                this.switchPlayers();
                this.namePrompt();
            } 
        }
    },

    namePrompt() {
        $(".player-num-label").text(`P${game.playerCounter}`); 
        $("#userName").attr("value", `Player${game.playerCounter}`);
        $(".name-prompt").show();
        $('#userName').val(`Player ${game.playerCounter}`);
        console.log("prompt");         
    },

    addUserName(player) {
        game.players.push(player);
        let divId = `sb-p${game.playerCounter}-row`;
        let playerNameId = `sb-p${game.playerCounter}-name`;
        let playerScoreId = `sb-p${game.playerCounter}-score`;
        
        // appending elements to scoreboard
        $("#scoreboard").append($("<div></div>").addClass("sb-player-row").attr("id", divId));

        $(`#${divId}`).append($(`<h3>${player.name}</h3>`).addClass("sb-player-name").attr("id", playerNameId));
        
        $(`#${divId}`).append($(`<p>${player.score}</p>`).addClass("sb-player-score").attr("id", playerScoreId));
    },

    updateScore(points, action) {
        if(action == "reset") {
            for (let i = 1; i <= game.playerNum; i++) {
                game.players[i-1].score = 0;
                $(`#sb-p${i}-score`).text(game.players[i-1].score);
            }
        } else {
            game.players[game.playerCounter-1].score += points;
            $(`#sb-p${game.playerCounter}-score`).text(game.players[game.playerCounter-1].score);
        }
    },

    switchPlayers() {
        $(`#scoreboard #sb-p${game.playerCounter}-row`).removeClass("player-turn");
        
        if (game.playerCounter == game.playerNum) {
            game.playerCounter = 1;
            console.log(`add to player ${game.playerCounter}`);
            $(`#scoreboard #sb-p${game.playerCounter}-row`).addClass("player-turn");
            
        } else {
            game.playerCounter++;
            console.log(`add to player ${game.playerCounter}`);
            $(`#scoreboard #sb-p${game.playerCounter}-row`).addClass("player-turn");
        }  
    },


    // ---------------------------------------- //
    // ---------- Gameboard & Cards ----------- //
    // ---------------------------------------- //

    resetCards() {
        $(".card-item").remove();
        game.setCards();
        game.pairedCardNum = 0;
    },

    setCards() {
        let cardSet = "";
        let layoutClass = "";
        let cardSetArray = [];

        if (this.mode === MODE_TIME && this.playerNum === 1) {
            this.totalCardNum = TOT_CARD_NUM_MED;
            cardSet = CARDSET_JAPAN_MED;
            layoutClass = CARD_LAYOUT_MED;

        } else {
            if (this.level === LEVEL_EASY) {
                this.totalCardNum = TOT_CARD_NUM_EASY;
                cardSet = CARDSET_JAPAN_EASY;
                layoutClass = CARD_LAYOUT_EASY;

            } else if (this.level === LEVEL_MED) {
                this.totalCardNum = TOT_CARD_NUM_MED;
                cardSet = CARDSET_JAPAN_MED;
                layoutClass = CARD_LAYOUT_MED;

            } else {
                this.totalCardNum = TOT_CARD_NUM_HARD;
                cardSet =  CARDSET_JAPAN_HARD;
                layoutClass = CARD_LAYOUT_HARD;
            }
        }

        // set number of cards and layout on gameboard
        let cardNum = this.totalCardNum;
        $("#cards").attr("class", layoutClass);
        
        cardSet.forEach((oneCard)=> {
            cardSetArray.push(oneCard);
        });

        // append elements and randomly assign cards
        for (let i = 0; i < cardNum; i++) {
            let randomCards = cardSetArray.splice((Math.random()*cardSetArray.length), 1)[0];
            
            $("#cards").append(
                    $("<div></div>").addClass(`card-item ${randomCards}`).attr("id", `card${i+1}`)
                    .append(
                        $("<div></div>").addClass(`card-item-inner ${randomCards}`)
                        .append(
                            $("<div></div>").addClass("card-item-front").append($("<img>").attr("src", CARDPATH_JAPAN + "yin-yang.svg")))
                        .append(
                            $("<div></div>").addClass("card-item-back")
                            .append($("<img>").attr("src", CARDPATH_JAPAN + randomCards + ".svg"))
                        )
                    )
            );
        } 
        
    },
    
    matchCard(cardClass, cardId) {
        if (game.currentCardId === "" && game.currentCard === "") {
            game.currentCardId = cardId;
            game.currentCard = cardClass;

        } else if (game.currentCardId === cardId) {
            console.log("same card");

        } else if (game.currentCardId !== cardId && cardClass === game.currentCard) {
            console.log("match");

            game.pairedCardNum+=2;

            let card0 = game.currentCard.replace("-inner ", " .");

            game.clickDisabled = true;
            this.updateScore(100, "addScore");
            setTimeout(()=> {
                $(`#cards .${card0}`).addClass("not-visible flip-card");
                game.clickDisabled = false;
            }, 500);
            game.currentCard = "";
            game.currentCardId = "";
            
            
        } else if (game.currentCardId !== cardId && cardClass !== game.currentCard){
            console.log("not match");
        
            game.clickDisabled = true;

            

            setTimeout(()=> {
                $(".flip-card").removeClass("flip-card");
                

                if (game.mode === MODE_STANDARD && this.playerNum > 1) {
                    setTimeout( ()=> {
                    
                    
                        this.switchPlayers();
                        $("#switch-username").text(game.players[game.playerCounter-1].name);
                        $("#switch-title").css("visibility", "visible");
    
                        setTimeout( ()=> {
                            $("#switch-title").css("visibility", "hidden");
                            game.clickDisabled = false;
                        }, 1000);

                    }, 200);
                } else {
                    game.clickDisabled = false;
                }

            }, 500);

            game.currentCard = "";
            game.currentCardId = "";
        }

        game.gameoverCheck();
    },

    // ---------------------------------------- //
    // ---------- Gameover & Results ---------- //
    // ---------------------------------------- //

    gameoverCheck() {
        console.log("checking:" + this.pairedCardNum + "/" + this.totalCardNum);
        if (this.pairedCardNum >= this.totalCardNum) {
            game.gameoverInfo();
            game.switchScreen("gameover-screen");
            game.pauseTimer();
        }
    },

    gameoverInfo() {
        // for 1 player
        if (game.playerNum == 1) {

            if (game.mode === MODE_TIME && game.timeRemaining <= 0) {
                // ran out of time in time mode
                $("#gameover-screen #gameover-title").text("Game Over");

            } else {
                // standard mode or has time remaining in time mode
                $("#gameover-screen #gameover-title").text("Cleared!");
                let timeAttr = "";
                let evalTime_3Star;
                let evalTime_2Star;

                if (game.mode === MODE_STANDARD) {
                    timeAttr = "Time Used";
                    evalTime_3Star = game.timeRemaining < 30000;
                    evalTime_2Star = game.timeRemaining < 60000;

                } else {
                    timeAttr = "Time Remaining";
                    evalTime_3Star = game.timeRemaining > 30000;
                    evalTime_2Star = game.timeRemaining > 15000;
                }

                let timeArr = game.calculateTime(game.timeRemaining);
                $("#gameover-screen #result").append($("<h3></h3>").attr("id", "result-time").text(`${timeAttr}: ${timeArr[0]}:${timeArr[1]}:${timeArr[2]}`));

                if (evalTime_3Star) {
                    $("#gameover-screen #result-stars")
                        .append($("<img src='./images/star.svg' class='star'></img>"))
                        .append($("<img src='./images/star.svg' class='star'></img>"))
                        .append($("<img src='./images/star.svg' class='star'></img>"));
    
                } else if (evalTime_2Star) {
                    $("#gameover-screen #result-stars")
                        .append($("<img src='./images/star.svg' class='star'></img>"))
                        .append($("<img src='./images/star.svg' class='star'></img>"))
                        .append($("<img src='./images/base-star.svg' class='star'></img>"));
                } else {
                    $("#gameover-screen #result-stars")
                        .append($("<img src='./images/star.svg' class='star'></img>"))
                        .append($("<img src='./images/base-star.svg' class='star'></img>"))
                        .append($("<img src='./images/base-star.svg' class='star'></img>"));
                }

            }
            
        // for 2-4 players
        } else {
            $("#gameover-screen #gameover-title").text("Game Over");
            $("#result-rank").append($("<h3>Ranking</h3>"));

            let scoreArr = [];
            for (let counter = 1; counter <= game.playerNum; counter++ ) {

                let divId = `result-p${counter}-row`;
                let playerNameId = `result-p${counter}-name`;
                let playerScoreId = `result-p${counter}-score`;

                
    
                $("#result-rank").append($("<div></div>").addClass("result-player-row").attr("id", divId));
    
                $(`#${divId}`).append($(`<h3>${game.players[counter-1].name}</h3>`).addClass("result-playerName").attr("id", playerNameId));
            
                $(`#${divId}`).append($(`<p>${game.players[counter-1].score}</p>`).addClass("result-playerScore").attr("id", playerScoreId));

                scoreArr.push(game.players[counter-1].score);
            }

            var maxScore = Math.max.apply(Math, scoreArr);
            var maxPlayer = scoreArr.indexOf(maxScore) + 1;

            $(`#result-p${maxPlayer}-row`).addClass("winner");


        }
    },

    audioPlay() {
        var audio = document.getElementById('bkgd-audio');
        return audio.paused ? audio.play() : audio.pause();
    }

}

class Player {
    constructor(playerName, score = 0) {
        this.name = playerName;
        this.score = score;
    }
}

$(document).ready(() => {
    game.switchScreen("splash-screen");
})

// prevent dragging card images
$(document).on("dragstart", (event)=> {
    event.preventDefault();
});


// header btns
$("header .pause-btn").on("click", ()=> {
    game.toggleDialogue("setting-menu");
    game.pauseTimer();
    $(".pause-btn").attr("disabled", true);
});



document.getElementById('mute-btn').addEventListener('click', function (e) {
    e = e || window.event;
    game.audioPlay();
    e.preventDefault();
}, false);

// setting menu
$("#setting-menu .help-btn").on("click", ()=> {
    game.toggleDialogue("instruction");
});

$("#setting-menu .resume-btn").on("click", ()=> {
    game.toggleDialogue("setting-menu");
    game.startTimer();
    $(".pause-btn").attr("disabled", false);

});

$("#setting-menu .restart-btn").on("click", ()=> {
    game.toggleDialogue("setting-menu");
    game.resetCards();
    game.updateScore(0, "reset");
    game.setTimer();
    game.startTimer();
    $(".pause-btn").attr("disabled", false);
});

$("#setting-menu .home-btn").on("click", ()=> {
    game.toggleDialogue("setting-menu");
    game.switchScreen("splash-screen");
    game.setTimer();
    game.reset();
    $(".pause-btn").attr("disabled", false);
    $("#bkgrd img").css("animation", "4s sliding-img linear infinite");
});




// instruction dialogue
$("#instruction .close-help-btn").on("click", ()=> {
    game.toggleDialogue("instruction");
});


// splash-screen
$("#splash-screen .start-btn").on("click", ()=> {
    game.switchScreen("player-num-screen");
});

$("#splash-screen .instruction-btn").on("click", ()=> {
    game.toggleDialogue("instruction");
});


// player-num-screen
$("#player-num-screen .1p-btn").on("click", ()=> {
    game.setPlayerNum(1);
    game.namePromptController("selectPNum");
});

$("#player-num-screen .2p-btn").on("click", ()=> {
    game.setPlayerNum(2);
    game.namePromptController("selectPNum");
});

$("#player-num-screen .3p-btn").on("click", ()=> {
    game.setPlayerNum(3);
    game.namePromptController("selectPNum");
});

$("#player-num-screen .4p-btn").on("click", ()=> {
    game.setPlayerNum(4);
    game.namePromptController("selectPNum");
});


// name-prompt
$("#submit-userName").on("click", ()=> {
    game.namePromptController("submit");
});


// mode-screen
$("#mode-screen .standard-btn").on("click", ()=> {
    game.switchScreen("level-screen");
    game.setMode(MODE_STANDARD);
});

$("#mode-screen .time-mode-btn").on("click", ()=> {
    game.switchScreen("level-screen");
    game.setMode(MODE_TIME);
});



// level-screen
$("#level-screen .easy-btn").on("click", ()=> {
    game.switchScreen("ready-screen");
    game.setLevel(LEVEL_EASY);
});

$("#level-screen .medium-btn").on("click", ()=> {
    game.switchScreen("ready-screen");
    game.setLevel(LEVEL_MED);
});

$("#level-screen .hard-btn").on("click", ()=> {
    game.switchScreen("ready-screen");
    game.setLevel(LEVEL_HARD);
});

// ready-screen
$("#ready-screen .play-btn").on("click", ()=> {
    game.switchScreen("game-screen");
    game.setTimer();
    game.startTimer();
    game.resetCards();
    game.updateScore(0, "reset");
    $("#bkgrd img").css("animation", "none");
})


// game-screen 

$(document).on("click", "#game-screen .card-item-inner", function() {
    if (game.clickDisabled == false) {
        var classes = $(this).attr("class");
        var parentId = $(this).parent().attr("id");
            
        $(this).addClass("flip-card");
        game.matchCard(classes, parentId);
    }
    
});

// gameover-screen
$("#gameover-screen .again-btn").on("click", ()=> {
    game.switchScreen("ready-screen");
});

$("#gameover-screen .quit-btn").on("click", ()=> {
    game.switchScreen("splash-screen");
    game.setTimer();
    game.reset();
    $("#bkgrd img").css("animation", "4s sliding-img linear infinite");
});
