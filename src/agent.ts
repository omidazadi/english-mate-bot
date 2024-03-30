import { setTimeout } from 'timers/promises';
import { AgentConfig } from './configs/agent-config';
import { Frontend } from './frontend';

export class Agent {
    private frontend: Frontend;
    private atWork: boolean;
    private agentConfig: AgentConfig;

    public constructor(frontend: Frontend, agentConfig: AgentConfig) {
        this.frontend = frontend;
        this.atWork = false;
        this.agentConfig = agentConfig;
    }

    public async sendReviewNotificationBatch(
        notificationBatch: Array<TelegramAgent.ReviewNotification>,
    ): Promise<void> {
        if (this.atWork === true) {
            throw new Error('TelegramAgent is busy.');
        }

        this.atWork = true;
        for (const notification of notificationBatch) {
            await this.frontend.sendSystemMessage(
                notification.learnerTid,
                'review-notification',
                {
                    context: { no_dues: notification.noDues },
                },
            );
            await setTimeout(this.agentConfig.delay);
        }
        this.atWork = false;
    }
}

export namespace TelegramAgent {
    export type ReviewNotification = {
        learnerTid: string;
        noDues: number;
    };
}
