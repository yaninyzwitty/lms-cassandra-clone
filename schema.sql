--cql schema for lms-platform


CREATE TABLE IF NOT EXISTS course (
    id UUID PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    description TEXT,
    image_url TEXT,
    price FLOAT,
    is_published BOOLEAN,
    category_id UUID,
);

CREATE TABLE IF NOT EXISTS category_by_course (
    id UUID PRIMARY KEY,
    name TEXT,  
);

CREATE TABLE IF NOT EXISTS attachment_by_course (
  id UUID PRIMARY KEY,
  name TEXT,
  url TEXT,
  course_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

);
CREATE TABLE IF NOT EXISTS chapter_by_course (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  video_url TEXT,
  position INT,
  is_published BOOLEAN,
  is_free BOOLEAN,
  course_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
);
CREATE TABLE IF NOT EXISTS mux_data_by_course (
  id UUID PRIMARY KEY,
  asset_id TEXT,
  playback_id TEXT,
  chapter_id UUID,
);

CREATE TABLE IF NOT EXISTS user_progress_by_course (
  id UUID PRIMARY KEY,
  user_id TEXT,
  chapter_id UUID,
  is_completed BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
);

CREATE TABLE IF NOT EXISTS purchase_by_course (
  id UUID PRIMARY KEY,
  user_id TEXT,
  course_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
);
CREATE TABLE IF NOT EXISTS stripe_customer_by_course (
  id UUID PRIMARY KEY,
  user_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
);


CREATE TABLE IF NOT EXISTS tests ( 
  id        UUID,
  user_id     UUID,
  title TEXT,
  PRIMARY KEY (( user_id ))
);

-- add categories to category table here --seed



-- 
CREATE TABLE IF NOT EXISTS chapter_by_course (
    id UUID,
    position INT,
    title TEXT,
    description TEXT,
    video_url TEXT,
    is_published BOOLEAN,
    is_free BOOLEAN,
    course_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, position)
  ) WITH CLUSTERING ORDER BY (position DESC);
  



CREATE TABLE IF NOT EXISTS chapter_by_course ( 
  id UUID,
  title TEXT,
  description TEXT,
  video_url TEXT,
  position INT,
  is_published BOOLEAN,
  is_free BOOLEAN,
  course_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY ((id), position)
) WITH CLUSTERING ORDER BY (position DESC);

-- CREATE TABLE IF NOT EXISTS posts_by_user ( 
--   user_id     UUID, 
--   post_id     TIMEUUID,
--   room_id     TEXT, 
--   text        TEXT,
--   PRIMARY KEY ((user_id), post_id)
-- );
