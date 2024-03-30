import { Context as GrammyContext, Bot as GrammyBot } from 'grammy';
import { Router } from './router';
import { ContextManager } from './context/context-manager';
import { RootHandler } from './handlers/root';
import { DatabaseManager } from './database/database-manager';

export class Gateway {
    private grammyBot: GrammyBot;
    private router: Router;
    private contextManager: ContextManager;
    private databaseManager: DatabaseManager;
    private rootHandler: RootHandler;

    public constructor(
        grammyBot: GrammyBot,
        router: Router,
        contextManager: ContextManager,
        databaseManager: DatabaseManager,
        rootHandler: RootHandler,
    ) {
        this.grammyBot = grammyBot;
        this.router = router;
        this.contextManager = contextManager;
        this.databaseManager = databaseManager;
        this.rootHandler = rootHandler;
    }

    public async configure(): Promise<void> {
        this.grammyBot.on('message', async (grammyContext: GrammyContext) => {
            const requestContext =
                await this.contextManager.buildRequestContext(grammyContext);
            if (
                requestContext.telegramContext.text !== null ||
                requestContext.telegramContext.photo !== null
            ) {
                try {
                    await this.rootHandler.handle(
                        this.router.route(requestContext),
                        requestContext,
                    );
                    await this.databaseManager.commitTransaction(
                        requestContext.poolClient,
                    );
                } catch (e: unknown) {
                    console.log(e);
                    await this.rootHandler.handle(
                        'common/internal-error',
                        requestContext,
                    );
                    await this.databaseManager.rollbackTransaction(
                        requestContext.poolClient,
                    );
                }
            } else {
                await this.rootHandler.handle(
                    'common/unsupported-media',
                    requestContext,
                );
                await this.databaseManager.rollbackTransaction(
                    requestContext.poolClient,
                );
            }
        });
    }

    public async open(): Promise<void> {
        await this.grammyBot.start();
    }

    public async close(): Promise<void> {
        await this.grammyBot.stop();
    }
}
