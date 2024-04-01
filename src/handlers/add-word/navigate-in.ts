import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';

export class AddWordNavigateInHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        if (
            requestContext.learner.dailyAddedCards >=
            this.constant.card.dailyAddedCards
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'add-word/navigate-in',
                { context: { scenario: 'error-too-many' } },
            );
            return;
        }

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'add-word-front' };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'add-word/navigate-in',
            { context: { scenario: 'success' } },
        );
    }
}
