import { CardRepository } from './card-repository';
import { LearnerRepository } from './learner-repository';
import { WordRepository } from './word-repository';

export class Repository {
    public learner: LearnerRepository;
    public word: WordRepository;
    public card: CardRepository;

    public constructor() {
        this.learner = new LearnerRepository();
        this.word = new WordRepository();
        this.card = new CardRepository();
    }
}
