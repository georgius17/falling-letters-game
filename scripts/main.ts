
const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const difficultyOptions: string[] = ['EASY', 'NORMAL', 'HARD'];
let gameTime: number = 0;
let unsolvedElements: CompElement[] = [];
let score: number = 0;
let lostLettersCount: number = 0;
let allLettersCount: number = 0;

let buttonsGap: number = 100;

interface CompElement {
    active: boolean;
    comp: Component;
}

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
};

interface OptionButton {
    text: string;
    rect: Rect;
    isHovered: boolean;
};

const baseButtonRect: Rect = {
    x: (1024/2)-(162/2),
    y: (576/2)-(45/2),
    w: 162,
    h: 45
}

const createButtonRect = (gap: number): Rect => {
    return {
        ...baseButtonRect,
        y: baseButtonRect.y + gap
    }
}

const optionsBtnsObjects: OptionButton[] = [];
for (let i = 0; i < 3; i++) {
    optionsBtnsObjects.push({
        text: difficultyOptions[i],
        rect: {...baseButtonRect, y: baseButtonRect.y + (i * buttonsGap)},
        isHovered: false
    })
}

const wrongKeyImg = new Image();
wrongKeyImg.src = './img/wrongKey.png';

const rightKeyImg = new Image();
rightKeyImg.src = './img/rightKey.png';


const buttonNormal = new Image();
buttonNormal.src = './img/ui/startButton/startButtonNormal.png';

const buttonHover = new Image();
buttonHover.src = './img/ui/startButton/startButtonHover.png';

const bgImg = new Image();
bgImg.src = './img/bg_trees.png';

let unloadedImages: HTMLImageElement[] = [buttonNormal, buttonHover, bgImg];

let loadedImages = {};
let promiseArray = unloadedImages.map((img: HTMLImageElement) => {
    let prom = new Promise<void>(( resolve, reject ) => {
       img.onload = () => {
           loadedImages[img.src] = img;
           resolve();
       };
   });
   return prom;
});


const rightKey = new AnimatedAsset({
    animate: true,
    position: {
        x: 300,
        y: 500
    },
    image: wrongKeyImg,
    frames: {
      max: 7,
      hold: 10,
      val: 0,
      elapsed: 0
    },
    scale: 2
});

const wrongKey = new AnimatedAsset({
    animate: true,
    position: {
        x: 300,
        y: 500
    },
    image: rightKeyImg,
    frames: {
      max: 7,
      hold: 10,
      val: 0,
      elapsed: 0
    },
    scale: 0.5
});

const start = (): void => {
    gameArea.initialize();
    Promise.all(promiseArray).then(() => {
        showStartScreen();
    });
}

const showStartScreen = (): void => {
    gameArea.clearOrEnd(false);
    gameArea.renderBackground();
    gameArea.showName();
    gameArea.showDifficulty();
    menu.showStartButtons();
    
}

const checkClick = (e: MouseEvent): void => {
    let p = getMousePos(e);
    menu.processClick(p);
}

const checkHover = (e: MouseEvent): void => {
    let p = getMousePos(e);
    menu.processHover(p);
}

const getMousePos = (e: MouseEvent): { x: number, y: number } => {
    let r = gameArea.canvas.getBoundingClientRect();
    return {
        x: e.clientX - r.left,
        y: e.clientY - r.top
    };
}

const checkKey = (e: KeyboardEvent): void => {
    let lastUnsolvedEle = unsolvedElements.find((i: CompElement) => i.comp.isSolved === false);
    if (lastUnsolvedEle !== undefined) {
        lastUnsolvedEle.comp.processKey(e.key.toUpperCase());
    }
}

const generateLetter = (): Component => {
    let randomPos = Math.floor(Math.random() * (900 - 100) + 100);
    let randomLetterIx = Math.floor(Math.random() * chars.length);
    allLettersCount++;
    return new Component(
        30, 
        30, 
        "black", 
        randomPos, 
        0, 
        chars.charAt(randomLetterIx), 
        isPreciousLetter(),
        gameArea.speed
    );
}

const isPreciousLetter = (): boolean => {
    let preciousCount = gameArea.preciousCount;
    if (preciousCount >= 1) {
        const isPreciousRnd = Math.random() > 0.5;
        if (isPreciousRnd) {
            gameArea.preciousCount = gameArea.preciousCount - 1;
        }
        return isPreciousRnd;
    }
    return false;
}

const updateAndGenerateLetters = (): void => {
    // generate letter at the beginning or in the interval
    if ((gameTime === 20 || gameTime % gameArea.letterInterval === 0) && !gameArea.isGameEnded) {
        unsolvedElements.push({
            active: true,
            comp: generateLetter()
        });
    }

    const updatedUnsolvedElements = [];
    for (let i = 0; i < unsolvedElements.length; i++) {
        if (unsolvedElements[i].comp.y <= 576) {
            updatedUnsolvedElements.push(unsolvedElements[i]);
            unsolvedElements[i].comp.update(gameArea.isGameEnded);
        } else {
            unsolvedElements[i].comp.missedKey(gameArea.isGameEnded);
        }
        
    }
    unsolvedElements = [...updatedUnsolvedElements];
}

const updateGameArea = (): void => {
    
    gameArea.clearOrEnd(true);
    updateAndGenerateLetters();
    if (gameArea.isGameEnded) {
        gameArea.showEndText();
        if (unsolvedElements.length <= 0) {
            gameArea.end();
        }
        return;
    }
    gameTime += 20;
}

const resetGameValues = (): void => {
    gameTime = 0;
    unsolvedElements = [];
    score = 0;
    lostLettersCount = 0;
    allLettersCount = 0;
}


let gameArea = new GameArea();
let menu = new Menu();

start();

