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

type WriteResponseProps = {
    nodeData: NodeWithChildren;
    handleNodeSelect: (nodeId: string) => void;
    refreshTree: () => void;
};

const WriteResponse = ({ nodeData, handleNodeSelect, refreshTree }: WriteResponseProps) => {
    const [responseText, setResponseText] = useState('');
    const [titleText, setTitleText] = useState('');
    const [stance, setStance] = useState<NodeStance | null>(null);

    const handleResponseSubmit = async () => {
        try {
            const response = await fetch(`/api/nodes/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: titleText, 
                    type: "post", 
                    parent: nodeData.id, 
                    content: responseText,
                    stance: stance
                })
            });
            if (!response.ok) {
                console.error('Failed to post response');
            }
            else {
                setResponseText('');
                setTitleText('');
                setStance('neutral');
                handleNodeSelect((await response.json()).nodeId);
            }
            refreshTree();
        }
        catch (error) {
            console.error('Error posting response:', error);
        }
    };

    const handleStanceChange = (event: React.MouseEvent<HTMLElement>, newStance: NodeStance) => {
        if (newStance !== null) {
            setStance(newStance);
        }
    };

    return (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Write a Response
            </Typography>
            <TextField 
                fullWidth
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                placeholder="Response title..."
                variant="outlined"
                sx={{ mb: 2 }}
            />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ToggleButtonGroup
                    value={stance}
                    exclusive
                    onChange={handleStanceChange}
                    aria-label="response stance"
                    size="small"
                >
                    <ToggleButton
                        value="community"
                        aria-label="community side"
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'var(--color-stance-community)',
                                '&:hover': {
                                    backgroundColor: 'var(--color-stance-community-hover)',
                                },
                            },
                        }}
                    >
                        Community Side
                    </ToggleButton>
                    <ToggleButton
                        value="neutral"
                        aria-label="neutral"
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'var(--color-stance-neutral)',
                                '&:hover': {
                                    backgroundColor: 'var(--color-stance-neutral-hover)',
                                },
                            },
                        }}
                    >
                        Neutral
                    </ToggleButton>
                    <ToggleButton
                        value="opposing"
                        aria-label="opposing side"
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'var(--color-stance-opposing)',
                                '&:hover': {
                                    backgroundColor: 'var(--color-stance-opposing-hover)',
                                },
                            },
                        }}
                    >
                        Opposing Side
                    </ToggleButton>
                </ToggleButtonGroup>
                <Button
                    variant="contained"
                    onClick={handleResponseSubmit}
                    disabled={!responseText.trim() || !titleText.trim()}
                >
                    Submit
                </Button>
            </Box>
        </Paper>
    );
}

type PinProps = {
    nodeData: NodeWithChildren;
    refreshTree: () => void;
};

const Pin = ({ nodeData, refreshTree }: PinProps) => {
    const [isPinned, setIsPinned] = useState(nodeData.pinned || false);

    useEffect(() => {
        setIsPinned(nodeData.pinned || false);
    }, [nodeData]);

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

    return (
        <IconButton 
            onClick={handlePinToggle}
            size="small"
        >
            {isPinned ? <Star sx={{ color: '#ffa200' }}/> : <Star sx={{ color: '#888' }}/>}
        </IconButton>
    );
}

type DeleteNodeProps = {
    nodeData: NodeWithChildren;
    handleNodeSelect: (nodeId: string) => void;
    refreshTree: () => void;
};

const DeleteNode = ({ nodeData, refreshTree, handleNodeSelect }: DeleteNodeProps) => {

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/nodes/delete?id=${nodeData.id}`, {
                method: 'POST',
            });
            
            if (!response.ok) {
                console.error('Failed to delete node');
            }

            if((await response.json()).success){
                refreshTree();
                handleNodeSelect(`${nodeData.parent}`);
            }
            else {
                console.log("cannot delete node");
            }
        } catch (error) {
            console.error('Error deleting node:', error);
        }
    };

    return nodeData.parent ? (
        <IconButton 
            onClick={handleDelete}
            size="small"
        >
            <Delete sx={{ color: 'red' }}/>
        </IconButton>
    ) : <></>;
}

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
            {/* Section 1: Content */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>
                    {user.membership && user.membership.adminRank >= 1 && (
                        <div>
                            <Pin nodeData={nodeData} refreshTree={refreshTree}/>
                            <DeleteNode nodeData={nodeData} refreshTree={refreshTree} handleNodeSelect={handleNodeSelect}/>
                        </div>
                    )}
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {content}
                </Typography>
            </Paper>
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