import { RequestContext } from '../../context/request-context';
import { Learner } from '../../database/models/learner';
import { Handler } from '../handler';

export class AddWordNavigateInHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        if (
            requestContext.user.dailyAddedCards >=
            this.constant.card.dailyAddedCards
        ) {
            await this.frontend.sendActionMessage(
                requestContext.user.tid,
                'add-word/navigate-in',
                { context: { scenario: 'error-too-many' } },
            );
            return;
        }

        const learner = new Learner(
            requestContext.user.id,
            requestContext.user.tid,
            { state: 'add-word-front' },
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
            'add-word/navigate-in',
            { context: { scenario: 'success' } },
        );
    }
}
