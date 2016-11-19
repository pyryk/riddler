/* Replace with your SQL commands */
CREATE TABLE categories (
    "id" serial NOT NULL,
	"name" text NOT NULL,
	"parent" integer references categories(id) on delete cascade,
	"creator" text references users(username) on delete set null,
	PRIMARY KEY ("id")
);

ALTER TABLE questions
    ADD COLUMN category integer references categories(id)
    on delete cascade
    on update cascade;
