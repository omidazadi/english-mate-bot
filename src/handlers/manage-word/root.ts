import { RequestContext } from '../../context/request-context';
import { ManageWordBrowseHandler } from './browse';
import { ManageWordDeleteHandler } from './delete';
import { ManageWordModifyHandler } from './modify';
import { ManageWordNavigateInHandler } from './navigate-in';
import { ManageWordNavigateOutHandler } from './navigate-out';
import { ManageWordNavigateToDeleteHandler } from './navigate-to-delete';
import { ManageWordNavigateToModifyHandler } from './navigate-to-modify';
import { ManageWordNavigateToViewHandler } from './navigate-to-view';

export class ManageWordRootHandler {
    private navigateInHandler: ManageWordNavigateInHandler;
    private navigateOutHandler: ManageWordNavigateOutHandler;
    private navigateToModifyHandler: ManageWordNavigateToModifyHandler;
    private navigateToDeleteHandler: ManageWordNavigateToDeleteHandler;
    private navigateToViewHandler: ManageWordNavigateToViewHandler;
    private browseHandler: ManageWordBrowseHandler;
    private deleteHandler: ManageWordDeleteHandler;
    private modifyHandler: ManageWordModifyHandler;

    public constructor(
        navigateInHandler: ManageWordNavigateInHandler,
        navigateOutHandler: ManageWordNavigateOutHandler,
        navigateToModifyHandler: ManageWordNavigateToModifyHandler,
        navigateToDeleteHandler: ManageWordNavigateToDeleteHandler,
        navigateToViewHandler: ManageWordNavigateToViewHandler,
        browseHandler: ManageWordBrowseHandler,
        deleteHandler: ManageWordDeleteHandler,
        modifyHandler: ManageWordModifyHandler,
    ) {
        this.navigateInHandler = navigateInHandler;
        this.navigateOutHandler = navigateOutHandler;
        this.navigateToModifyHandler = navigateToModifyHandler;
        this.navigateToDeleteHandler = navigateToDeleteHandler;
        this.navigateToViewHandler = navigateToViewHandler;
        this.browseHandler = browseHandler;
        this.deleteHandler = deleteHandler;
        this.modifyHandler = modifyHandler;
    }

    public async handle(
        path: string,
        requestContext: RequestContext,
    ): Promise<void> {
        if (path === 'navigate-in') {
            await this.navigateInHandler.handle(requestContext);
        } else if (path === 'navigate-out') {
            await this.navigateOutHandler.handle(requestContext);
        } else if (path === 'navigate-to-modify') {
            await this.navigateToModifyHandler.handle(requestContext);
        } else if (path === 'navigate-to-delete') {
            await this.navigateToDeleteHandler.handle(requestContext);
        } else if (path === 'navigate-to-view') {
            await this.navigateToViewHandler.handle(requestContext);
        } else if (path === 'browse') {
            await this.browseHandler.handle(requestContext);
        } else if (path === 'delete') {
            await this.deleteHandler.handle(requestContext);
        } else if (path === 'modify') {
            await this.modifyHandler.handle(requestContext);
        }
    }
}
