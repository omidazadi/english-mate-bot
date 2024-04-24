import { setTimeout } from 'timers/promises';
import { AgentConfig } from './configs/agent-config';
import { Frontend } from './frontend';
import { Repository } from './database/repositories/repository';
import { PoolClient } from 'pg';
import { BotConfig } from './configs/bot-config';

export class Agent {
    private frontend: Frontend;
    private repository: Repository;
    private atWork: boolean;
    private agentConfig: AgentConfig;
    private botConfig: BotConfig;

    public constructor(
        frontend: Frontend,
        repository: Repository,
        agentConfig: AgentConfig,
        botConfig: BotConfig,
    ) {
        this.frontend = frontend;
        this.repository = repository;
        this.atWork = false;
        this.agentConfig = agentConfig;
        this.botConfig = botConfig;
    }

    public async sendReviewNotificationBatch(
        notificationBatch: Array<TelegramAgent.ReviewNotification>,
        poolClient: PoolClient,
    ): Promise<[number, number]> {
        if (this.atWork === true) {
            throw new Error('TelegramAgent is busy.');
        }

        this.atWork = true;
        let [totalLearners, totalDues] = [0, 0];
        for (const notification of notificationBatch) {
            if (notification.noDues > 0) {
                if (
                    await this.frontend.sendSystemMessage(
                        notification.learnerTid,
                        'review-notification',
                        {
                            context: {
                                no_dues: notification.noDues,
                                bot_username: this.botConfig.username.slice(
                                    1,
                                    this.botConfig.username.length,
                                ),
                            },
                        },
                    )
                ) {
                    totalLearners += 1;
                    totalDues += notification.noDues;
                } else {
                    await this.repository.learner.muteLearner(
                        notification.learnerTid,
                        poolClient,
                    );
                }

                await setTimeout(this.agentConfig.delay);
            }
        }
        this.atWork = false;

        return [totalLearners, totalDues];
    }
}

export namespace TelegramAgent {
    export type ReviewNotification = {
        learnerTid: string;
        noDues: number;
    };
}
