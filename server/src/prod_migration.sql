--- DELETE OLD USERS
--- INSERT NEW USERS
DO $ $ DECLARE u RECORD;

BEGIN FOR u IN
SELECT
    *
FROM
    (
        VALUES
            ()
    ) AS v(full_name, email, id) LOOP IF u.id = '#N/A' THEN CONTINUE;

END IF;

INSERT INTO
    application."user" (id, full_name, email)
VALUES
    (u.id, u.full_name, u.email) ON CONFLICT (id) DO NOTHING;

END LOOP;

END $ $ LANGUAGE plpgsql;

--- UPDATE SURVEY ADMINS
DO $ $ DECLARE u RECORD;

BEGIN FOR u IN
SELECT
    *
FROM
    (
        VALUES
            ()
    ) AS v(full_name, email, id) LOOP IF u.id = '#N/A' THEN CONTINUE;

END IF;

WITH old_user AS (
    SELECT
        *
    FROM
        application."user"
    WHERE
        email = u.email
        AND id <> u.id
)
UPDATE
    data.survey
SET
    author_id = u.id author = u.full_name
WHERE
    data.survey.author_id = old_user.id;

END LOOP;

END $ $ LANGUAGE plpgsql;