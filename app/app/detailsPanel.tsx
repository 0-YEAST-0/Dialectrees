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
    ListItemIcon
} from '@mui/material';
import { PushPin, PushPinOutlined, ChevronRight } from '@mui/icons-material';

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

    const [responseText, setResponseText] = useState('');
    const [isPinned, setIsPinned] = useState(nodeData.pinned || false);

    useEffect(() => {
        setIsPinned(nodeData.pinned || false);
    }, [nodeData.pinned]);
    
    const handleResponseSubmit = () => {
        // Placeholder for actual submission logic
        console.log("Submitted response:", responseText);
        setResponseText('');
    };

    const handlePinToggle = async () => {
        try {
            const newPinnedState = !isPinned;
            setIsPinned(newPinnedState);
            
            const response = await fetch(`/api/nodes/setPinned?id=${nodeData.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pinned: newPinnedState })
            });
            
            if (!response.ok) {
                // Revert on error
                setIsPinned(isPinned);
                console.error('Failed to update pin status');
            }
            refreshTree();
        } catch (error) {
            // Revert on error
            setIsPinned(isPinned);
            console.error('Error updating pin status:', error);
        }
    };

    const truncateContent = (text: string, maxLength: number = 240) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <Box sx={{ p: 3, maxWidth: '100%' }}>
            {/* Section 1: Content */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>
                    {user.membership && user.membership.adminRank >= 1 && (
                        <IconButton 
                            onClick={handlePinToggle}
                            color="primary"
                            size="small"
                        >
                            {isPinned ? <PushPin /> : <PushPinOutlined />}
                        </IconButton>
                    )}
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {content}
                </Typography>
            </Paper>

            {/* Section 2: Write a Response */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                    Write a Response
                </Typography>
                <TextField
                    multiline
                    fullWidth
                    minRows={3}
                    maxRows={12}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response..."
                    variant="outlined"
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleResponseSubmit}
                        disabled={!responseText.trim()}
                    >
                        Submit
                    </Button>
                </Box>
            </Paper>

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
                                                            {resp.author}
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