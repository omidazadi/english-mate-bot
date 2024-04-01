import { setTimeout } from 'timers/promises';
import { AgentConfig } from './configs/agent-config';
import { Frontend } from './frontend';
import { Constant } from './constants/constant';

export class Agent {
    private frontend: Frontend;
    private atWork: boolean;
    private agentConfig: AgentConfig;
    private constant: Constant;

    public constructor(
        frontend: Frontend,
        agentConfig: AgentConfig,
        constant: Constant,
    ) {
        this.frontend = frontend;
        this.atWork = false;
        this.agentConfig = agentConfig;
        this.constant = constant;
    }

    public async sendReviewNotificationBatch(
        notificationBatch: Array<TelegramAgent.ReviewNotification>,
    ): Promise<[number, number]> {
        if (this.atWork === true) {
            throw new Error('TelegramAgent is busy.');
        }

        this.atWork = true;
        let [totalLearners, totalDues] = [0, 0];
        for (const notification of notificationBatch) {
            notification.noDues = Math.min(
                notification.noDues,
                this.constant.card.dailyReviews,
            );
            if (notification.noDues > 0) {
                totalLearners += 1;
                totalDues += notification.noDues;
                await this.frontend.sendSystemMessage(
                    notification.learnerTid,
                    'review-notification',
                    {
                        context: {
                            no_dues: notification.noDues,
                        },
                    },
                );
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
