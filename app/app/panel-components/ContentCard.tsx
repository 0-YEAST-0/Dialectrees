import DialectreesConfig from "@/app/config";
import { checkPermission, Permissions } from "@/app/client-permissions";
import { NodeWithChildren } from "@/db/nodes";
import { User } from "@/db/user";
import { ArrowBack, ArrowForward, Delete, Star, ThumbDown, ThumbUp } from "@mui/icons-material";
import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

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

type ContentCardProps = {
    nodeData: NodeWithChildren;
    handleNodeSelect: (nodeId: string) => void;
    refreshTree: () => void;
    user: User;
};

export const ContentCard = ({ 
    nodeData, 
    user, 
    refreshTree, 
    handleNodeSelect
  }: ContentCardProps) => {
    const { title, content, author } = nodeData;
    
    function extractStanceAndLike(votes: { isStance: boolean, isPositive: boolean }[]): { stance: number, like: number } {
        let stance = 0;
        let like = 0;
      
        for (const vote of votes) {
          const value = vote.isPositive ? 1 : -1;
          if (vote.isStance) {
            stance = value;
          } else {
            like = value;
          }
        }
      
        return { stance, like };
    }
    const { stance, like } = extractStanceAndLike(nodeData.votes);
    
    // Voting state
    const [userStance, setUserStance] = useState(stance || 0);
    const [userLike, setUserLike] = useState(like || 0);
    const [counts, setCounts] = useState({
      moveLeftCount: (nodeData.cachedVotes?.community || 0),
      moveRightCount: (nodeData.cachedVotes?.opposing || 0),
      likeCount: nodeData.cachedVotes?.likes || 0,
      dislikeCount: nodeData.cachedVotes?.dislikes || 0
    });
  
    useEffect(() => {
      const { stance, like } = extractStanceAndLike(nodeData.votes);

      setUserStance(stance || 0);
      setUserLike(like || 0);
      setCounts({
        moveLeftCount: (nodeData.cachedVotes?.community || 0),
        moveRightCount: (nodeData.cachedVotes?.opposing || 0),
        likeCount: nodeData.cachedVotes?.likes || 0,
        dislikeCount: nodeData.cachedVotes?.dislikes || 0
      });
    }, [nodeData]);
  
    const handleVote = async (isStance: boolean, value: number) => {
      try {
        console.log("vote");
        const params = new URLSearchParams({ id: `${nodeData.id}` });
        
        let bodyVal = 0;
        if (isStance) {
          const newStance = userStance === value ? 0 : value;
          bodyVal = newStance;
          setUserStance(newStance);

          const diff = userStance - newStance;
          const sum = userStance + newStance;
          if (diff != 0){
            setCounts({
              moveLeftCount: counts.moveLeftCount + (sum >= 0 ? -Math.sign(diff)*DialectreesConfig.authorStanceMultiplier : 0),
              moveRightCount: counts.moveRightCount + (sum <= 0 ? Math.sign(diff)*DialectreesConfig.authorStanceMultiplier : 0),
              likeCount: counts.likeCount,
              dislikeCount: counts.dislikeCount
            });
          }
          
        } else {
          const newLike = userLike === value ? 0 : value;
          bodyVal = newLike;
          setUserLike(newLike);

          const diff = userLike - newLike;
          const sum = userLike + newLike;
          if (diff != 0){
            setCounts({
              moveLeftCount: counts.moveLeftCount,
              moveRightCount: counts.moveRightCount,
              likeCount: counts.likeCount + (sum >= 0 ? -Math.sign(diff) : 0),
              dislikeCount: counts.dislikeCount + (sum <= 0 ? Math.sign(diff) : 0)
            });
          }
        }

        const body = {
          isStance: isStance,
          value: bodyVal,
        };
        
        const response = await fetch(`/api/nodes/vote?${params}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body)
        });
        
        if (!response.ok) {
          // Revert on error
          if (isStance) 
            setUserStance(userStance);
          else 
            setUserLike(userLike);

          console.error('Failed to update vote');
        } else {
          // Update counts from response if available
          const result = await response.json();
          if (result.counts) {
            setCounts(result.counts);
          }
        }
        
        refreshTree();
      } catch (error) {
        // Revert on error
        if (isStance) 
          setUserStance(userStance);
        else 
          setUserLike(userLike);
        console.error('Error updating vote:', error);
      }
    };
  
    return (
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        {/* Header with title and admin actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {author && (
                <Typography variant="body2" color="text.secondary">
                by {author.username}
                </Typography>
            )}
          </Box>
          {checkPermission(user, Permissions.SET_PINNED) && (
              <Pin nodeData={nodeData} refreshTree={refreshTree}/>
          )}
          {checkPermission(user, Permissions.DELETE_RESPONSE) && (
              <DeleteNode nodeData={nodeData} refreshTree={refreshTree} handleNodeSelect={handleNodeSelect}/>
          )}
        </Box>
  
        {/* Content */}
        <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
          {content}
        </Typography>
  
        {/* Action bar */}
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Move left */}
          <IconButton 
            size="small" 
            sx={{color: userStance === 1 ? "var(--color-stance-community)" : "#aaa"}}
            onClick={() => handleVote(true, 1)}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '20px' }}>
            {counts.moveLeftCount}
          </Typography>
  
          {/* Move right */}
          <IconButton 
            size="small" 
            sx={{color: userStance === -1 ? "var(--color-stance-opposing)" : "#aaa", ml: 1}}
            onClick={() => handleVote(true, -1)}
          >
            <ArrowForward />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '20px' }}>
            {counts.moveRightCount}
          </Typography>
  
          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />
  
          {/* Like */}
          <IconButton 
            size="small" 
            color={userLike === 1 ? "success" : "default"}
            onClick={() => handleVote(false, 1)}
          >
            <ThumbUp />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '20px' }}>
            {counts.likeCount}
          </Typography>
  
          {/* Dislike */}
          <IconButton 
            size="small" 
            color={userLike === -1 ? "error" : "default"}
            sx={{ ml: 1 }}
            onClick={() => handleVote(false, -1)}
          >
            <ThumbDown />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '20px' }}>
            {counts.dislikeCount}
          </Typography>
        </Box>
      </Paper>
    );
  };