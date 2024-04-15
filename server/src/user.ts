import { User as ApplicationUser } from '@interfaces/user';
import { getDb } from './database';

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
  groups: string[];
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
        groups: dbUser.groups,
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
    INSERT INTO "user" (id, full_name, email, groups)
    VALUES ($(id), $(fullName), $(email), $(groups))
    ON CONFLICT (id) DO UPDATE
      SET full_name = $(fullName), email = $(email), groups = $(groups)
    RETURNING *
  `,
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      groups: user.groups,
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
export async function getUsers(userGroups: string[], excludeIds = []) {
  const dbUsers = await getDb().manyOrNone<DbUser>(
    `SELECT * FROM "user" WHERE NOT (id = ANY ($2)) ${userGroups.length > 0 ? 'AND groups && $1' : ''}`,
    [userGroups, excludeIds],
  );
  return dbUsers.map(dbUserToUser);
}
