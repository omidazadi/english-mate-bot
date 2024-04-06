import { instanceToInstance } from 'class-transformer';
import { Bot as GrammyBot } from 'grammy';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { setTimeout } from 'timers/promises';
import { BotConfig } from '../../configs/bot-config';
import { Repository } from '../../database/repositories/repository';
import { Frontend } from '../../frontend';
import { Constant } from '../../constants/constant';

export class PremiumDetailsHandler extends Handler {
    private grammyBot: GrammyBot;
    private botConfig: BotConfig;

    public constructor(
        repository: Repository,
        frontend: Frontend,
        constant: Constant,
        grammyBot: GrammyBot,
        botConfig: BotConfig,
    ) {
        super(repository, frontend, constant);
        this.grammyBot = grammyBot;
        this.botConfig = botConfig;
    }

    public async handle(requestContext: RequestContext): Promise<void> {
        if (requestContext.telegramContext.text === null) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'premium/details',
                {
                    context: { scenario: 'error-does-not-exist' },
                },
            );
            return;
        }

        const deck = await this.repository.deck.getDeckByFullName(
            requestContext.telegramContext.text,
            requestContext.poolClient,
        );

        if (deck === null || deck.status === 'offline') {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'premium/details',
                {
                    context: { scenario: 'error-does-not-exist' },
                },
            );
            return;
        }

        const exampleWord =
            deck.exampleWord === null
                ? null
                : await this.repository.word.getWord(
                      deck.exampleWord,
                      requestContext.poolClient,
                  );
        const adminUsername: any = await this.grammyBot.api.getChat(
            parseInt(this.botConfig.ownerTid),
        );

        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'premium/details',
            {
                context: { scenario: 'description', deck: deck },
            },
        );
        await setTimeout(this.constant.ux.consecutiveMessageDelay);
        if (exampleWord !== null) {
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'premium/details',
                {
                    context: { scenario: 'example-prelude' },
                },
            );
            await setTimeout(this.constant.ux.consecutiveMessageDelay);
            await this.frontend.sendActionMessage(
                requestContext.learner.tid,
                'premium/details',
                {
                    photo:
                        exampleWord.media === null
                            ? undefined
                            : exampleWord.media,
                    context: { scenario: 'example', word: exampleWord },
                },
            );
            await setTimeout(this.constant.ux.consecutiveMessageDelay);
        }
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'premium/details',
            {
                context: {
                    scenario: 'contact-admin',
                    admin_username: adminUsername.username,
                },
            },
        );
    }
}
