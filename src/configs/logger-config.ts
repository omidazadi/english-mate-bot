import { IsNotEmpty, IsString } from 'class-validator';

export class LoggerConfig {
    @IsString()
    @IsNotEmpty()
    public channelUsername: string;

    public constructor() {
        this.channelUsername = process.env.LOGGER_CHANNEL_USERNAME!;
    }
}
