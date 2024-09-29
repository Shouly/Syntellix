import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import ScienceIcon from '@mui/icons-material/Science';
import { Avatar, Dialog, DialogContent, DialogTitle, Grid, IconButton } from '@mui/material';
import React, { useState } from 'react';
import { presetAvatars } from '../utils/iconMap';
import AgentAvatar from './AgentAvatar';

function AgentAvatarSelector({ selectedAvatar, onAvatarChange }) {
    const [open, setOpen] = useState(false);
    const [tempAvatar, setTempAvatar] = useState(selectedAvatar);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setTempAvatar(selectedAvatar);
    };

    const handleAvatarSelect = (avatar) => {
        const selectedAvatar = JSON.stringify({
            icon: avatar.name,
            color: avatar.color
        });
        setTempAvatar(JSON.parse(selectedAvatar));
        onAvatarChange(selectedAvatar);
        setOpen(false);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                const selectedAvatar = JSON.stringify({
                    icon: base64String,
                    color: null
                });
                onAvatarChange(selectedAvatar);
            };
            reader.readAsDataURL(file);
        }
        setOpen(false);
    };

    return (
        <>
            <IconButton
                onClick={handleOpen}
                size="large"
                sx={{ position: 'relative' }}
                aria-label="Select avatar"
            >
                <AgentAvatar avatarData={selectedAvatar} agentName="" size="medium" />
                <Avatar
                    sx={{
                        width: 24,
                        height: 24,
                        bgcolor: 'secondary.main',
                        position: 'absolute',
                        bottom: 8,
                        right: 0,
                    }}
                >
                    <AddAPhotoIcon sx={{ fontSize: 16 }} />
                </Avatar>
            </IconButton>

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: '800px', // 减小最大宽度
                        maxHeight: '80%',
                        zIndex: 10003,
                    },
                    style: {
                        position: 'fixed',
                        top: '15%', // 这个值可以调整，越小越靠近顶部
                        margin: '0 auto',
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    padding: 2,
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: '1.25rem',
                    fontWeight: 500,
                }}>
                    选择头像
                </DialogTitle>
                <div style={{ height: '8px' }} /> {/* 添加一个空的div作为分隔符 */}
                <DialogContent sx={{ padding: 3 }}>
                    <Grid container spacing={2} direction="column" alignItems="center">
                        <Grid item>
                            <Grid container spacing={2} justifyContent="center">
                                {presetAvatars.map((avatar, index) => (
                                    <Grid item key={index}>
                                        <IconButton onClick={() => handleAvatarSelect(avatar)}>
                                            <Avatar sx={{ width: 56, height: 56, bgcolor: avatar.color }}>
                                                {React.createElement(avatar.icon, { sx: { fontSize: 32, color: 'white' } })}
                                            </Avatar>
                                        </IconButton>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid item>
                            <input
                                accept="image/*"
                                id="avatar-upload"
                                type="file"
                                hidden
                                onChange={handleFileUpload}
                            />
                            <label htmlFor="avatar-upload">
                                <IconButton component="span">
                                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                                        <AddAPhotoIcon />
                                    </Avatar>
                                </IconButton>
                            </label>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default AgentAvatarSelector;