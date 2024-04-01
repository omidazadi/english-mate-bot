import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { Word } from '../../database/models/word';
import { Card } from '../../database/models/card';

export class ManageWordDeleteHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const word = (await this.repository.word.getWord(
            requestContext.learner.data.word,
            requestContext.poolClient,
        )) as Word;

        if (word.accessType === 'private') {
            await this.repository.word.deleteWord(
                word.id,
                requestContext.poolClient,
            );
        } else {
            await this.repository.card.deleteCard(
                requestContext.learner.id,
                word.id,
                requestContext.poolClient,
            );
        }

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'word-reminder' };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'manage-word/delete',
        );
    }
}
