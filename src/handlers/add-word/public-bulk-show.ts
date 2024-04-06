import { instanceToInstance } from 'class-transformer';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { setTimeout } from 'timers/promises';

export class AddWordPublicBulkShowHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const args = (requestContext.telegramContext.text as string).split(' ');
        if (args.length !== 2 || Number.isNaN(parseInt(args[1]))) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'common/unkown',
            );
            return;
        }

        const wordSet = await this.repository.word.getPublicWordSet(
            parseInt(args[1]),
            requestContext.poolClient,
        );
        if (wordSet.length === 0) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'common/unkown',
            );
            return;
        }

        for (const word of wordSet) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'common/word-preview',
                {
                    photo: word.media === null ? undefined : word.media,
                    context: {
                        word: word,
                    },
                },
            );
            await setTimeout(this.constant.ux.consecutiveMessageDelay);
        }

        const learner = instanceToInstance(requestContext.learner);
        learner.data = {
            state: 'show-public-definitions',
            wordSet: parseInt(args[1]),
        };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'add-word/public-bulk-show',
            {
                context: {
                    no_words: wordSet.length,
                },
            },
        );
    }
}
