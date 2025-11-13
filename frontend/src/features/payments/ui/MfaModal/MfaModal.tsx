import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (code: string) => void;
    errorMsg: string;
    clearErrorMsg: () => void;
    loading?: boolean;
}

export function MfaModal({
    open,
    onClose,
    onSubmit,
    errorMsg,
    clearErrorMsg,
    loading = false,
}: ModalProps) {
    const [code, setCode] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSubmit(code);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Confirm Payment
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Enter the 6-digit code from your authenticator app to confirm this
                            transaction.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                className="w-full border-gray-300 ronded-lg px-3 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                                placeholder="000000"
                                value={code}
                                onChange={(event) => {
                                    setCode(event.target.value.replace(/\D/g, ''));
                                    if (errorMsg) clearErrorMsg();
                                }}
                                disabled={loading}
                            />

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                                    disabled={loading || code.length !== 6}
                                >
                                    {loading ? 'Verifying...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.25 }}
                                className="bg-red-600 px-5 py-3 rounded-lg shadow-md text-white font-medium text-center w-full max-w-sm"
                                role="alert"
                            >
                                {errorMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
