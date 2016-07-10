import React from 'react';
import { branch as branchMixin } from 'baobab-react/mixins';

import Section from './Editor.Section.jsx';

import styles from './Editor.css';

export default React.createClass({
  displayName: 'iconotexte/Editor',
  mixins: [branchMixin],
  cursors: {
    sections: 'sections',
  },


  /**
   * Handlers:
   * *********
   */
  handleAppendSection() {
    const index = this.state.sections.length;
    this.props.actions.insertSection({ index });

    // Give the newly inserted section the focus:
    window.setTimeout(
      () => this.refs[`section-${ index }`].refs.editor.focus(),
      0
    );
  },
  handleInsertSection({ index, text, img }) {
    this.props.actions.insertSection({ index, text, img });

    // Give the newly inserted section the focus:
    window.setTimeout(
      () => this.refs[`section-${ index + 1 }`].refs.editor.focus(),
      0
    );
  },
  handleDeleteSection({ index }) {
    this.props.actions.deleteSection({ index });
  },
  handleChangeSectionText({ index, text }) {
    this.props.actions.updateSection({ index, updates: { text } });
  },
  handleChangeSectionImage({ index, img }) {
    this.props.actions.updateSection({ index, updates: { img } });
  },
  handleMergeAfter({ index }) {
    this.props.actions.mergeSectionAfter({ index });
  },
  handleMergeBefore({ index }) {
    this.props.actions.mergeSectionBefore({ index });

    // Give the first section the focus:
    this.refs[`section-${ index - 1 }`].refs.editor.focus();
  },


  /**
   * Rendering:
   * **********
   */
  render() {
    const { sections } = this.state;

    return (
      <div className={ styles.editor }>
        <ul>{
          sections.map((section, i) => (
            <li key={ i }>
              <Section
                ref={ `section-${ i }` }

                index={ i }
                section={ section }

                onNew={ this.handleInsertSection }
                onDelete={ this.handleDeleteSection }
                onChangeText={ this.handleChangeSectionText }
                onChangeImage={ this.handleChangeSectionImage }

                onMergeAfter={
                  (i < this.state.sections.length - 1) ?
                    this.handleMergeAfter :
                    null
                }
                onMergeBefore={
                  (i > 0) ?
                    this.handleMergeBefore :
                    null
                }
              />
            </li>
          ))
        }</ul>

        <div className={ styles.editor_editButtons }>
          <button
            className="ic-custom-button"
            onClick={ this.handleAppendSection }
          >
            <img src="../assets/icons/ico-edit-img-2.svg" />
          </button>
          <button
            className="ic-custom-button"
            onClick={ this.handleAppendSection }
          >
            <img src="../assets/icons/ico-edit-txt-2.svg" />
          </button>
        </div>
      </div>
    );
  },
});
