/**
 * Created by denuss on 15.12.2016.
 */
$(document).ready(function () {
    var ms = localStorage.getItem("netMemory");
    var loadedData = {};
    if (ms) {
        loadedData.memory = JSON.parse(ms);
    }

    var game = new Game(loadedData);
    game.newGame();
});

Game = function (loadedData) {
    /*    if (loadedData) {
     for (var key in loadedData) {
     this[key] = loadedData[key];
     }
     }*/
    this.neroNet = new NeroNet(loadedData && loadedData['memory']);
    this.taked = 0;
    var self = this;
    this.isNeroTurn = false;
    $("#takeOne").on("click", function (e) {
        if (self.isNeroTurn) return;
        self.take(1);
    });

    $("#takeTwo").on("click", function (e) {
        if (self.isNeroTurn) return;
        self.take(2);
    });
};

Game.prototype.take = function (count) {
    for (var i = 0; i < count; i++) {
        this.taked++;
        $("#m" + this.taked).addClass("player-taked").find(".match").addClass("greyscale");
        if (this.taked == 11) {
            this.endGame(true);
            return;
        }

    }

    this.isNeroTurn = true;
    this.neroTurn();
};

Game.prototype.neroTurn = function () {
    var count = this.neroNet.makeTurn(this.taked);
    for (var i = 0; i < count; i++) {
        this.taked++;
        $("#m" + this.taked).addClass("nero-taked").find(".match").addClass("greyscale");
        if (this.taked == 11) {
            this.endGame(false);
            return;
        }
    }
    this.isNeroTurn = false;
};

Game.prototype.endGame = function (isUserWin) {
    this.neroNet.endGame(!isUserWin);
    var ms = JSON.stringify(this.neroNet.memory);
    localStorage.setItem("netMemory", ms);
    var s = isUserWin ? "пользователь" : "компьютер";
    alert("победил " + s);
    this.newGame();
};

Game.prototype.newGame = function () {
    this.taked = 0;
    this.isNeroTurn = false;
    $(".match").removeClass("greyscale").parent().removeClass("player-taked").removeClass("nero-taked");
};

NeroNet = function (memory) {
    this.memory = [];
    for (var i = 0; i < 11; i++) {
        this.memory[i] = !!memory ? new NeroNodeMemory(memory[i]) : new NeroNodeMemory();
    }
};

NeroNet.prototype.makeTurn = function (pos) {
    return this.memory[pos].resolveAction();
};

NeroNet.prototype.endGame = function (isWin) {
    if (isWin) {
        for (var i = 0; i < 11; i++) {
            this.memory[i].learnWin();
        }
    } else {
        var p = 2;
        for (i = 10; i >= 0; i--) {
            if (this.memory[i].answer != 0) {
                this.memory[i].learnFail(p--);
                if (p == 0) {
                    break;
                }
            }
        }
    }
};


NeroNodeMemory = function (memory) {
    this.weightOne = 1;
    this.weightTwo = 1;
    this.answer = 0;
    if (memory) {
        for (var key in memory) {
            this[key] = memory[key];
        }
    }
};

NeroNodeMemory.prototype.resolveAction = function () {
    var sum = this.weightOne + this.weightTwo;
    var rnd = Math.floor(Math.random() * 6 + 1);
    return this.answer = rnd <= this.weightOne ? 1 : 2;
};

NeroNodeMemory.prototype.learnWin = function () {
    switch (this.answer) {
        case 1:
            this.weightOne += 2;
            break;
        case 2:
            this.weightTwo += 2;
            break;
    }

    this.answer = 0;
};

NeroNodeMemory.prototype.learnFail = function (val) {
    switch (this.answer) {
        case 1:
            this.weightOne -= val;
            this.weightOne = Math.max(this.weightOne, 0);
            break;
        case 2:
            this.weightTwo -= val;
            this.weightTwo = Math.max(this.weightTwo, 0);
            break;
    }

    this.answer = 0;
};

