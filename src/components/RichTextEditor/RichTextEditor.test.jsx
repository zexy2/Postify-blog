import { configureStore } from '@reduxjs/toolkit';
import React, { createRef } from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import aiReducer from '../../features/ai-assistant/store/aiSlice';
import RichTextEditor from './RichTextEditor';

describe('RichTextEditor', () => {
  it('mounts safely while AI ghost completion is enabled', async () => {
    const store = configureStore({ reducer: { ai: aiReducer } });
    const onChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container, unmount } = render(
      <Provider store={store}>
        <RichTextEditor content="" onChange={onChange} minHeight={240} maxHeight={480} />
      </Provider>,
    );

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')).toBeInTheDocument();
    });

    expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/editor view is not available/i);
    unmount();
    consoleError.mockRestore();
  });

  it('binds external validation semantics to the contenteditable surface', async () => {
    const store = configureStore({ reducer: { ai: aiReducer } });
    const editorRef = createRef();

    const { container } = render(
      <Provider store={store}>
        <div>
          <span id="content-label">Content</span>
          <span id="content-error">Required</span>
          <RichTextEditor
            ref={editorRef}
            content=""
            onChange={vi.fn()}
            ariaLabelledBy="content-label"
            ariaInvalid
            ariaDescribedBy="content-error"
          />
        </div>
      </Provider>,
    );

    await waitFor(() => expect(container.querySelector('.ProseMirror')).toBeInTheDocument());
    const editable = container.querySelector('.ProseMirror');
    expect(editable).toHaveAttribute('aria-labelledby', 'content-label');
    expect(editable).toHaveAttribute('aria-invalid', 'true');
    expect(editable).toHaveAttribute('aria-describedby', 'content-error');

    expect(editorRef.current.focus()).toBe(true);
    await waitFor(() => expect(editable).toHaveFocus());
  });

  it('imports and exports markdown through the editor document model', async () => {
    const store = configureStore({ reducer: { ai: aiReducer } });
    const onChange = vi.fn();
    const editorRef = createRef();

    const { container } = render(
      <Provider store={store}>
        <RichTextEditor ref={editorRef} content="" onChange={onChange} />
      </Provider>,
    );

    await waitFor(() => expect(container.querySelector('.ProseMirror')).toBeInTheDocument());
    expect(editorRef.current.importMarkdown('## Steps\n\n- Build\n- Verify')).toBe(true);

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(editorRef.current.getMarkdown()).toContain('## Steps');
    expect(editorRef.current.getMarkdown()).toContain('- Build');
  });

});
