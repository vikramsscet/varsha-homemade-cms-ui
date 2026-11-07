import { Link } from 'react-router-dom'
import { formatMoney } from '../../utils/cart.js'
import { formatDateTime } from '../users/UserStatusBadge.jsx'
import { StatusBadge } from './OrderBadges.jsx'

function customerName(customer) {
  return [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || '—'
}

// Shared by the global and user-specific order lists.
// `linkState` is passed to the details route (e.g. { from: '/users/:id/orders' }).
function OrdersTable({ orders, showCustomer = false, linkState }) {
  const headers = [
    'Order Number',
    ...(showCustomer ? ['Customer', 'Email'] : []),
    'Order Date', 'Order Status', 'Payment Status', 'Payment Method', 'Total Amount', 'Actions',
  ]
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="min-w-full divide-y divide-border text-left text-sm">
        <thead className="bg-background text-xs font-medium uppercase text-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-4 py-3.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-text">{order.orderNumber}</td>
              {showCustomer && (
                <>
                  <td className="px-4 py-3 text-text">{customerName(order.customer)}</td>
                  <td className="px-4 py-3 text-muted">{order.customer?.email || '—'}</td>
                </>
              )}
              <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(order.createdAt)}</td>
              <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
              <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} /></td>
              <td className="whitespace-nowrap px-4 py-3 text-text">{order.paymentMethodSummary || '—'}</td>
              <td className="whitespace-nowrap px-4 py-3 text-text">{formatMoney(order.totalAmount, order.currency)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <Link
                  to={`/orders/${order.id}`}
                  state={linkState}
                  aria-label={`View details for order ${order.orderNumber}`}
                  className="font-medium text-primary hover:text-primary-hover"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersTable
