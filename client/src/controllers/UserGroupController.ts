import { request } from '@src/utils/request';
import { UserGroup } from '@interfaces/userGroup';

/** Retrieves user groups for the specified organization or defaults to the logged-in user's organization. */
export async function getUserGroups(organizationId?: string) {
  return request<UserGroup[]>(
    `/api/user-groups${organizationId ? `/${organizationId}` : ''}`,
    {
      method: 'GET',
    },
  );
}

/** Fetches all user groups across all organizations. Requires super-user privileges. */
export async function getAllUserGroups() {
  return request<UserGroup[]>('/api/user-groups/all', {
    method: 'GET',
  });
}

export async function createUserGroup(groupName: string) {
  return request<UserGroup>('/api/user-groups', {
    method: 'POST',
    body: { name: groupName },
  });
}

export async function deleteUserGroup(groupId: string) {
  return request<UserGroup>(`/api/user-groups/${groupId}`, {
    method: 'DELETE',
  });
}
