import { useTransactions } from '../../hooks'
import Card from '../../components/Card/Card'
import Badge from '../../components/Badge/Badge'
import Modal from '../../components/Modal/Modal'
import ExplorerLink from '../../components/ExplorerLink/ExplorerLink'
import SearchBar from '../../components/SearchBar/SearchBar'
import FilterPanel from '../../components/FilterPanel/FilterPanel'
import SortDropdown from '../../components/SortDropdown/SortDropdown'
import Pagination from '../../components/Pagination/Pagination'
import { TransactionSkeleton } from '../../components/Skeleton'
import ErrorCard from '../../components/Error/ErrorCard'
import EmptyState from '../../components/EmptyState/EmptyState'
import { shortenAddress } from '../../utils/format'
import { formatDate, formatFullDate } from '../../utils/date'
import './Transactions.css'

const FILTERS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { label: 'Completed', value: 'completed' },
      { label: 'Pending', value: 'pending' },
      { label: 'Confirmed', value: 'confirmed' },
      { label: 'Failed', value: 'failed' },
    ],
  },
]

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Amount (High)', value: 'amount_desc' },
  { label: 'Amount (Low)', value: 'amount_asc' },
]

export default function Transactions() {
  const {
    transactions, loading, error, page, totalPages,
    search, filters, sort,
    detail, detailLoading,
    goToPage, openDetail, closeDetail,
    setSearch, setFilters, setSort,
    refetch,
  } = useTransactions()

  function handleSearch(value) {
    setSearch(value)
  }

  return (
    <div className="page-transactions slide-up">
      <div className="txns-header">
        <h1 className="page-title">Transactions</h1>
      </div>

      <div className="txns-toolbar">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search transactions..." />
        <div className="txns-toolbar-right">
          <FilterPanel filters={FILTERS} activeFilters={filters} onChange={setFilters} />
          <SortDropdown options={SORT_OPTIONS} value={sort} onChange={setSort} />
        </div>
      </div>

      {loading ? (
        <TransactionSkeleton />
      ) : error ? (
        <ErrorCard message={error} onRetry={refetch} />
      ) : transactions.length === 0 ? (
        <Card>
          <EmptyState
            title="No transactions found"
            description={search || Object.keys(filters).length ? 'Try adjusting your search or filters' : 'Your transactions will appear here'}
            action={
              (search || Object.keys(filters).length) ? (
                <button className="btn btn--secondary btn--sm" onClick={() => { setSearch(''); setFilters({}) }}>
                  Clear filters
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <Card className="txns-table">
            {transactions.map((txn) => (
              <div key={txn._id || txn.id} className="txn-row" onClick={() => openDetail(txn._id || txn.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openDetail(txn._id || txn.id)}>
                <div className="txn-left">
                  <div className={`txn-icon txn-icon--received`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  </div>
                  <div>
                    <span className="txn-name">{txn.asset || txn.currency || 'Payment'}</span>
                    <span className="txn-date">{formatDate(txn.createdAt || txn.date)}</span>
                  </div>
                </div>
                <div className="txn-middle">
                  <span className="txn-counterparty">{shortenAddress(txn.payerAddress || txn.receiverAddress || txn.from || txn.to, 6)}</span>
                  <span className="txn-id">{txn._id || txn.id}</span>
                </div>
                <div className="txn-right">
                  <span className={`txn-amount txn-amount--received`}>
                    {txn.amount ? `${txn.amount} ${txn.asset || ''}` : '—'}
                  </span>
                  <Badge variant={
                    txn.status === 'completed' || txn.status === 'confirmed' ? 'success' :
                    txn.status === 'failed' ? 'error' : 'warning'
                  }>
                    {txn.status || 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </Card>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}

      <Modal isOpen={!!detail} onClose={closeDetail} title="Transaction Details">
        {detailLoading ? (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}>Loading...</div>
        ) : detail?.error ? (
          <EmptyState title="Failed to load details" description={detail.error} />
        ) : detail ? (
          <div className="txn-detail">
            <div className="txn-detail-row">
              <span className="txn-detail-label">ID</span>
              <span className="txn-detail-value">{detail._id || detail.id}</span>
            </div>
            <div className="txn-detail-row">
              <span className="txn-detail-label">Status</span>
              <div className="txn-detail-right-group">
                <Badge variant={
                  detail.status === 'completed' || detail.status === 'confirmed' ? 'success' :
                  detail.status === 'failed' ? 'error' : 'warning'
                }>{detail.status || 'Pending'}</Badge>
                {detail.confirmed && <Badge variant="success">Confirmed On-Chain</Badge>}
                {detail.status === 'Submitted' && <Badge variant="info">Submitted</Badge>}
              </div>
            </div>
            <div className="txn-detail-row">
              <span className="txn-detail-label">Amount</span>
              <span className="txn-detail-value">{detail.amount || '—'} {detail.asset || ''}</span>
            </div>
            <div className="txn-detail-row">
              <span className="txn-detail-label">Payer</span>
              <span className="txn-detail-value txn-detail-value--mono">{shortenAddress(detail.payerAddress || detail.from, 8) || '—'}</span>
            </div>
            <div className="txn-detail-row">
              <span className="txn-detail-label">Receiver</span>
              <span className="txn-detail-value txn-detail-value--mono">{shortenAddress(detail.receiverAddress || detail.to, 8) || '—'}</span>
            </div>
            {(detail.transactionHash || detail.blockchainType === 'soroban') && (
              <div className="txn-detail-divider" />
            )}
            {detail.transactionHash && (
              <div className="txn-detail-row">
                <span className="txn-detail-label">Transaction Hash</span>
                <span className="txn-detail-value txn-detail-value--mono txn-detail-value--hash">{detail.transactionHash}</span>
              </div>
            )}
            {detail.transactionHash && (
              <div className="txn-detail-row">
                <span className="txn-detail-label">Explorer</span>
                <ExplorerLink type="tx" value={detail.transactionHash} />
              </div>
            )}
            <div className="txn-detail-row">
              <span className="txn-detail-label">Date</span>
              <span className="txn-detail-value">{formatFullDate(detail.createdAt || detail.date)}</span>
            </div>
            {detail.ledger && (
              <div className="txn-detail-row">
                <span className="txn-detail-label">Ledger</span>
                <span className="txn-detail-value">{detail.ledger}</span>
              </div>
            )}
            {detail.network && (
              <div className="txn-detail-row">
                <span className="txn-detail-label">Network</span>
                <Badge variant="info">{detail.network}</Badge>
              </div>
            )}
            {detail.blockchainType && (
              <div className="txn-detail-row">
                <span className="txn-detail-label">Blockchain</span>
                <Badge variant="info">{detail.blockchainType}</Badge>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
