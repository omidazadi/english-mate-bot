import { Bot as GrammyBot } from 'grammy';
import { ContextManager } from './context/context-manager';
import { Repository } from './database/repositories/repository';
import { Gateway } from './gateway';
import { RootHandler } from './handlers/root';
import { Frontend } from './frontend';
import { Router } from './router';
import { Config } from './configs/config';
import { DatabaseManager } from './database/database-manager';
import { CommonUnknownHandler } from './handlers/common/unknown';
import { CommonInternalErrorHandler } from './handlers/common/internal-error';
import { CommonRootHandler } from './handlers/common/root';
import { WordReminderJumpHandler } from './handlers/word-reminder/jump';
import { WordReminderStatisticsHandler } from './handlers/word-reminder/statistics';
import { WordReminderTalkToAdminHandler } from './handlers/word-reminder/talk-to-admin';
import { WordReminderRootHandler } from './handlers/word-reminder/root';
import { Agent } from './agent';
import { CronJob } from 'cron';
import { CommonUnsupportedMediaHandler } from './handlers/common/unsupported-media';
import { Constant } from './constants/constant';
import { AddWordRootHandler } from './handlers/add-word/root';
import { AddWordNavigateInHandler } from './handlers/add-word/navigate-in';
import { AddWordNavigateOutHandler } from './handlers/add-word/navigate-out';
import { AddWordFrontHandler } from './handlers/add-word/front';
import { AddWordBackHandler } from './handlers/add-word/back';

export class Bot {
    private gateway: Gateway | undefined;
    private dailyCronJob: CronJob | undefined;

    public async configure(config: Config) {
        const constant = new Constant();
        const grammyBot = new GrammyBot(config.telegramConfig.botToken);
        const frontend = new Frontend(grammyBot);
        await frontend.configure();
        const repository = new Repository();
        const databaseManager = new DatabaseManager(config.postgresConfig);
        await databaseManager.executeDDL();
        const contextManager = new ContextManager(
            repository,
            databaseManager,
            config.botConfig,
        );
        const router = new Router();
        await router.configure();
        const agent = new Agent(frontend, config.agentConfig);

        const addWordNavigateInHandler = new AddWordNavigateInHandler(
            repository,
            frontend,
            config.botConfig,
            constant,
        );
        const addWordNavigateOutHandler = new AddWordNavigateOutHandler(
            repository,
            frontend,
            config.botConfig,
            constant,
        );
        const addWordFrontHandler = new AddWordFrontHandler(
            repository,
            frontend,
            config.botConfig,
            constant,
        );
        const addWordBackHandler = new AddWordBackHandler(
            repository,
            frontend,
            config.botConfig,
            constant,
        );
        const addWordRootHandler = new AddWordRootHandler(
            addWordNavigateInHandler,
            addWordNavigateOutHandler,
            addWordFrontHandler,
            addWordBackHandler,
        );

        // Word Reminder Handlers
        const wordReminderJumpHandler = new WordReminderJumpHandler(
            repository,
            frontend,
            config.botConfig,
            constant,
        );
        const wordReminderStatisticsHandler = new WordReminderStatisticsHandler(
            repository,
            frontend,
            config.botConfig,
            constant,
        );
        const wordReminderTalkToAdminHandler =
            new WordReminderTalkToAdminHandler(
                repository,
                frontend,
                config.botConfig,
                constant,
                grammyBot,
            );
        const wordReminderRootHandler = new WordReminderRootHandler(
            wordReminderJumpHandler,
            wordReminderStatisticsHandler,
            wordReminderTalkToAdminHandler,
        );

        // Common Handlers
        const commonUnknownHandler = new CommonUnknownHandler(
            repository,
            frontend,
            config.botConfig,
            constant,
        );
        const commonInternalErrorHandler = new CommonInternalErrorHandler(
            repository,
            frontend,
            config.botConfig,
            constant,
        );
        const commonUnsupportedMediaHandler = new CommonUnsupportedMediaHandler(
            repository,
            frontend,
            config.botConfig,
            constant,
        );
        const commonRootHandler = new CommonRootHandler(
            commonUnknownHandler,
            commonInternalErrorHandler,
            commonUnsupportedMediaHandler,
        );

        // Root Handler
        const rootHandler = new RootHandler(
            addWordRootHandler,
            wordReminderRootHandler,
            commonRootHandler,
        );

        this.gateway = new Gateway(
            grammyBot,
            router,
            contextManager,
            databaseManager,
            rootHandler,
        );
        this.gateway.configure();

        this.dailyCronJob = new CronJob(
            '0 9 * * *',
            async () => {
                const poolClient = await databaseManager.createTransaction();
                await repository.card.updateAllDueDates(poolClient);
                await repository.learner.resetDailyStatistics(poolClient);
                const notificationData =
                    await repository.learner.getNotificationData(poolClient);
                await databaseManager.commitTransaction(poolClient);

                await agent.sendReviewNotificationBatch(
                    notificationData.map((value: [string, number]) => {
                        return { learnerTid: value[0], noDues: value[1] };
                    }),
                );
            },
            null,
            false,
            'Asia/Tehran',
        );
    }

    public async start(): Promise<void> {
        if (typeof this.dailyCronJob !== 'undefined') {
            this.dailyCronJob.start();
        }

        if (typeof this.gateway !== 'undefined') {
            await this.gateway.open();
        }
    }

    public async stop(): Promise<void> {
        if (typeof this.dailyCronJob !== 'undefined') {
            this.dailyCronJob.stop();
        }

        if (typeof this.gateway !== 'undefined') {
            await this.gateway.close();
        }
    }
}
