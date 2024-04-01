import { PoolClient } from 'pg';
import { Learner } from '../database/models/learner';
import { TelegramContext } from './telegram-context';

export class RequestContext {
    public telegramContext: TelegramContext;
    public learner: Learner;
    public poolClient: PoolClient;

    public constructor(
        telegramContext: TelegramContext,
        learner: Learner,
        poolClient: PoolClient,
    ) {
        this.telegramContext = telegramContext;
        this.learner = learner;
        this.poolClient = poolClient;
    }
}
