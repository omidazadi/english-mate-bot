import { Context as GrammyContext } from 'grammy';
import { RequestContext } from './request-context';
import { Repository } from '../database/repositories/repository';
import { DatabaseManager } from '../database/database-manager';
import { TelegramContext } from './telegram-context';
import { BotConfig } from '../configs/bot-config';

export class ContextManager {
    private repository: Repository;
    private databaseManager: DatabaseManager;
    private botConfig: BotConfig;

    public constructor(
        repository: Repository,
        databaseManager: DatabaseManager,
        botConfig: BotConfig,
    ) {
        this.repository = repository;
        this.databaseManager = databaseManager;
        this.botConfig = botConfig;
    }

    public async buildRequestContext(
        grammyContext: GrammyContext,
    ): Promise<RequestContext> {
        const poolClient = await this.databaseManager.createTransaction();
        const telegramContext = this.buildTelegramContext(grammyContext);
        let user = await this.repository.learner.getLearnerByTidLocking(
            telegramContext.tid,
            poolClient,
        );
        if (user === null) {
            user = await this.repository.learner.createLearner(
                telegramContext.tid,
                { state: 'word-reminder' },
                telegramContext.tid === this.botConfig.ownerTid
                    ? 'admin'
                    : 'user',
                0,
                0,
                20,
                false,
                poolClient,
            );
        }

        return new RequestContext(telegramContext, user, poolClient);
    }

    public buildTelegramContext(grammyContext: GrammyContext): TelegramContext {
        let [tid, text, photo]: [string | null, string | null, string | null] =
            [null, null, null];

        if (typeof grammyContext.from !== 'undefined') {
            tid = grammyContext.from.id.toString();
        } else {
            throw new Error(
                'Could not identify the source of telegram request.',
            );
        }

        if (typeof grammyContext.message !== 'undefined') {
            if (typeof grammyContext.message.photo !== 'undefined') {
                photo = grammyContext.message.photo[0].file_id;
                if (typeof grammyContext.message.caption !== 'undefined') {
                    text = grammyContext.message.caption;
                }
            } else if (typeof grammyContext.message.text !== 'undefined') {
                text = grammyContext.message.text;
            }
        }

        return new TelegramContext(
            tid,
            text,
            photo,
            tid === this.botConfig.ownerTid ? true : false,
        );
    }
}
