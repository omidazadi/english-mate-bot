import { RequestContext } from '../../context/request-context';
import { WordReminderTalkToAdminHandler } from './talk-to-admin';
import { WordReminderJumpHandler } from './jump';
import { WordReminderStatisticsHandler } from './statistics';

export class WordReminderRootHandler {
    private jumpHandler: WordReminderJumpHandler;
    private statisticsHandler: WordReminderStatisticsHandler;
    private talkToAdminHandler: WordReminderTalkToAdminHandler;

    public constructor(
        jumpHandler: WordReminderJumpHandler,
        statisticsHandler: WordReminderStatisticsHandler,
        talkToAdminHandler: WordReminderTalkToAdminHandler,
    ) {
        this.jumpHandler = jumpHandler;
        this.statisticsHandler = statisticsHandler;
        this.talkToAdminHandler = talkToAdminHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        if (path === 'jump') {
            await this.jumpHandler.handle(requestContext);
        } else if (path === 'statistics') {
            await this.statisticsHandler.handle(requestContext);
        } else if (path === 'talk-to-admin') {
            await this.talkToAdminHandler.handle(requestContext);
        }
    }
}
