import { FSRS, Rating } from 'fsrs.js';
import { BotConfig } from '../../configs/bot-config';
import { Constant } from '../../constants/constant';
import { RequestContext } from '../../context/request-context';
import { Card } from '../../database/models/card';
import { Repository } from '../../database/repositories/repository';
import { Frontend } from '../../frontend';
import { Handler } from '../handler';
import { instanceToInstance } from 'class-transformer';
import { Word } from '../../database/models/word';

export class ReviewWordRateHandler extends Handler {
    private buttonTexts: any;

    public constructor(
        repository: Repository,
        frontend: Frontend,
        botConfig: BotConfig,
        constant: Constant,
        buttonTexts: any,
    ) {
        super(repository, frontend, botConfig, constant);
        this.buttonTexts = buttonTexts;
    }

    public async handle(requestContext: RequestContext): Promise<void> {
        const card = (await this.repository.card.getCardByOwnerAndWord(
            requestContext.learner.id,
            requestContext.learner.data.word,
            requestContext.poolClient,
        )) as Card;
        const now = new Date(requestContext.learner.data.now);
        const fsrs = new FSRS();
        const schedulingCards = fsrs.repeat(card.fsrsInfo, now);

        card.isDue = false;
        if (
            requestContext.telegramContext.text ===
            this.buttonTexts.state.rate_word.easy
        ) {
            card.fsrsInfo = schedulingCards[Rating.Easy].card;
        } else if (
            requestContext.telegramContext.text ===
            this.buttonTexts.state.rate_word.good
        ) {
            card.fsrsInfo = schedulingCards[Rating.Good].card;
        } else if (
            requestContext.telegramContext.text ===
            this.buttonTexts.state.rate_word.hard
        ) {
            card.fsrsInfo = schedulingCards[Rating.Hard].card;
        } else if (
            requestContext.telegramContext.text ===
            this.buttonTexts.state.rate_word.again
        ) {
            card.fsrsInfo = schedulingCards[Rating.Again].card;
        }

        await this.repository.card.updateCard(card, requestContext.poolClient);

        const dueCard = await this.repository.card.getOneDueCard(
            requestContext.learner.id,
            requestContext.poolClient,
        );

        const learner = instanceToInstance(requestContext.learner);
        learner.dailyReviews += 1;
        if (
            learner.dailyReviews >= this.constant.card.dailyReviews ||
            dueCard === null
        ) {
            learner.data = {
                state: 'word-reminder',
            };
            await this.repository.learner.updateLearner(
                learner,
                requestContext.poolClient,
            );

            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'review-word/rate',
                {
                    context: {
                        scenario: 'finished',
                    },
                },
            );
        } else {
            const word = (await this.repository.word.getWord(
                dueCard.word,
                requestContext.poolClient,
            )) as Word;

            learner.data = { state: 'review-word', word: dueCard.word };
            await this.repository.learner.updateLearner(
                learner,
                requestContext.poolClient,
            );

            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'review-word/rate',
                {
                    context: {
                        scenario: 'next',
                        word: word.front,
                    },
                },
            );
        }
    }
}
