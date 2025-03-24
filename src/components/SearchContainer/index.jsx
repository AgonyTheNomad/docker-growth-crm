import React from 'react';

const SearchContainer = ({ 
  searchTerm, 
  handleSearchTermChange, 
  searchAcrossStatuses, 
  toggleSearchAcrossStatuses, 
  selectedFranchiseValue, 
  connected,
  showSearchResults,
  searchResults,
  isSearching,
  handleClearSearchResults,
  handleCheckboxChange
}) => {
  return (
    <div className="search-container bg-gray-900 p-4 mt-4 mb-4 rounded-md">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-2/3">
          <label className="label text-white mb-2 block">Search Clients</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchTermChange}
            placeholder="Search by name, email, phone, company..."
            className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md"
            disabled={!selectedFranchiseValue || !connected}
          />
          {searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
            <p className="text-xs text-gray-400 mt-1">Type at least 3 characters to search</p>
          )}
        </div>
        <div className="w-full md:w-1/3 mt-4 md:mt-7">
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              checked={searchAcrossStatuses}
              onChange={toggleSearchAcrossStatuses}
              className="mr-2"
              disabled={!selectedFranchiseValue || !connected}
            />
            <span>Search across all statuses</span>
          </label>
        </div>
      </div>
      
      {/* Search Results Display */}
      {showSearchResults && (
        <div className="search-results mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">
              Search Results ({searchResults.length})
            </h3>
            <button
              onClick={handleClearSearchResults}
              className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
            >
              Clear Results
            </button>
          </div>
          
          {isSearching ? (
            <div className="text-center py-8 text-white">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-96 overflow-y-auto bg-gray-800 rounded-md">
              <table className="min-w-full">
                <thead className="bg-gray-700 sticky top-0">
                  <tr>
                    <th className="py-2 px-4 text-left text-white">Client Name</th>
                    <th className="py-2 px-4 text-left text-white">Status</th>
                    <th className="py-2 px-4 text-left text-white">Contact</th>
                    <th className="py-2 px-4 text-left text-white">Growthbacker</th>
                    <th className="py-2 px-4 text-left text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(client => (
                    <tr key={client.id} className="border-t border-gray-700 hover:bg-gray-700">
                      <td className="py-2 px-4 text-white">{client.client_name}</td>
                      <td className="py-2 px-4 text-white">{client.status}</td>
                      <td className="py-2 px-4 text-white">
                        {client.email_address && (
                          <div className="text-sm text-gray-300">{client.email_address}</div>
                        )}
                        {client.mobile_phone_number && (
                          <div className="text-sm text-gray-300">{client.mobile_phone_number}</div>
                        )}
                      </td>
                      <td className="py-2 px-4 text-white">{client.growthbacker || 'None'}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => {
                            // This will select the client in the checkbox system
                            handleCheckboxChange(client.id);
                            
                            // This will scroll to the client's status column
                            const statusElement = document.getElementById(`status-column-${client.status}`);
                            if (statusElement) {
                              statusElement.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs"
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
            <div className="text-center py-8 text-white">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchContainer;