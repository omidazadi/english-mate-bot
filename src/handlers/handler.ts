import { BotConfig } from '../configs/bot-config';
import { Constant } from '../constants/constant';
import { Repository } from '../database/repositories/repository';
import { Frontend } from '../frontend';

export class Handler {
    protected repository: Repository;
    protected frontend: Frontend;
    protected constant: Constant;

    public constructor(
        repository: Repository,
        frontend: Frontend,
        constant: Constant,
    ) {
        this.repository = repository;
        this.frontend = frontend;
        this.constant = constant;
    }
}
