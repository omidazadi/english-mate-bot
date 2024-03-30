import { PoolClient } from 'pg';
import { Learner } from '../database/models/learner';
import { TelegramContext } from './telegram-context';

export class RequestContext {
    public telegramContext: TelegramContext;
    public user: Learner;
    public poolClient: PoolClient;

    public constructor(
        telegramContext: TelegramContext,
        user: Learner,
        poolClient: PoolClient,
    ) {
        this.telegramContext = telegramContext;
        this.user = user;
        this.poolClient = poolClient;
    }
}
