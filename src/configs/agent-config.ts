import { IsNotEmpty, IsNumber } from 'class-validator';

export class AgentConfig {
    @IsNumber()
    @IsNotEmpty()
    public delay: number;

    public constructor() {
        this.delay = parseInt(process.env.AGENT_DELAY!);
    }
}
