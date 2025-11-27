import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Search, UserCheck } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReferencesSearch = ({ selectedReferences = [], onReferencesChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchMembers(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const searchMembers = async (query) => {
    setIsSearching(true);
    try {
      const response = await axios.get(`${API}/members/search`, {
        params: { search: query, limit: 10 }
      });
      setSearchResults(response.data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching members:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addReference = (member) => {
    // Check if already added
    const alreadyAdded = selectedReferences.some(
      ref => ref.membershipId === member.membershipId
    );
    
    if (!alreadyAdded) {
      const newReference = {
        membershipId: member.membershipId,
        name: member.name,
        photo: member.photo,
        addedOn: new Date().toISOString()
      };
      onReferencesChange([...selectedReferences, newReference]);
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const removeReference = (membershipId) => {
    onReferencesChange(
      selectedReferences.filter(ref => ref.membershipId !== membershipId)
    );
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="references-search">
        <UserCheck className="inline w-4 h-4 mr-1" />
        Recent References (Optional for Verification)
      </Label>
      
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="references-search"
            type="text"
            placeholder="Search active members by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="pl-10"
          />
        </div>
        
        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                {searchResults.map((member) => {
                  const isSelected = selectedReferences.some(
                    ref => ref.membershipId === member.membershipId
                  );
                  return (
                    <button
                      key={member.membershipId}
                      type="button"
                      onClick={() => !isSelected && addReference(member)}
                      disabled={isSelected}
                      className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition-colors ${
                        isSelected ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'cursor-pointer'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-lg">👤</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">ID: {member.membershipId}</p>
                      </div>
                      {isSelected && (
                        <span className="text-green-600 text-sm font-semibold">Added</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No active members found. Try a different search term.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected References */}
      {selectedReferences.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Selected References ({selectedReferences.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedReferences.map((ref) => (
              <div
                key={ref.membershipId}
                className="inline-flex items-center space-x-2 bg-green-50 border border-green-300 rounded-full px-3 py-1.5 text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {ref.photo ? (
                    <img
                      src={ref.photo}
                      alt={ref.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">👤</span>
                  )}
                </div>
                <span className="font-medium text-gray-800">{ref.name}</span>
                <button
                  type="button"
                  onClick={() => removeReference(ref.membershipId)}
                  className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                  aria-label="Remove reference"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Add members who can verify your profile. Only active (paid) members can be added as references.
      </p>
    </div>
  );
};

export default ReferencesSearch;
