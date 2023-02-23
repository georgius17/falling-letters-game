class Menu {
    constructor() {
        this.isButtonStartHoveredM = false;
        this.isButtonOptionsHoveredM = false;
        this.isOptionsDisplayedM = false;
        this.isEndMenuDisplayedM = false;
    }
    showButton(isHovered, rect, text) {
        let id = buttonNormal.src;
        if (isHovered) {
            id = buttonHover.src;
        }
        let ctx = gameArea.context();
        ctx.drawImage(loadedImages[id], rect.x, rect.y);
        ctx.font = '10px myFirstFont';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, (rect.x + rect.w / 2), (rect.y + rect.h / 2));
    }
    showStartButtons() {
        this.showButton(false, createButtonRect(0), 'Start game');
        this.showButton(false, createButtonRect(buttonsGap), 'Options');
    }
    showOptionsButtons() {
        this.isOptionsDisplayedM = true;
        for (let i = 0; i < optionsBtnsObjects.length; i++) {
            this.showButton(false, optionsBtnsObjects[i].rect, optionsBtnsObjects[i].text);
        }
    }
    showEndMenuButtons() {
        this.isEndMenuDisplayedM = true;
        this.showButton(false, createButtonRect(0), 'Restart');
        this.showButton(false, createButtonRect(buttonsGap), 'Back to menu');
    }
    isCurrentButtonClick(p, rect) {
        if (p.x >= rect.x && p.x <= rect.x + rect.w &&
            p.y >= rect.y && p.y <= rect.y + rect.h) {
            return true;
        }
        return false;
    }
    isCurrentButtonHover(p, rect, text, isButtonHovered) {
        if (p.x >= rect.x && p.x <= rect.x + rect.w &&
            p.y >= rect.y && p.y <= rect.y + rect.h) {
            if (!isButtonHovered) {
                this.showButton(true, rect, text);
            }
            return true;
        }
        else if (isButtonHovered) {
            this.showButton(false, rect, text);
            return false;
        }
    }
    processClick(p) {
        if (this.isOptionsDisplayedM) {
            for (let i = 0; i < optionsBtnsObjects.length; i++) {
                if (this.isCurrentButtonClick(p, optionsBtnsObjects[i].rect)) {
                    gameArea.changeDifficulty(i);
                    this.isOptionsDisplayedM = false;
                    showStartScreen();
                    return;
                }
            }
            return;
        }
        if (this.isCurrentButtonClick(p, createButtonRect(0))) {
            //restart
            if (this.isEndMenuDisplayedM) {
                this.isEndMenuDisplayedM = false;
                resetGameValues();
                gameArea.start();
                return;
            }
            //start
            gameArea.start();
            return;
        }
        if (this.isCurrentButtonClick(p, createButtonRect(buttonsGap))) {
            //back to menu
            if (this.isEndMenuDisplayedM) {
                this.isEndMenuDisplayedM = false;
                resetGameValues();
                showStartScreen();
                return;
            }
            //options
            this.showOptionsButtons();
            return;
        }
        return;
    }
    processHover(p) {
        if (this.isOptionsDisplayedM) {
            for (let i = 0; i < optionsBtnsObjects.length; i++) {
                optionsBtnsObjects[i].isHovered = this.isCurrentButtonHover(p, optionsBtnsObjects[i].rect, optionsBtnsObjects[i].text, optionsBtnsObjects[i].isHovered);
            }
            return;
        }
        this.isButtonStartHoveredM = this.isCurrentButtonHover(p, createButtonRect(0), (!this.isEndMenuDisplayedM ? 'Start game' : 'Restart'), this.isButtonStartHoveredM);
        this.isButtonOptionsHoveredM = this.isCurrentButtonHover(p, createButtonRect(buttonsGap), (!this.isEndMenuDisplayedM ? 'Options' : 'Back to menu'), this.isButtonOptionsHoveredM);
    }
}
class AnimatedAsset {
    constructor({ position, image, frames = { max: 1, hold: 10, val: 0, elapsed: 0 }, animate = false, rotation = 0, scale = 1 }) {
        this.position = position;
        this.image = new Image();
        this.frames = Object.assign(Object.assign({}, frames), { val: 0, elapsed: 0 });
        this.image.onload = () => {
            this.width = (this.image.width / this.frames.max) * scale;
            this.height = this.image.height * scale;
        };
        this.image.src = image.src;
        ;
        this.isAnimate = animate;
        this.opacity = 1;
        this.rotation = rotation;
        this.scale = scale;
        this.isEnded = false;
    }
    draw() {
        let c = gameArea.ctx;
        c.save();
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        c.rotate(this.rotation);
        c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
        c.globalAlpha = this.opacity;
        const crop = {
            position: {
                x: this.frames.val * (this.width / this.scale),
                y: 0
            },
            width: this.image.width / this.frames.max,
            height: this.image.height
        };
        const image = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: this.image.width / this.frames.max,
            height: this.image.height
        };
        c.drawImage(this.image, crop.position.x, crop.position.y, crop.width, crop.height, image.position.x, image.position.y, image.width * this.scale, image.height * this.scale);
        c.restore();
        if (!this.isAnimate)
            return;
        if (this.frames.max > 1) {
            this.frames.elapsed++;
        }
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) {
                this.frames.val++;
            }
            else {
                this.frames.val = 0;
                this.isEnded = true;
            }
        }
    }
}
class GameArea {
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.name = 'Magic letters';
        this.difficulty = 0;
        this.gameTimeMax = DIFFICULTY[0].timeMs;
        this.letterInterval = DIFFICULTY[0].interval;
        this.maxLoose = DIFFICULTY[0].maxLoose;
        this.preciousCount = DIFFICULTY[0].preciousCount;
        this.preciousCollectedCount = 0;
        this.speed = DIFFICULTY[0].speed;
        this.isGameEnded = false;
        this.endText = '';
    }
    context() {
        return this.ctx;
    }
    initialize() {
        this.canvas.width = 1024;
        this.canvas.height = 576;
        this.ctx.font = '20px myFirstFont';
        this.addEventListeners();
        //this.interval = setInterval(updateGameArea, 20);
    }
    renderBackground() {
        let id = bgImg.src;
        this.ctx.drawImage(loadedImages[id], 0, 0, this.canvas.width, this.canvas.height);
    }
    addEventListeners() {
        this.canvas.setAttribute("tabindex", "0");
        this.canvas.addEventListener('mousemove', checkHover, false);
        this.canvas.addEventListener('click', checkClick, false);
        this.canvas.addEventListener('keydown', checkKey, false);
    }
    incNewPreciousCollected() {
        this.preciousCollectedCount++;
    }
    showName() {
        this.ctx.font = '25px myFirstFont';
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.name, (this.canvas.width / 2), (this.canvas.height / 2) - 200);
    }
    showDifficulty() {
        this.ctx.font = '10px myFirstFont';
        this.ctx.fillText(`Difficulty: ${difficultyOptions[this.difficulty]}`, (this.canvas.width / 2), (this.canvas.height / 2) - 100);
    }
    clearOrEnd(isPlaying) {
        this.ctx.fillStyle = 'black';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (isPlaying) {
            this.renderBackground();
            this.showGameInfo();
            if (this.isGameEnded)
                return;
            if (gameTime >= this.gameTimeMax) {
                this.isGameEnded = true;
                this.canvas.removeEventListener('keydown', checkKey);
                this.endText = 'Game completed!';
            }
            if (lostLettersCount >= this.maxLoose) {
                this.isGameEnded = true;
                this.canvas.removeEventListener('keydown', checkKey);
                this.endText = 'You lost!';
            }
        }
    }
    changeDifficulty(i) {
        if (i === this.difficulty) {
            return;
        }
        this.difficulty = i;
        this.gameTimeMax = DIFFICULTY[i].timeMs;
        this.letterInterval = DIFFICULTY[i].interval;
        this.maxLoose = DIFFICULTY[i].maxLoose;
        this.preciousCount = DIFFICULTY[0].preciousCount;
        this.preciousCollectedCount = 0;
        this.speed = DIFFICULTY[0].speed;
    }
    showGameInfo() {
        this.ctx.font = '15px myFirstFont';
        if (score < 0) {
            this.ctx.fillStyle = 'red';
        }
        this.ctx.fillText(`Score: ${score}`, 100, 50);
        this.ctx.fillStyle = 'black';
        // currTime - count from zero
        // let currTime = Math.floor(Number(gameTime) / 1000);
        let currTimeCounter = Math.floor((this.gameTimeMax - gameTime) / 1000);
        this.ctx.fillText(`Time: ${currTimeCounter}`, 900, 50);
        if (lostLettersCount > 0) {
            this.ctx.fillStyle = 'red';
        }
        this.ctx.fillText(`Missed: ${lostLettersCount}/${this.maxLoose}`, 400, 50);
        this.ctx.fillStyle = 'black';
        if (this.preciousCollectedCount > 0) {
            this.ctx.fillStyle = 'green';
        }
        this.ctx.fillText(`Golds: ${this.preciousCollectedCount}`, 600, 50);
        this.ctx.fillStyle = 'black';
    }
    showMissedKeysCount() {
        this.ctx.font = '15px myFirstFont';
        this.ctx.fillText(`${lostLettersCount}/${this.maxLoose}`, 300, 50);
    }
    start() {
        this.canvas.removeEventListener('click', checkClick);
        this.canvas.removeEventListener('mousemove', checkHover);
        this.interval = setInterval(updateGameArea, 20);
    }
    restart() {
        gameTime = 0;
        unsolvedElements = [];
        score = 0;
        lostLettersCount = 0;
        this.start();
    }
    showEndText() {
        this.ctx.font = '15px myFirstFont';
        this.ctx.fillText(this.endText, (this.canvas.width / 2), (this.canvas.height / 2 - 100));
    }
    end() {
        clearInterval(this.interval);
        this.ctx.fillText(this.endText, (this.canvas.width / 2), (this.canvas.height / 2 - 100));
        this.ctx.fillStyle = 'black';
        this.isGameEnded = false;
        menu.showEndMenuButtons();
        this.addEventListeners();
    }
}
class Component {
    constructor(w, h, color, x, y, char, isPrecious, additionalSpeed) {
        this.width = w;
        this.height = h;
        this.color = isPrecious ? 'yellow' : color;
        this.x = x;
        this.y = y;
        this.char = char;
        this.isPrecious = isPrecious;
        this.baseSpeedY = 3;
        this.speedY = additionalSpeed + (isPrecious ? this.baseSpeedY * 2 : this.baseSpeedY);
        this.isSolved = false;
        this.isAnimation = false;
        this.additionalSpeed = additionalSpeed;
    }
    update(isGameEnded) {
        this.y = this.y + this.speedY + (isGameEnded ? 3 : 0);
        if (this.isPrecious) {
            //random direction for precious
            if (Math.random() > 0.5) {
                this.x++;
            }
            else {
                this.x--;
            }
        }
        if (this.isAnimation) {
            this.char = null;
            this.handleAnime();
        }
        if (this.char !== null) {
            let ctx = gameArea.context();
            ctx.font = "20px myFirstFont";
            ctx.fillStyle = this.color;
            ctx.fillText(this.char, this.x, this.y);
        }
    }
    handleAnime() {
        this.asset.position = {
            x: this.x,
            y: this.y - 50
        };
        this.asset.draw();
        if (this.asset.isEnded) {
            this.isAnimation = false;
        }
    }
    addAsset(isCorrect) {
        this.asset = new AnimatedAsset({
            animate: true,
            position: {
                x: this.x,
                y: this.y - 50
            },
            image: isCorrect ? wrongKeyImg : rightKeyImg,
            frames: {
                max: 7,
                hold: 10,
                val: 0,
                elapsed: 0
            },
            scale: 2
        });
    }
    processKey(key) {
        if (this.isSolved) {
            return;
        }
        this.isSolved = true;
        this.isAnimation = true;
        if (key !== this.char) {
            score--;
            lostLettersCount++;
            this.addAsset(false);
            return;
        }
        else if (key === this.char) {
            let scoreInc = 1;
            if (this.isPrecious) {
                scoreInc = 2;
                gameArea.incNewPreciousCollected();
            }
            score = score + scoreInc;
            this.addAsset(true);
            return;
        }
    }
    missedKey(isGameEnded) {
        if (isGameEnded)
            return;
        if (!this.isSolved) {
            lostLettersCount++;
            score--;
        }
    }
}
