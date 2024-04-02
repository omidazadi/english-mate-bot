import { BulkConstant } from './bulk-constant';
import { CardConstant } from './card-constant';

export class Constant {
    public card: CardConstant;
    public bulk: BulkConstant;

    public constructor() {
        this.card = new CardConstant();
        this.bulk = new BulkConstant();
    }
}
