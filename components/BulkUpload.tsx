'use client';

import { useState, useEffect } from 'react';

interface ChitSet {
  _id: string;
  name: string;
}

export default function BulkUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [chitSets, setChitSets] = useState<ChitSet[]>([]);
  const [selectedChitSets, setSelectedChitSets] = useState<string[]>([]);
  const [loadingSets, setLoadingSets] = useState(true);

  useEffect(() => {
    fetchChitSets();
  }, []);

  const fetchChitSets = async () => {
    try {
      const response = await fetch('/api/sets');
      const data = await response.json();
      if (data.success) {
        setChitSets(data.sets);
      }
    } catch (error) {
      console.error('Error fetching chit sets:', error);
    } finally {
      setLoadingSets(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleChitSetToggle = (setId: string) => {
    setSelectedChitSets(prev =>
      prev.includes(setId)
        ? prev.filter(id => id !== setId)
        : [...prev, setId]
    );
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (selectedChitSets.length > 0) {
      formData.append('chitSetIds', JSON.stringify(selectedChitSets));
    }

    try {
      const response = await fetch('/api/members/bulk', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        const chitSetNames = selectedChitSets.length > 0
          ? chitSets.filter(s => selectedChitSets.includes(s._id)).map(s => s.name).join(', ')
          : '';
        
        setResult({
          success: true,
          message: `Successfully uploaded ${data.count} members${chitSetNames ? ` and added to: ${chitSetNames}` : ''}`,
          count: data.count,
        });
        setFile(null);
        setSelectedChitSets([]);
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Refresh chit sets to show updated member counts
        fetchChitSets();
      } else {
        setResult({
          success: false,
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        message: 'Failed to upload file',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Bulk Upload Members</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSV File Format
        </label>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <p className="mb-2">Required columns: Name, Mobile, Email, Location, Aadhar</p>
          <p className="text-xs">Example:</p>
          <pre className="text-xs mt-1">
{`Name,Mobile,Email,Location,Aadhar
John Doe,9876543210,john@example.com,Mumbai,123456789012
Jane Smith,9876543211,jane@example.com,Delhi,123456789013`}
          </pre>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
          Select CSV File
        </label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {file && (
        <div className="mb-4 text-sm text-gray-600">
          Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </div>
      )}

      {/* Chit Set Selection */}
      {!loadingSets && (
        <div className="mb-4">
          {chitSets.length > 0 ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Members to Chit Sets
                <span className="text-xs text-gray-500 ml-2">(Select one or more)</span>
              </label>
              <div className="border-2 border-blue-200 rounded-md p-3 max-h-64 overflow-y-auto bg-blue-50">
                {chitSets.map((set) => (
                  <label key={set._id} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded mb-1">
                    <input
                      type="checkbox"
                      checked={selectedChitSets.includes(set._id)}
                      onChange={() => handleChitSetToggle(set._id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{set.name}</span>
                  </label>
                ))}
              </div>
              {selectedChitSets.length > 0 && (
                <p className="mt-2 text-sm font-medium text-blue-700">
                  ✓ {selectedChitSets.length} chit set(s) selected - Members will be added to these sets
                </p>
              )}
              {selectedChitSets.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  ⚠️ No chit sets selected - Members will be uploaded but not assigned to any set
                </p>
              )}
            </>
          ) : (
            <div className="border-2 border-amber-200 rounded-md p-4 bg-amber-50">
              <p className="text-sm text-amber-800 font-medium mb-2">
                ⚠️ No chit sets found
              </p>
              <p className="text-xs text-amber-700 mb-3">
                Create chit sets first before uploading members. You can create them from the &quot;Create Sets&quot; page or Management tab.
              </p>
              <a
                href="/admin/create-sets"
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                Go to Create Sets →
              </a>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload Members'}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {result.message}
        </div>
      )}
    </div>
  );
}

