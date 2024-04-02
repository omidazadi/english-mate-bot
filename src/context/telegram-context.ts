export class TelegramContext {
    public tid: string;
    public text: string | null;
    public photo: string | null;
    public isOwner: boolean;

    public constructor(
        tid: string,
        text: string | null,
        photo: string | null,
        isOwner: boolean,
    ) {
        this.tid = tid;
        this.text = text;
        this.photo = photo;
        this.isOwner = isOwner;
    }
}
