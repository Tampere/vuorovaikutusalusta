import { User as ApplicationUser } from '@interfaces/user';
import { getDb, encryptionKey } from './database';

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
  organizations: string[];
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
        organizations: dbUser.organizations,
        roles: dbUser.roles,
      };
}

/** Check if user has admin rights */
export function isAdmin(user?: Express.User) {
  return user?.roles.includes('organization_admin') ?? false;
}

/** Check if user has super user rights */
export function isSuperUser(user?: Express.User) {
  return user?.roles.includes('super_user') ?? false;
}

/**
 * Updates (if exists) or inserts (if new) user into the database.
 * @param user User
 * @returns User
 */
export async function upsertUser(user: Express.User) {
  const newUser = await getDb().one<DbUser>(
    `
    INSERT INTO "user" (id, full_name, email, organizations, roles)
    VALUES (
      $(id),
      pgp_sym_encrypt($(fullName), $(encryptionKey)),
      pgp_sym_encrypt($(email), $(encryptionKey)),
      $(organizations),
      $(roles)
    )
    ON CONFLICT (id) DO UPDATE
      SET
        full_name = pgp_sym_encrypt($(fullName), $(encryptionKey)),
        email = pgp_sym_encrypt($(email), $(encryptionKey)),
        organizations = $(organizations),
        roles = $(roles)
    RETURNING
      id,
      pgp_sym_decrypt(full_name, $(encryptionKey)),
      pgp_sym_decrypt(email, $(encryptionKey)),
      organizations,
      roles
  `,
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      organizations: user.organizations,
      roles: user.roles,
      encryptionKey
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
    `SELECT
      id,
      pgp_sym_decrypt(full_name, $2) as full_name,
      pgp_sym_decrypt(email, $2) as email,
      organizations,
      roles
    FROM "user" WHERE id = $1`,
    [id, encryptionKey],
  );
  return dbUserToUser(user);
}

/**
 * Gets all users from database
 * @param excludeIds User IDs to exclude
 * @returns Users
 */
export async function getUsers(userOrganizations: string[], excludeIds = []) {
  const dbUsers = await getDb().manyOrNone<DbUser>(
    `SELECT
      id,
      pgp_sym_decrypt(full_name, $3::text) as full_name,
      pgp_sym_decrypt(email, $3::text) as email,
      organizations,
      roles
    FROM "user"
    WHERE NOT (id = ANY ($2)) ${userOrganizations.length > 0 ? 'AND organizations && $1' : ''}`,
    [userOrganizations, excludeIds, encryptionKey],
  );
  return dbUsers.map(dbUserToUser);
}
