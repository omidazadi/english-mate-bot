export class Learner {
    public id: number;
    public tid: string;
    public data: Learner.Data;
    public accessLevel: Learner.AccessLevel;
    public dailyReviews: number;
    public dailyAddedCards: number;
    public maximumDailyReviews: number;
    public isMuted: boolean;

    public constructor(
        id: number,
        tid: string,
        data: Learner.Data,
        accessLevel: Learner.AccessLevel,
        dailyReviews: number,
        dailyAddedCards: number,
        maximumDailyReviews: number,
        isMuted: boolean,
    ) {
        this.id = id;
        this.tid = tid;
        this.data = data;
        this.accessLevel = accessLevel;
        this.dailyReviews = dailyReviews;
        this.dailyAddedCards = dailyAddedCards;
        this.maximumDailyReviews = maximumDailyReviews;
        this.isMuted = isMuted;
    }
}

export namespace Learner {
    export type AccessLevel = 'user' | 'admin';

    export type State =
        | 'word-reminder'
        | 'add-word-front'
        | 'add-word-back'
        | 'show-public-definitions'
        | 'browse-word'
        | 'word-view'
        | 'modify-word'
        | 'delete-word'
        | 'review-word'
        | 'rate-word'
        | 'premium-decks'
        | 'settings'
        | 'modify-maximum-reviews'
        | 'cli';

    export type Data = {
        state: State;
        [key: string]: any;
    };
}
