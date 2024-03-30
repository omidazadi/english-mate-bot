import { RequestContext } from '../../context/request-context';
import { AddWordBackHandler } from './back';
import { AddWordFrontHandler } from './front';
import { AddWordNavigateInHandler } from './navigate-in';
import { AddWordNavigateOutHandler } from './navigate-out';

export class AddWordRootHandler {
    private navigateInHandler: AddWordNavigateInHandler;
    private navigateOutHandler: AddWordNavigateOutHandler;
    private frontHandler: AddWordFrontHandler;
    private backHandler: AddWordBackHandler;

    public constructor(
        navigateInHandler: AddWordNavigateInHandler,
        navigateOutHandler: AddWordNavigateOutHandler,
        frontHandler: AddWordFrontHandler,
        backHandler: AddWordBackHandler,
    ) {
        this.navigateInHandler = navigateInHandler;
        this.navigateOutHandler = navigateOutHandler;
        this.frontHandler = frontHandler;
        this.backHandler = backHandler;
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
        }
    }
}
