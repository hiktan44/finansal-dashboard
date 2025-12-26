import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  isVisible: boolean;
  message: string;
  progress?: number;
}

export function ProgressIndicator({ isVisible, message, progress }: ProgressIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {message}
          </h3>
          {progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <p className="text-sm text-gray-600">
            Lütfen bekleyin...
          </p>
        </div>
      </div>
    </div>
  );
}
