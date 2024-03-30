import { Card as FSRSCard } from 'fsrs.js';
import { RequestContext } from '../../context/request-context';
import { Learner } from '../../database/models/learner';
import { Handler } from '../handler';

export class AddWordBackHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        if (
            requestContext.telegramContext.photo !== null &&
            requestContext.telegramContext.text !== null &&
            Buffer.byteLength(requestContext.telegramContext.text, 'utf8') >
                this.constant.card.backSizeMedia
        ) {
            await this.frontend.sendActionMessage(
                requestContext.user.tid,
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
                requestContext.user.tid,
                'add-word/back',
                { context: { scenario: 'error-invalid-back' } },
            );
            return;
        }

        const word = await this.repository.word.createWord(
            requestContext.user.data.front,
            requestContext.telegramContext.text,
            requestContext.telegramContext.photo,
            'private',
            requestContext.poolClient,
        );
        await this.repository.card.createCard(
            requestContext.user.id,
            word.id,
            new FSRSCard(),
            false,
            requestContext.poolClient,
        );

        const learner = new Learner(
            requestContext.user.id,
            requestContext.user.tid,
            { state: 'word-reminder' },
            requestContext.user.accessLevel,
            requestContext.user.dailyReviews,
            requestContext.user.dailyAddedCards + 1,
        );
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.user.tid,
            'add-word/back',
            {
                context: {
                    scenario: 'success',
                    word: requestContext.user.data.front,
                },
            },
        );
    }
}
