import { useState, useEffect } from 'react'
import {
  X,
  Package,
  User,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  Receipt,
  FileText,
  Navigation2,
} from 'lucide-react'

export default function DeliveryDetailsModal({
  isOpen,
  onClose,
  destination,
  origin,
  metrics,
  onConfirmDelivered,
}) {
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [otpError, setOtpError] = useState('')
  const [isDelivered, setIsDelivered] = useState(false)

  const correctOtp = '7429'
  const customerPhone = '+91 98765 43210'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(customerPhone)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (otpInput.trim() === correctOtp) {
      setIsDelivered(true)
      setOtpError('')
      if (onConfirmDelivered) {
        onConfirmDelivered('Order #RID-2048 verified via OTP 7429 & delivered at UPES')
      }
    } else {
      setOtpError('Invalid OTP. Please ask customer for the correct 4-digit code (Demo hint: 7429)')
    }
  }

  return (
    <div className="delivery-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="delivery-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="delivery-modal-header">
          <div className="modal-title-group">
            <div className="modal-badge-pill">
              <Package size={15} />
              <span>Order #RID-2048</span>
            </div>
            <span className="modal-status-pill">
              {isDelivered ? 'Delivered' : 'Out for Delivery'}
            </span>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close delivery details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="delivery-modal-body">
          {/* Customer & Contact Card */}
          <div className="modal-section-card">
            <div className="section-card-head">
              <div className="avatar-chip">
                <User size={18} />
              </div>
              <div className="card-person-info">
                <h3 className="person-name">{destination.label || 'Rahul Sharma'}</h3>
                <span className="person-subtitle">UPES Student • Recipient</span>
              </div>
              <div className="contact-actions">
                <a
                  href={`tel:${customerPhone.replace(/\s+/g, '')}`}
                  className="btn-dial-link"
                  title="Call Phone"
                >
                  <Phone size={14} />
                  <span>Call</span>
                </a>
                <button
                  type="button"
                  className="btn-copy-link"
                  onClick={handleCopyPhone}
                  title="Copy Phone Number"
                >
                  {copiedPhone ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="delivery-loc-row">
              <MapPin size={15} className="text-blue" />
              <div>
                <span className="loc-label">Drop-off Address:</span>
                <p className="loc-text">{destination.address || 'Hostel Block B, UPES Bidholi Campus, Dehradun'}</p>
              </div>
            </div>

            <div className="delivery-instruction-box">
              <FileText size={14} className="instruction-icon" />
              <span>
                <strong>Note:</strong> "Please call when reaching Gate 2 near cafeteria. If phone is unreachable, leave with security guard."
              </span>
            </div>
          </div>

          {/* Delivery Route & Real-Time Stats */}
          <div className="modal-metrics-grid">
            <div className="modal-metric-tile">
              <span className="metric-caption">Estimated Arrival</span>
              <div className="metric-val">
                <Clock size={16} className="text-blue" />
                <span>{isDelivered ? '0 min' : metrics.etaMinutes ? `${metrics.etaMinutes} min` : 'Live'}</span>
              </div>
            </div>

            <div className="modal-metric-tile">
              <span className="metric-caption">Remaining Distance</span>
              <div className="metric-val">
                <Navigation2 size={16} className="text-teal" />
                <span>{isDelivered ? '0 m' : metrics.remainingDistance || 'Live'}</span>
              </div>
            </div>

            <div className="modal-metric-tile">
              <span className="metric-caption">Verification</span>
              <div className="metric-val">
                <ShieldCheck size={16} className={isDelivered ? 'text-emerald' : 'text-amber'} />
                <span>{isDelivered ? 'Verified' : 'OTP Required'}</span>
              </div>
            </div>
          </div>

          {/* Order Manifest / Items */}
          <div className="modal-section-card">
            <div className="section-title-row">
              <Receipt size={16} />
              <h4>Order Manifest (2 Items)</h4>
            </div>

            <div className="order-items-list">
              <div className="order-item-row">
                <div className="item-name-col">
                  <span className="item-qty">1x</span>
                  <span className="item-title">UPES Engineering Lab Kit (Breadboard & Circuit Module)</span>
                </div>
                <span className="item-price">₹320</span>
              </div>

              <div className="order-item-row">
                <div className="item-name-col">
                  <span className="item-qty">1x</span>
                  <span className="item-title">Technical Graph Notebook & Precision Ruler Set</span>
                </div>
                <span className="item-price">₹110</span>
              </div>

              <div className="order-item-row sub-row">
                <span className="item-sublabel">Express Delivery (Prem Nagar ➔ UPES)</span>
                <span className="item-price">₹50</span>
              </div>

              <div className="order-total-row">
                <span>Total Amount (Paid via UPI)</span>
                <span className="total-price">₹480</span>
              </div>
            </div>
          </div>

          {/* OTP Verification & Complete Delivery Section */}
          <div className="modal-section-card otp-verification-card">
            <div className="section-title-row">
              <ShieldCheck size={16} className="text-amber" />
              <h4>Delivery OTP Verification</h4>
            </div>

            {isDelivered ? (
              <div className="otp-success-banner">
                <CheckCircle2 size={24} className="text-emerald" />
                <div>
                  <h5>Delivery Completed & Confirmed</h5>
                  <p>Order #RID-2048 was verified with customer OTP and closed.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="otp-input-form">
                <p className="otp-guide-text">
                  Ask customer <strong>Rahul Sharma</strong> for their 4-digit delivery PIN to complete handoff.
                  <span className="otp-hint-badge">Hint: 7429</span>
                </p>

                <div className="otp-controls-row">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="otp-code-input"
                  />
                  <button
                    type="submit"
                    disabled={otpInput.length !== 4}
                    className="btn-submit-otp"
                  >
                    <CheckCircle2 size={16} />
                    <span>Complete Delivery</span>
                  </button>
                </div>

                {otpError && (
                  <div className="otp-error-message">
                    <AlertTriangle size={14} />
                    <span>{otpError}</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="delivery-modal-footer">
          <button type="button" className="btn-modal-dismiss" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
