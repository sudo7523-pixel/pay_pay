import { cn } from '../../utils/helpers'
import './Skeleton.css'

export default function Skeleton({ width, height, borderRadius, className }) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <Skeleton width="40%" height="14px" />
      <Skeleton width="60%" height="28px" />
      <Skeleton width="30%" height="12px" />
    </div>
  )
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="skeleton-table" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <Skeleton width="36px" height="36px" borderRadius="50%" />
          <div className="skeleton-table-cols">
            <Skeleton width="140px" height="14px" />
            <Skeleton width="80px" height="12px" />
          </div>
          <div className="skeleton-table-right">
            <Skeleton width="100px" height="14px" />
            <Skeleton width="50px" height="12px" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="skeleton-profile" aria-hidden="true">
      <div className="skeleton-profile-header">
        <Skeleton width="64px" height="64px" borderRadius="50%" />
        <div>
          <Skeleton width="160px" height="20px" />
          <Skeleton width="120px" height="14px" />
        </div>
      </div>
      <Skeleton width="100%" height="1px" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-profile-row">
          <Skeleton width="100px" height="14px" />
          <Skeleton width="160px" height="14px" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-dashboard" aria-hidden="true">
      <Skeleton width="240px" height="24px" />
      <Skeleton width="180px" height="14px" />
      <div className="skeleton-dashboard-cards">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <Skeleton width="160px" height="18px" />
      <TableSkeleton rows={3} />
    </div>
  )
}

export function WalletSkeleton() {
  return (
    <div className="skeleton-wallet" aria-hidden="true">
      <Skeleton width="120px" height="28px" />
      <CardSkeleton />
      <CardSkeleton />
      <Skeleton width="100%" height="80px" borderRadius="var(--radius-lg)" />
    </div>
  )
}

export function TransactionSkeleton() {
  return (
    <div className="skeleton-transactions" aria-hidden="true">
      <Skeleton width="160px" height="28px" />
      <TableSkeleton rows={5} />
    </div>
  )
}

export function MerchantSkeleton() {
  return (
    <div className="skeleton-merchant" aria-hidden="true">
      <Skeleton width="200px" height="28px" />
      <div className="skeleton-dashboard-cards">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <Skeleton width="40px" height="40px" borderRadius="var(--radius-md)" />
          <div className="skeleton-table-cols">
            <Skeleton width="120px" height="14px" />
            <Skeleton width="80px" height="12px" />
          </div>
        </div>
      ))}
    </div>
  )
}
