export class DeckConstant {
    public nameSize: number;
    public fullNameSize: number;
    public descriptionSize: number;
    public levelSize: number;

    public constructor() {
        this.nameSize = 8;
        this.fullNameSize = 128;
        this.descriptionSize = 1024;
        this.levelSize = 8;
    }
}
