export class CardConstant {
    public frontSize: number;
    public backSizePlain: number;
    public backSizeMedia: number;
    public dailyAddedCards: number;
    public dailyReviews: number;

    public constructor() {
        this.frontSize = 128;
        this.backSizePlain = 1024;
        this.backSizeMedia = 512;
        this.dailyAddedCards = 50;
        this.dailyReviews = 20;
    }
}
