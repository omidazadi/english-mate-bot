export class Word {
    public id: number;
    public front: string;
    public back: string | null;
    public media: string | null;
    public accessType: 'public' | 'paid' | 'private';
    public tag: number;
    public deck: string | null;

    public constructor(
        id: number,
        front: string,
        back: string | null,
        media: string | null,
        accessType: 'public' | 'paid' | 'private',
        tag: number,
        deck: string | null,
    ) {
        this.id = id;
        this.front = front;
        this.back = back;
        this.media = media;
        this.accessType = accessType;
        this.tag = tag;
        this.deck = deck;
    }
}
