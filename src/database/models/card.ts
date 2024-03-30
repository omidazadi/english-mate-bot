import { Card as FSRSCard } from 'fsrs.js';

export class Card {
    public owner: number;
    public word: number;
    public fsrsInfo: FSRSCard;
    public isDue: boolean;

    public constructor(
        owner: number,
        word: number,
        fsrsInfo: FSRSCard,
        isDue: boolean,
    ) {
        this.owner = owner;
        this.word = word;
        this.fsrsInfo = fsrsInfo;
        this.isDue = isDue;
    }
}
