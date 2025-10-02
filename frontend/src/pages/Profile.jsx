import React, { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { TextField, Button, Avatar } from '@mui/material'
import axios from 'axios'
import server from '../../environment.js'

function Profile() {
  const { userData, updateProfile } = useContext(AuthContext)
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (userData) {
      setName(userData.name || '')
      setAvatarUrl(userData.avatarUrl || '')
    }
  }, [userData])

  const onUpload = async (file) => {
    if (!file) return
    try {
      setUploading(true)
      const form = new FormData()
      form.append('avatar', file)
      const token = localStorage.getItem('token')
      const res = await axios.post(`${server}/api/v1/users/profile/avatar`, form, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const newUrl = res.data.avatarUrl
      setAvatarUrl(newUrl)
      // update context user
      await updateProfile({ name, avatarUrl: newUrl })
    } catch (e) {
      alert('Failed to upload image. Please try a smaller image (max 5MB).')
      console.error(e)
    } finally {
      setUploading(false)
    }
  }

  const onSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ name, avatarUrl })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='container my-4' style={{ maxWidth: 900 }}>
      <div className='row align-items-center g-3 mb-3'>
        <div className='col-12 col-sm-8'>
          <h3 className='mb-0'>Your Profile</h3>
          <p className='text-muted mb-0'>Update your photo and personal details</p>
        </div>
        <div className='col-12 col-sm-4 text-sm-end'>
          <Button variant='contained' onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>
      <div className='row g-4'>
        <div className='col-12 col-md-4 d-flex flex-column align-items-center'>
          <Avatar src={avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `${server}${avatarUrl}`) : ''} sx={{ width: 140, height: 140, mb: 2 }} />
          <div className='d-flex gap-2'>
            <input ref={inputRef} type='file' accept='image/png, image/jpeg' style={{ display: 'none' }} onChange={(e) => onUpload(e.target.files[0])} />
            <Button variant='outlined' onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Photo'}</Button>
          </div>
        </div>
        <div className='col-12 col-md-8'>
          <div className='row g-3'>
            <div className='col-12'>
              <TextField fullWidth label='Full Name' value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className='col-12'>
              <TextField fullWidth label='Avatar URL (optional)' value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


