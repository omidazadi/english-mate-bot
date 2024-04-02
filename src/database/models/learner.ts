export class Learner {
    public id: number;
    public tid: string;
    public data: Learner.Data;
    public accessLevel: Learner.AccessLevel;
    public dailyReviews: number;
    public dailyAddedCards: number;

    public constructor(
        id: number,
        tid: string,
        data: Learner.Data,
        accessLevel: Learner.AccessLevel,
        dailyReviews: number,
        dailyAddedCards: number,
    ) {
        this.id = id;
        this.tid = tid;
        this.data = data;
        this.accessLevel = accessLevel;
        this.dailyReviews = dailyReviews;
        this.dailyAddedCards = dailyAddedCards;
    }
}

export namespace Learner {
    export type AccessLevel = 'user' | 'admin';

    export type State =
        | 'word-reminder'
        | 'add-word-front'
        | 'add-word-back'
        | 'browse-word'
        | 'word-view'
        | 'modify-word'
        | 'delete-word'
        | 'review-word'
        | 'rate-word'
        | 'cli';

    export type Data = {
        state: State;
        [key: string]: any;
    };
}
