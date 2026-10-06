import React from 'react';
import styles from './DataTable.module.scss';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  pagination,
  onPageChange,
  searchQuery = '',
  onSearchChange,
  filterComponent,
  actionButton,
  onRowClick
}) => {
  return (
    <div className={styles.tableContainer}>
      {/* Table Toolbar */}
      {(onSearchChange || filterComponent || actionButton) && (
        <div className={styles.tableToolbar}>
          <div className={styles.tableFilterGroup}>
            {onSearchChange && (
              <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Filter / Search records..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
            {filterComponent}
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>
      )}

      {/* Main Table Wrapper */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={col.width ? { width: col.width } : {}}
                  className={col.sortable ? styles.sortable : ''}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx}>
                      <div
                        style={{
                          height: '16px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px',
                          animation: 'pulseGlow 1.5s infinite ease-in-out'
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className={styles.emptyState}>
                    <span style={{ fontSize: '2rem' }}>📦</span>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row._id || row.id || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {columns.map((col, cIdx) => (
                    <td key={col.key || cIdx}>
                      {col.render ? col.render(row[col.key], row, rIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className={styles.pagination}>
          <span>
            Showing page <strong>{pagination.page}</strong> of{' '}
            <strong>{pagination.totalPages || 1}</strong> ({pagination.total || data.length} total)
          </span>
          <div className={styles.paginationButtons}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page >= (pagination.totalPages || 1)}
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
