import { RequestContext } from '../../context/request-context';
import { ReviewWordGuessHandler } from './guess';
import { ReviewWordNavigateInHandler } from './navigate-in';
import { ReviewWordNavigateOutHandler } from './navigate-out';
import { ReviewWordRateHandler } from './rate';

export class ReviewWordRootHandler {
    private guessHandler: ReviewWordGuessHandler;
    private navigateInHandler: ReviewWordNavigateInHandler;
    private navigateOutHandler: ReviewWordNavigateOutHandler;
    private rateHandler: ReviewWordRateHandler;

    public constructor(
        guessHandler: ReviewWordGuessHandler,
        navigateInHandler: ReviewWordNavigateInHandler,
        navigateOutHandler: ReviewWordNavigateOutHandler,
        rateHandler: ReviewWordRateHandler,
    ) {
        this.guessHandler = guessHandler;
        this.navigateInHandler = navigateInHandler;
        this.navigateOutHandler = navigateOutHandler;
        this.rateHandler = rateHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        if (path === 'guess') {
            await this.guessHandler.handle(requestContext);
        } else if (path === 'navigate-in') {
            await this.navigateInHandler.handle(requestContext);
        } else if (path === 'navigate-out') {
            await this.navigateOutHandler.handle(requestContext);
        } else if (path === 'rate') {
            await this.rateHandler.handle(requestContext);
        }
    }
}
