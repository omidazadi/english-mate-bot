import { BulkConstant } from './bulk-constant';
import { CardConstant } from './card-constant';
import { DeckConstant } from './deck-constant';
import { UxConstant } from './ux-constant';

export class Constant {
    public ux: UxConstant;
    public card: CardConstant;
    public bulk: BulkConstant;
    public deck: DeckConstant;

    public constructor() {
        this.ux = new UxConstant();
        this.card = new CardConstant();
        this.bulk = new BulkConstant();
        this.deck = new DeckConstant();
    }
}
