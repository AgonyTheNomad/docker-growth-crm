import React, { useState, useEffect, useRef } from 'react';

const ClientSearch = ({
  connected,
  selectedFranchiseValue,
  sendMessage,
  handleCheckboxChange,
  searchResults,
  setSearchResults,
  // NEW: callback prop to open the card in parent; defaulting to no-op to avoid errors
  onSelectClient = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [searchParams, setSearchParams] = useState(null);
  const maxRetries = 3;
  const searchTimeoutRef = useRef(null);

  // Reset state whenever connection or franchise changes
  useEffect(() => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setRetryCount(0);
    clearTimeout(searchTimeoutRef.current);
  }, [connected, selectedFranchiseValue, setSearchResults]);

  // Handle search term input changes
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // This effect watches for search results and retries with different strategies if needed
  useEffect(() => {
    if (
      isSearching &&
      searchResults &&
      Array.isArray(searchResults) &&
      searchResults.length === 0 &&
      retryCount < maxRetries &&
      searchParams
    ) {
      const retryStrategies = [
        // Strategy 1: Try with first word only
        () => {
          const firstWord = searchParams.searchTerm.split(' ')[0];
          if (firstWord && firstWord.length >= 3) {
            console.log(`Retry ${retryCount + 1}: Searching with first word only: "${firstWord}"`);
            return { ...searchParams, searchTerm: firstWord };
          }
          return null;
        },
        // Strategy 2: Try with last word only
        () => {
          const words = searchParams.searchTerm.split(' ');
          const lastWord = words[words.length - 1];
          if (lastWord && lastWord.length >= 3 && words.length > 1) {
            console.log(`Retry ${retryCount + 1}: Searching with last word only: "${lastWord}"`);
            return { ...searchParams, searchTerm: lastWord };
          }
          return null;
        },
        // Strategy 3: Try reversing the word order
        () => {
          const words = searchParams.searchTerm.split(' ');
          if (words.length > 1) {
            const reversed = words.reverse().join(' ');
            console.log(`Retry ${retryCount + 1}: Searching with reversed order: "${reversed}"`);
            return { ...searchParams, searchTerm: reversed };
          }
          return null;
        }
      ];

      const strategy = retryStrategies[retryCount];
      if (strategy) {
        const newParams = strategy();
        if (newParams) {
          // Schedule the retry after a short delay
          searchTimeoutRef.current = setTimeout(() => {
            sendMessage(newParams);
            setRetryCount((prev) => prev + 1);
          }, 2500); // 2.5 second delay
        } else {
          // If the strategy returned null, try the next strategy
          setRetryCount((prev) => prev + 1);
        }
      }
    } else if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
      // Reset retry count if we got results
      setRetryCount(0);
      setIsSearching(false);
    } else if (retryCount >= maxRetries) {
      // Stop searching after max retries
      setIsSearching(false);
    }
  }, [searchResults, isSearching, retryCount, searchParams, sendMessage]);

  // Handle search - explicit button click or Enter key
  const handleSearch = () => {
    if (searchTerm.trim().length < 3) return;

    setIsSearching(true);
    setRetryCount(0);
    clearTimeout(searchTimeoutRef.current);

    console.log(`Searching for: "${searchTerm}"`);

    const params = {
      type: 'searchInStatus',
      status: null,
      searchTerm: searchTerm.trim(),
      searchAcrossStatuses: true
    };

    setSearchParams(params);
    sendMessage(params);
    setShowResults(true);
  };

  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Update when results change
  useEffect(() => {
    console.log('Results updated:', searchResults?.length || 0);
    if (!isSearching || (searchResults?.length || 0) > 0) {
      setIsSearching(false);
    }
  }, [searchResults, isSearching]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => clearTimeout(searchTimeoutRef.current);
  }, []);

  // NEW: handle the user clicking "Select" in the results
  const handleSelectClient = (client) => {
    // Optionally toggle the checkbox
    handleCheckboxChange(client.id);

    // Hide the search results overlay
    setShowResults(false);

    // Call the parent callback to open the card
    onSelectClient(client);
  };

  return (
    <>
      <div className="search-container bg-gray-900 p-3 my-3 rounded-md">
        <div className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchTermChange}
            onKeyPress={handleKeyPress}
            placeholder="Search clients..."
            className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-l-md"
          />
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded-r-md"
            onClick={handleSearch}
            disabled={searchTerm.trim().length < 3 || isSearching}
          >
            {isSearching
              ? retryCount > 0
                ? `Retrying (${retryCount}/${maxRetries})...`
                : 'Searching...'
              : 'Search'}
          </button>
        </div>
        {searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
          <p className="text-xs text-gray-400 mt-1">Type at least 3 characters</p>
        )}
      </div>

      {showResults && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 99999 }}>
          <div
            className="fixed inset-0 bg-black bg-opacity-70"
            onClick={() => setShowResults(false)}
          />
          <div
            className="relative bg-gray-900 p-4 rounded-lg shadow-xl"
            style={{ width: '90%', maxWidth: '600px', maxHeight: '60vh', overflowY: 'auto' }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg text-white">
                Search Results: {Array.isArray(searchResults) ? searchResults.length : 0}
                {isSearching && retryCount > 0 && (
                  <span className="ml-2 text-sm text-gray-400">
                    (Attempt {retryCount + 1}/{maxRetries + 1})
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowResults(false)}
                className="px-3 py-1 bg-gray-700 text-white rounded-md"
              >
                Close
              </button>
            </div>

            {isSearching ? (
              <div className="text-center py-10 text-white">
                {retryCount > 0 ? (
                  <div>
                    <p>Trying alternative search...</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Attempt {retryCount + 1} of {maxRetries + 1}
                    </p>
                  </div>
                ) : (
                  <div>Searching...</div>
                )}
              </div>
            ) : searchResults && Array.isArray(searchResults) && searchResults.length > 0 ? (
              <div className="bg-gray-800 rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-2 text-left text-white">Name</th>
                      <th className="p-2 text-left text-white">Status</th>
                      <th className="p-2 text-left text-white">Email</th>
                      <th className="p-2 text-center text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((client) => (
                      <tr key={client.id} className="border-t border-gray-700">
                        <td className="p-2 text-white">{client.client_name}</td>
                        <td className="p-2 text-white">{client.status}</td>
                        <td className="p-2 text-white">{client.email_address}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleSelectClient(client)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-800 rounded-md text-white">
                <p className="mb-2">No results found</p>
                {retryCount >= maxRetries ? (
                  <div>
                    <p className="text-sm text-gray-400">Tried multiple search strategies</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Try a different search term or check spelling
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Try a different search term</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ClientSearch;
