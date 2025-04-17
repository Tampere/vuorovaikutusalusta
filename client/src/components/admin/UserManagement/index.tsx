import React, { useEffect, useState } from 'react';
import { AdminAppBar } from '../AdminAppBar';
import { useTranslations } from '@src/stores/TranslationContext';
import { UserList } from './UserList';
import { Box } from '@mui/material';
import { NewUserRequest } from './NewUserRequest';
import { User } from '@interfaces/user';
import { useUser } from '@src/stores/UserContext';
import { useToasts } from '@src/stores/ToastContext';
import { UserGroupManagement } from './UserGroupManagement';
import { UserGroup } from '@interfaces/userGroup';
import {
  getAllUserGroups,
  getUserGroups,
} from '@src/controllers/UserGroupController';

export function UserManagement() {
  const { tr } = useTranslations();
  const { activeUserIsSuperUser } = useUser();
  const { showToast } = useToasts();
  const [users, setUsers] = useState<{ data: User[]; loading: boolean }>({
    data: [],
    loading: false,
  });
  const [availableUserGroups, setAvailableUserGroups] = useState<UserGroup[]>(
    [],
  );

  async function refreshUsers() {
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

  async function refreshUserGroups() {
    try {
      const userGroups = activeUserIsSuperUser
        ? await getAllUserGroups()
        : await getUserGroups();

      setAvailableUserGroups(userGroups);
    } catch (error) {
      showToast({
        severity: 'error',
        message: tr.UserManagement.userGroupFetchFailed,
      });
    }
  }

  useEffect(() => {
    refreshUserGroups();
  }, []);

  useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <>
      <AdminAppBar labels={[tr.AppBarUserMenu.userManagement]} />
      <Box
        sx={{
          padding: '2rem 8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '84px',
          height: 'calc(100vh - 70px)',
          overflowY: 'hidden',
        }}
      >
        <UserGroupManagement
          availableUserGroups={availableUserGroups}
          onGroupChange={refreshUserGroups}
          onGroupDelete={async () => {
            await refreshUserGroups();
            await refreshUsers();
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <NewUserRequest onSubmitSuccess={refreshUsers} />
          <UserList users={users} availableUserGroups={availableUserGroups} />
        </Box>
      </Box>
    </>
  );
}
