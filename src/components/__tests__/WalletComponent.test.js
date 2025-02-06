import { render, screen, fireEvent, act } from '@testing-library/react';
import WalletComponent from '../WalletComponent';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

// Mock the Solana wallet adapter hooks
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: jest.fn(),
  useWallet: jest.fn(),
}));

describe('WalletComponent', () => {
  const mockConnection = {
    getBalance: jest.fn(),
    getLatestBlockhash: jest.fn(),
    confirmTransaction: jest.fn(),
  };

  const mockWallet = {
    publicKey: null,
    sendTransaction: jest.fn(),
  };

  beforeEach(() => {
    useConnection.mockReturnValue({ connection: mockConnection });
    useWallet.mockReturnValue(mockWallet);
    mockConnection.getBalance.mockResolvedValue(2000000000); // 2 SOL
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders wallet connect button when wallet is not connected', () => {
    render(<WalletComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays wallet balance when connected', async () => {
    const connectedWallet = {
      ...mockWallet,
      publicKey: { toString: () => 'test-public-key' },
    };
    useWallet.mockReturnValue(connectedWallet);

    await act(async () => {
      render(<WalletComponent />);
    });

    expect(screen.getByText('2 SOL')).toBeInTheDocument();
  });

  it('handles send transaction', async () => {
    const connectedWallet = {
      ...mockWallet,
      publicKey: { toString: () => 'test-public-key' },
      sendTransaction: jest.fn().mockResolvedValue('test-signature'),
    };
    useWallet.mockReturnValue(connectedWallet);

    mockConnection.getLatestBlockhash.mockResolvedValue({
      blockhash: 'test-blockhash',
      lastValidBlockHeight: 1234,
    });

    mockConnection.confirmTransaction.mockResolvedValue({
      value: { err: null },
    });

    await act(async () => {
      render(<WalletComponent />);
    });

    // Fill in transaction details
    fireEvent.change(screen.getByPlaceholder('Recipient Address'), {
      target: { value: 'valid-recipient-address' },
    });
    fireEvent.change(screen.getByPlaceholder('Amount in SOL'), {
      target: { value: '1' },
    });

    // Submit transaction
    await act(async () => {
      fireEvent.click(screen.getByText('Send SOL'));
    });

    expect(connectedWallet.sendTransaction).toHaveBeenCalled();
  });

  it('displays error for invalid recipient address', async () => {
    const connectedWallet = {
      ...mockWallet,
      publicKey: { toString: () => 'test-public-key' },
    };
    useWallet.mockReturnValue(connectedWallet);

    const consoleSpy = jest.spyOn(console, 'log');

    await act(async () => {
      render(<WalletComponent />);
    });

    // Try to submit with invalid address
    fireEvent.change(screen.getByPlaceholder('Recipient Address'), {
      target: { value: 'invalid-address' },
    });
    fireEvent.change(screen.getByPlaceholder('Amount in SOL'), {
      target: { value: '1' },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Send SOL'));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid recipient address:',
      expect.any(Error)
    );
  });
});