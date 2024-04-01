import { ValidateNested } from 'class-validator';
import { TelegramConfig } from './telegram-config';
import { PostgresConfig } from './postgres-config';
import { BotConfig } from './bot-config';
import { AgentConfig } from './agent-config';
import { LoggerConfig } from './logger-config';

export class Config {
    @ValidateNested()
    public botConfig: BotConfig;

    @ValidateNested()
    public telegramConfig: TelegramConfig;

    @ValidateNested()
    public agentConfig: AgentConfig;

    @ValidateNested()
    public postgresConfig: PostgresConfig;

    @ValidateNested()
    public loggerConfig: LoggerConfig;

    public constructor() {
        this.botConfig = new BotConfig();
        this.telegramConfig = new TelegramConfig();
        this.agentConfig = new AgentConfig();
        this.postgresConfig = new PostgresConfig();
        this.loggerConfig = new LoggerConfig();
    }
}
