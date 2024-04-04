import { IsNotEmpty, IsString } from 'class-validator';

export class BotConfig {
    @IsString()
    @IsNotEmpty()
    public username: string;

    @IsString()
    @IsNotEmpty()
    public ownerTid: string;

    @IsString()
    @IsNotEmpty()
    public version: string;

    public constructor() {
        this.username = process.env.BOT_USERNAME!;
        this.ownerTid = process.env.BOT_OWNER_TID!;
        this.version = process.env.BOT_VERSION!;
    }
}
