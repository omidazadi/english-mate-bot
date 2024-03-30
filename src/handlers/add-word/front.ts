import { RequestContext } from '../../context/request-context';
import { Learner } from '../../database/models/learner';
import { Handler } from '../handler';

export class AddWordFrontHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        if (
            requestContext.telegramContext.photo !== null ||
            requestContext.telegramContext.text === null ||
            Buffer.byteLength(requestContext.telegramContext.text, 'utf8') >
                this.constant.card.frontSize
        ) {
            await this.frontend.sendActionMessage(
                requestContext.user.tid,
                'add-word/front',
                { context: { scenario: 'error-invalid-front' } },
            );
            return;
        }

        if (
            (await this.repository.card.getCardByOwnerAndFront(
                requestContext.user.id,
                requestContext.telegramContext.text,
                requestContext.poolClient,
            )) !== null
        ) {
            await this.frontend.sendActionMessage(
                requestContext.user.tid,
                'add-word/front',
                { context: { scenario: 'error-already-exists' } },
            );
            return;
        }

        const learner = new Learner(
            requestContext.user.id,
            requestContext.user.tid,
            {
                state: 'add-word-back',
                front: requestContext.telegramContext.text,
            },
            requestContext.user.accessLevel,
            requestContext.user.dailyReviews,
            requestContext.user.dailyAddedCards,
        );
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.user.tid,
            'add-word/front',
            { context: { scenario: 'success' } },
        );
    }
}
