export class Deck {
    public name: string;
    public fullName: string;
    public description: string;
    public exampleWord: number | null;
    public status: 'online' | 'offline';
    public level: string;
    public price: number;

    public constructor(
        name: string,
        fullName: string,
        description: string,
        exampleWord: number | null,
        status: 'online' | 'offline',
        level: string,
        price: number,
    ) {
        this.name = name;
        this.fullName = fullName;
        this.description = description;
        this.exampleWord = exampleWord;
        this.status = status;
        this.level = level;
        this.price = price;
    }
}
