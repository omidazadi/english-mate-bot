import { RequestContext } from '../../context/request-context';
import { SettingsNavigateInHandler } from './navigate-in';
import { SettingsNavigateOutHandler } from './navigate-out';
import { SettingsNavigateToSetMaximumHandler } from './navigate-to-set-maximum';
import { SettingsNavigateToSettingsHandler } from './navigate-to-settings';
import { SettingsSetMaximumReviewsHandler } from './set-maximum-reviews';
import { SettingsSetMutedUnmutedHandler } from './set-muted-unmuted';

export class SettingsRootHandler {
    private navigateInHandler: SettingsNavigateInHandler;
    private navigateOutHandler: SettingsNavigateOutHandler;
    private navigateToSetMaximumHandler: SettingsNavigateToSetMaximumHandler;
    private navigateToSettingsHandler: SettingsNavigateToSettingsHandler;
    private setMaximumReviewsHandler: SettingsSetMaximumReviewsHandler;
    private setMutedUnmutedHandler: SettingsSetMutedUnmutedHandler;

    public constructor(
        navigateInHandler: SettingsNavigateInHandler,
        navigateOutHandler: SettingsNavigateOutHandler,
        navigateToSetMaximumHandler: SettingsNavigateToSetMaximumHandler,
        navigateToSettingsHandler: SettingsNavigateToSettingsHandler,
        setMaximumReviewsHandler: SettingsSetMaximumReviewsHandler,
        setMutedUnmutedHandler: SettingsSetMutedUnmutedHandler,
    ) {
        this.navigateInHandler = navigateInHandler;
        this.navigateOutHandler = navigateOutHandler;
        this.navigateToSetMaximumHandler = navigateToSetMaximumHandler;
        this.navigateToSettingsHandler = navigateToSettingsHandler;
        this.setMaximumReviewsHandler = setMaximumReviewsHandler;
        this.setMutedUnmutedHandler = setMutedUnmutedHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        if (path === 'navigate-in') {
            await this.navigateInHandler.handle(requestContext);
        } else if (path === 'navigate-out') {
            await this.navigateOutHandler.handle(requestContext);
        } else if (path === 'navigate-to-set-maximum') {
            await this.navigateToSetMaximumHandler.handle(requestContext);
        } else if (path === 'navigate-to-settings') {
            await this.navigateToSettingsHandler.handle(requestContext);
        } else if (path === 'set-maximum-reviews') {
            await this.setMaximumReviewsHandler.handle(requestContext);
        } else if (path === 'set-muted-unmuted') {
            await this.setMutedUnmutedHandler.handle(requestContext);
        }
    }
}
