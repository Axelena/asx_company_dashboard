import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
        <Loader2 className="size-10 text-[#20705c] animate-spin" />
        <span className="text-[#212529] font-medium">Loading company information...</span>
      </div>
    </div>
  );
}
