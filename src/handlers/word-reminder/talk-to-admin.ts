import { Bot as GrammyBot } from 'grammy';
import { RequestContext } from '../../context/request-context';
import { Handler } from '../handler';
import { Repository } from '../../database/repositories/repository';
import { Frontend } from '../../frontend';
import { BotConfig } from '../../configs/bot-config';
import { Constant } from '../../constants/constant';
import { instanceToInstance } from 'class-transformer';

export class WordReminderTalkToAdminHandler extends Handler {
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
        const learner = instanceToInstance(requestContext.learner);
        learner.data = { state: 'word-reminder' };
        await this.repository.learner.updateLearner(
            learner,
            requestContext.poolClient,
        );
        const adminUsername: any = await this.grammyBot.api.getChat(
            parseInt(this.botConfig.ownerTid),
        );
        await this.frontend.sendActionMessage(
            requestContext.learner.tid,
            'word-reminder/talk-to-admin',
            {
                context: {
                    admin_username: adminUsername.username,
                },
            },
        );
    }
}
