import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';

export class PremiumNavigateInHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const onlineDecks = await this.repository.deck.getOnlineDecks(
            requestContext.poolClient,
        );
        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'premium-decks' };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'premium/navigate-in',
            {
                context: { decks: onlineDecks },
            },
        );
    }
}
