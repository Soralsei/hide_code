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

const hide_code_icon = new LabIcon({
  name: 'auto_init:init',
  svgstr: hide_code_svg
});

const show_code_icon = new LabIcon({
  name: 'auto_init:init',
  svgstr: show_code_svg
});

const EXT : string = 'hide_code';
const CODE : string = 'code';

/**
 * Initialization data for the hide_code extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'hide_code:plugin',
  autoStart: true,
  requires: [INotebookTracker, IMainMenu],
  activate: (app: JupyterFrontEnd, tracker: INotebookTracker, main_menu: IMainMenu) => {
    console.log('JupyterLab extension hide_code is activated!');

    const hide_command = EXT + ":hide";
    const show_command = EXT + ":show";
  }
};

export default plugin;
