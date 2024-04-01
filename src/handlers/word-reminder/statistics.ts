import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';

export class WordReminderStatisticsHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const noCards = await this.repository.card.getNoCards(
            requestContext.learner.id,
            requestContext.poolClient,
        );
        const noDueCards = await this.repository.card.getNoDueCards(
            requestContext.learner.id,
            requestContext.poolClient,
        );

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'word-reminder' };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'word-reminder/statistics',
            { context: { no_cards: noCards, no_due_cards: noDueCards } },
        );
    }
}
