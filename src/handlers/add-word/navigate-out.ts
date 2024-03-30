import { RequestContext } from '../../context/request-context';
import { Learner } from '../../database/models/learner';
import { Handler } from '../handler';

export class AddWordNavigateOutHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const learner = new Learner(
            requestContext.user.id,
            requestContext.user.tid,
            { state: 'word-reminder' },
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
            'add-word/navigate-out',
        );
    }
}
