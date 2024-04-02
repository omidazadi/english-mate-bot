export class Word {
    public id: number;
    public front: string;
    public back: string | null;
    public media: string | null;
    public accessType: 'public' | 'paid' | 'private';
    public tag: number;

    public constructor(
        id: number,
        front: string,
        back: string | null,
        media: string | null,
        accessType: 'public' | 'paid' | 'private',
        tag: number,
    ) {
        this.id = id;
        this.front = front;
        this.back = back;
        this.media = media;
        this.accessType = accessType;
        this.tag = tag;
    }
}
