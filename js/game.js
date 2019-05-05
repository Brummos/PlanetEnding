var FPS = 60;
var gBackgroundWidth = 700;
var gBackgroundHeight = 500;
var gBackground = document.getElementById("canvas_background").getContext('2d');
var gPlayer = document.getElementById("canvas_player").getContext('2d');
var gEnemies = document.getElementById("canvas_enemies").getContext('2d');
var GUI = document.getElementById("ui_enemies").getContext('2d');

var stars = [];
var bullets = [];
var enemies = [];

var score = 0;
var planetHealth = 100;
var gameState = "menu";

var Key = {
    left: false,
    right: false,
    space: false
};

var player =   {
    width: 16,
    height: 16,
    x: (gBackgroundWidth / 2) - 8,
    y: gBackgroundHeight - 20,
    speed: 4,
    canShoot: true,
    shootTimer: 0,
    ship: new Ship(1, 3),
    image: new Image(),
    render: function() {
        this.image.src = "images/player.png";
        gPlayer.drawImage(this.image, this.x, this.y-50, 60, 60);
        // gPlayer.fillStyle = "aqua";
        // gPlayer.fillRect(this.x, this.y, this.width, this.height);
    },
    tick: function() {
        if (Key.left) this.x -= this.speed;
        if (Key.right) this.x += this.speed;
        if (Key.space && this.canShoot) {
            this.canShoot = false;
            this.ship.shoot();
            this.shootTimer = this.ship.maxShootTimer;
        }
    }
};

// Listeners

addEventListener("keydown", function(e){
    var keyCode = (e.keyCode) ? e.keyCode : e.which;
    switch(keyCode) {
        case 37:
            Key.left = true
            break;
        case 39:
            Key.right = true
            break;
        case 32: //space
            Key.space = true;
            break;
        case 49: //1
            player.ship = new Ship(1, 3);
            break;
        case 50: //2
            player.ship = new Ship(2, 7);
            break;
        case 51: //3
            player.ship = new Ship(3, 7);
            break;
    }
}, false);

addEventListener("keyup", function(e){
    var keyCode = (e.keyCode) ? e.keyCode : e.which;
    switch(keyCode) {
        case 37:
            Key.left = false
            break;
        case 39:
            Key.right = false
            break;
        case 32: //space
            Key.space = false;
            break;
    }
}, false);

// Objects

function Star(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3;
    this.render = function() {
        gBackground.fillStyle = "white";
        gBackground.fillRect(this.x, this.y, this.size, this.size);
    }
    this.tick = function() {
        if (this.y > gBackgroundHeight + 4) {
            stars.splice(stars.indexOf(this), 1);
            return;
        }
        this.y++;

    }
}

function Ship(shipType, shootTimer) {
    this.shipType = shipType;
    this.maxShootTimer = shootTimer;
    this.shoot = function() {
        if (this.shipType == 1) {
            bullets.push(new Bullet(player.x + 2 + (player.width / 2), player.y - 3 - (player.height / 2))); //player.x + (player.width - 4), player.y - (player.height / 2))
        } else if (this.shipType == 2) {
            bullets.push(new Bullet(player.x-12, player.y - 7 - (player.height / 2)));
            bullets.push(new Bullet(player.x + 19 + (player.width - 4), player.y - 7 - (player.height / 2)));
        } else if (this.shipType == 3) {
            bullets.push(new Bullet(player.x + 2 + (player.width / 2), player.y - 3 - (player.height / 2)));
            bullets.push(new Bullet(player.x-12, player.y - 7 - (player.height / 2)));
            bullets.push(new Bullet(player.x + 19 + (player.width - 4), player.y - 7 - (player.height / 2)));
        }
    }
}

function Bullet(x, y) {
    this.x  = x;
    this.y = y;
    this.speed  = 40;
    this.width = 40;
    this.height = 12;
    this.image = new Image();
    this.render = function() {
        this.image.src = "images/bullet.png";
        gPlayer.drawImage(this.image, this.x, this.y, this.width, this.height);
        // gPlayer.fillStyle = "red";
        // gPlayer.fillRect(this.x, this.y, this.width, this.height);
    }
    this.tick = function() {
        if (this.y < (0 - this.height)) {
            bullets.splice(bullets.indexOf(this), 1);
            return;
        }
        this.y -= this.speed;

        for (i in enemies) {
            if (collision(this, enemies[i])) {
                score = score + enemies[i].scoreValue;
                enemies.splice(enemies.indexOf(enemies[i]), 1);
                bullets.splice(bullets.indexOf(this), 1);
            }
        }
    };
}

function Enemy(x, y) {
    this.x  = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.speed = 0.3;
    this.scoreValue = 50;
    this.image = new Image();
    this.render = function() {
        this.image.src = "images/enemy.png";
        gPlayer.drawImage(this.image, this.x, this.y, this.width, this.height);
         // gEnemies.fillStyle = "green";
        // gEnemies.fillRect(this.x, this.y, this.width, this.height);
    }
    this.tick = function() {
        if (this.y > gBackgroundHeight + this.height) {
            var index = enemies.indexOf(this);
            enemies.splice(index, 1);

            planetHealth--;
            return;
        }
        this.y += this.speed;
    };
}

// Background stars

function initStars(amount) {
    for (i = 0; i < amount; i++) {
        stars.push(new Star(Math.random() * gBackgroundWidth, Math.random() * gBackgroundHeight));
    }
}

function createStars(amount) {
    for (i = 0; i < amount; i++) {
        stars.push(new Star(Math.random() * gBackgroundWidth, Math.random() * -5));
    }
}

// Enemies

function initEnemies(amount) {
    var spacingWidth = 50;
    var spacingHeigth = 24;
    for (x = 0; x < amount; x++) {
        for (y = 0; y < amount; y++) {
            enemies.push(new Enemy((x * spacingWidth) + (gBackgroundWidth / 2) - ((amount * spacingWidth) / 2), y * spacingHeigth));
        }
    }
}

function collision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// General

function render() {
    gBackground.clearRect(0, 0, gBackgroundWidth, gBackgroundHeight);
    gPlayer.clearRect(0, 0, gBackgroundWidth, gBackgroundHeight);
    gEnemies.clearRect(0, 0, gBackgroundWidth, gBackgroundHeight);
    GUI.clearRect(0, 0, gBackgroundWidth, gBackgroundHeight);

    for (i in stars) stars[i].render();

    switch(gameState) {
        case "play":
            player.render();
            for (i in bullets) bullets[i].render();
            for (i in enemies) enemies[i].render();

            if (gameState == "play") {
                //GUI
                GUI.fillStyle = "white";
                GUI.textBaseline = "top";
                GUI.font = "bold 16px Arial";
                GUI.fillText("Score: " + score, 2, 2);
                GUI.fillText("Health: " + planetHealth, 2, 18);
            }
            break;
        case "menu":
            GUI.fillStyle = "white";
            GUI.font = "bold 40px Arial";
            GUI.fillText("Planet Ending", (gBackgroundWidth/2)-160, gBackgroundHeight/2);
            GUI.font = "bold 20px Arial";
            GUI.fillText("Press space to start", (gBackgroundWidth/2)-130, gBackgroundHeight/2 + 40);
            break;
        case "gameWin":
            GUI.fillStyle = "white";
            GUI.font = "bold 40px Arial";
            GUI.fillText("Congratulations!", (gBackgroundWidth/2)-150, gBackgroundHeight/2);
            GUI.font = "bold 20px Arial";
            GUI.fillText("Press space to go again!", (gBackgroundWidth/2)-110, gBackgroundHeight/2 + 40);
            break;
        case "gameOver":
            GUI.fillStyle = "white";
            GUI.font = "bold 40px Arial";
            GUI.fillText("You're a loser!", (gBackgroundWidth/2)-130, gBackgroundHeight/2);
            GUI.font = "bold 20px Arial";
            GUI.fillText("Press space to go again!", (gBackgroundWidth/2)-110, gBackgroundHeight/2 + 40);
            break;
    }
}

function tick() {
    createStars(1);
    for (i in stars) stars[i].tick();

    switch(gameState) {
        case "play":
            if (planetHealth <= 0) {
                gameState = "gameOver";
                return;
            }

            if (enemies.length <= 0) {
                if (planetHealth == 100) {
                    gameState = "gameWin";
                    return;
                } else {
                    gameState = "gameOver";
                    return;
                }
            }

            player.tick();
            for (i in bullets) bullets[i].tick();
            for (i in enemies) enemies[i].tick();
            if (player.shootTimer <= 0) player.canShoot = true;
            player.shootTimer--;
            break;
        case "menu":
            if (Key.space) gameState = "play";
            break;
        case "gameWin":
        case "gameOver": //space
            if (Key.space) {
                planetHealth = 100;
                score = 0;
                gameState = "play";
                initEnemies(10);
            }
            break;
    }
}

function init() {
    initStars(600);
    initEnemies(10);
}

init();
setInterval(function() {
    render();
    tick();
}, 1000/FPS);