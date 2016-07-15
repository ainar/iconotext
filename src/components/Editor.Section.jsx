import React from 'react';
import ReactDOM from 'react-dom';
import { Editor, RichUtils, EditorState, ContentState } from 'draft-js';

import ImageBlock from './ImageBlock.jsx';
import ImageBlockEdit from './ImageBlockEdit.jsx';
import InlineToolbar from './Editor.InlineToolbar.jsx';

import { t } from '../utils/translator.js';
import selectionUtils from '../utils/selection.js';

const PARAGRAPH_SEP = '\n\n';

export default React.createClass({
  displayName: 'iconotexte/Editor.Section',

  /**
   * Lifecycle:
   * **********
   */
  getInitialState() {
    return {
      showToolbar: false,
      toolbarPosition: null,
      editorState: EditorState.createWithContent(
        ContentState.createFromText('')
      ),
    };
  },
  componentWillReceiveProps({ section: { text } }) {
    const { editorState } = this.state;
    const currentText = editorState
      .getCurrentContent()
      .getPlainText();

    if (text !== currentText) {
      this.setState({
        editorState: EditorState.createWithContent(
          ContentState.createFromText(text)
        ),
      });
    }
  },
  componentDidMount() {
    document.body.addEventListener('click', this.onClickBody);
  },
  componentWillUnmount() {
    document.body.removeEventListener('click', this.onClickBody);
  },

  /**
   * Handlers:
   * *********
   */
  onClickBody(e) {
    if (!this.props.editingImg) {
      return;
    }

    const dom = ReactDOM.findDOMNode(this);
    let node = e.target;
    let isOut = true;

    while (node) {
      if (node === dom) {
        isOut = false;
        break;
      }

      node = node.parentNode;
    }

    if (isOut) {
      this.props.editImg({ index: null });
    }
  },
  onClickEditImg() {
    this.props.editImg({ index: this.props.index });
  },
  onClickText() {
    this.refs.editor.focus();
  },
  toggleInlineStyle(inlineStyle) {
    this.onChangeText(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  },
  onChangeImg(img) {
    this.props.onChangeImg({
      img,
      index: this.props.index,
    });
    this.props.editImg({ index: null });
  },
  onTextBlur() {
    // There are some collision between this handler and this.onChangeText.
    // This setTimeout is here to ensure that the frame following the loss of
    // the focus, the editor will effectively lose its selection:
    setTimeout(
      () => this.setState({
        // Hide toolbar:
        showToolbar: false,

        // Clear current selection:
        editorState: EditorState.moveSelectionToEnd(
          this.state.editorState,
        ),
      }),
      0
    );
  },
  onChangeText(editorState) {
    const hasFocus = editorState.getSelection().getHasFocus();
    let newText = editorState.getCurrentContent().getPlainText();

    // Check selection:
    if (
      hasFocus &&
      !editorState.getSelection().isCollapsed() &&
      selectionUtils.getSelectionRange()
    ) {
      const selectionRange = selectionUtils.getSelectionRange();
      const selectionCoords = selectionUtils.getSelectionCoords(
        selectionRange,
        this.refs.text
      );

      this.setState({
        showToolbar: true,
        toolbarPosition: {
          top: selectionCoords.offsetTop,
          left: selectionCoords.offsetLeft,
        },
      });
    } else {
      this.setState({
        showToolbar: false,
      });
    }

    // Check if text has been updated:
    if (newText !== this.props.section.text) {
      // Split the section if new paragraph:
      if (~newText.indexOf(PARAGRAPH_SEP)) {
        const splitted = newText.split(PARAGRAPH_SEP);
        newText = splitted[0];

        // Insert new section:
        this.props.onNew({
          index: this.props.index,
          text: splitted.slice(1).join(PARAGRAPH_SEP),
        });
      }

      // Update current section else:
      this.props.onChangeText({
        index: this.props.index,
        text: newText,
      });
    }

    // Manually reset the current editor state to preserve the full editor
    // state:
    this.setState({ editorState });
  },
  onKeyCommand(e) {
    // TODO:
    // This feature is disabled at the moment (check Editor props).
    // The issues to solve are:
    //   1. If the cursor is at the beginning of a line (I guess an internal
    //      block?), then startOffset is 0.
    //   2. If there is a line break in the paragraph, then endOffset is not
    //      equal to the text length.

    const { editorState } = this.state;
    const selectionState = editorState.getSelection();

    const startOffset = selectionState.getStartOffset();
    const endOffset = selectionState.getEndOffset();
    const selectionLength = endOffset - startOffset;
    const textLength = editorState
      .getCurrentContent()
      .getPlainText()
      .length;

    // When pressing "backspace" at the beginning of the section, it will merge
    // it with the previous one:
    if (
      e === 'backspace' &&
      selectionLength === 0 &&
      startOffset === 0
    ) {
      this.props.onMergeBefore({ index: this.props.index });
      return true;
    }

    // When pressing "delete" at the end of the section, it will merge it with
    // the next one:
    if (
      e === 'delete' &&
      selectionLength === 0 &&
      endOffset === textLength
    ) {
      this.props.onMergeAfter({ index: this.props.index });
      return true;
    }

    return false;
  },

  /**
   * Rendering:
   * **********
   */
  render() {
    const { section, editingImg } = this.props;

    return (
      <div
        data-component="editor-section"
        data-full={ !!(section.img && section.text) || undefined }
      >
        <div className="wrapper">
          <div className="img">
            {
              (section.img && !editingImg) ?
                <ImageBlock
                  img={ section.img }
                  onDelete={ this.onChangeImg }
                /> :
                undefined
            }
            {
              editingImg ?
                <ImageBlockEdit
                  img={ section.img }
                  setImg={ this.onChangeImg }
                /> :
                undefined
            }
          </div>
        </div>

        <div className="icons">
          {
            !editingImg ?
              <button onClick={ this.onClickEditImg }>
                <img src="../assets/icons/ico-edit-img-1.svg" />
              </button> :
              null
          }
        </div>

        <div className="wrapper">
          <div
            ref="text"
            className="text"
            onClick={ this.onClickText }
          >
            {
              this.state.showToolbar ?
                <InlineToolbar
                  onToggle={ this.toggleInlineStyle }
                  editorState={ this.state.editorState }
                  position={ this.state.toolbarPosition }
                /> :
                null
            }
            <Editor
              ref="editor"
              placeholder={ t('Editor.Section.placeholder') }
              onBlur={ this.onTextBlur }
              onChange={ this.onChangeText }
              handleKeyCommand={ null /* this.onKeyCommand */ }
              editorState={ this.state.editorState }
            />
          </div>
        </div>
      </div>
    );
  },
});
