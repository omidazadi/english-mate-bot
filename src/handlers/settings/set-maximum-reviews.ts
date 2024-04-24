import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';

export class SettingsSetMaximumReviewsHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        if (
            requestContext.telegramContext.text === null ||
            requestContext.telegramContext.photo !== null
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'common/unknown',
            );
            return;
        }

        const newMaximum = parseInt(requestContext.telegramContext.text);
        if (
            isNaN(newMaximum) ||
            newMaximum < this.constant.card.minumumDailyReviews ||
            newMaximum > this.constant.card.maximumDailyReviews
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'settings/set-maximum-reviews',
                { context: { scenario: 'error-invalid-maximum' } },
            );
            return;
        }

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'settings' };
        learner.maximumDailyReviews = newMaximum;
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'settings/set-maximum-reviews',
            { context: { scenario: 'success', learner: learner } },
        );
    }
}
