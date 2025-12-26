import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: any;
  onSuccess: () => void;
}

export function EditAssetModal({ isOpen, onClose, holding, onSuccess }: EditAssetModalProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<string>(holding?.quantity?.toString() || '');
  const [price, setPrice] = useState<string>(holding?.purchase_price?.toString() || '');
  const [purchaseDate, setPurchaseDate] = useState<string>(
    holding?.purchase_date ? new Date(holding.purchase_date).toISOString().split('T')[0] : ''
  );
  const [notes, setNotes] = useState(holding?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!quantity || !price || !holding) return;

    setSubmitting(true);
    try {
      const newQuantity = parseFloat(quantity);
      const newPrice = parseFloat(price);
      const newValue = newQuantity * newPrice;

      const { error } = await supabase
        .from('portfolio_holdings')
        .update({
          quantity: newQuantity,
          purchase_price: newPrice,
          purchase_date: purchaseDate,
          current_value: newQuantity * holding.current_price,
          gain_loss: (holding.current_price - newPrice) * newQuantity,
          gain_loss_percent: ((holding.current_price - newPrice) / newPrice) * 100,
          notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', holding.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating holding:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !holding) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('editAsset')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Asset Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="font-semibold text-gray-900 text-lg">{holding.symbol}</div>
            <div className="text-sm text-gray-600">Güncel Fiyat: {holding.current_price.toFixed(2)} TL</div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('quantity')}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                step="0.0001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('purchasePrice')}
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('purchaseDate')}
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('notes')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!quantity || !price || submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('loading')}</span>
                </>
              ) : (
                <span>{t('save')}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
