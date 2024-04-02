import { IsNotEmpty, IsString } from 'class-validator';

export class ClassroomConfig {
    @IsString()
    @IsNotEmpty()
    public channelUsername: string;

    public constructor() {
        this.channelUsername = process.env.CLASSROOM_CHANNEL_USERNAME!;
    }
}
