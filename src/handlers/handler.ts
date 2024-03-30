import { BotConfig } from '../configs/bot-config';
import { Constant } from '../constants/constant';
import { Repository } from '../database/repositories/repository';
import { Frontend } from '../frontend';

export class Handler {
    protected repository: Repository;
    protected frontend: Frontend;
    protected botConfig: BotConfig;
    protected constant: Constant;

    public constructor(
        repository: Repository,
        frontend: Frontend,
        botConfig: BotConfig,
        constant: Constant,
    ) {
        this.repository = repository;
        this.frontend = frontend;
        this.botConfig = botConfig;
        this.constant = constant;
    }
}
