import { RequestContext } from '../../context/request-context';
import { PremiumDetailsHandler } from './details';
import { PremiumNavigateInHandler } from './navigate-in';
import { PremiumNavigateOutHandler } from './navigate-out';

export class PremiumRootHandler {
    private navigateInHandler: PremiumNavigateInHandler;
    private navigateOutHandler: PremiumNavigateOutHandler;
    private detailsHandler: PremiumDetailsHandler;

    public constructor(
        navigateInHandler: PremiumNavigateInHandler,
        navigateOutHandler: PremiumNavigateOutHandler,
        detailsHandler: PremiumDetailsHandler,
    ) {
        this.navigateInHandler = navigateInHandler;
        this.navigateOutHandler = navigateOutHandler;
        this.detailsHandler = detailsHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        if (path === 'navigate-in') {
            await this.navigateInHandler.handle(requestContext);
        } else if (path === 'navigate-out') {
            await this.navigateOutHandler.handle(requestContext);
        } else if (path === 'details') {
            await this.detailsHandler.handle(requestContext);
        }
    }
}
