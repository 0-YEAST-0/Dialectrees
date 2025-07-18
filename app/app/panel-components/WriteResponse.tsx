import { NodeWithChildren } from "@/db/nodes";
import { NodeStance } from "@/db/schema";
import { Paper, Typography, TextField, Box, ToggleButtonGroup, ToggleButton, Button } from "@mui/material";
import { useState } from "react";

type WriteResponseProps = {
    nodeData: NodeWithChildren;
    handleNodeSelect: (nodeId: string) => void;
    refreshTree: () => void;
};

export const WriteResponse = ({ nodeData, handleNodeSelect, refreshTree }: WriteResponseProps) => {
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