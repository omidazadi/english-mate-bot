import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class PostgresConfig {
    @IsString()
    @IsNotEmpty()
    public host: string;

    @Min(0)
    @Max(65535)
    @IsNumber()
    @IsNotEmpty()
    public port: number;

    @IsString()
    @IsNotEmpty()
    public user: string;

    @IsString()
    @IsNotEmpty()
    public password: string;

    @IsString()
    @IsNotEmpty()
    public database: string;

    @Min(0)
    @Max(2000)
    @IsNumber()
    @IsNotEmpty()
    public connectionTimeout: number;

    @Min(0)
    @Max(1000)
    @IsNumber()
    @IsNotEmpty()
    public maxPoolCapacity: number;

    public constructor() {
        this.host = process.env.POSTGRES_HOST!;
        this.port = parseInt(process.env.POSTGRES_PORT!);
        this.user = process.env.POSTGRES_USER!;
        this.password = process.env.POSTGRES_PASSWORD!;
        this.database = process.env.POSTGRES_DATABASE!;
        this.connectionTimeout = parseInt(
            process.env.POSTGRES_CONNECTION_TIMEOUT!,
        );
        this.maxPoolCapacity = parseInt(
            process.env.POSTGRES_MAX_POOL_CAPACITY!,
        );
    }
}
