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
import { useTranslation } from 'react-i18next';
import { useAICompletion, selectAIEnabled, selectGhostCompletionEnabled } from '../../features/ai-assistant';
import styles from './RichTextEditor.module.css';

const MenuBar = ({ editor }) => {
  const { i18n } = useTranslation();
  if (!editor) return null;
  const en = i18n.language?.startsWith('en');
  const label = (english, turkish) => (en ? english : turkish);

  const buttons = [
    {
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      icon: 'B',
      title: label('Bold', 'Kalın'),
      className: styles.bold,
    },
    {
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      icon: 'I',
      title: label('Italic', 'İtalik'),
      className: styles.italic,
    },
    {
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      icon: 'S',
      title: label('Strikethrough', 'Üstü çizili'),
      className: styles.strike,
    },
    {
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      icon: '</>',
      title: label('Code', 'Kod'),
    },
    { type: 'divider' },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      icon: 'H1',
      title: label('Heading 1', 'Başlık 1'),
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      icon: 'H2',
      title: label('Heading 2', 'Başlık 2'),
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      icon: 'H3',
      title: label('Heading 3', 'Başlık 3'),
    },
    { type: 'divider' },
    {
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      icon: '•',
      title: label('Bullet list', 'Madde işaretli liste'),
    },
    {
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      icon: '1.',
      title: label('Numbered list', 'Numaralı liste'),
    },
    {
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      icon: '"',
      title: label('Quote', 'Alıntı'),
    },
    {
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      icon: '{ }',
      title: label('Code block', 'Kod bloğu'),
    },
    { type: 'divider' },
    {
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().chain().focus().undo().run(),
      icon: '↩',
      title: label('Undo', 'Geri al'),
    },
    {
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().chain().focus().redo().run(),
      icon: '↪',
      title: label('Redo', 'Yinele'),
    },
  ];

  return (
    <div className={styles.menuBar} onFocusCapture={(event) => event.target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })}>
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
            aria-label={button.title}
            aria-pressed={button.isActive || undefined}
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
  placeholder,
  minHeight = 200,
  maxHeight = 500,
  readOnly = false,
}, forwardedRef) => {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder || t('posts.bodyPlaceholder');

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
        placeholder: resolvedPlaceholder,
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
