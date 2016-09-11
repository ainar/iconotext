import Baobab from 'baobab';

export default new Baobab({

  // Interface language:
  locale: 'fr-FR',

  // Current view:
  // 'editor', 'about', 'preview', etc...
  view: 'welcome',

  // The "ui" branch only contains data related to UI manipulations, and are
  // not data to save:
  ui: {
    // The index of the section with the image import panel opened:
    sectionEditingImage: null,

    // True during the PDF generation:
    exporting: false,

    // True if modifications have been added since last document save:
    unsave: false,
  },

  // Document state:
  document: {
    // Sections format:
    // { text: '?HTMLString', img: '?Image', textIcon: '?int', imgIcon: '?int' }
    sections: [
      // Initial empty section
      {
        img: null,
        text: '',
        imgIcon: 1,
        textIcon: 1,
      },
    ],

    // Document metadata:
    //   - title
    //   - image
    //   - imageDescription
    //   - textDescription
    //   - author
    //   - date
    meta: [],
  },

  // Publication settings:
  publish: {
    // 'print' or 'screen'
    support: 'print',

    // 'a4' or 'pocket'
    format: 'a4',

    // 'portrait' or 'landscape'
    orientation: 'portrait',
  },
});
