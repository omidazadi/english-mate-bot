import { Bot as GrammyBot } from 'grammy';
import { LoggerConfig } from './configs/logger-config';
import { Frontend } from './frontend';

export class Logger {
    private frontend: Frontend | undefined;
    private loggerConfig: LoggerConfig;
    private logChannelTid: string;

    public constructor(loggerConfig: LoggerConfig) {
        this.loggerConfig = loggerConfig;
        this.logChannelTid = '';
    }

    public async configure(grammyBot: GrammyBot) {
        this.logChannelTid = (
            await grammyBot.api.getChat(this.loggerConfig.channelUsername)
        ).id.toString();
    }

    public setFrontend(frontend: Frontend) {
        this.frontend = frontend;
    }

    public async log(message: string) {
        if (typeof this.frontend === 'undefined') {
            return;
        }

        await this.frontend.sendSystemMessage(this.logChannelTid, 'log', {
            context: {
                message: message,
                severity: 'log',
                date: new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Tehran',
                }),
            },
        });
    }

    public async warn(message: string) {
        if (typeof this.frontend === 'undefined') {
            return;
        }

        await this.frontend.sendSystemMessage(this.logChannelTid, 'warn', {
            context: {
                message: message,
                severity: 'warn',
                date: new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Tehran',
                }),
            },
        });
    }

    public async dailyReport(
        totalNotifications: number,
        totalCards: number,
        totalCardsByState: [number, number, number, number],
        totalDues: number,
    ) {
        if (typeof this.frontend === 'undefined') {
            return;
        }

        await this.frontend.sendSystemMessage(
            this.logChannelTid,
            'daily-report',
            {
                context: {
                    total_notifications: totalNotifications,
                    total_cards: totalCards,
                    new_cards: totalCardsByState[0],
                    learning_cards: totalCardsByState[1],
                    review_cards: totalCardsByState[2],
                    relearning_cards: totalCardsByState[3],
                    total_dues: totalDues,
                    severity: 'log',
                    date: new Date().toLocaleString('en-US', {
                        timeZone: 'Asia/Tehran',
                    }),
                },
            },
        );
    }
}
