interface DifficultyItem {
    interval: number;
    timeMs: number;
    maxLoose: number;
    preciousCount: number;
    speed: number;
};

const DIFFICULTY: DifficultyItem[] = [
    {
        interval: 1500,
        timeMs: 15000,
        maxLoose: 7,
        preciousCount: 3,
        speed: 1
    },
    {
        interval: 1000,
        timeMs: 25000,
        maxLoose: 5,
        preciousCount: 4,
        speed: 2
    },
    {
        interval: 500,
        timeMs: 30000,
        maxLoose: 2,
        preciousCount: 5,
        speed: 2
    }
];
