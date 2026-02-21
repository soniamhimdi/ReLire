import React, { useState } from 'react';
import type { BookFilters as FiltersType, BookFiltersProps } from '../../types';
import './BookFilters.css';

const BookFilters: React.FC<BookFiltersProps> = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState<FiltersType>({
    category: initialFilters.category,
    ageRange: initialFilters.ageRange,
    minPrice: initialFilters.minPrice,
    maxPrice: initialFilters.maxPrice,
    condition: initialFilters.condition,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newValue = value === '' ? undefined : 
                     (name.includes('Price') ? Number(value) : value);
    
    const newFilters = { ...filters, [name]: newValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="filters-panel">
      <div className="filters-header">
        <h3>Filtres</h3>
        <button onClick={handleReset} className="btn-reset">
          Réinitialiser
        </button>
      </div>
      
      <div className="filter-group">
        <label htmlFor="category">Catégorie</label>
        <select
          id="category"
          name="category"
          value={filters.category || ''}
          onChange={handleChange}
        >
          <option value="">Toutes les catégories</option>
          <option value="EDUCATIONAL">Éducatif</option>
          <option value="CHILDREN">Jeunesse</option>
          <option value="TEXTBOOK">Manuel scolaire</option>
          <option value="NOVEL">Roman</option>
          <option value="COMIC">Bande dessinée</option>
          <option value="NON_FICTION">Documentaire</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="ageRange">Tranche d'âge</label>
        <select
          id="ageRange"
          name="ageRange"
          value={filters.ageRange || ''}
          onChange={handleChange}
        >
          <option value="">Tous les âges</option>
          <option value="0-2">0-2 ans</option>
          <option value="3-5">3-5 ans</option>
          <option value="6-8">6-8 ans</option>
          <option value="9-12">9-12 ans</option>
          <option value="13-17">13-17 ans</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="condition">État</label>
        <select
          id="condition"
          name="condition"
          value={filters.condition || ''}
          onChange={handleChange}
        >
          <option value="">Tous les états</option>
          <option value="NEW">Neuf</option>
          <option value="VERY_GOOD">Très bon état</option>
          <option value="GOOD">Bon état</option>
          <option value="ACCEPTABLE">État correct</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Prix ($)</label>
        <div className="price-inputs">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={handleChange}
            min="0"
          />
          <span>à</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default BookFilters;