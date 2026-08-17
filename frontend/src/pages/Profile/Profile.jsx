import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import * as userService from '../../services/userService'
import Card from '../../components/Card/Card'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Modal from '../../components/Modal/Modal'
import { ProfileSkeleton } from '../../components/Skeleton'
import './Profile.css'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { success, error } = useToast()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    userService.getProfile()
      .then(setProfile)
      .catch(() => error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [error])

  function openEdit() {
    setEditName(profile?.name || user?.name || '')
    setEditOpen(true)
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    if (!editName.trim()) return

    setEditLoading(true)
    try {
      const updated = await userService.updateProfile({ name: editName })
      setProfile(updated)
      refreshUser()
      success('Profile updated')
      setEditOpen(false)
    } catch (err) {
      error(err.message || 'Failed to update profile')
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-profile slide-up">
        <div className="profile-header">
          <h1 className="page-title">Profile</h1>
        </div>
        <ProfileSkeleton />
      </div>
    )
  }

  const displayUser = profile || user

  return (
    <div className="page-profile slide-up">
      <div className="profile-header">
        <h1 className="page-title">Profile</h1>
      </div>

      <Card className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {displayUser?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="profile-name">{displayUser?.name || 'Unknown'}</h2>
            <p className="profile-email">{displayUser?.email || ''}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-field">
            <span className="profile-field-label">Email</span>
            <span className="profile-field-value">{displayUser?.email || ''}</span>
          </div>
          {displayUser?.role && (
            <div className="profile-field">
              <span className="profile-field-label">Role</span>
              <span className="profile-field-value" style={{ textTransform: 'capitalize' }}>{displayUser.role}</span>
            </div>
          )}
          {displayUser?.createdAt && (
            <div className="profile-field">
              <span className="profile-field-label">Member Since</span>
              <span className="profile-field-value">
                {new Date(displayUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <Button variant="secondary" onClick={openEdit}>
            Edit Profile
          </Button>
        </div>
      </Card>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Input
            label="Name"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Button type="submit" fullWidth loading={editLoading}>
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  )
}
