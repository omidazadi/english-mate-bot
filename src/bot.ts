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
import { ReviewWordGuessHandler } from './handlers/review-word/guess';
import { ReviewWordNavigateOutHandler } from './handlers/review-word/navigate-out';
import { ReviewWordRateHandler } from './handlers/review-word/rate';
import { ReviewWordRootHandler } from './handlers/review-word/root';
import { ReviewWordNavigateInHandler } from './handlers/review-word/navigate-in';
import { readFile } from 'fs/promises';
import { Logger } from './logger';
import { ManageWordNavigateInHandler } from './handlers/manage-word/navigate-in';
import { ManageWordNavigateOutHandler } from './handlers/manage-word/navigate-out';
import { ManageWordNavigateToModifyHandler } from './handlers/manage-word/navigate-to-modify';
import { ManageWordNavigateToDeleteHandler } from './handlers/manage-word/navigate-to-delete';
import { ManageWordNavigateToViewHandler } from './handlers/manage-word/navigate-to-view';
import { ManageWordBrowseHandler } from './handlers/manage-word/browse';
import { ManageWordDeleteHandler } from './handlers/manage-word/delete';
import { ManageWordModifyHandler } from './handlers/manage-word/modify';
import { ManageWordRootHandler } from './handlers/manage-word/root';
import { AdminNavigateInHandler } from './handlers/admin/navigate-in';
import { AdminNavigateOutHandler } from './handlers/admin/navigate-out';
import { AdminCommandHandler } from './handlers/admin/command';
import { AdminRootHandler } from './handlers/admin/root';
import { AddWordPublicBulkHandler } from './handlers/add-word/public-bulk';

export class Bot {
    private gateway: Gateway | undefined;
    private dailyCronJob: CronJob | undefined;
    private logger: Logger | undefined;

    public async configure(config: Config) {
        const constant = new Constant();
        const grammyBot = new GrammyBot(config.telegramConfig.botToken);
        this.logger = new Logger(config.loggerConfig);
        await this.logger.configure(grammyBot);
        const buttonTexts = JSON.parse(
            (await readFile('src/ui/button-texts.json', 'utf8')).toString(),
        );
        const frontend = new Frontend(grammyBot, buttonTexts, this.logger);
        frontend.configure();
        this.logger.setFrontend(frontend);
        const repository = new Repository();
        const databaseManager = new DatabaseManager(config.postgresConfig);
        await databaseManager.executeDDL();
        const contextManager = new ContextManager(
            repository,
            databaseManager,
            config.botConfig,
        );
        const router = new Router(buttonTexts);
        const agent = new Agent(frontend, config.agentConfig, constant);

        // Review Word Handlers
        const reviewWordGuessHandler = new ReviewWordGuessHandler(
            repository,
            frontend,
            constant,
        );
        const reviewWordNavigateInHandler = new ReviewWordNavigateInHandler(
            repository,
            frontend,
            constant,
        );
        const reviewWordNavigateOutHandler = new ReviewWordNavigateOutHandler(
            repository,
            frontend,
            constant,
        );
        const reviewWordRateHandler = new ReviewWordRateHandler(
            repository,
            frontend,
            constant,
            buttonTexts,
        );
        const reviewWordRootHandler = new ReviewWordRootHandler(
            reviewWordGuessHandler,
            reviewWordNavigateInHandler,
            reviewWordNavigateOutHandler,
            reviewWordRateHandler,
        );

        // Add Word Handlers
        const addWordNavigateInHandler = new AddWordNavigateInHandler(
            repository,
            frontend,
            constant,
        );
        const addWordNavigateOutHandler = new AddWordNavigateOutHandler(
            repository,
            frontend,
            constant,
        );
        const addWordFrontHandler = new AddWordFrontHandler(
            repository,
            frontend,
            constant,
        );
        const addWordBackHandler = new AddWordBackHandler(
            repository,
            frontend,
            constant,
        );
        const addWordPublicBulkHandler = new AddWordPublicBulkHandler(
            repository,
            frontend,
            constant,
        );
        const addWordRootHandler = new AddWordRootHandler(
            addWordNavigateInHandler,
            addWordNavigateOutHandler,
            addWordFrontHandler,
            addWordBackHandler,
            addWordPublicBulkHandler,
        );

        // Word Reminder Handlers
        const wordReminderJumpHandler = new WordReminderJumpHandler(
            repository,
            frontend,
            constant,
        );
        const wordReminderStatisticsHandler = new WordReminderStatisticsHandler(
            repository,
            frontend,
            constant,
        );
        const wordReminderTalkToAdminHandler =
            new WordReminderTalkToAdminHandler(
                repository,
                frontend,
                constant,
                grammyBot,
                config.botConfig,
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
            constant,
        );
        const commonInternalErrorHandler = new CommonInternalErrorHandler(
            repository,
            frontend,
            constant,
        );
        const commonUnsupportedMediaHandler = new CommonUnsupportedMediaHandler(
            repository,
            frontend,
            constant,
        );
        const commonRootHandler = new CommonRootHandler(
            commonUnknownHandler,
            commonInternalErrorHandler,
            commonUnsupportedMediaHandler,
        );

        // Manage Word Handlers
        const manageWordNavigateInHandler = new ManageWordNavigateInHandler(
            repository,
            frontend,
            constant,
        );
        const manageWordNavigateOutHandler = new ManageWordNavigateOutHandler(
            repository,
            frontend,
            constant,
        );
        const manageWordNavigateToModifyHandler =
            new ManageWordNavigateToModifyHandler(
                repository,
                frontend,
                constant,
            );
        const manageWordNavigateToDeleteHandler =
            new ManageWordNavigateToDeleteHandler(
                repository,
                frontend,
                constant,
            );
        const manageWordNavigateToViewHandler =
            new ManageWordNavigateToViewHandler(repository, frontend, constant);
        const manageWordBrowseHandler = new ManageWordBrowseHandler(
            repository,
            frontend,
            constant,
        );
        const manageWordDeleteHandler = new ManageWordDeleteHandler(
            repository,
            frontend,
            constant,
        );
        const manageWordModifyHandler = new ManageWordModifyHandler(
            repository,
            frontend,
            constant,
        );
        const manageWordRootHandler = new ManageWordRootHandler(
            manageWordNavigateInHandler,
            manageWordNavigateOutHandler,
            manageWordNavigateToModifyHandler,
            manageWordNavigateToDeleteHandler,
            manageWordNavigateToViewHandler,
            manageWordBrowseHandler,
            manageWordDeleteHandler,
            manageWordModifyHandler,
        );

        // Admin Handlers
        const adminNavigateInHandler = new AdminNavigateInHandler(
            repository,
            frontend,
            constant,
        );
        const adminNavigateOutHandler = new AdminNavigateOutHandler(
            repository,
            frontend,
            constant,
        );
        const adminCommandHandler = new AdminCommandHandler(
            repository,
            frontend,
            constant,
            grammyBot,
            config.classroomConfig,
            config.botConfig,
        );
        const adminRootHandler = new AdminRootHandler(
            adminNavigateInHandler,
            adminNavigateOutHandler,
            adminCommandHandler,
        );

        // Root Handler
        const rootHandler = new RootHandler(
            reviewWordRootHandler,
            addWordRootHandler,
            wordReminderRootHandler,
            manageWordRootHandler,
            adminRootHandler,
            commonRootHandler,
        );

        this.gateway = new Gateway(
            grammyBot,
            router,
            contextManager,
            databaseManager,
            rootHandler,
            this.logger,
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
                const totalCards = await repository.card.getNoAllCards(
                    poolClient,
                );
                await databaseManager.commitTransaction(poolClient);

                const [totalNotifications, totalDues] =
                    await agent.sendReviewNotificationBatch(
                        notificationData.map((value: [string, number]) => {
                            return { learnerTid: value[0], noDues: value[1] };
                        }),
                    );

                await this.logger?.dailyReport(
                    totalNotifications,
                    totalCards,
                    totalDues,
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
            this.gateway.open();
            if (typeof this.logger !== 'undefined') {
                await this.logger.log('Bot is live.');
            }
        }
    }

    public async stop(): Promise<void> {
        if (typeof this.dailyCronJob !== 'undefined') {
            this.dailyCronJob.stop();
        }

        if (typeof this.gateway !== 'undefined') {
            if (typeof this.logger !== 'undefined') {
                await this.logger.log('Bot is down.');
            }
            await this.gateway.close();
        }
    }
}
