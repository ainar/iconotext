import fs from 'fs';

import state from '../state.js';
import { t } from '../utils/translator.js';

const { dialog } = require('electron').remote; // eslint-disable-line

export default {
  setView(view) {
    state.set('view', view);
  },
  save() {
    dialog.showSaveDialog(
      {
        filters: [
          {
            name: t('nav.fileExtName'),
            extensions: ['iconotext'],
          },
        ],
      },
      fileName => {
        if (fileName === undefined) return;

        fs.writeFile(
          fileName,
          JSON.stringify(state.get('document')),
          err => {
            if (err) {
              dialog.showErrorBox(
                t('nav.saveFail'),
                err.message
              );
            } else {
              dialog.showMessageBox({
                message: t('nav.saveSuccess'),
                buttons: ['OK'],
              });
            }
          }
        );
      }
    );
  },
  open() {
    dialog.showOpenDialog(
      {
        filters: [
          {
            name: t('nav.fileExtName'),
            extensions: ['iconotext'],
          },
        ],
      },
      fileNames => {
        if (fileNames === undefined) return;
        const fileName = fileNames[0];

        fs.readFile(
          fileName,
          'utf-8',
          (err, data) => {
            if (err) {
              dialog.showErrorBox(
                t('nav.loadFail'),
                err.message
              );
            } else {
              let doc;

              try {
                doc = JSON.parse(data);
              } catch (e) {
                dialog.showErrorBox(
                  t('nav.parseFail'),
                  e.message
                );
              }

              if (doc) {
                state.set('document', doc);
              }
            }
          }
        );
      }
    );
  },
};
