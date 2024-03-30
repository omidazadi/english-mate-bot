import { IsNotEmpty, IsString } from 'class-validator';

export class TelegramConfig {
    @IsString()
    @IsNotEmpty()
    public botToken: string;

    public constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN!;
    }
}
