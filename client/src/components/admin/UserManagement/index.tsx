import React, { useEffect, useState } from 'react';
import { AdminAppBar } from '../AdminAppBar';
import { useTranslations } from '@src/stores/TranslationContext';
import { UserList } from './UserList';
import { Box } from '@mui/material';
import { NewUserRequest } from './NewUserRequest';
import { User } from '@interfaces/user';
import { useUser } from '@src/stores/UserContext';
import { useToasts } from '@src/stores/ToastContext';

export function UserManagement() {
  const { tr } = useTranslations();
  const { activeUserIsSuperUser } = useUser();
  const { showToast } = useToasts();
  const [users, setUsers] = useState<{ data: User[]; loading: boolean }>({
    data: [],
    loading: false,
  });

  async function fetchUsers() {
    try {
      setUsers((prev) => ({ ...prev, loading: true }));
      const response = await fetch(
        `/api/users${activeUserIsSuperUser ? '/all' : ''}?includePending=true`,
      );
      const usersData = (await response.json()) as User[];
      setUsers({ data: usersData, loading: false });
    } catch (error) {
      setUsers((prev) => ({ ...prev, loading: false }));
      showToast({
        severity: 'error',
        message: tr.EditSurveyInfo.userFetchFailed,
      });
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <AdminAppBar labels={[tr.AppBarUserMenu.userManagement]} />
      <Box
        sx={{
          padding: '2rem 8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          height: 'calc(100vh - 70px)',
          overflowY: 'hidden',
        }}
      >
        <NewUserRequest onSubmitSuccess={fetchUsers} />
        <UserList users={users} />
      </Box>
    </>
  );
}
