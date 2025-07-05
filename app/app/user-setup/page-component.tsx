
'use client';

import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { createUser } from './create-user';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="contained"
      style={{textTransform: 'none'}}
      sx={{ mt: 2, backgroundColor: '#e7000b', '&:hover': { backgroundColor: '#c00009' } }}
      disabled={pending}
      className='w-full'
    >
      {pending ? 'Saving...' : 'Save'}
    </Button>
  );
}

interface UserSetupPageProps {
  user: any; // Replace with proper user type
  userExists: boolean;
}

export default function UserSetupPage({ user, userExists }: UserSetupPageProps) {
  const [error, setError] = useState<string | null>(null);

  if (userExists) {
    return (
      <div>
        <p>User already exists</p>
        <Button
          variant="contained"
          href='/app'
          sx={{ mt: 2, backgroundColor: '#e7000b', '&:hover': { backgroundColor: '#c00009' } }}
        >
          Return to main page
        </Button>
      </div>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#bbb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <form action={createUser}>
        <Card sx={{ width: 400, p: 2 }}>
          <CardContent>
            <Typography variant="h5" mb={2}>
              Choose a Display Name
            </Typography>
            <TextField
              fullWidth
              label="Display Name"
              name="displayName"
              required
              autoFocus
            />
            {error && (
              <Typography color="error" mt={1}>
                {error}
              </Typography>
            )}
            <SubmitButton />
          </CardContent>
        </Card>
      </form>
    </Box>
  );
}