import React from 'react';
import { Avatar } from '@mui/material';
import { MuiIcons } from '../utils/iconMap';

function AgentAvatar({ avatarData, agentName, size = 'medium' }) {
    const sizeMap = {
        xs: { width: 32, height: 32, iconSize: 20, fontSize: '0.75rem' },
        small: { width: 48, height: 48, iconSize: 24, fontSize: '1rem' },
        medium: { width: 64, height: 64, iconSize: 32, fontSize: '1.5rem' },
        large: { width: 80, height: 80, iconSize: 48, fontSize: '2rem' },
    };

    const { width, height, iconSize, fontSize } = sizeMap[size] || sizeMap.medium;

    if (!avatarData) {
        return (
            <Avatar 
                sx={{ 
                    width, 
                    height, 
                    bgcolor: 'primary.main',
                    fontSize,
                    fontWeight: 'bold'
                }}
            >
                {agentName.charAt(0).toUpperCase()}
            </Avatar>
        );
    }

    try {
        const { icon, color } = JSON.parse(avatarData);

        if (icon && MuiIcons[icon]) {
            const IconComponent = MuiIcons[icon];
            return (
                <Avatar 
                    sx={{ 
                        width, 
                        height, 
                        bgcolor: color || 'primary.main',
                        '&:hover': {
                            bgcolor: color ? `${color}CC` : 'primary.dark',
                        },
                        transition: 'background-color 0.3s'
                    }}
                >
                    <IconComponent sx={{ fontSize: iconSize, color: 'white' }} />
                </Avatar>
            );
        } else if (typeof icon === 'string' && icon.startsWith('data:image')) {
            return (
                <Avatar
                    src={icon}
                    sx={{ 
                        width, 
                        height, 
                        bgcolor: color || 'primary.main',
                        '&:hover': {
                            opacity: 0.8,
                        },
                        transition: 'opacity 0.3s'
                    }}
                >
                    {agentName.charAt(0).toUpperCase()}
                </Avatar>
            );
        }

        return (
            <Avatar 
                sx={{ 
                    width, 
                    height, 
                    bgcolor: color || 'primary.main',
                    fontSize,
                    fontWeight: 'bold',
                    '&:hover': {
                        bgcolor: color ? `${color}CC` : 'primary.dark',
                    },
                    transition: 'background-color 0.3s'
                }}
            >
                {agentName.charAt(0).toUpperCase()}
            </Avatar>
        );
    } catch (error) {
        return (
            <Avatar 
                sx={{ 
                    width, 
                    height, 
                    bgcolor: 'primary.main',
                    fontSize,
                    fontWeight: 'bold'
                }}
            >
                {agentName.charAt(0).toUpperCase()}
            </Avatar>
        );
    }
}

export default AgentAvatar;
