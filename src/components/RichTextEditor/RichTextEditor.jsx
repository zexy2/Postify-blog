/**
 * RichTextEditor Component
 * TipTap-based rich text editor with formatting tools and AI assistance
 */

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import { useSelector } from 'react-redux';
import { useAICompletion, selectAIEnabled, selectGhostCompletionEnabled } from '../../features/ai-assistant';
import styles from './RichTextEditor.module.css';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const buttons = [
    {
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      icon: 'B',
      title: 'Bold',
      className: styles.bold,
    },
    {
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      icon: 'I',
      title: 'Italic',
      className: styles.italic,
    },
    {
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      icon: 'S',
      title: 'Strikethrough',
      className: styles.strike,
    },
    {
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      icon: '</>',
      title: 'Code',
    },
    { type: 'divider' },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      icon: 'H1',
      title: 'Heading 1',
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      icon: 'H2',
      title: 'Heading 2',
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      icon: 'H3',
      title: 'Heading 3',
    },
    { type: 'divider' },
    {
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      icon: '•',
      title: 'Bullet List',
    },
    {
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      icon: '1.',
      title: 'Numbered List',
    },
    {
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      icon: '"',
      title: 'Quote',
    },
    {
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      icon: '{ }',
      title: 'Code Block',
    },
    { type: 'divider' },
    {
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().chain().focus().undo().run(),
      icon: '↩',
      title: 'Undo',
    },
    {
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().chain().focus().redo().run(),
      icon: '↪',
      title: 'Redo',
    },
  ];

  return (
    <div className={styles.menuBar}>
      {buttons.map((button, index) => {
        if (button.type === 'divider') {
          return <div key={index} className={styles.divider} />;
        }

        return (
          <button
            key={index}
            type="button"
            onClick={button.action}
            disabled={button.disabled}
            className={`${styles.menuButton} ${button.isActive ? styles.active : ''} ${button.className || ''}`}
            title={button.title}
          >
            {button.icon}
          </button>
        );
      })}
    </div>
  );
};

const RichTextEditor = forwardRef(({
  content = '',
  onChange,
  placeholder = 'İçeriğinizi buraya yazın...',
  minHeight = 200,
  maxHeight = 500,
  readOnly = false,
}, forwardedRef) => {
  // AI feature state
  const aiEnabled = useSelector(selectAIEnabled);
  const ghostEnabled = useSelector(selectGhostCompletionEnabled);
  const editorRef = useRef(null);
  const [showGhostText, setShowGhostText] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Markdown,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange({
          html: editor.getHTML(),
          text: editor.getText(),
          json: editor.getJSON(),
        });
      }
    },
  });

  useImperativeHandle(forwardedRef, () => ({
    importMarkdown(markdown) {
      if (!editor) return false;
      return editor.commands.setContent(markdown || '', { contentType: 'markdown', emitUpdate: true });
    },
    getMarkdown() {
      return editor?.getMarkdown?.() || '';
    },
  }), [editor]);

  // Sync only genuine external content changes (draft restore / starter outline).
  useEffect(() => {
    if (!editor) return;
    const nextContent = content || '';
    const currentHtml = editor.getHTML();
    if (nextContent && nextContent !== currentHtml && editor.getText().trim().length === 0) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [content, editor]);

  // AI Completion hook
  const {
    suggestion,
    isLoading: aiLoading,
    requestCompletion,
    acceptSuggestion,
    dismissSuggestion,
    acceptWord,
  } = useAICompletion(editor);

  // Request completion on text change
  useEffect(() => {
    if (!editor || !aiEnabled || !ghostEnabled || readOnly) return;

    const handleUpdate = () => {
      const text = editor.getText();
      const { from } = editor.state.selection;
      
      // Only trigger if cursor is at end of content or after space
      if (text.length > 20) {
        requestCompletion(text, from);
      }
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, aiEnabled, ghostEnabled, readOnly, requestCompletion]);

  // Handle keyboard shortcuts for AI
  useEffect(() => {
    if (!editor || !aiEnabled || !ghostEnabled) return;

    const handleKeyDown = (event) => {
      // Only handle if we have a suggestion
      if (!suggestion) return;

      if (event.key === 'Tab') {
        event.preventDefault();
        acceptSuggestion();
        setShowGhostText(false);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        dismissSuggestion();
        setShowGhostText(false);
      } else if (event.key === 'ArrowRight' && event.metaKey) {
        // Cmd+Right to accept word by word
        event.preventDefault();
        acceptWord();
      } else if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
        // Any other key dismisses suggestion
        dismissSuggestion();
        setShowGhostText(false);
      }
    };

    // EditorContent can exist one effect tick before Tiptap exposes editor.view.
    // Bind to the mounted ProseMirror node instead of touching the throwing view getter.
    const editorDom = editorRef.current?.querySelector('.ProseMirror');
    if (!editorDom) return undefined;

    editorDom.addEventListener('keydown', handleKeyDown);

    return () => {
      editorDom.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, suggestion, aiEnabled, ghostEnabled, acceptSuggestion, dismissSuggestion, acceptWord]);

  // Show ghost text when suggestion is available
  useEffect(() => {
    setShowGhostText(!!suggestion);
  }, [suggestion]);

  return (
    <div className={styles.editor} ref={editorRef}>
      {!readOnly && <MenuBar editor={editor} />}
      <div className={styles.contentWrapper}>
        <EditorContent
          editor={editor}
          className={styles.content}
          style={{ minHeight, maxHeight }}
        />
        {/* Ghost Text Suggestion */}
        {showGhostText && suggestion && (
          <div className={styles.ghostTextContainer}>
            <span className={styles.ghostText}>{suggestion.text}</span>
            <span className={styles.ghostHint}>Tab ↹</span>
          </div>
        )}
        {/* AI Loading Indicator */}
        {aiLoading && aiEnabled && ghostEnabled && (
          <div className={styles.aiLoading}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        )}
      </div>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
