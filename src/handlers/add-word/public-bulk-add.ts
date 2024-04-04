import { Card as FSRSCard } from 'fsrs.js';
import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { setTimeout } from 'timers/promises';

export class AddWordPublicBulkAddHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const wordSet = await this.repository.word.getPublicWordSet(
            requestContext.learner.data.wordSet,
            requestContext.poolClient,
        );
        if (wordSet.length === 0) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'common/unkown',
            );
            return;
        }

        const learner = instanceToInstance(requestContext.learner);
        let result: Array<[string, string]> = [];
        for (const word of wordSet) {
            if (result.length >= this.constant.bulk.bulkPageSize) {
                await this.frontend.sendActionMessage(
                    requestContext.learner.tid,
                    'add-word/public-bulk',
                    { context: { result: result, land: false } },
                );
                await setTimeout(this.constant.bulk.bulkPageDelay);
                result = [];
            }

            if (learner.dailyAddedCards >= this.constant.card.dailyAddedCards) {
                result.push([word.front, 'too-many']);
                continue;
            }

            const card = await this.repository.card.getCardByOwnerAndFront(
                learner.id,
                word.front,
                requestContext.poolClient,
            );

            if (card !== null) {
                result.push([word.front, 'duplicate']);
                continue;
            }

            learner.dailyAddedCards += 1;
            await this.repository.card.createCard(
                learner.id,
                word.id,
                new FSRSCard(),
                false,
                requestContext.poolClient,
            );
            result.push([word.front, 'success']);
        }

        if (result.length > 0) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'add-word/public-bulk-add',
                { context: { result: result, land: true } },
            );
        }

        learner.data = { state: 'word-reminder' };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
    }
}
