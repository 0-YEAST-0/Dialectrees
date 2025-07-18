import { NodeWithChildren } from "@/db/nodes";
import { useEffect, useState } from "react";
import { User } from "@/db/user";
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Paper,
    IconButton,
    Divider,
    ListItemButton,
    ListItemIcon,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import { Star, StarOutlined, ChevronRight, Delete } from '@mui/icons-material';
import { NodeStance } from "@/db/schema";
import { ContentCard } from "./panel-components/ContentCard";
import { WriteResponse } from "./panel-components/WriteResponse";

type DetailsPanelProps = {
    nodeData: NodeWithChildren | {};
    handleNodeSelect: (nodeId: string) => void;
    user: User;
    refreshTree: () => void;
};

export const DetailsPanel = ({ nodeData, handleNodeSelect, user, refreshTree }: DetailsPanelProps) => {
    if ('id' in nodeData) {
        return (<PostDetails nodeData={nodeData} handleNodeSelect={handleNodeSelect} user={user} refreshTree={refreshTree}/>)
    }
    else {
        return (<Placeholder />)
    }
};

type PostDetailsProps = {
    nodeData: NodeWithChildren;
    handleNodeSelect: (nodeId: string) => void;
    user: User;
    refreshTree: () => void;
};


const PostDetails = ({ nodeData, handleNodeSelect, user, refreshTree }: PostDetailsProps) => {
    const title = nodeData.title || '';
    const content = nodeData.content || '';
    const responses = nodeData.children || [];


    const truncateContent = (text: string, maxLength: number = 240) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <Box sx={{ p: 3, maxWidth: '100%' }}>
            <ContentCard nodeData={nodeData} user={user} refreshTree={refreshTree} handleNodeSelect={handleNodeSelect}/>
            <WriteResponse nodeData={nodeData} handleNodeSelect={handleNodeSelect} refreshTree={refreshTree}/>

            {/* Section 3: List of Responses */}
            <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                    Responses
                </Typography>
                {responses.length > 0 ? (
                    <List disablePadding>
                        {responses.map((resp, index) => (
                            'id' in resp ? (
                                <Box key={index}>
                                    <ListItemButton 
                                        onClick={() => handleNodeSelect(`${resp.id}`)}
                                        sx={{ 
                                            borderRadius: 1,
                                            mb: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                backgroundColor: 'action.hover'
                                            }
                                        }}
                                    >
                                        <ListItemText slotProps={{primary: {component: "div"}, secondary: {component: "div"}}}
                                            primary={
                                                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
                                                    {resp.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography 
                                                        variant="body2" 
                                                        component="div"
                                                        color="text.secondary"
                                                        sx={{ mb: 1 }}
                                                    >
                                                        {truncateContent('content' in resp ? resp.content || '' : '')}
                                                    </Typography>
                                                    {'author' in resp && resp.author && (
                                                        <Typography 
                                                            variant="caption" 
                                                            component="div"
                                                            color="text.disabled"
                                                        >
                                                            {resp.author.username}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <ListItemIcon sx={{ minWidth: 'auto', ml: 2 }}>
                                            <ChevronRight color="action" />
                                        </ListItemIcon>
                                    </ListItemButton>
                                </Box>
                            ) : (
                                <Typography key={index} color="error">Error loading response</Typography>
                            )
                        ))}
                    </List>
                ) : (
                    <Typography color="text.secondary">
                        No responses yet.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
}

const Placeholder = () => {
    return (
        <Box sx={{ p: 3, maxWidth: '100%' }}>
            <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    Welcome to Dialectrees
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Dialectrees allows you to create and visualize conversation trees collaboratively
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Discourse tend to be quite repetitive, the same arguments come up over and over again.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    With Dialectrees you can keep track of them on one centralized platform, managed by the community.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    It works like one large conversation tree, where any user can write a response to any other response. Community members can vote on the quality of those responses, and admins can pin them to the tree, so they are displayed grapically.
                </Typography>
                <Typography variant="body1">
                    At the moment, it is still an early prototype, with only one community. In the future, it could be expanded to include multiple communities, each with their own tree
                </Typography>
            </Paper>
        </Box>
    );
}