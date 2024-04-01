import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { Word } from '../../database/models/word';

export class ManageWordNavigateToDeleteHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const word = (await this.repository.word.getWord(
            requestContext.learner.data.word,
            requestContext.poolClient,
        )) as Word;

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'delete-word', word: word.id };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'manage-word/navigate-to-delete',
            { context: { word: word.front } },
        );
    }
}
