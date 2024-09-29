import React from 'react';
import { Avatar } from '@mui/material';
import { MuiIcons } from '../utils/iconMap';

function AgentAvatar({ avatarData, agentName, size = 'medium' }) {
    const sizeMap = {
        small: { width: 48, height: 48, iconSize: 24 },
        medium: { width: 64, height: 64, iconSize: 32 },
        large: { width: 80, height: 80, iconSize: 48 },
    };

    const { width, height, iconSize } = sizeMap[size] || sizeMap.medium;

    if (!avatarData) {
        return (
            <Avatar sx={{ width, height, bgcolor: 'primary.main' }}>
                {agentName.charAt(0).toUpperCase()}
            </Avatar>
        );
    }

    try {
        const { icon, color } = JSON.parse(avatarData);

        if (icon && MuiIcons[icon]) {
            const IconComponent = MuiIcons[icon];
            return (
                <Avatar sx={{ width, height, bgcolor: color || 'primary.main' }}>
                    <IconComponent sx={{ fontSize: iconSize, color: 'white' }} />
                </Avatar>
            );
        } else if (typeof icon === 'string' && icon.startsWith('data:image')) {
            return (
                <Avatar
                    src={icon}
                    sx={{ width, height, bgcolor: color || 'primary.main' }}
                >
                    {agentName.charAt(0).toUpperCase()}
                </Avatar>
            );
        }

        return (
            <Avatar sx={{ width, height, bgcolor: color || 'primary.main' }}>
                {agentName.charAt(0).toUpperCase()}
            </Avatar>
        );
    } catch (error) {
        console.error(`Error parsing avatar data for agent ${agentName}:`, error);
        return (
            <Avatar sx={{ width, height, bgcolor: 'primary.main' }}>
                {agentName.charAt(0).toUpperCase()}
            </Avatar>
        );
    }
}

export default AgentAvatar;