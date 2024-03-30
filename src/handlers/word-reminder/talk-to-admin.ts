import { Bot as GrammyBot } from 'grammy';
import { RequestContext } from '../../context/request-context';
import { Learner } from '../../database/models/learner';
import { Handler } from '../handler';
import { Repository } from '../../database/repositories/repository';
import { Frontend } from '../../frontend';
import { BotConfig } from '../../configs/bot-config';
import { Constant } from '../../constants/constant';

export class WordReminderTalkToAdminHandler extends Handler {
    private grammyBot: GrammyBot;

    public constructor(
        repository: Repository,
        frontend: Frontend,
        botConfig: BotConfig,
        constant: Constant,
        grammyBot: GrammyBot,
    ) {
        super(repository, frontend, botConfig, constant);
        this.grammyBot = grammyBot;
    }

    public async handle(requestContext: RequestContext): Promise<void> {
        const learner = new Learner(
            requestContext.user.id,
            requestContext.user.tid,
            { state: 'word-reminder' },
            requestContext.user.accessLevel,
            requestContext.user.dailyReviews,
            requestContext.user.dailyAddedCards,
        );
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        const adminUsername: any = await this.grammyBot.api.getChat(
            parseInt(this.botConfig.ownerTid),
        );
        await this.frontend.sendActionMessage(
            requestContext.user.tid,
            'word-reminder/talk-to-admin',
            {
                context: {
                    admin_username: adminUsername.username,
                },
            },
        );
    }
}
