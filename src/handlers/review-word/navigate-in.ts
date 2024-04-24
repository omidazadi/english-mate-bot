import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { Word } from '../../database/models/word';

export class ReviewWordNavigateInHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const dueCard = await this.repository.card.getOneDueCard(
            requestContext.learner.id,
            requestContext.poolClient,
        );

        if (
            requestContext.learner.dailyReviews >=
                requestContext.learner.maximumDailyReviews ||
            dueCard === null
        ) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'review-word/navigate-in',
                { context: { scenario: 'error-nothing-to-review' } },
            );
            return;
        }

        const word = (await this.repository.word.getWord(
            dueCard.word,
            requestContext.poolClient,
        )) as Word;

        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'review-word', word: dueCard.word };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'review-word/navigate-in',
            { context: { scenario: 'success', word: word.front } },
        );
    }
}
