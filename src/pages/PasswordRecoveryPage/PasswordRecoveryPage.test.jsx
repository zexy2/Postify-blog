import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PasswordRecoveryPage from './PasswordRecoveryPage';

const resetPassword = vi.fn();
const updatePassword = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    resetPassword,
    updatePassword,
    isLoading: false,
  }),
}));

describe('PasswordRecoveryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPassword.mockResolvedValue({ success: true });
    updatePassword.mockResolvedValue({ success: true });
  });

  it('requests a recovery email through the existing auth flow', async () => {
    render(
      <MemoryRouter>
        <PasswordRecoveryPage mode="request" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Hesap e-postası'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kurtarma bağlantısı gönder' }));

    await waitFor(() => expect(resetPassword).toHaveBeenCalledWith('user@example.com'));
    await waitFor(() => expect(screen.getByText('Kurtarma e-postası gönderildi.')).toBeVisible());
  });


  it('focuses and marks only the invalid recovery field', async () => {
    render(
      <MemoryRouter>
        <PasswordRecoveryPage mode="request" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Kurtarma bağlantısı gönder' }));
    const email = screen.getByLabelText('Hesap e-postası');
    await waitFor(() => expect(email).toHaveFocus());
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAttribute('aria-describedby', 'recovery-form-error');
  });

  it('routes reset-password validation to the field that needs correction', async () => {
    render(
      <MemoryRouter>
        <PasswordRecoveryPage mode="update" />
      </MemoryRouter>,
    );

    const password = screen.getByLabelText('Yeni şifre');
    const confirm = screen.getByLabelText('Yeni şifreyi doğrula');
    const submit = screen.getByRole('button', { name: 'Şifreyi güncelle' });

    fireEvent.click(submit);
    await waitFor(() => expect(password).toHaveFocus());
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(confirm).toHaveAttribute('aria-invalid', 'false');

    fireEvent.change(password, { target: { value: 'secure-pass-123' } });
    fireEvent.change(confirm, { target: { value: 'different-pass-456' } });
    fireEvent.click(submit);

    await waitFor(() => expect(confirm).toHaveFocus());
    expect(password).toHaveAttribute('aria-invalid', 'false');
    expect(confirm).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Şifreler eşleşmiyor.');
  });

  it('updates the password when the recovery session has matching credentials', async () => {
    render(
      <MemoryRouter>
        <PasswordRecoveryPage mode="update" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Yeni şifre'), { target: { value: 'secure-pass-123' } });
    fireEvent.change(screen.getByLabelText('Yeni şifreyi doğrula'), { target: { value: 'secure-pass-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Şifreyi güncelle' }));

    await waitFor(() => expect(updatePassword).toHaveBeenCalledWith('secure-pass-123'));
    await waitFor(() => expect(screen.getByText('Şifre güncellendi.')).toBeVisible());
  });
});
