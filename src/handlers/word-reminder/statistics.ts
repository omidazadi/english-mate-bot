import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';

export class WordReminderStatisticsHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const noCards = await this.repository.card.getNoCards(
            requestContext.learner.id,
            requestContext.poolClient,
        );
        const noCardsByState = await this.repository.card.getNoCardsByState(
            requestContext.learner.id,
            requestContext.poolClient,
        );
        let noDueCards = await this.repository.card.getNoDueCards(
            requestContext.learner.id,
            requestContext.poolClient,
        );
        noDueCards = Math.min(
            noDueCards,
            requestContext.learner.maximumDailyReviews -
                requestContext.learner.dailyReviews,
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
            {
                context: {
                    no_cards: noCards,
                    new_cards: noCardsByState[0],
                    learning_cards: noCardsByState[1],
                    review_cards: noCardsByState[2],
                    relearning_cards: noCardsByState[3],
                    no_due_cards: noDueCards,
                },
            },
        );
    }
}
