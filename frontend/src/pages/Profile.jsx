import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { TextField, Button, Avatar, Snackbar, Alert, Paper, Box, Grid, Typography } from '@mui/material';
import axios from 'axios';
import server from '../../environment.js';
import styles from '../style/profile.module.css';

function Profile() {
  const { userData, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Feedback Messages
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success'); // 'success' or 'error'
  const [showToast, setShowToast] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setAvatarUrl(userData.avatarUrl || '');
    }
  }, [userData]);

  const triggerToast = (msg, severity = 'success') => {
    setAlertMsg(msg);
    setAlertSeverity(severity);
    setShowToast(true);
  };

  const onUpload = async (file) => {
    if (!file) return;

    // Client-side validations matching backend constraints
    if (file.size > 5 * 1024 * 1024) {
      triggerToast('File too large. Maximum size is 5MB.', 'error');
      return;
    }
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      triggerToast('Invalid file format. Only PNG and JPG/JPEG are allowed.', 'error');
      return;
    }

    try {
      setUploading(true);
      const form = new FormData();
      form.append('avatar', file);
      
      const token = localStorage.getItem('token');
      const res = await axios.post(`${server}/api/v1/users/profile/avatar`, form, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const newUrl = res.data.avatarUrl;
      setAvatarUrl(newUrl);
      
      // Update Auth context state
      await updateProfile({ name, avatarUrl: newUrl });
      triggerToast('Profile photo updated successfully!', 'success');
    } catch (e) {
      console.error(e);
      let errMsg = 'Failed to upload image. Please try again.';
      if (e.response && e.response.data && e.response.data.message) {
        errMsg = e.response.data.message;
      }
      triggerToast(errMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      triggerToast('Full Name cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name, avatarUrl });
      triggerToast('Profile settings saved successfully!', 'success');
    } catch (e) {
      console.error(e);
      triggerToast('Failed to save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPersonalLink = () => {
    const personalLink = `${window.location.origin}/${userData?.username}`;
    navigator.clipboard.writeText(personalLink);
    setLinkCopied(true);
    triggerToast('Personal meeting link copied!', 'success');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const renderAvatarSource = () => {
    if (!avatarUrl) return '';
    return avatarUrl.startsWith('http') ? avatarUrl : `${server}${avatarUrl}`;
  };

  return (
    <Box sx={{ maxWidth: '900px', margin: '40px auto', px: 3, fontFamily: 'Inter, sans-serif' }}>
      
      {/* Upper header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <div>
          <Typography variant="h4" fontWeight="600" color="#202124" sx={{ letterSpacing: '-0.8px', mb: 1 }}>
            Your Profile
          </Typography>
          <Typography variant="body1" color="#5f6368">
            Manage your personal credentials, profile picture, and room invites.
          </Typography>
        </div>
        <Button 
          variant="contained" 
          onClick={onSave} 
          disabled={saving || uploading}
          sx={{ py: 1.2, px: 3, borderRadius: '8px', fontWeight: '600', textTransform: 'none' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Main card */}
      <Paper elevation={0} className={styles.profileCard}>
        <Grid container spacing={4}>
          
          {/* Left Column: Picture uploads */}
          <Grid item xs={12} md={4} className={styles.avatarSection}>
            <Typography variant="body2" fontWeight="600" color="#5f6368" align="center" sx={{ mb: 1 }}>
              PROFILE PHOTO
            </Typography>
            
            {/* Interactive avatar frame */}
            <div 
              className={styles.avatarWrapper} 
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload a new profile photo"
            >
              <Avatar 
                src={renderAvatarSource()} 
                sx={{ width: 140, height: 140, border: '3px solid #f1f3f4', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }} 
              />
              <div className={styles.avatarOverlay}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
            </div>
            
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/png, image/jpeg" 
              style={{ display: 'none' }} 
              onChange={(e) => onUpload(e.target.files[0])} 
            />
            
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
              sx={{ textTransform: 'none', borderRadius: '6px', fontWeight: '500' }}
            >
              {uploading ? 'Uploading...' : 'Change Photo'}
            </Button>
            <Typography variant="caption" color="text.secondary" align="center">
              Supports PNG, JPG, JPEG (Max 5MB)
            </Typography>
          </Grid>

          {/* Right Column: Text fields & meeting code */}
          <Grid item xs={12} md={8}>
            <div className={styles.sectionHeader}>Account Details</div>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Username" 
                  value={userData?.username || ''} 
                  variant="outlined" 
                  disabled
                  helperText="Your username is fixed and acts as your personal room ID"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Avatar URL (Optional)" 
                  value={avatarUrl} 
                  onChange={(e) => setAvatarUrl(e.target.value)} 
                  variant="outlined"
                  helperText="You can paste an external URL or upload a file on the left"
                />
              </Grid>
            </Grid>

            {/* Clipboard Room Code Copy widget */}
            <div className={styles.personalLinkCard}>
              <div className={styles.personalLinkInfo}>
                <span className={styles.personalLinkLabel}>Your Personal Room Link</span>
                <span className={styles.personalLinkUrl}>
                  {window.location.origin}/{userData?.username}
                </span>
              </div>
              <button 
                className={styles.btnCopy} 
                onClick={handleCopyPersonalLink}
                title="Copy personal link to clipboard"
              >
                {linkCopied ? (
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#34a853' }}>Copied!</span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            </div>

          </Grid>
        </Grid>
      </Paper>

      {/* Action Toast Notifications */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowToast(false)} 
          severity={alertSeverity} 
          sx={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {alertMsg}
        </Alert>
      </Snackbar>

    </Box>
  );
}

export default Profile;
