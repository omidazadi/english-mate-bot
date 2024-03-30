import { RequestContext } from '../../context/request-context';
import { CommonUnknownHandler } from './unknown';
import { CommonInternalErrorHandler } from './internal-error';
import { CommonUnsupportedMediaHandler } from './unsupported-media';

export class CommonRootHandler {
    private unknownHandler: CommonUnknownHandler;
    private internalErrorHandler: CommonInternalErrorHandler;
    private unsupportedMediaHandler: CommonUnsupportedMediaHandler;

    public constructor(
        unknownHandler: CommonUnknownHandler,
        internalErrorHandler: CommonInternalErrorHandler,
        unsupportedMediaHandler: CommonUnsupportedMediaHandler,
    ) {
        this.unknownHandler = unknownHandler;
        this.internalErrorHandler = internalErrorHandler;
        this.unsupportedMediaHandler = unsupportedMediaHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        if (path === 'unknown') {
            await this.unknownHandler.handle(requestContext);
        } else if (path === 'internal-error') {
            await this.internalErrorHandler.handle(requestContext);
        } else if (path === 'unsupported-media') {
            await this.unsupportedMediaHandler.handle(requestContext);
        }
    }
}
