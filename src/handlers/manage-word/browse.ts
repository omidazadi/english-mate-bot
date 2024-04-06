import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { Word } from '../../database/models/word';

export class ManageWordBrowseHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        if (
            requestContext.telegramContext.photo !== null ||
            requestContext.telegramContext.text === null
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'manage-word/browse',
                { context: { scenario: 'error-does-not-exist' } },
            );
            return;
        }

        const card = await this.repository.card.getCardByOwnerAndFront(
            requestContext.learner.id,
            requestContext.telegramContext.text,
            requestContext.poolClient,
        );

        if (card === null) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'manage-word/browse',
                { context: { scenario: 'error-does-not-exist' } },
            );
            return;
        }

        const word = (await this.repository.word.getWord(
            card.word,
            requestContext.poolClient,
        )) as Word;

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'word-view', word: word.id };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'manage-word/browse',
            {
                photo: word.media === null ? undefined : word.media,
                context: {
                    scenario: 'success',
                    word: word,
                },
            },
        );
    }
}
