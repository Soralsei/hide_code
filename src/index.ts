import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
    INotebookTracker,
    NotebookPanel
} from '@jupyterlab/notebook';

import { IMainMenu } from '@jupyterlab/mainmenu';
import { Cell, CodeCell } from "@jupyterlab/cells";
import { LabIcon } from "@jupyterlab/ui-components";
import { ToolbarButton } from "@jupyterlab/apputils";

import hide_code_svg from "../resources/hide.svg";
import show_code_svg from "../resources/show.svg";

const EXT: string = 'hide_code';
const CODE: string = 'code';
const SHOW_META = 'show_input';

const hide_code_icon = new LabIcon({
    name: EXT + ":hide",
    svgstr: hide_code_svg
});

const show_code_icon = new LabIcon({
    name: EXT + ":show",
    svgstr: show_code_svg
});

function hideCodeCells(tracker: INotebookTracker, manager: VisibilityManager) {
    const notebook: NotebookPanel | null = tracker.currentWidget;
    if (notebook !== null) {
        notebook.content.widgets.map((cell: Cell) => {
            if (cell.model.type === CODE) {
                const code = cell as CodeCell;
                const metadata = code.model.metadata;

                code.inputArea.hide();
                metadata.set(SHOW_META, false);
            }
        });
        manager.update(notebook, false);
    }
}

function showCodeCells(tracker: INotebookTracker, manager: VisibilityManager) {
    const notebook: NotebookPanel | null = tracker.currentWidget;
    if (notebook !== null) {
        notebook.content.widgets.map((cell: Cell) => {
            if (cell.model.type === CODE) {
                const code = cell as CodeCell;
                const metadata = code.model.metadata;
                
                code.inputArea.show();
                metadata.set(SHOW_META, true);
            }
        });
        manager.update(notebook, true);
    }
}

class VisibilityManager {
    private tracker: INotebookTracker;
    private hide_button: ToolbarButton;
    private show_button: ToolbarButton;
    private states: Map<string, boolean>;

    constructor(hide: ToolbarButton, show: ToolbarButton, tracker: INotebookTracker) {
        this.hide_button = hide;
        this.tracker = tracker;
        this.show_button = show;
        this.states = new Map<string, boolean>();
    }

    public init(notebook: NotebookPanel) {
        let isVisible: boolean = true;
        for (let cell of notebook.content.widgets) {
            // console.log(cell.model.type)
            if (cell.model.type === CODE) {
                const code = cell as CodeCell;
                const metadata = code.model.metadata;
                isVisible = !metadata.has(SHOW_META) || metadata.get(SHOW_META) as boolean;
                hideCodeCells(this.tracker, this);
                break;
            }
        }
        this.update(notebook, isVisible);
    }

    public update(notebook: NotebookPanel, state: boolean) {
        this.states.set(notebook.id, state);
        this.onChange(notebook);
    }

    public initIfNecessary(notebook: NotebookPanel) {
        if (!this.states.has(notebook.id)) {
            // console.log("initializing hide_code");
            this.init(notebook);
        }
    }

    public onChange(notebook: NotebookPanel | null) {
        if (notebook !== null) {
            const toolbar = notebook.toolbar;
            toolbar.addItem('hide_code', this.hide_button);
            toolbar.addItem('show_code', this.show_button);
            if (this.states.get(notebook.id)) {
                this.hide_button.show();
                this.show_button.hide();
            } else {
                this.hide_button.hide();
                this.show_button.show();
            }
        }
    }
}

/**
 * Initialization data for the hide_code extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
    id: 'hide_code:plugin',
    autoStart: true,
    requires: [INotebookTracker, IMainMenu],
    activate: (app: JupyterFrontEnd, tracker: INotebookTracker, main_menu: IMainMenu) => {
        // console.log('JupyterLab extension hide_code is activated!');

        const hide_command: string = EXT + ":hide";
        const show_command: string = EXT + ":show";
        const hide_button = new ToolbarButton({
            icon: hide_code_icon,
            onClick: () => {
                hideCodeCells(tracker, manager);
            }
        })
        const show_button = new ToolbarButton({
            icon: show_code_icon,
            onClick: () => {
                showCodeCells(tracker, manager);
            }
        })
        const manager = new VisibilityManager(hide_button, show_button, tracker);

        app.commands.addCommand(hide_command, {
            label: 'Hide all code input',
            execute: () => {
                hideCodeCells(tracker, manager);
            }
        });

        app.commands.addCommand(show_command, {
            label: 'Show all code input',
            execute: () => {
                showCodeCells(tracker, manager);
            }
        });

        tracker.currentChanged.connect((_, notebookPanel: NotebookPanel | null) => {
            notebookPanel?.context.ready.then(async () => {
                return notebookPanel?.context.sessionContext.ready;
            }).then(() => {
                manager.initIfNecessary(notebookPanel);
            });
            manager.onChange(notebookPanel);
        });

        main_menu.editMenu.addGroup([
            { command: hide_command },
            { command: show_command }
        ], 10);
    }
};

export default plugin;
