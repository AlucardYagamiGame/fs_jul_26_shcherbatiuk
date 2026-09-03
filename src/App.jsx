/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    oneCategory => oneCategory.id === product.categoryId,
  ); // find by product.categoryId
  const user =
    usersFromServer.find(oneUser => oneUser.id === category.ownerId) || null; // find by category.ownerId

  return {
    ...product,
    category,
    user,
  };
});

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Product' },
  { key: 'categoryId', label: 'Category' },
  { key: 'user', label: 'User' },
];

export const App = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  const handleSort = column => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = column => {
    if (sortColumn !== column) return 'fa-sort';

    return sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  };

  const filteredProducts = products.filter(product => {
    if (selectedUser && product.user?.id !== selectedUser) {
      return false;
    }

    if (
      searchInput &&
      !product.name.toLowerCase().includes(searchInput.toLowerCase())
    ) {
      return false;
    }

    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(product.categoryId)
    ) {
      return false;
    }

    return true;
  });

  const getValue = product => {
    if (sortColumn === 'id') return product.id;
    if (sortColumn === 'name') return product.name;
    if (sortColumn === 'categoryId') return product.category.title;

    return product.user.name;
  };

  const compareProducts = (firstProduct, secondProduct) => {
    const comparison =
      getValue(firstProduct) > getValue(secondProduct) ? 1 : -1;

    return sortDirection === 'asc' ? comparison : -comparison;
  };

  const displayedProducts =
    sortColumn && sortDirection
      ? [...filteredProducts].sort(compareProducts)
      : filteredProducts;

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': selectedUser === null })}
                onClick={event => {
                  event.preventDefault();
                  setSelectedUser(null);
                }}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({ 'is-active': selectedUser === user.id })}
                  onClick={event => {
                    event.preventDefault();
                    setSelectedUser(user.id);
                  }}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={searchInput}
                  onChange={event => setSearchInput(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {searchInput && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setSearchInput('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length > 0,
                })}
                onClick={event => {
                  event.preventDefault();
                  setSelectedCategories([]);
                }}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category.id),
                  })}
                  href="#/"
                  onClick={event => {
                    event.preventDefault();
                    setSelectedCategories(prev => {
                      return prev.includes(category.id)
                        ? prev.filter(id => id !== category.id)
                        : [...prev, category.id];
                    });
                  }}
                >
                  {category.title}
                </a>
              ))}
            </div>
            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={event => {
                  event.preventDefault();
                  setSelectedUser(null);
                  setSearchInput('');
                  setSelectedCategories([]);
                  setSortColumn(null);
                  setSortDirection(null);
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {filteredProducts.length === 0 && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
          {filteredProducts.length > 0 && (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {columns.map(column => (
                    <th key={column.key}>
                      <a
                        href="#/"
                        onClick={e => {
                          e.preventDefault();
                          handleSort(column.key);
                        }}
                      >
                        <span className="is-flex is-flex-wrap-nowrap">
                          {column.label}
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={`fas ${getSortIcon(column.key)}`}
                            />
                          </span>
                        </span>
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {displayedProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>
                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>
                    <td
                      data-cy="ProductUser"
                      className={
                        product.user.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
