import { X } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100] transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative pointer-events-auto animate-in fade-in zoom-in duration-200">
          <button onClick={onClose} className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-6 mt-2">
            <h2 className="text-xl font-bold text-gray-900">Size Guide</h2>
            <p className="text-sm text-gray-500 mt-1">Use this guide to find your perfect fit.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-tl-lg">Size</th>
                  <th scope="col" className="px-6 py-3">Chest (in)</th>
                  <th scope="col" className="px-6 py-3">Waist (in)</th>
                  <th scope="col" className="px-6 py-3 rounded-tr-lg">Length (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">S</th>
                  <td className="px-6 py-4">36-38</td>
                  <td className="px-6 py-4">30-32</td>
                  <td className="px-6 py-4">28</td>
                </tr>
                <tr className="bg-white border-b">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">M</th>
                  <td className="px-6 py-4">38-40</td>
                  <td className="px-6 py-4">32-34</td>
                  <td className="px-6 py-4">29</td>
                </tr>
                <tr className="bg-white border-b">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">L</th>
                  <td className="px-6 py-4">40-42</td>
                  <td className="px-6 py-4">34-36</td>
                  <td className="px-6 py-4">30</td>
                </tr>
                <tr className="bg-white">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">XL</th>
                  <td className="px-6 py-4">42-44</td>
                  <td className="px-6 py-4">36-38</td>
                  <td className="px-6 py-4">31</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
            <strong>Note:</strong> Measurements are approximate. For specific sizing questions, please contact us.
          </div>
        </div>
      </div>
    </>
  );
}
