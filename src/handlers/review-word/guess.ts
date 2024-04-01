import { FSRS, Rating } from 'fsrs.js';
import { RequestContext } from '../../context/request-context';
import { Card } from '../../database/models/card';
import { Handler } from '../handler';
import { instanceToInstance } from 'class-transformer';
import { Word } from '../../database/models/word';

export class ReviewWordGuessHandler extends Handler {
    public async handle(requestContext: RequestContext): Promise<void> {
        const card = (await this.repository.card.getCardByOwnerAndWord(
            requestContext.learner.id,
            requestContext.learner.data.word,
            requestContext.poolClient,
        )) as Card;
        const word = (await this.repository.word.getWord(
            requestContext.learner.data.word,
            requestContext.poolClient,
        )) as Word;

        const now = new Date();
        const fsrs = new FSRS();
        const schedulingCards = fsrs.repeat(card.fsrsInfo, now);

        const againInterval = this.convertToHumanReadableInterval(
            now,
            schedulingCards[Rating.Again].card.due,
        );
        const hardInterval = this.convertToHumanReadableInterval(
            now,
            schedulingCards[Rating.Hard].card.due,
        );
        const goodInterval = this.convertToHumanReadableInterval(
            now,
            schedulingCards[Rating.Good].card.due,
        );
        const easyInterval = this.convertToHumanReadableInterval(
            now,
            schedulingCards[Rating.Easy].card.due,
        );

        const learner = instanceToInstance(requestContext.learner);
        learner.data = {
            state: 'rate-word',
            now: now,
            word: requestContext.learner.data.word,
        };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'common/word-preview',
            {
                photo: word.media === null ? undefined : word.media,
                context: {
                    front: word.front,
                    back: word.back,
                },
            },
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'review-word/guess',
            {
                context: {
                    again: againInterval,
                    hard: hardInterval,
                    good: goodInterval,
                    easy: easyInterval,
                },
            },
        );
    }

    private convertToHumanReadableInterval(timeA: Date, timeB: Date): string {
        const interval = timeB.getTime() - timeA.getTime();
        const yearInterval = 1000 * 60 * 60 * 24 * 30 * 12;
        const monthInterval = 1000 * 60 * 60 * 24 * 30;
        const dayInterval = 1000 * 60 * 60 * 24;
        const minuteInterval = 1000 * 60;

        if (interval >= yearInterval) {
            const rawConverted = (interval / yearInterval).toFixed(1);
            if (rawConverted.endsWith('0')) {
                return `${rawConverted.slice(0, rawConverted.length - 2)}y`;
            } else {
                return `${rawConverted}y`;
            }
        } else if (interval >= monthInterval) {
            const rawConverted = (interval / monthInterval).toFixed(1);
            if (rawConverted.endsWith('0')) {
                return `${rawConverted.slice(0, rawConverted.length - 2)}mo`;
            } else {
                return `${rawConverted}mo`;
            }
        } else if (interval >= dayInterval) {
            const rawConverted = (interval / dayInterval).toFixed(1);
            if (rawConverted.endsWith('0')) {
                return `${rawConverted.slice(0, rawConverted.length - 2)}d`;
            } else {
                return `${rawConverted}d`;
            }
        } else if (interval >= 5 * minuteInterval) {
            const rawConverted = (interval / minuteInterval).toFixed(1);
            if (rawConverted.endsWith('0')) {
                return `${rawConverted.slice(0, rawConverted.length - 2)}m`;
            } else {
                return `${rawConverted}m`;
            }
        } else {
            return '< 5m';
        }
    }
}
