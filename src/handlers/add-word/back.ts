import { Card as FSRSCard } from 'fsrs.js';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { instanceToInstance } from 'class-transformer';

export class AddWordBackHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        if (
            requestContext.telegramContext.photo !== null &&
            requestContext.telegramContext.text !== null &&
            Buffer.byteLength(requestContext.telegramContext.text, 'utf8') >
                this.constant.card.backSizeMedia
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'add-word/back',
                { context: { scenario: 'error-invalid-back' } },
            );
            return;
        }

        if (
            requestContext.telegramContext.photo === null &&
            requestContext.telegramContext.text !== null &&
            Buffer.byteLength(requestContext.telegramContext.text, 'utf8') >
                this.constant.card.backSizePlain
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'add-word/back',
                { context: { scenario: 'error-invalid-back' } },
            );
            return;
        }

        const word = await this.repository.word.createWord(
            requestContext.learner.data.front,
            requestContext.telegramContext.text,
            requestContext.telegramContext.photo,
            'private',
            requestContext.poolClient,
        );
        await this.repository.card.createCard(
            requestContext.learner.id,
            word.id,
            new FSRSCard(),
            false,
            requestContext.poolClient,
        );

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'word-reminder' };
        learner.dailyAddedCards += 1;
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/word-preview',
            {
                photo:
                    requestContext.telegramContext.photo === null
                        ? undefined
                        : requestContext.telegramContext.photo,
                context: {
                    front: requestContext.learner.data.front,
                    back: requestContext.telegramContext.text,
                },
            },
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'add-word/back',
            {
                context: {
                    scenario: 'success',
                    word: requestContext.learner.data.front,
                },
            },
        );
    }
}
