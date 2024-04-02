import { RequestContext } from '../../context/request-context';
import { AddWordBackHandler } from './back';
import { AddWordFrontHandler } from './front';
import { AddWordNavigateInHandler } from './navigate-in';
import { AddWordNavigateOutHandler } from './navigate-out';
import { AddWordPublicBulkHandler } from './public-bulk';

export class AddWordRootHandler {
    private navigateInHandler: AddWordNavigateInHandler;
    private navigateOutHandler: AddWordNavigateOutHandler;
    private frontHandler: AddWordFrontHandler;
    private backHandler: AddWordBackHandler;
    private publicBulkHandler: AddWordPublicBulkHandler;

    public constructor(
        navigateInHandler: AddWordNavigateInHandler,
        navigateOutHandler: AddWordNavigateOutHandler,
        frontHandler: AddWordFrontHandler,
        backHandler: AddWordBackHandler,
        publicBulkHandler: AddWordPublicBulkHandler,
    ) {
        this.navigateInHandler = navigateInHandler;
        this.navigateOutHandler = navigateOutHandler;
        this.frontHandler = frontHandler;
        this.backHandler = backHandler;
        this.publicBulkHandler = publicBulkHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        if (path === 'navigate-in') {
            await this.navigateInHandler.handle(requestContext);
        } else if (path === 'navigate-out') {
            await this.navigateOutHandler.handle(requestContext);
        } else if (path === 'front') {
            await this.frontHandler.handle(requestContext);
        } else if (path === 'back') {
            await this.backHandler.handle(requestContext);
        } else if (path === 'public-bulk') {
            await this.publicBulkHandler.handle(requestContext);
        }
    }
}
