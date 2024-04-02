import { RequestContext } from '../../context/request-context';
import { AdminCommandHandler } from './command';
import { AdminNavigateInHandler } from './navigate-in';
import { AdminNavigateOutHandler } from './navigate-out';

export class AdminRootHandler {
    private navigateInHandler: AdminNavigateInHandler;
    private navigateOutHandler: AdminNavigateOutHandler;
    private commandHandler: AdminCommandHandler;

    public constructor(
        navigateInHandler: AdminNavigateInHandler,
        navigateOutHandler: AdminNavigateOutHandler,
        commandHandler: AdminCommandHandler,
    ) {
        this.navigateInHandler = navigateInHandler;
        this.navigateOutHandler = navigateOutHandler;
        this.commandHandler = commandHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        if (path === 'navigate-in') {
            await this.navigateInHandler.handle(requestContext);
        } else if (path === 'navigate-out') {
            await this.navigateOutHandler.handle(requestContext);
        } else if (path === 'command') {
            await this.commandHandler.handle(requestContext);
        }
    }
}
