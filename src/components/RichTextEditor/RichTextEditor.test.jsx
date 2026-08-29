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
