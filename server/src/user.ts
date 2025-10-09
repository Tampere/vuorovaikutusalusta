import { User as ApplicationUser } from '@interfaces/user';
import { getDb } from './database';
import { ADMIN_ROLE, INTERNAL_USER_GROUP_ROLES } from './auth';

/**
 * Define user type inside Express types to make it globally accessible via req.user
 */
declare global {
  namespace Express {
    interface User extends ApplicationUser {}
  }
}

interface DbUser {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
}

/**
 * Converts a DB user into user
 * @param dbUser DB user
 * @returns User
 */
function dbUserToUser(dbUser: DbUser): Express.User {
  return !dbUser
    ? null
    : {
        id: dbUser.id,
        fullName: dbUser.full_name,
        email: dbUser.email,
        roles: dbUser.roles,
      };
}

/**
 * Updates (if exists) or inserts (if new) user into the database.
 * @param user User
 * @returns User
 */
export async function upsertUser(user: Express.User) {
  const newUser = await getDb().one<DbUser>(
    `
    INSERT INTO "user" (id, full_name, email, roles)
    VALUES ($(id), $(fullName), $(email), $(roles))
    ON CONFLICT (id) DO UPDATE
      SET full_name = $(fullName), email = $(email), roles = $(roles)
    RETURNING *
  `,
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
    },
  );
  return dbUserToUser(newUser);
}

/**
 * Get user with given ID
 * @param id ID
 */
export async function getUser(id: string) {
  const user = await getDb().oneOrNone<DbUser>(
    `SELECT * FROM "user" WHERE id = $1`,
    [id],
  );
  return dbUserToUser(user);
}

/**
 * Gets all users from database
 * @param excludeIds User IDs to exclude
 * @returns Users
 */
export async function getUsers(excludeIds = []) {
  const dbUsers = await getDb().manyOrNone<DbUser>(
    `SELECT * FROM "user" WHERE NOT (id = ANY ($1))`,
    [excludeIds],
  );
  return dbUsers.map(dbUserToUser);
}

/**
 * Checks if user has admin role
 */
export function isAdmin(user?: Express.User): boolean {
  return user?.roles.includes(ADMIN_ROLE);
}

/**
 * Checks if user has any of the internal user group roles
 * @param user User
 */
export function isInternalUser(user?: Express.User): boolean {
  return INTERNAL_USER_GROUP_ROLES.some((role) => user?.roles.includes(role));
}

/**
 * Gets roles for the given user excluding admin role
 * @param user User
 * @returns User group roles
 */
export function getUserGroupRoles(user: Express.User) {
  return user.roles.filter((role) => role !== ADMIN_ROLE);
}
