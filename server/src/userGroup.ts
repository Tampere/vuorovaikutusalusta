import { getDb } from './database';
import { UserGroup } from '@interfaces/userGroup';

export async function getUserGroups(organizationId: string) {
  return getDb().manyOrNone<UserGroup>(
    `
    SELECT id, name, organization
    FROM application.user_group
    WHERE organization = $1
    `,
    [organizationId],
  );
}

export async function getAllUserGroups() {
  return getDb().manyOrNone<UserGroup>(
    `
    SELECT id, name, organization
    FROM application.user_group
    `,
  );
}

export async function addUserGroup(organizationId: string, groupName: string) {
  return getDb().one<UserGroup>(
    `
    INSERT INTO application.user_group (name, organization)
    VALUES ($1, $2)
    RETURNING id, name
    `,
    [groupName, organizationId],
  );
}

export async function deleteUserGroup(groupId: string) {
  return getDb().none(
    `
    DELETE FROM application.user_group
    WHERE id = $1
    `,
    [groupId],
  );
}

export async function getUserGroup(groupId: string) {
  return getDb().one<UserGroup>(
    `
    SELECT id, name
    FROM application.user_group
    WHERE id = $1
    `,
    [groupId],
  );
}
